import requests
import json

GEMINI_KEY = 'AIzaSyAd-tuBIYb0difgvc-QJf2tbU7piFkK71o'
GEMINI_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key={GEMINI_KEY}'

payload = {
    "contents": [{"role": "user", "parts": [{"text": "Hello, this is a test prompt."}]}],
    "generationConfig": {"temperature": 0.6, "maxOutputTokens": 300}
}

try:
    resp = requests.post(GEMINI_URL, json=payload)
    print(f"Status: {resp.status_code}")
    print(resp.text)
except Exception as e:
    print(e)
