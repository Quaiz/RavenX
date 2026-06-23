import os
import requests
import json

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
os.makedirs(base_dir, exist_ok=True)

images = {
    'f35.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/61/F-35A_flight_%28cropped%29.jpg',
    'su57.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Sukhoi_Design_Bureau%2C_054%2C_Sukhoi_T-50_%28Su-57_prototype%29_%2849581303977%29.jpg',
    'j20.jpg': 'https://upload.wikimedia.org/wikipedia/commons/7/73/J-20_at_CCAS2022_%2820220827103424%29.jpg',
    'mq9.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/12/MQ-9_Reaper_UAV_%28cropped%29.jpg',
    'm1a2.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/0b/M1A2_SEP_v3.jpg',
    't14.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/VDayRehearsal05052016-28.jpg',
    'himars.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/83/HIMARS_-_missile_launched.jpg',
    'nimitz.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/81/USS_Nimitz_in_Victoria_Canada_036.jpg',
    'type055.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/21/PLANS_Nanchang_%28DDG-101%29_20211021.jpg',
    'yasen.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/40/%D0%9A-560_%C2%AB%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D0%BE%D0%B4%D0%B2%D0%B8%D0%BD%D1%81%D0%BA%C2%BB.jpg',
    's400.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/94/%D0%A1-400_%C2%AB%D0%A2%D1%80%D0%B8%D1%83%D0%BC%D1%84%C2%BB.JPG',
    'patriot.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/U-s-service-members-stand-by-a-patriot-missile-battery-in-gaziantep-turkey.jpg',
    'kinzhal.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/2018_Moscow_Victory_Day_Parade_66.jpg',
    'javelin.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/FGM-148_Javelin_firing.jpg'
}

for filename, url in images.items():
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        try:
            print(f"Downloading {filename}...")
            # We use a standard browser User-Agent to avoid 403 Forbidden
            res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}, timeout=10)
            if res.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(res.content)
                print(f"Saved {filename}")
            else:
                print(f"Failed {filename} - HTTP {res.status_code}")
        except Exception as e:
            print(f"Error {filename}: {e}")
    else:
        print(f"Skipped {filename} (already exists)")
