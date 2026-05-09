from config import knowledge_collection, embedding_model


async def retrieve_relevant_docs(question: str, top_k: int = 5) -> list:
    """
    Embed question locally then search ChromaDB
    """
    # embed question locally — free, no API
    question_embedding = embedding_model.encode(question).tolist()

    total_docs = knowledge_collection.count()
    if total_docs == 0:
        print("ChromaDB is empty. Please call /api/ai/ingest first.")
        return []

    n_results = min(top_k, total_docs)

    results = knowledge_collection.query(
        query_embeddings=[question_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )

    docs = []
    if results and results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            docs.append({
                "text":     doc,
                "metadata": results["metadatas"][0][i],
                "score":    round(1 - results["distances"][0][i], 3),
            })

    return docs


async def format_context(docs: list) -> tuple:
    """
    Format docs into context string + source names
    """
    if not docs:
        return "No relevant information found.", []

    context_parts = []
    sources       = []

    for i, doc in enumerate(docs, 1):
        context_parts.append(f"[Source {i}]\n{doc['text']}")
        meta = doc.get("metadata", {})
        if meta.get("food_name"):
            sources.append(f"{meta['food_name']} @ {meta.get('hotel_name', '')}")
        elif meta.get("hotel_name"):
            sources.append(meta["hotel_name"])
        else:
            sources.append("Go-Eat FAQ")

    return "\n\n".join(context_parts), sources