import requests
import json
import urllib.parse

def get_leader(country_name):
    # Search wikidata for the country to get its Q-ID, or just use SPARQL with label filtering
    # But SPARQL label filtering can be slow. 
    # Let's just use Wikipedia's API: "President of {country_name}" and "Prime Minister of {country_name}"
    
    titles_to_check = [f"President of {country_name}", f"Prime Minister of {country_name}", f"Leader of {country_name}", country_name]
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    for title in titles_to_check:
        target = urllib.parse.quote(title)
        url = f'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={target}&gsrlimit=1&prop=pageimages|extracts&exintro&exchars=200&pithumbsize=400&format=json'
        
        try:
            res = requests.get(url, headers=headers, timeout=5).json()
            pages = list(res.get('query', {}).get('pages', {}).values())
            if pages:
                page = pages[0]
                # If we searched for "President of X", we might get the article "President of X" or the person's name.
                # Actually, searching Wikipedia for "Current President of Russia" yields "President of Russia" or "Vladimir Putin".
                
                print(f"Title: {page.get('title')} | Extract: {page.get('extract')} | Img: {page.get('thumbnail', {}).get('source')}")
                break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    get_leader("United States")
    get_leader("Vietnam")
    get_leader("Russia")
    get_leader("China")
