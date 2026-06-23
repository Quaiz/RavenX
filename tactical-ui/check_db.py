import os
import re

base_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\hardware"
db_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\data\hardwareDatabase.js"

with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.finditer(r"id:\s*'([^']+)'", content)
for match in matches:
    hw_id = match.group(1).lower()
    filepath = os.path.join(base_dir, f"{hw_id}.jpg")
    
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        new_url = f"/hardware/{hw_id}.jpg"
        pattern = r"(id:\s*'" + match.group(1) + r"'[^}]*?image:\s*')[^']+(')"
        content = re.sub(pattern, r"\g<1>" + new_url + r"\g<2>", content)
    else:
        print(f"[{hw_id}] File missing or too small!")

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("DB check complete. Leftover remote URLs:")
# Check for 'http' in image field
for match in re.finditer(r"image:\s*'([^']+)'", content):
    if match.group(1).startswith("http"):
        print(f"Found remote URL: {match.group(1)}")
