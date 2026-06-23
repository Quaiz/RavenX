import os
import time
import urllib.request
import json
import urllib.parse

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
db_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\data\hardwareDatabase.js"

missing_items = {
    'tb2': 'Bayraktar_TB2',
    'tos1a': 'TOS-1',
    'bmp3': 'BMP-3',
    'arleigh': 'Arleigh_Burke-class_destroyer',
    'yasen': 'Yasen-class_submarine',
    'ohio': 'Ohio-class_submarine',
    'borei': 'Borei-class_submarine',
    'astute': 'Astute-class_submarine',
    'lcs': 'Littoral_combat_ship',
    'thaad': 'Terminal_High_Altitude_Area_Defense',
    'irondome': 'Iron_Dome',
    'atacms': 'MGM-140_ATACMS',
    'm777': 'M777_howitzer',
    'ak12': 'AK-12'
}

def download_file(url, path):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    with urllib.request.urlopen(req, timeout=20) as response, open(path, 'wb') as out_file:
        out_file.write(response.read())

for hw_id, wiki_title in missing_items.items():
    filepath = os.path.join(base_dir, f"{hw_id}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        continue
            
    try:
        print(f"[{hw_id}] Querying Wikimedia API for thumbnail...")
        # Get 1000px thumbnail
        api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={wiki_title}&prop=pageimages&pithumbsize=1000&format=json"
        
        req = urllib.request.Request(api_url, headers={'User-Agent': 'RavenX-Dashboard-Builder/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            
        pages = data.get('query', {}).get('pages', {})
        page = list(pages.values())[0] if pages else {}
        
        if 'thumbnail' in page:
            img_url = page['thumbnail']['source']
            print(f"[{hw_id}] Found thumbnail URL: {img_url}")
            download_file(img_url, filepath)
            print(f"[{hw_id}] Downloaded successfully.")
        else:
            print(f"[{hw_id}] No thumbnail found.")
            
        time.sleep(2)
        
    except Exception as e:
        print(f"[{hw_id}] Error: {e}")

print("Checking db update...")
import re
with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.finditer(r"id:\s*'([^']+)'", content)
for match in matches:
    hw_id = match.group(1).lower()
    filepath = os.path.join(base_dir, f"{hw_id}.jpg")
    
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        new_url = f"/hardware/{hw_id}.jpg"
        pattern = r"(id:\s*'" + match.group(1) + r"'[^}]*?image:\s*')[^']+(')"
        content = re.sub(pattern, r"\g<1>" + new_url + r"\g<2>", content)

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Database updated to force local paths.")
