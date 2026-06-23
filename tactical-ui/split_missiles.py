import json
import re

db_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\data\hardwareDatabase.js"

with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the JSON array
match = re.search(r"export const HARDWARE_DATABASE = (\[.*\]);", content, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    
    missile_keywords = ['missile', 'defense', 'c-ram', 'anti-tank', 'howitzer', 'artillery']
    
    for item in data:
        if item.get('type') == 'WEAPONS':
            # Check if it should be MISSILES / HEAVY
            text_to_check = (item.get('name', '') + ' ' + item.get('class', '') + ' ' + item.get('desc', '')).lower()
            if any(k in text_to_check for k in missile_keywords):
                item['type'] = 'MISSILES'
                
    new_json = json.dumps(data, indent=2)
    new_content = content[:match.start(1)] + new_json + content[match.end(1):]
    
    with open(db_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated database to separate MISSILES.")
else:
    print("Could not find JSON array.")
