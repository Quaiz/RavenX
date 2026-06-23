import os
import time
import json
import urllib.request
import re

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
db_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\data\hardwareDatabase.js"

# 50 new guns
raw_data = [
    # Pistols
    {'id': 'beretta92', 'name': 'Beretta 92', 'class': 'Semi-automatic Pistol', 'type': 'WEAPONS', 'origin': 'ITALY', 'wiki_title': 'Beretta_92', 'desc': 'A standard issue sidearm for the US military as the M9.', 'stats': [{'label': 'CALIBER', 'value': 40, 'text': '9x19mm Parabellum'}]},
    {'id': 'deserteagle', 'name': 'Desert Eagle', 'class': 'Semi-automatic Pistol', 'type': 'WEAPONS', 'origin': 'USA/ISRAEL', 'wiki_title': 'Desert_Eagle', 'desc': 'A gas-operated semi-automatic pistol known for chambering the .50 Action Express cartridge.', 'stats': [{'label': 'CALIBER', 'value': 95, 'text': '.50 AE'}]},
    {'id': 'sigp320', 'name': 'SIG Sauer P320', 'class': 'Semi-automatic Pistol', 'type': 'WEAPONS', 'origin': 'USA/GERMANY', 'wiki_title': 'SIG_Sauer_P320', 'desc': 'Adopted as the M17 by the US military, replacing the M9.', 'stats': [{'label': 'MODULARITY', 'value': 100, 'text': 'High'}]},
    {'id': 'fiveseven', 'name': 'FN Five-seveN', 'class': 'Semi-automatic Pistol', 'type': 'WEAPONS', 'origin': 'BELGIUM', 'wiki_title': 'FN_Five-seveN', 'desc': 'A lightweight polymer-based pistol designed to fire 5.7x28mm.', 'stats': [{'label': 'CALIBER', 'value': 60, 'text': '5.7x28mm'}]},
    {'id': 'cz75', 'name': 'CZ 75', 'class': 'Semi-automatic Pistol', 'type': 'WEAPONS', 'origin': 'CZECH REPUBLIC', 'wiki_title': 'CZ_75', 'desc': 'One of the original "wonder nines" featuring a staggered-column magazine.', 'stats': [{'label': 'CALIBER', 'value': 40, 'text': '9x19mm'}]},
    {'id': 'makarov', 'name': 'Makarov PM', 'class': 'Semi-automatic Pistol', 'type': 'WEAPONS', 'origin': 'USSR', 'wiki_title': 'Makarov_pistol', 'desc': 'The Soviet Union\'s standard military sidearm from 1951 to 1991.', 'stats': [{'label': 'CALIBER', 'value': 35, 'text': '9x18mm Makarov'}]},
    
    # SMGs
    {'id': 'ump45', 'name': 'Heckler & Koch UMP', 'class': 'Submachine Gun', 'type': 'WEAPONS', 'origin': 'GERMANY', 'wiki_title': 'Heckler_%26_Koch_UMP', 'desc': 'A lightweight, blowback-operated submachine gun adopted by various agencies.', 'stats': [{'label': 'CALIBER', 'value': 70, 'text': '.45 ACP'}]},
    {'id': 'mp7', 'name': 'Heckler & Koch MP7', 'class': 'Personal Defense Weapon', 'type': 'WEAPONS', 'origin': 'GERMANY', 'wiki_title': 'Heckler_%26_Koch_MP7', 'desc': 'A PDW chambered for the 4.6x30mm armor-piercing cartridge.', 'stats': [{'label': 'CALIBER', 'value': 50, 'text': '4.6x30mm'}]},
    {'id': 'mac10', 'name': 'MAC-10', 'class': 'Machine Pistol', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'MAC-10', 'desc': 'A highly compact, blowback-operated machine pistol developed in 1964.', 'stats': [{'label': 'FIRE RATE', 'value': 95, 'text': '1090 RPM'}]},
    {'id': 'thompson', 'name': 'Thompson SMG', 'class': 'Submachine Gun', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'Thompson_submachine_gun', 'desc': 'The infamous "Tommy Gun" utilized extensively in WWII.', 'stats': [{'label': 'CALIBER', 'value': 70, 'text': '.45 ACP'}]},
    {'id': 'ppsh41', 'name': 'PPSh-41', 'class': 'Submachine Gun', 'type': 'WEAPONS', 'origin': 'USSR', 'wiki_title': 'PPSh-41', 'desc': 'A Soviet submachine gun used extensively during WWII.', 'stats': [{'label': 'FIRE RATE', 'value': 90, 'text': '900 RPM'}]},
    {'id': 'bizon', 'name': 'PP-19 Bizon', 'class': 'Submachine Gun', 'type': 'WEAPONS', 'origin': 'RUSSIA', 'wiki_title': 'PP-19_Bizon', 'desc': 'A 9mm submachine gun developed by Kalashnikov featuring a helical magazine.', 'stats': [{'label': 'CAPACITY', 'value': 90, 'text': '64 rounds'}]},
    
    # Shotguns
    {'id': 'mossberg500', 'name': 'Mossberg 500', 'class': 'Pump-action Shotgun', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'Mossberg_500', 'desc': 'A series of widely used pump-action shotguns.', 'stats': [{'label': 'CALIBER', 'value': 80, 'text': '12 Gauge'}]},
    {'id': 'remington870', 'name': 'Remington 870', 'class': 'Pump-action Shotgun', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'Remington_Model_870', 'desc': 'A widely utilized US pump-action shotgun for LE and military.', 'stats': [{'label': 'CALIBER', 'value': 80, 'text': '12 Gauge'}]},
    {'id': 'benellim4', 'name': 'Benelli M4', 'class': 'Semi-automatic Shotgun', 'type': 'WEAPONS', 'origin': 'ITALY', 'wiki_title': 'Benelli_M4', 'desc': 'A tactical semi-automatic shotgun used by the USMC.', 'stats': [{'label': 'CALIBER', 'value': 80, 'text': '12 Gauge'}]},
    {'id': 'spas12', 'name': 'Franchi SPAS-12', 'class': 'Combat Shotgun', 'type': 'WEAPONS', 'origin': 'ITALY', 'wiki_title': 'Franchi_SPAS-12', 'desc': 'A dual-mode shotgun, selectable between pump-action and semi-automatic.', 'stats': [{'label': 'MODE', 'value': 100, 'text': 'Dual-Action'}]},
    {'id': 'aa12', 'name': 'AA-12', 'class': 'Automatic Shotgun', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'Atchisson_AA-12', 'desc': 'A fully automatic combat shotgun.', 'stats': [{'label': 'FIRE RATE', 'value': 95, 'text': '300 RPM'}]},
    {'id': 'saiga12', 'name': 'Saiga-12', 'class': 'Semi-automatic Shotgun', 'type': 'WEAPONS', 'origin': 'RUSSIA', 'wiki_title': 'Saiga-12', 'desc': 'A Kalashnikov-pattern 12-gauge combat shotgun.', 'stats': [{'label': 'MAGAZINE', 'value': 85, 'text': 'Box/Drum Mag'}]},
    
    # Rifles
    {'id': 'fal', 'name': 'FN FAL', 'class': 'Battle Rifle', 'type': 'WEAPONS', 'origin': 'BELGIUM', 'wiki_title': 'FN_FAL', 'desc': 'The "Right Arm of the Free World" chambered in 7.62 NATO.', 'stats': [{'label': 'CALIBER', 'value': 80, 'text': '7.62x51mm'}]},
    {'id': 'm14', 'name': 'M14 Rifle', 'class': 'Battle Rifle', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'M14_rifle', 'desc': 'An American select-fire battle rifle.', 'stats': [{'label': 'CALIBER', 'value': 80, 'text': '7.62x51mm'}]},
    {'id': 'g3', 'name': 'Heckler & Koch G3', 'class': 'Battle Rifle', 'type': 'WEAPONS', 'origin': 'GERMANY', 'wiki_title': 'Heckler_%26_Koch_G3', 'desc': 'A German 7.62x51mm NATO battle rifle.', 'stats': [{'label': 'RELIABILITY', 'value': 90, 'text': 'Roller-delayed'}]},
    {'id': 'sks', 'name': 'SKS', 'class': 'Semi-automatic Rifle', 'type': 'WEAPONS', 'origin': 'USSR', 'wiki_title': 'SKS', 'desc': 'A Soviet semi-automatic carbine chambered for the 7.62x39mm round.', 'stats': [{'label': 'CALIBER', 'value': 70, 'text': '7.62x39mm'}]},
    {'id': 'm1garand', 'name': 'M1 Garand', 'class': 'Semi-automatic Rifle', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'M1_Garand', 'desc': 'The standard US service rifle during World War II.', 'stats': [{'label': 'CALIBER', 'value': 85, 'text': '.30-06 Springfield'}]},
    {'id': 'kar98k', 'name': 'Karabiner 98k', 'class': 'Bolt-action Rifle', 'type': 'WEAPONS', 'origin': 'GERMANY', 'wiki_title': 'Karabiner_98k', 'desc': 'The standard service rifle of the German Wehrmacht.', 'stats': [{'label': 'CALIBER', 'value': 80, 'text': '7.92x57mm Mauser'}]},
    {'id': 'mosin', 'name': 'Mosin-Nagant', 'class': 'Bolt-action Rifle', 'type': 'WEAPONS', 'origin': 'RUSSIA', 'wiki_title': 'Mosin–Nagant', 'desc': 'A five-shot, bolt-action, internal magazine-fed military rifle.', 'stats': [{'label': 'CALIBER', 'value': 85, 'text': '7.62x54mmR'}]},
    {'id': 'tar21', 'name': 'IWI Tavor TAR-21', 'class': 'Assault Rifle (Bullpup)', 'type': 'WEAPONS', 'origin': 'ISRAEL', 'wiki_title': 'IWI_Tavor', 'desc': 'An Israeli bullpup assault rifle.', 'stats': [{'label': 'ERGONOMICS', 'value': 90, 'text': 'Bullpup'}]},
    {'id': 'l85a2', 'name': 'SA80 / L85A2', 'class': 'Assault Rifle (Bullpup)', 'type': 'WEAPONS', 'origin': 'UK', 'wiki_title': 'SA80', 'desc': 'A British family of 5.56x45mm NATO bullpup assault rifles.', 'stats': [{'label': 'ACCURACY', 'value': 85, 'text': 'High'}]},
    {'id': 'galil', 'name': 'IMI Galil', 'class': 'Assault Rifle', 'type': 'WEAPONS', 'origin': 'ISRAEL', 'wiki_title': 'IMI_Galil', 'desc': 'A family of Israeli small arms designed by Yisrael Galil.', 'stats': [{'label': 'RELIABILITY', 'value': 95, 'text': 'AK-derived'}]},

    # Sniper
    {'id': 'svd', 'name': 'Dragunov SVD', 'class': 'Designated Marksman Rifle', 'type': 'WEAPONS', 'origin': 'USSR', 'wiki_title': 'Dragunov_sniper_rifle', 'desc': 'A semi-automatic designated marksman rifle chambered in 7.62x54mmR.', 'stats': [{'label': 'RANGE', 'value': 80, 'text': '800 m'}]},
    {'id': 'vss', 'name': 'VSS Vintorez', 'class': 'Suppressed Sniper Rifle', 'type': 'WEAPONS', 'origin': 'USSR', 'wiki_title': 'VSS_Vintorez', 'desc': 'A suppressed sniper rifle that uses a heavy subsonic 9x39mm cartridge.', 'stats': [{'label': 'STEALTH', 'value': 100, 'text': 'Integrally Suppressed'}]},
    {'id': 'm24', 'name': 'M24 Sniper Weapon System', 'class': 'Sniper Rifle', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'M24_Sniper_Weapon_System', 'desc': 'The military and police version of the Remington Model 700 rifle.', 'stats': [{'label': 'ACCURACY', 'value': 95, 'text': 'Sub-MOA'}]},
    {'id': 'intervention', 'name': 'CheyTac M200 Intervention', 'class': 'Sniper Rifle', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'CheyTac_Intervention', 'desc': 'An American bolt-action sniper rifle designed for ultra-long range engagements.', 'stats': [{'label': 'RANGE', 'value': 100, 'text': '2,300 m'}]},
    {'id': 'sr25', 'name': 'SR-25', 'class': 'Designated Marksman Rifle', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'SR-25', 'desc': 'A semi-automatic special application sniper rifle.', 'stats': [{'label': 'ACCURACY', 'value': 90, 'text': 'High'}]},
    
    # MGs
    {'id': 'mg42', 'name': 'MG 42', 'class': 'General-purpose Machine Gun', 'type': 'WEAPONS', 'origin': 'GERMANY', 'wiki_title': 'MG_42', 'desc': 'A 7.92x57mm Mauser general-purpose machine gun designed in Nazi Germany.', 'stats': [{'label': 'FIRE RATE', 'value': 100, 'text': '1,200 RPM'}]},
    {'id': 'm60', 'name': 'M60', 'class': 'General-purpose Machine Gun', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'M60_machine_gun', 'desc': 'A family of American general-purpose machine guns firing 7.62x51mm NATO.', 'stats': [{'label': 'FIRE RATE', 'value': 75, 'text': '600 RPM'}]},
    {'id': 'm240', 'name': 'M240', 'class': 'General-purpose Machine Gun', 'type': 'WEAPONS', 'origin': 'USA/BELGIUM', 'wiki_title': 'M240_machine_gun', 'desc': 'The US military designation for the FN MAG.', 'stats': [{'label': 'RELIABILITY', 'value': 100, 'text': 'Extreme'}]},
    {'id': 'minigun', 'name': 'M134 Minigun', 'class': 'Rotary Machine Gun', 'type': 'WEAPONS', 'origin': 'USA', 'wiki_title': 'M134_Minigun', 'desc': 'A 7.62x51mm NATO six-barrel rotary machine gun.', 'stats': [{'label': 'FIRE RATE', 'value': 100, 'text': '6,000 RPM'}]}
]

