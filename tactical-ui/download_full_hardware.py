import os
import requests
import time

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
os.makedirs(base_dir, exist_ok=True)

# Map our internal IDs to Wikipedia page titles to fetch the main image
wiki_mapping = {
    'f22': 'Lockheed_Martin_F-22_Raptor',
    'f35': 'Lockheed_Martin_F-35_Lightning_II',
    'su57': 'Sukhoi_Su-57',
    'j20': 'Chengdu_J-20',
    'b2': 'Northrop_B-2_Spirit',
    'typhoon': 'Eurofighter_Typhoon',
    'rafale': 'Dassault_Rafale',
    'apache': 'Boeing_AH-64_Apache',
    'mq9': 'General_Atomics_MQ-9_Reaper',
    'tb2': 'Bayraktar_TB2',
    
    'm1a2': 'M1_Abrams',
    'leopard2': 'Leopard_2',
    't14': 'T-14_Armata',
    'k2': 'K2_Black_Panther',
    'challenger2': 'Challenger_2',
    'himars': 'M142_HIMARS',
    'm270': 'M270_Multiple_Launch_Rocket_System',
    'tos1a': 'TOS-1',
    'stryker': 'Stryker',
    'bmp3': 'BMP-3',
    
    'ford': 'Gerald_R._Ford-class_aircraft_carrier',
    'nimitz': 'Nimitz-class_aircraft_carrier',
    'arleigh': 'Arleigh_Burke-class_destroyer',
    'type055': 'Type_055_destroyer',
    'virginia': 'Virginia-class_submarine',
    'yasen': 'Yasen-class_submarine',
    'ohio': 'Ohio-class_submarine',
    'borei': 'Borei-class_submarine',
    'astute': 'Astute-class_submarine',
    'lcs': 'Littoral_combat_ship',
    
    'patriot': 'MIM-104_Patriot',
    's400': 'S-400_missile_system',
    'thaad': 'Terminal_High_Altitude_Area_Defense',
    'irondome': 'Iron_Dome',
    'kinzhal': 'Kh-47M2_Kinzhal',
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
        print(f"[{hw_id}] Already exists")
        continue

    try:
        print(f"[{hw_id}] Fetching from Wikipedia API...")
        api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{wiki_title}"
        res = requests.get(api_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        
        if res.status_code == 200:
            data = res.json()
            if 'originalimage' in data:
                img_url = data['originalimage']['source']
                
                # Download the image
                img_res = requests.get(img_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
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
        
        # Sleep to avoid rate limiting
        time.sleep(1.5)
        
    except Exception as e:
        print(f"[{hw_id}] Error: {e}")

print("Download complete.")
