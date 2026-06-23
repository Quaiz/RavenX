import os
import requests
import time

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"

wiki_mapping = {
    'apache': 'Boeing_AH-64_Apache',
    'tb2': 'Bayraktar_TB2',
    'm270': 'M270_Multiple_Launch_Rocket_System',
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
    'javelin': 'FGM-148_Javelin',
    'nlaw': 'NLAW',
    'm777': 'M777_howitzer',
    'm4a1': 'M4_carbine',
    'ak12': 'AK-12',
    'scar': 'FN_SCAR'
}

for hw_id, wiki_title in wiki_mapping.items():
    filename = f"{hw_id}.jpg"
    filepath = os.path.join(base_dir, filename)
    
    if os.path.exists(filepath):
        continue

    try:
        print(f"[{hw_id}] Fetching from MediaWiki API...")
        api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={wiki_title}&prop=pageimages&piprop=original&format=json"
        res = requests.get(api_url, headers={"User-Agent": "RavenX-Bot/1.0 (Contact: admin@ravenx.com)"}, timeout=10)
        
        if res.status_code == 200:
            data = res.json()
            pages = data['query']['pages']
            page = list(pages.values())[0]
            if 'original' in page:
                img_url = page['original']['source']
                
                img_res = requests.get(img_url, headers={"User-Agent": "RavenX-Bot/1.0"}, timeout=15)
                if img_res.status_code == 200:
                    with open(filepath, 'wb') as f:
                        f.write(img_res.content)
                    print(f"[{hw_id}] Saved successfully.")
                else:
                    print(f"[{hw_id}] Failed to download image - HTTP {img_res.status_code}")
            else:
                print(f"[{hw_id}] No original image found in API.")
        else:
            print(f"[{hw_id}] API Failed - HTTP {res.status_code}")
        
        time.sleep(2)
        
    except Exception as e:
        print(f"[{hw_id}] Error: {e}")

print("Download complete.")
