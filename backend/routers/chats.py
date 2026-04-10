from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Space, Chat, Message, User
from backend.schemas import ChatCreate, ChatResponse, ChatWithMessages, MessageResponse, CitationItem
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/spaces/{space_id}/chats", tags=["chats"])


@router.get("", response_model=list[ChatResponse])
async def list_chats(
    space_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify space ownership
    space_result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    if not space_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Space not found")

    result = await db.execute(
        select(Chat)
        .where(Chat.space_id == space_id, Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    space_id: UUID,
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify space ownership
    space_result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    if not space_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Space not found")

    chat = Chat(
        title=chat_data.title or "New Chat",
        space_id=space_id,
        user_id=current_user.id,
    )
    db.add(chat)
    await db.flush()
    await db.refresh(chat)

    return chat


@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat(
    space_id: UUID,
    chat_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Chat).where(
            Chat.id == chat_id,
            Chat.space_id == space_id,
            Chat.user_id == current_user.id,
        )
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get messages
    msg_result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )
    messages = msg_result.scalars().all()

    return ChatWithMessages(
        id=chat.id,
        title=chat.title,
        messages=[
            MessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                citations=[CitationItem(**c) for c in (m.citations or [])],
                created_at=m.created_at,
            )
            for m in messages
        ],
    )


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    space_id: UUID,
    chat_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Chat).where(
            Chat.id == chat_id,
            Chat.space_id == space_id,
            Chat.user_id == current_user.id,
        )
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await db.delete(chat)
