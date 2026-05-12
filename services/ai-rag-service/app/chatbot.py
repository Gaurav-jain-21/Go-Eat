import ollama

def ask_llama(prompt):
    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        return response["message"]["content"]
    except Exception as e:
        return f"AI Error: Unable to fetch response from Ollama. {str(e)}"