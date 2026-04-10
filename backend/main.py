from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import create_tables
from backend.auth.router import router as auth_router
from backend.routers.spaces import router as spaces_router
from backend.routers.documents import router as documents_router
from backend.routers.chats import router as chats_router
from backend.routers.query import router as query_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables
    await create_tables()
    print("✅ Database tables created")
    yield
    # Shutdown
    print("👋 Shutting down")


app = FastAPI(
    title="Research Spaces API",
    description="Multi-space RAG platform for research papers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(spaces_router)
app.include_router(documents_router)
app.include_router(chats_router)
app.include_router(query_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Research Spaces API"}
