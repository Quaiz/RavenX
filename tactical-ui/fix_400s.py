import os
import re

filepath = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components\MilitaryHardware.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'M1A2': 'https://upload.wikimedia.org/wikipedia/commons/0/0b/M1A2_SEP_v3.jpg',
    'S400': 'https://upload.wikimedia.org/wikipedia/commons/9/94/%D0%A1-400_%C2%AB%D0%A2%D1%80%D0%B8%D1%83%D0%BC%D1%84%C2%BB.JPG',
    'PATRIOT': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/U-s-service-members-stand-by-a-patriot-missile-battery-in-gaziantep-turkey.jpg',
    'JAVELIN': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/FGM-148_Javelin_firing.jpg'
}

for hw_id, new_image_url in replacements.items():
    pattern = r"(id:\s*'" + hw_id + r"'[^}]*?image:\s*')[^']+(')"
    content = re.sub(pattern, r"\g<1>" + new_image_url + r"\g<2>", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("400s fixed")
