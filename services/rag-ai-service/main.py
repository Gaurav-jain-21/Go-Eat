from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from router import router
from config import PORT
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"\n{'='*50}")
    print(f"  Go-Eat RAG AI Service")
    print(f"  Port    : {PORT}")
    print(f"  Docs    : http://localhost:{PORT}/docs")
    print(f"  Model   : llama3-70b-8192 (Groq - free)")
    print(f"  Vectors : HuggingFace all-MiniLM-L6-v2")
    print(f"{'='*50}\n")
    yield
    print("RAG AI Service shutting down...")


app = FastAPI(
    title="Go-Eat RAG AI Service",
    description="Free AI chatbot using Groq + HuggingFace + ChromaDB",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "service": "Go-Eat RAG AI Service",
        "status":  "running",
        "docs":    f"http://localhost:{PORT}/docs",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
    )