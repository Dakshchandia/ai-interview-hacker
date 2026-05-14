import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.core.config import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)
print("Available models supporting generateContent:")
for m in client.models.list():
    actions = m.supported_actions or []
    if "generateContent" in actions:
        print(" ", m.name)