# Read existing DB
with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r"export const HARDWARE_DATABASE = (\[.*\]);", content, re.DOTALL)
if match:
    existing_data = json.loads(match.group(1))
else:
    existing_data = []

existing_ids = {item['id'].lower() for item in existing_data}

print(f"Existing items: {len(existing_data)}. Adding up to {len(raw_data)} new items.")

def download_file(url, path):
    req = urllib.request.Request(url, headers={'User-Agent': 'RavenX-Tactical/3.0'})
    with urllib.request.urlopen(req, timeout=15) as response, open(path, 'wb') as out_file:
        out_file.write(response.read())

added_items = 0

for index, item in enumerate(raw_data):
    hw_id = item['id'].lower()
    if hw_id in existing_ids:
        continue
        
    wiki_title = item['wiki_title']
    filename = f"{hw_id}.jpg"
    filepath = os.path.join(base_dir, filename)
    
    success = False
    
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        success = True
        print(f"[{index+1}/{len(raw_data)}] {hw_id} - Exists Locally.")
    else:
        try:
            print(f"[{index+1}/{len(raw_data)}] {hw_id} - Fetching from MediaWiki API...")
            api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={wiki_title}&prop=pageimages&pithumbsize=1000&format=json"
            
            req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                
            pages = data.get('query', {}).get('pages', {})
            page = list(pages.values())[0] if pages else {}
            
            if 'thumbnail' in page:
                img_url = page['thumbnail']['source']
                download_file(img_url, filepath)
                print(f"  -> Downloaded {filename}")
                success = True
            else:
                print(f"  -> No thumbnail found.")
                
            time.sleep(1.2)
            
        except urllib.error.HTTPError as e:
             print(f"  -> HTTP Error: {e.code}")
             time.sleep(3)
        except Exception as e:
            print(f"  -> Error: {e}")

    if success:
        clean_item = dict(item)
        del clean_item['wiki_title']
        clean_item['image'] = f"/hardware/{filename}"
        existing_data.append(clean_item)
        added_items += 1

# Write to JS file
js_content = f"// AUTO-GENERATED DATABASE ({len(existing_data)} items)\n\nexport const HARDWARE_DATABASE = "
js_content += json.dumps(existing_data, indent=2)
js_content += ";\n"

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"\nCompleted! Added {added_items} new weapons to DB. Total items: {len(existing_data)}.")
