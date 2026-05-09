from groq import Groq
from config import GROQ_API_KEY, chat_hist_col
from retrieve import retrieve_relevant_docs, format_context
from datetime import datetime

# Groq client — completely free
groq_client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are a helpful AI assistant for Go-Eat, a food delivery app in India.

You help users with:
- Finding food items and restaurants nearby
- Questions about menus, prices and availability
- How to place, track and cancel orders
- Payments (Razorpay, PayPal) and refunds
- Delivery policies

RULES:
- Only answer using the provided context
- If info is not in context, say: "I don't have that information. Please contact support@goeat.com"
- Keep answers short and friendly
- Use Rs. for prices
- Never make up prices or restaurant details"""


async def generate_answer(
    question:   str,
    session_id: str = None,
    user_id:    str = None,
) -> dict:

    # step 1 — retrieve relevant docs from ChromaDB
    relevant_docs    = await retrieve_relevant_docs(question, top_k=5)
    context, sources = await format_context(relevant_docs)

    # step 2 — load conversation history
    history_messages = []
    if session_id:
        try:
            history = await chat_hist_col.find_one({"session_id": session_id})
            if history:
                history_messages = history.get("messages", [])[-6:]
        except Exception as e:
            print(f"History load error: {e}")

    # step 3 — build messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history_messages)
    messages.append({
        "role":    "user",
        "content": f"""Context from Go-Eat database:
{context}

User Question: {question}

Answer based only on the context above.""",
    })

    # step 4 — call Groq (free Llama 3)
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",   # correct Groq model name
            messages=messages,
            temperature=0.3,
            max_tokens=500,
        )
        answer = response.choices[0].message.content

    except Exception as e:
        print(f"Groq error: {e}")
        raise Exception(f"AI generation failed: {str(e)}")

    # step 5 — save chat history to MongoDB
    if session_id:
        try:
            await chat_hist_col.update_one(
                {"session_id": session_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                {"role": "user",      "content": question},
                                {"role": "assistant", "content": answer},
                            ]
                        }
                    },
                    "$set": {
                        "user_id":    user_id,
                        "updated_at": datetime.utcnow(),
                    },
                    "$setOnInsert": {
                        "created_at": datetime.utcnow(),
                    },
                },
                upsert=True,
            )
        except Exception as e:
            print(f"History save error: {e}")

    return {
        "answer":     answer,
        "sources":    sources,
        "session_id": session_id,
    }