import os
import re

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
db_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\data\hardwareDatabase.js"

fallback_urls = {
    'tb2': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Bayraktar_TB2_in_flight.jpg',
    'tos1a': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/TOS-1A_Solntsepyok.jpg',
    'bmp3': 'https://upload.wikimedia.org/wikipedia/commons/8/81/BMP-3_in_Moscow_2015.jpg',
    'arleigh': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/USS_Arleigh_Burke_%28DDG-51%29.jpg',
    'yasen': 'https://upload.wikimedia.org/wikipedia/commons/4/40/%D0%9A-560_%C2%AB%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D0%BE%D0%B4%D0%B2%D0%B8%D0%BD%D1%81%D0%BA%C2%BB.jpg',
    'ohio': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/USS_Ohio_%28SSGN-726%29.jpg',
    'borei': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Yury_Dolgorukiy_submarine_1.jpg',
    'astute': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/HMS_Astute_%28S119%29.jpg',
    'lcs': 'https://upload.wikimedia.org/wikipedia/commons/4/45/USS_Freedom_%28LCS-1%29.jpg',
    'thaad': 'https://upload.wikimedia.org/wikipedia/commons/2/22/THAAD_launcher.jpg',
    'irondome': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Iron_Dome_in_action.jpg',
    'atacms': 'https://upload.wikimedia.org/wikipedia/commons/0/07/ATACMS_launch.jpg',
    'm777': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/M777_howitzer_Afghanistan.jpg',
    'ak12': 'https://upload.wikimedia.org/wikipedia/commons/4/41/AK-12_assault_rifle.jpg'
}

with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For each item in database, check if local file exists
matches = re.finditer(r"id:\s*'([^']+)'", content)
for match in matches:
    hw_id = match.group(1)
    filename = f"{hw_id.lower()}.jpg"
    filepath = os.path.join(base_dir, filename)
    
    if os.path.exists(filepath):
        new_url = f"/hardware/{filename}"
    else:
        new_url = fallback_urls.get(hw_id.lower(), "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")
    
    # Replace the image: '...' for this specific hw_id block
    pattern = r"(id:\s*'" + hw_id + r"'[^}]*?image:\s*')[^']+(')"
    content = re.sub(pattern, r"\g<1>" + new_url + r"\g<2>", content)

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated hardwareDatabase.js with accurate local and remote URLs.")
