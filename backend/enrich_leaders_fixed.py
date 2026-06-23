import json
import requests
import urllib.parse
import time
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def fetch_wiki_details(session, name):
    if not name: return None
    
    target = urllib.parse.quote(name)
    url = f'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={target}&gsrlimit=1&prop=extracts&exintro&exsentences=3&explaintext&format=json'
    headers = {'User-Agent': 'RavenX Intelligence Engine / 1.0 (tactical@ravenx.com)'}
    
    try:
        res = session.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            pages = list(data.get('query', {}).get('pages', {}).values())
            if pages and 'extract' in pages[0]:
                extract = pages[0]['extract']
                # Try to extract a party from the text
                party = None
                if "Democratic" in extract: party = "Democratic"
                elif "Republican" in extract: party = "Republican"
                elif "Communist Party" in extract: party = "Communist Party"
                elif "Conservative" in extract: party = "Conservative"
                elif "Labour" in extract: party = "Labour"
                elif "Independent" in extract: party = "Independent"
                
                # Extract birth year if present (e.g., "born 1952" or "born 21 December 1977")
                dob = None
                match = re.search(r'born.*?(\d{4})', extract)
                if match:
                    dob = match.group(1)
                    
                return {"desc": extract.strip(), "party": party, "dob": dob}
    except Exception as e:
        print(f"Error fetching {name}: {e}")
    return None

def main():
    in_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\leaders_data.json"
    with open(in_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    names_to_fetch = set()
    for country, info in data.items():
        if info.get('head_of_state', {}).get('name') and not info['head_of_state'].get('desc'):
            names_to_fetch.add(info['head_of_state']['name'])
        if info.get('head_of_gov', {}).get('name') and not info['head_of_gov'].get('desc'):
            names_to_fetch.add(info['head_of_gov']['name'])
            
    print(f"Fetching details for {len(names_to_fetch)} leaders...")
    
    details_cache = {}
    session = requests.Session()
    
    count = 0
    total = len(names_to_fetch)
    for name in names_to_fetch:
        count += 1
        print(f"[{count}/{total}] Fetching {name}...")
        details_cache[name] = fetch_wiki_details(session, name)
        time.sleep(0.05) # Polite rate limiting
                
    for country, info in data.items():
        hos = info.get('head_of_state', {})
        if hos.get('name'):
            details = details_cache.get(hos['name'])
            if details:
                hos['desc'] = details['desc']
                hos['party'] = details['party'] if details['party'] else hos.get('party')
                hos['dob'] = details['dob'] if details['dob'] else hos.get('dob')
                
        hog = info.get('head_of_gov', {})
        if hog.get('name'):
            details = details_cache.get(hog['name'])
            if details:
                hog['desc'] = details['desc']
                hog['party'] = details['party'] if details['party'] else hog.get('party')
                hog['dob'] = details['dob'] if details['dob'] else hog.get('dob')
            
    with open(in_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print("Done!")

if __name__ == "__main__":
    main()
