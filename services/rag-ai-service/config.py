import os

# disable ChromaDB telemetry — must be before importing chromadb
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["CHROMA_TELEMETRY"]     = "False"

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import chromadb
from sentence_transformers import SentenceTransformer

load_dotenv()

# ── Environment variables ──
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MONGO_URI    = os.getenv("MONGO_URI", "mongodb://localhost:27017")
HOTEL_DB     = os.getenv("HOTEL_DB", "foodapp-hotels")
RAG_DB       = os.getenv("RAG_DB",   "foodapp-rag")
PORT         = int(os.getenv("PORT", 4007))
CHROMA_PATH  = os.getenv("CHROMA_PATH", "./chromadb_store")

# ── MongoDB local client ──
mongo_client  = AsyncIOMotorClient(MONGO_URI)
hotel_db      = mongo_client[HOTEL_DB]
rag_db        = mongo_client[RAG_DB]
hotels_col    = hotel_db["hotels"]
foods_col     = hotel_db["foods"]
chat_hist_col = rag_db["chat_history"]

# ── HuggingFace embedding model (free, runs locally) ──
print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded!")

# ── ChromaDB local vector store ──
chroma_client        = chromadb.PersistentClient(path=CHROMA_PATH)
knowledge_collection = chroma_client.get_or_create_collection(
    name="food_knowledge",
    metadata={"hnsw:space": "cosine"}
)

print(f"ChromaDB ready. Vectors in store: {knowledge_collection.count()}")