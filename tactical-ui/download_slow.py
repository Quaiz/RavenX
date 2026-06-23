import os
import requests
import time

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
os.makedirs(base_dir, exist_ok=True)

images = {
    't14.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/VDayRehearsal05052016-28.jpg',
    'himars.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/83/HIMARS_-_missile_launched.jpg',
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
            res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}, timeout=15)
            if res.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(res.content)
                print(f"Saved {filename}")
            else:
                print(f"Failed {filename} - HTTP {res.status_code}")
            time.sleep(3) # Wait 3 seconds
        except Exception as e:
            print(f"Error {filename}: {e}")
    else:
        print(f"Skipped {filename} (already exists)")
