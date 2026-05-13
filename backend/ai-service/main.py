from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from services.groq_service import ask_groq
from services.rag_service import ingest_documents, search_context
from services.recommendation_service import simple_food_recommendation

app = FastAPI(title="GoEat AI Service")


class ChatRequest(BaseModel):
    message: str


class RagChatRequest(BaseModel):
    message: str
    top_k: Optional[int] = 3


class FoodRecommendRequest(BaseModel):
    foods: List[Dict[str, Any]]
    budget: Optional[float] = None
    vegOnly: Optional[bool] = False
    category: Optional[str] = None


class HotelAssistantRequest(BaseModel):
    message: str
    hotelName: Optional[str] = None
    hotelData: Optional[Dict[str, Any]] = None


class AdminAssistantRequest(BaseModel):
    message: str
    platformData: Optional[Dict[str, Any]] = None


@app.get("/")
def home():
    return {
        "success": True,
        "message": "GoEat AI Service is running",
    }


@app.get("/api/ai/test")
def test():
    return {
        "success": True,
        "message": "AI routes working",
    }


@app.post("/api/ai/chat")
def normal_chat(request: ChatRequest):
    try:
        system_prompt = (
            "You are GoEat AI assistant. "
            "Help users with food suggestions, order help, refund help, "
            "hotel suggestions, and GoEat support. "
            "Keep answers simple and useful."
        )

        reply = ask_groq(
            message=request.message,
            system_prompt=system_prompt,
        )

        return {
            "success": True,
            "userMessage": request.message,
            "aiReply": reply,
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/api/ai/ingest")
def ingest_rag_docs():
    try:
        result = ingest_documents()
        return result

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/api/ai/rag-chat")
def rag_chat(request: RagChatRequest):
    try:
        context = search_context(
            query=request.message,
            top_k=request.top_k,
        )

        system_prompt = (
            "You are GoEat RAG support assistant. "
            "Answer only using the provided GoEat context. "
            "If the context does not contain the answer, say that you do not have enough information."
        )

        reply = ask_groq(
            message=request.message,
            system_prompt=system_prompt,
            context=context,
        )

        return {
            "success": True,
            "userMessage": request.message,
            "contextUsed": context,
            "aiReply": reply,
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/api/ai/recommend-food")
def recommend_food(request: FoodRecommendRequest):
    try:
        recommended_foods = simple_food_recommendation(
            foods=request.foods,
            budget=request.budget,
            veg_only=request.vegOnly,
            category=request.category,
        )

        food_context = str(recommended_foods)

        system_prompt = (
            "You are GoEat food recommendation assistant. "
            "Recommend foods from the given food list only. "
            "Explain briefly why these foods are good choices."
        )

        user_message = (
            f"Recommend food with budget={request.budget}, "
            f"vegOnly={request.vegOnly}, category={request.category}. "
            f"Food list: {food_context}"
        )

        reply = ask_groq(
            message=user_message,
            system_prompt=system_prompt,
        )

        return {
            "success": True,
            "recommendedFoods": recommended_foods,
            "aiReply": reply,
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/api/ai/hotel-assistant")
def hotel_assistant(request: HotelAssistantRequest):
    try:
        system_prompt = (
            "You are GoEat hotel panel AI assistant. "
            "Help hotel owners improve food descriptions, menu pricing, "
            "ratings, order management, and customer satisfaction."
        )

        message = f"""
Hotel Name: {request.hotelName}
Hotel Data: {request.hotelData}

Hotel Owner Question:
{request.message}
"""

        reply = ask_groq(
            message=message,
            system_prompt=system_prompt,
        )

        return {
            "success": True,
            "message": request.message,
            "aiReply": reply,
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/api/ai/admin-assistant")
def admin_assistant(request: AdminAssistantRequest):
    try:
        system_prompt = (
            "You are GoEat admin AI assistant. "
            "Help admin summarize orders, payments, refunds, hotels, foods, "
            "reviews, users, and platform performance."
        )

        message = f"""
Platform Data:
{request.platformData}

Admin Question:
{request.message}
"""

        reply = ask_groq(
            message=message,
            system_prompt=system_prompt,
        )

        return {
            "success": True,
            "message": request.message,
            "aiReply": reply,
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))