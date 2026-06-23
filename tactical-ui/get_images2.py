import requests
import re
import json

files = [
    "File:F-35A_flight_(cropped).jpg",
    "File:Sukhoi_Su-57_at_MAKS-2019_(1).jpg",
    "File:J-20_at_Airshow_China_2016_(cropped).jpg",
    "File:MQ-9_Reaper_in_flight_(2010).jpg",
    "File:M1A2_Abrams_tank.jpg",
    "File:T-14_Armata_in_2016.jpg",
    "File:M142_HIMARS_firing.jpg",
    "File:USS_Nimitz_(CVN-68).jpg",
    "File:Nanchang_(101)_in_2021.jpg",
    "File:Severodvinsk_submarine_K-560.jpg",
    "File:S-400_Triumf_at_Engineering_Technologies_2012_01.jpg",
    "File:Patriot_missile_launch.jpg",
    "File:MiG-31K_with_Kinzhal.jpg",
    "File:FGM-148_Javelin_firing.jpg"
]

urls = {}
for f in files:
    try:
        url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={f}&prop=imageinfo&iiprop=url&format=json"
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}).json()
        pages = res['query']['pages']
        page = list(pages.values())[0]
        if 'imageinfo' in page:
            image_url = page['imageinfo'][0]['url']
            urls[f] = image_url
            print(f"Success: {f} -> {image_url}")
        else:
            print(f"Failed: {f} - No imageinfo")
    except Exception as e:
        print(f"Failed: {f} - {e}")

with open("image_urls.json", "w") as out:
    json.dump(urls, out, indent=2)
