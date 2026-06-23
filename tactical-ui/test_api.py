import requests

pages = [
    "F-35_Lightning_II",
    "Sukhoi_Su-57",
    "Chengdu_J-20",
    "General_Atomics_MQ-9_Reaper",
    "M1_Abrams",
    "T-14_Armata",
    "M142_HIMARS",
    "Nimitz-class_aircraft_carrier",
    "Type_055_destroyer",
    "Yasen-class_submarine",
    "S-400_missile_system",
    "MIM-104_Patriot",
    "Kh-47M2_Kinzhal",
    "FGM-148_Javelin"
]

urls = {}
for p in pages:
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{p}"
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}).json()
        image = res.get('originalimage', {}).get('source', '')
        if image:
            urls[p] = image
            print(f"Success: {p} -> {image}")
        else:
            print(f"Failed: {p} - No image in summary")
    except Exception as e:
        print(f"Failed: {p} - {e}")

import json
with open("wiki_urls.json", "w") as out:
    json.dump(urls, out, indent=2)
