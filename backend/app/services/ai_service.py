"""
ai_service.py — Lightweight Edition
-------------------------------------
- Groq API for chat and summary (fast, free)
- Hugging Face Inference API for embeddings (no PyTorch, no heavy install)
- Works perfectly on Render free tier
"""

import os
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_TOKEN", "")


def generate_embedding(text: str) -> list:
    """
    Generate 384-dim embeddings via Hugging Face Inference API.
    No local model, no PyTorch — just a simple HTTP call.
    Falls back to zero vector if API fails.
    """
    try:
        headers = {}
        if HF_TOKEN:
            headers["Authorization"] = f"Bearer {HF_TOKEN}"

        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": text[:512]},  # truncate to avoid token limits
            timeout=15
        )
        response.raise_for_status()
        result = response.json()

        # HF returns nested list for batched input, flat list for single
        if isinstance(result[0], list):
            return result[0]
        return result

    except Exception as e:
        print(f"Embedding Error: {e}")
        return [0.0] * 384  # zero vector fallback


def generate_summary(text: str) -> str:
    """Generate a structured summary of a note using Groq."""
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes notes concisely and clearly."
                },
                {
                    "role": "user",
                    "content": f"Summarize the following note with key bullet points and a brief overview:\n\n{text}"
                }
            ],
            temperature=0.3,
            max_tokens=400,
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Summary Error: {e}")
        return "Summary unavailable. Please try again."


def chat_with_notes(context: str, message: str, history: list = None) -> str:
    """
    Core RAG chat function.
    Sends context (from vector search), history, and user message to Groq.
    """
    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are MentorAI, a Senior Technical Mentor. "
                    "Your goal is to help users learn from their own knowledge base.\n"
                    "GUIDELINES:\n"
                    "1. Use the provided 'USER NOTES' as your primary source of truth.\n"
                    "2. If the notes contain the answer, say 'Based on your notes...' and explain clearly.\n"
                    "3. If the notes are irrelevant, provide a helpful expert answer from general knowledge.\n"
                    "4. Use professional Markdown (bold, lists, code blocks) for readability.\n"
                    "5. Be encouraging and concise."
                )
            }
        ]

        if context and context.strip():
            messages.append({
                "role": "system",
                "content": f"RELEVANT USER NOTES FOR THIS QUERY:\n\n{context}"
            })

        if history:
            for msg in history:
                if msg.get("role") in ("user", "assistant") and msg.get("content"):
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })

        messages.append({"role": "user", "content": message})

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Chat Error: {e}")
        return "I'm sorry, I couldn't reach the AI mentor core. Please check your GROQ_API_KEY."