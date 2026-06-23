import requests
import urllib.parse
import json

def test(target):
    target_safe = urllib.parse.quote(target)
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=links|extracts&exintro&titles={target_safe}&pllimit=50&format=json"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers).json()
    pages = res.get('query', {}).get('pages', {})
    page = list(pages.values())[0]
    links = [l['title'] for l in page.get('links', [])]
    filtered_links = [l for l in links if ":" not in l and not l.startswith("List of")]
    print(f"\n--- TARGET: {target} ---")
    print(filtered_links)

test("China")
