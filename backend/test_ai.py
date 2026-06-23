import requests

url = "https://backend-m4edkucwp-thaiminhquan505-1161s-projects.vercel.app/api/ai/chat"

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "hello"}],
    "stream": True
}

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer fake_token"
}

try:
    print(f"Sending POST to {url}...")
    resp = requests.post(url, json=payload, headers=headers, stream=True)
    print(f"Status Code: {resp.status_code}")
    print(f"Headers: {resp.headers}")
    for chunk in resp.iter_content(chunk_size=1024):
        if chunk:
            print(chunk.decode("utf-8"), end="")
except Exception as e:
    print(f"Error: {e}")
