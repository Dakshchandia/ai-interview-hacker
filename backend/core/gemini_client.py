"""
Gemini Client — quota-aware with model fallback
------------------------------------------------
Model priority:
  1. gemini-1.5-flash  (1500 req/day free tier)
  2. gemini-1.5-flash-8b (fallback, even higher quota)

Retries once on 429 after waiting the suggested delay.
"""

import time
import re
from google import genai
from google.genai import types
from google.genai.errors import ClientError
from core.config import settings

# Model fallback chain — ordered by preference
MODEL_CHAIN = [
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
]


def get_client() -> genai.Client:
    settings.validate()
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_response(prompt: str, system_instruction: str = "") -> str:
    """
    Generate a text response from Gemini.
    Tries MODEL_CHAIN in order, retries once on 429 with suggested delay.
    """
    client = get_client()
    contents = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt

    last_error = None
    for model in MODEL_CHAIN:
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=4096,  # reduced from 8192 to save quota
                ),
            )
            return response.text

        except ClientError as e:
            last_error = e
            error_str = str(e)

            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                # Extract retry delay from error message
                delay = _extract_retry_delay(error_str)
                if delay and delay <= 30:
                    print(f"⏳ Quota hit on {model}, waiting {delay}s then retrying...")
                    time.sleep(delay + 1)
                    try:
                        response = client.models.generate_content(
                            model=model,
                            contents=contents,
                            config=types.GenerateContentConfig(
                                temperature=0.7,
                                top_p=0.95,
                                top_k=40,
                                max_output_tokens=4096,
                            ),
                        )
                        return response.text
                    except ClientError:
                        pass  # Try next model in chain

                print(f"⚠️  Quota exhausted on {model}, trying next model...")
                continue  # Try next model

            # Non-quota error — raise immediately
            raise

    # All models exhausted
    raise RuntimeError(
        f"All Gemini models quota exhausted. Please wait or upgrade your API plan. "
        f"Last error: {last_error}"
    )


def _extract_retry_delay(error_str: str) -> float | None:
    """Extract retry delay seconds from Gemini 429 error message."""
    match = re.search(r"retry[^\d]*(\d+(?:\.\d+)?)\s*s", error_str, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None
