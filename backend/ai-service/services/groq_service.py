import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def ask_groq(
    message: str,
    system_prompt: str = None,
    context: str = None,
):

    final_system_prompt = system_prompt or (
        "You are GoEat AI assistant."
    )

    final_user_message = message

    if context:
        final_user_message = f"""
Use this context to answer accurately.

CONTEXT:
{context}

QUESTION:
{message}
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": final_system_prompt,
            },
            {
                "role": "user",
                "content": final_user_message,
            },
        ],
        temperature=0.7,
    )

    return response.choices[0].message.content