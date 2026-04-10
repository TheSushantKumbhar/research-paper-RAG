import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Space, Document, User
from backend.schemas import DocumentResponse
from backend.auth.dependencies import get_current_user
from backend.services.pdf_processor import extract_text_from_pdf, chunk_text
from backend.services.embeddings import get_embeddings
from backend.services.pinecone_service import upsert_vectors, delete_by_doc_id

router = APIRouter(prefix="/spaces/{space_id}/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
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
        select(Document)
        .where(Document.space_id == space_id)
        .order_by(Document.uploaded_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    space_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify space ownership
    space_result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    if not space_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Space not found")

    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read PDF
    pdf_bytes = await file.read()

    # Extract text
    text = extract_text_from_pdf(pdf_bytes)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Chunk text
    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="PDF produced no usable text chunks")

    # Generate document ID
    doc_id = str(uuid.uuid4())

    # Generate embeddings in batches
    batch_size = 20
    all_vectors = []

    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i : i + batch_size]
        embeddings = get_embeddings(batch_chunks)

        for j, (chunk, embedding) in enumerate(zip(batch_chunks, embeddings)):
            vector_id = f"{doc_id}_{i + j}"
            all_vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "text": chunk,
                    "paper_name": file.filename,
                    "doc_id": doc_id,
                },
            })

    # Upsert to Pinecone
    namespace = str(space_id)
    upsert_vectors(namespace, all_vectors)

    # Save document record to DB
    document = Document(
        id=uuid.UUID(doc_id),
        space_id=space_id,
        filename=file.filename,
        num_chunks=len(chunks),
    )
    db.add(document)
    await db.flush()
    await db.refresh(document)

    return document


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    space_id: UUID,
    doc_id: UUID,
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
        select(Document).where(Document.id == doc_id, Document.space_id == space_id)
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from Pinecone
    delete_by_doc_id(str(space_id), str(doc_id))

    await db.delete(document)
