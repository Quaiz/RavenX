import os
import time
import urllib.request
import json
import random

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"

wiki_mapping = {
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
    'nlaw': 'NLAW',
    'm777': 'M777_howitzer',
    'ak12': 'AK-12'
}

user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0"
]

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': random.choice(user_agents)})
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode())

def download_file(url, path):
    req = urllib.request.Request(url, headers={'User-Agent': random.choice(user_agents)})
    with urllib.request.urlopen(req, timeout=20) as response, open(path, 'wb') as out_file:
        out_file.write(response.read())

for hw_id, wiki_title in wiki_mapping.items():
    filepath = os.path.join(base_dir, f"{hw_id}.jpg")
    if os.path.exists(filepath):
        continue
    try:
        print(f"[{hw_id}] Querying...")
        api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{wiki_title}"
        data = fetch_json(api_url)
        if 'originalimage' in data:
            img_url = data['originalimage']['source']
            download_file(img_url, filepath)
            print(f"[{hw_id}] Downloaded.")
        else:
            print(f"[{hw_id}] No originalimage.")
        time.sleep(3)
    except urllib.error.HTTPError as e:
        print(f"[{hw_id}] HTTP Error: {e.code}")
    except Exception as e:
        print(f"[{hw_id}] Error: {e}")

print("Done")
