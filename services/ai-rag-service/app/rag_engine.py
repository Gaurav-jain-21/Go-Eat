import faiss
import numpy as np

from sentence_transformers import SentenceTransformer

from .data import foods

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

food_texts = [
    f"{food['name']} {food['description']}"
    for food in foods
]

# Initialize FAISS index only if we have data
if food_texts:
    embeddings = model.encode(food_texts).astype('float32')
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
else:
    index = None

def search_food(query):
    if index is None:
        return []

    query_embedding = model.encode([query]).astype('float32')
    distances, indices = index.search(query_embedding, 3)
    
    results = []
    for idx in indices[0]:
        # FAISS returns -1 if no neighbors are found; check bounds to be safe
        if idx != -1 and idx < len(foods):
            results.append(foods[idx])
    return results