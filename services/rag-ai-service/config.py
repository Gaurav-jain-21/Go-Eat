import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_URI      = os.getenv("MONGO_URI")
HOTEL_DB       = os.getenv("HOTEL_DB", "foodapp-hotels")
RAG_DB         = os.getenv("RAG_DB",   "foodapp-rag")
PORT           = int(os.getenv("PORT", 4007))

client    = AsyncIOMotorClient(MONGO_URI)
hotel_db  = client[HOTEL_DB]   
rag_db    = client[RAG_DB]     
hotels_col     = hotel_db["hotels"]
foods_col      = hotel_db["foods"]
vectors_col    = rag_db["knowledge_vectors"]
chat_hist_col  = rag_db["chat_history"]