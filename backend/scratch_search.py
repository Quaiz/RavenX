import requests
import json
import urllib.parse

def test(target):
    target_safe = urllib.parse.quote(target)
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=links|extracts&exintro&titles={target_safe}&pllimit=5&format=json"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers).json()
    pages = res.get('query', {}).get('pages', {})
    if not pages:
        print("No pages found")
        return
    page = list(pages.values())[0]
    print(f"[{target}] Title:", page.get('title'), "Missing:", page.get('missing') is not None)

test("Vietnam")
test("vietnam")
test("China")
test("china")
