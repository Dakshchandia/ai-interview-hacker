"""
Gemini Client — uses the new google-genai SDK (v2+)
"""
from google import genai
from google.genai import types
from backend.core.config import settings


def get_client() -> genai.Client:
    settings.validate()
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_response(prompt: str, system_instruction: str = "") -> str:
    """
    Generate a text response from Gemini 2.5 Flash.
    Combines system_instruction + prompt into a single request.
    """
    client = get_client()

    contents = prompt
    if system_instruction:
        contents = f"{system_instruction}\n\n{prompt}"

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
        ),
    )

    return response.text
