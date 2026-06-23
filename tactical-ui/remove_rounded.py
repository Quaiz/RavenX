import os
import re

directory = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to remove rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded
    # But NOT rounded-full (often used for dots/indicators)
    # Regex: replace \brounded(?:-(?:sm|md|lg|xl|2xl|3xl))?\b with empty string
    
    # We also need to be careful about not leaving double spaces
    new_content = re.sub(r'\brounded-(?:sm|md|lg|xl|2xl|3xl)\b', '', content)
    new_content = re.sub(r'\brounded\b', '', new_content)
    
    # Clean up double spaces in classNames
    new_content = re.sub(r'  +', ' ', new_content)
    # Clean up trailing spaces before quotes
    new_content = re.sub(r' "\b', '"', new_content)
    new_content = re.sub(r'\b" ', '"', new_content)
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {os.path.basename(filepath)}")
        return True
    return False

updated_count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            if process_file(os.path.join(root, file)):
                updated_count += 1

print(f"Total files updated: {updated_count}")
