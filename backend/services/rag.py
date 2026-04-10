import json
from typing import AsyncGenerator
import google.generativeai as genai
from backend.config import get_settings

settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a helpful research assistant. You answer questions based ONLY on the provided context from research papers.

Rules:
1. Answer ONLY using the information from the provided context chunks.
2. If the context does not contain enough information to answer the question, say "I don't have enough information from the uploaded papers to answer this question."
3. Be specific and cite which paper(s) your information comes from.
4. Provide clear, well-structured answers.
5. Do not make up or hallucinate information not present in the context.
"""


def build_rag_prompt(
    question: str,
    context_chunks: list[dict],
    chat_history: list[dict],
) -> str:
    """
    Build the full prompt for Gemini with context chunks and chat history.
    context_chunks: list of {text, paper_name, score}
    chat_history: list of {role, content}
    """
    # Build context section
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        paper = chunk.get("paper_name", "Unknown Paper")
        text = chunk.get("text", "")
        context_parts.append(f"[Source {i}: {paper}]\n{text}")

    context_text = "\n\n---\n\n".join(context_parts)

    # Build chat history section
    history_text = ""
    if chat_history:
        history_parts = []
        for msg in chat_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_parts.append(f"{role}: {msg['content']}")
        history_text = "\n\nPrevious conversation:\n" + "\n".join(history_parts)

    prompt = f"""{SYSTEM_PROMPT}

Context from research papers:
{context_text}
{history_text}

User question: {question}

Provide a detailed answer based on the context above. Reference the source papers when possible."""

    return prompt


async def stream_gemini_response(prompt: str) -> AsyncGenerator[str, None]:
    """
    Stream response from Gemini model token by token.
    Yields SSE-formatted data strings.
    """
    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    response = model.generate_content(prompt, stream=True)

    for chunk in response:
        if chunk.text:
            # Send token event
            data = json.dumps({"type": "token", "content": chunk.text})
            yield f"data: {data}\n\n"
