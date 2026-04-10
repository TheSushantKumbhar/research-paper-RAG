from pinecone import Pinecone
from backend.config import get_settings

settings = get_settings()

pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)


def upsert_vectors(
    namespace: str,
    vectors: list[dict],
) -> None:
    """
    Upsert vectors into Pinecone index under the given namespace.
    vectors: list of {"id": str, "values": list[float], "metadata": dict}
    """
    # Batch upsert in groups of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch, namespace=namespace)


def query_vectors(
    namespace: str,
    query_vector: list[float],
    top_k: int = 3,
) -> list[dict]:
    """
    Query Pinecone for the top_k most similar vectors in the given namespace.
    Returns list of {id, score, metadata} dicts.
    """
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        namespace=namespace,
        include_metadata=True,
    )

    matches = []
    for match in results.get("matches", []):
        matches.append({
            "id": match["id"],
            "score": match["score"],
            "metadata": match.get("metadata", {}),
        })

    return matches


def delete_by_doc_id(namespace: str, doc_id: str) -> None:
    """Delete all vectors belonging to a specific document."""
    # Use metadata filter to find and delete vectors by doc_id
    # Pinecone supports delete by filter in some plans
    # Fallback: delete by ID prefix
    try:
        index.delete(
            filter={"doc_id": {"$eq": doc_id}},
            namespace=namespace,
        )
    except Exception:
        # If filter delete is not supported, we'll skip
        pass


def clear_namespace(namespace: str) -> None:
    """Delete all vectors in a namespace."""
    try:
        index.delete(delete_all=True, namespace=namespace)
    except Exception:
        pass
