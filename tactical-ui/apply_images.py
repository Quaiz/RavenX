import os
import re

filepath = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components\MilitaryHardware.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'F35': 'https://upload.wikimedia.org/wikipedia/commons/6/61/F-35A_flight_%28cropped%29.jpg',
    'SU57': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Sukhoi_Design_Bureau%2C_054%2C_Sukhoi_T-50_%28Su-57_prototype%29_%2849581303977%29.jpg',
    'J20': 'https://upload.wikimedia.org/wikipedia/commons/7/73/J-20_at_CCAS2022_%2820220827103424%29.jpg',
    'MQ9': 'https://upload.wikimedia.org/wikipedia/commons/1/12/MQ-9_Reaper_UAV_%28cropped%29.jpg',
    'M1A2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/M1A2_SEP_v3.jpg/1200px-M1A2_SEP_v3.jpg', # Removed 3840px
    'T14': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/VDayRehearsal05052016-28.jpg',
    'HIMARS': 'https://upload.wikimedia.org/wikipedia/commons/8/83/HIMARS_-_missile_launched.jpg',
    'NIMITZ': 'https://upload.wikimedia.org/wikipedia/commons/8/81/USS_Nimitz_in_Victoria_Canada_036.jpg',
    'TYPE055': 'https://upload.wikimedia.org/wikipedia/commons/2/21/PLANS_Nanchang_%28DDG-101%29_20211021.jpg',
    'YASEN': 'https://upload.wikimedia.org/wikipedia/commons/4/40/%D0%9A-560_%C2%AB%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D0%B4%D0%BE%D0%B2%D0%B8%D0%BD%D1%81%D0%BA%C2%BB.jpg',
    'S400': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/%D0%A1-400_%C2%AB%D0%A2%D1%80%D0%B8%D1%83%D0%BC%D1%84%C2%BB.JPG/1200px-%D0%A1-400_%C2%AB%D0%A2%D1%80%D0%B8%D1%83%D0%BC%D1%84%C2%BB.JPG',
    'PATRIOT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/U-s-service-members-stand-by-a-patriot-missile-battery-in-gaziantep-turkey.jpg/1200px-U-s-service-members-stand-by-a-patriot-missile-battery-in-gaziantep-turkey.jpg',
    'KINZHAL': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/2018_Moscow_Victory_Day_Parade_66.jpg',
    'JAVELIN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/FGM-148_Javelin_firing.jpg/1200px-FGM-148_Javelin_firing.jpg'
}

# Find all blocks of each hardware
for hw_id, new_image_url in replacements.items():
    pattern = r"(id:\s*'" + hw_id + r"'[^}]*?image:\s*')[^']+(')"
    # print(pattern)
    content = re.sub(pattern, r"\g<1>" + new_image_url + r"\g<2>", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Images replaced successfully")
