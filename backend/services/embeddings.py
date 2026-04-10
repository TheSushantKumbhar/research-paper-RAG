import ollama
from backend.config import get_settings

settings = get_settings()
EMBEDDING_MODEL = "mxbai-embed-large:latest"


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using Ollama.
    Processes one at a time to avoid context length overflow.
    Returns a list of embedding vectors (1024-dim each).
    """
    if not texts:
        return []

    embeddings = []
    for text in texts:
        # Truncate to ~400 chars as safety net
        truncated = text[:2000] if len(text) > 2000 else text
        try:
            response = ollama.embed(
                model=EMBEDDING_MODEL,
                input=truncated,
            )
            embeddings.append(response["embeddings"][0])
        except Exception as e:
            print(f"Embedding error for chunk (len={len(truncated)}): {e}")
            # Try with even shorter text
            try:
                short = truncated[:800]
                response = ollama.embed(
                    model=EMBEDDING_MODEL,
                    input=short,
                )
                embeddings.append(response["embeddings"][0])
            except Exception as e2:
                print(f"Embedding retry also failed: {e2}")
                # Return zero vector as fallback
                embeddings.append([0.0] * 1024)

    return embeddings


def get_single_embedding(text: str) -> list[float]:
    """Generate embedding for a single text string."""
    truncated = text[:2000] if len(text) > 2000 else text
    response = ollama.embed(
        model=EMBEDDING_MODEL,
        input=truncated,
    )
    return response["embeddings"][0]
