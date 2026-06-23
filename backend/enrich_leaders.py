import json
import requests
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

def fetch_wiki_details(name):
    if not name: return None
    
    target = urllib.parse.quote(name)
    url = f'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&exsentences=2&explaintext&titles={target}&format=json'
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        res = requests.get(url, headers=headers, timeout=5).json()
        pages = list(res.get('query', {}).get('pages', {}).values())
        if pages and 'extract' in pages[0]:
            return pages[0]['extract']
    except Exception as e:
        print(f"Error fetching {name}: {e}")
    return None

def main():
    in_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\leaders_data.json"
    with open(in_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    names_to_fetch = set()
    for country, info in data.items():
        if info.get('head_of_state', {}).get('name'):
            names_to_fetch.add(info['head_of_state']['name'])
        if info.get('head_of_gov', {}).get('name'):
            names_to_fetch.add(info['head_of_gov']['name'])
            
    print(f"Fetching details for {len(names_to_fetch)} leaders...")
    
    details_cache = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_wiki_details, name): name for name in names_to_fetch}
        for future in futures:
            name = futures[future]
            try:
                details_cache[name] = future.result()
            except Exception:
                details_cache[name] = None
                
    for country, info in data.items():
        if info.get('head_of_state', {}).get('name'):
            info['head_of_state']['desc'] = details_cache.get(info['head_of_state']['name'])
        if info.get('head_of_gov', {}).get('name'):
            info['head_of_gov']['desc'] = details_cache.get(info['head_of_gov']['name'])
            
    with open(in_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print("Done!")

if __name__ == "__main__":
    main()
