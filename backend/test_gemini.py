"""
Quick test — run from project root:
    python backend/test_gemini.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.gemini_client import generate_response

def test_gemini():
    print("Testing Gemini API connection...")
    try:
        response = generate_response(
            prompt="Say exactly: 'Gemini is working!' and nothing else.",
            system_instruction="You are a test assistant. Follow instructions exactly."
        )
        print(f"✅ Success! Response: {response.strip()}")
    except Exception as e:
        print(f"Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
