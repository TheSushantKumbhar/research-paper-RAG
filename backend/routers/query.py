import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db, async_session
from backend.models import Space, Chat, Message, User
from backend.schemas import QueryRequest
from backend.auth.dependencies import get_current_user
from backend.services.embeddings import get_single_embedding
from backend.services.pinecone_service import query_vectors
from backend.services.rag import build_rag_prompt, stream_gemini_response

router = APIRouter(prefix="/spaces/{space_id}/chats/{chat_id}", tags=["query"])

HISTORY_LIMIT = 5  # Last N messages to include as context


@router.post("/query")
async def query_rag(
    space_id: UUID,
    chat_id: UUID,
    query_data: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify space ownership
    space_result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    if not space_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Space not found")

    # Verify chat ownership
    chat_result = await db.execute(
        select(Chat).where(
            Chat.id == chat_id,
            Chat.space_id == space_id,
            Chat.user_id == current_user.id,
        )
    )
    chat = chat_result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    question = query_data.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # 1. Save user message to DB
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=question,
        citations=[],
    )
    db.add(user_message)
    await db.flush()

    # 2. Fetch recent chat history
    history_result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .limit(HISTORY_LIMIT + 1)  # +1 because we just added the user message
    )
    history_messages = list(reversed(history_result.scalars().all()))
    # Exclude the current message from history
    chat_history = [
        {"role": m.role, "content": m.content}
        for m in history_messages[:-1]
    ]

    # 3. Generate query embedding
    query_embedding = get_single_embedding(question)

    # 4. Query Pinecone
    namespace = str(space_id)
    matches = query_vectors(namespace, query_embedding, top_k=3)

    # 5. Extract context chunks and citations
    context_chunks = []
    citations = []
    for match in matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        paper_name = metadata.get("paper_name", "Unknown")

        context_chunks.append({
            "text": text,
            "paper_name": paper_name,
            "score": match.get("score", 0),
        })

        # Build citation (truncate snippet)
        snippet = text[:300] + "..." if len(text) > 300 else text
        citations.append({
            "paper_name": paper_name,
            "snippet": snippet,
        })

    # 6. Build prompt
    prompt = build_rag_prompt(question, context_chunks, chat_history)

    # Commit user message before streaming
    await db.commit()

    # 7. Stream response
    async def event_stream():
        full_response = ""

        async for sse_data in stream_gemini_response(prompt):
            # Extract token from SSE data for accumulation
            try:
                line = sse_data.strip()
                if line.startswith("data: "):
                    parsed = json.loads(line[6:])
                    if parsed.get("type") == "token":
                        full_response += parsed.get("content", "")
            except (json.JSONDecodeError, Exception):
                pass
            yield sse_data

        # Send citations
        citations_data = json.dumps({"type": "citations", "content": citations})
        yield f"data: {citations_data}\n\n"

        # Send done signal
        done_data = json.dumps({"type": "done"})
        yield f"data: {done_data}\n\n"

        # Save assistant message to DB
        async with async_session() as save_db:
            assistant_message = Message(
                chat_id=chat_id,
                role="assistant",
                content=full_response,
                citations=citations,
            )
            save_db.add(assistant_message)

            # Update chat title if it's the first message
            chat_result = await save_db.execute(
                select(Chat).where(Chat.id == chat_id)
            )
            chat_obj = chat_result.scalar_one_or_none()
            if chat_obj and chat_obj.title == "New Chat":
                # Use first few words of question as title
                chat_obj.title = question[:50] + ("..." if len(question) > 50 else "")

            await save_db.commit()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
