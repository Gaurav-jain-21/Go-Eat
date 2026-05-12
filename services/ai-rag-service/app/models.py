from pydantic import BaseModel
from typing import List

class QueryRequest(BaseModel):
    query: str

class FoodItem(BaseModel):
    id: int
    name: str
    category: str
    price: int
    description: str

class SearchResponse(BaseModel):
    query: str
    results: List[FoodItem]

class ChatResponse(BaseModel):
    query: str
    response: str

class RecommendResponse(BaseModel):
    recommendations: List[FoodItem]
    ai_response: str