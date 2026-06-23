import requests
import urllib.parse
import json
import sys

def test(target):
    target_safe = urllib.parse.quote(target)
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={target_safe}&gsrlimit=10&prop=extracts&exintro&exchars=150&format=json"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers).json()
    pages = list(res.get('query', {}).get('pages', {}).values())
    
    print(f"\n--- TARGET: {target} ---")
    for p in pages:
        print(p.get('title').encode(sys.stdout.encoding, errors='replace').decode(sys.stdout.encoding))

test("China")
test("Victor Bout")
