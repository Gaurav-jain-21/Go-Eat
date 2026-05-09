from fastapi import APIRouter, HTTPException, BackgroundTasks
from models import ChatRequest, ChatResponse, IngestRequest
from generate import generate_answer
from ingest import ingest_all_data
from config import knowledge_collection
import uuid

router = APIRouter(prefix="/api/ai", tags=["AI"])


# ── POST /api/ai/chat ──
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Ask the AI anything about Go-Eat"""
    try:
        if not request.question or not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        session_id = request.session_id or str(uuid.uuid4())

        result = await generate_answer(
            question=request.question.strip(),
            session_id=session_id,
            user_id=request.user_id,
        )

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            session_id=session_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /api/ai/ingest ──
@router.post("/ingest")
async def ingest(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
):
    """Build or rebuild the vector knowledge base"""
    background_tasks.add_task(ingest_all_data, request.force_reingest)
    return {
        "message":       "Ingestion started. Check server logs for progress.",
        "force_reingest": request.force_reingest,
    }


# ── GET /api/ai/stats ──
@router.get("/stats")
async def stats():
    """Check how many vectors are in ChromaDB"""
    try:
        count = knowledge_collection.count()
        return {
            "total_vectors": count,
            "status":        "ready" if count > 0 else "empty — run /api/ai/ingest first",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /api/ai/health ──
@router.get("/health")
async def health():
    """Health check"""
    try:
        count = knowledge_collection.count()
        return {
            "status":      "ok",
            "service":     "Go-Eat RAG AI Service",
            "port":        4007,
            "model":       "llama3-70b-8192 (Groq — free)",
            "embeddings":  "all-MiniLM-L6-v2 (HuggingFace — free & local)",
            "vector_db":   "ChromaDB (local)",
            "vectors":     count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))