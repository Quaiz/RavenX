import requests
import urllib.parse
import json

def test(target):
    target_safe = urllib.parse.quote(target)
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=links|extracts&exintro&titles={target_safe}&pllimit=5&format=json"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers).json()
    print(f"\n--- TARGET: {target} ---")
    pages = res.get('query', {}).get('pages', {})
    if not pages:
        print("No pages dict!")
        return
    for pid, pdata in pages.items():
        print(f"Page ID: {pid}")
        print(f"Title: {pdata.get('title')}")
        print(f"Missing: {'missing' in pdata}")
        print(f"Extract len: {len(pdata.get('extract', ''))}")

test("China")
test("china")
test("Vietnam")
test("vietnam")
