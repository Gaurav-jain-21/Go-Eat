from fastapi import FastAPI, HTTPException
from .models import QueryRequest, SearchResponse, ChatResponse, RecommendResponse
from .rag_engine import search_food
from .chatbot import ask_llama

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "AI-RAG Service Running",
        "status": "online"
    }

@app.post("/api/ai/search", response_model=SearchResponse)
def semantic_search(data: QueryRequest):
    results = search_food(data.query)
    return {
        "query": data.query,
        "results": results
    }

@app.post("/api/ai/chat", response_model=ChatResponse)
def ai_chat(data: QueryRequest):
    response = ask_llama(data.query)
    if "AI Error" in response:
        raise HTTPException(status_code=503, detail=response)
    
    return {
        "query": data.query,
        "response": response
    }

@app.post("/api/ai/recommend-food", response_model=RecommendResponse)
def recommend_food(data: QueryRequest):
    results = search_food(data.query)
    
    # Better formatting for the prompt context
    food_context = "\n".join([
        f"- {f['name']} ({f['category']}): {f['description']} - ${f['price']}" 
        for f in results
    ])
    
    prompt = f"""
    User Query: {data.query}
    Available Menu Options:
    {food_context}
    
    Briefly recommend the best food options based on the query above.
    """
    response = ask_llama(prompt)
    return {
        "recommendations": results,
        "ai_response": response
    }