import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def chunk_text(text: str, chunk_size: int = 150, overlap: int = 30) -> list[str]:
    """
    Split text into chunks of approximately chunk_size words with overlap.
    Using ~150 words per chunk to stay within mxbai-embed-large's 512 token limit.
    Returns a list of text chunks.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])

        # Only add non-empty chunks with meaningful content
        if len(chunk.strip()) > 30:
            chunks.append(chunk.strip())

        start = end - overlap

    return chunks
