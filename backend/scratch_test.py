import requests

def search_wiki(query):
    # Get page summary and links
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=links|extracts&exintro&titles={query}&pllimit=10&format=json"
    res = requests.get(url).json()
    pages = res.get('query', {}).get('pages', {})
    for page_id, page_info in pages.items():
        if page_id == "-1":
            continue
        print("Title:", page_info.get('title'))
        print("Extract:", page_info.get('extract', '')[:200])
        links = [l['title'] for l in page_info.get('links', [])]
        print("Links:", links)

search_wiki("Victor Bout")
