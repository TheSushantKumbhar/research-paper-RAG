from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Spaces ---
class SpaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class SpaceResponse(BaseModel):
    id: UUID
    name: str
    description: str
    created_at: datetime
    document_count: Optional[int] = 0

    class Config:
        from_attributes = True


# --- Documents ---
class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    num_chunks: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


# --- Chats ---
class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Messages ---
class CitationItem(BaseModel):
    paper_name: str
    snippet: str


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    citations: list[CitationItem] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ChatWithMessages(BaseModel):
    id: UUID
    title: str
    messages: list[MessageResponse] = []

    class Config:
        from_attributes = True


# --- Query ---
class QueryRequest(BaseModel):
    question: str
