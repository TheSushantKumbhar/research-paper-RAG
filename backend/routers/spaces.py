from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.database import get_db
from backend.models import Space, Document, User
from backend.schemas import SpaceCreate, SpaceResponse
from backend.auth.dependencies import get_current_user
from backend.services.pinecone_service import clear_namespace

router = APIRouter(prefix="/spaces", tags=["spaces"])


@router.get("", response_model=list[SpaceResponse])
async def list_spaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Space,
            func.count(Document.id).label("doc_count"),
        )
        .outerjoin(Document, Document.space_id == Space.id)
        .where(Space.user_id == current_user.id)
        .group_by(Space.id)
        .order_by(Space.created_at.desc())
    )
    rows = result.all()

    spaces = []
    for space, doc_count in rows:
        spaces.append(
            SpaceResponse(
                id=space.id,
                name=space.name,
                description=space.description,
                created_at=space.created_at,
                document_count=doc_count,
            )
        )
    return spaces


@router.post("", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    space_data: SpaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    space = Space(
        name=space_data.name,
        description=space_data.description or "",
        user_id=current_user.id,
    )
    db.add(space)
    await db.flush()
    await db.refresh(space)

    return SpaceResponse(
        id=space.id,
        name=space.name,
        description=space.description,
        created_at=space.created_at,
        document_count=0,
    )


@router.get("/{space_id}", response_model=SpaceResponse)
async def get_space(
    space_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(status_code=404, detail="Space not found")

    # Count documents
    doc_result = await db.execute(
        select(func.count(Document.id)).where(Document.space_id == space_id)
    )
    doc_count = doc_result.scalar() or 0

    return SpaceResponse(
        id=space.id,
        name=space.name,
        description=space.description,
        created_at=space.created_at,
        document_count=doc_count,
    )


@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_space(
    space_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Space).where(Space.id == space_id, Space.user_id == current_user.id)
    )
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(status_code=404, detail="Space not found")

    # Clear Pinecone namespace
    clear_namespace(str(space_id))

    await db.delete(space)
