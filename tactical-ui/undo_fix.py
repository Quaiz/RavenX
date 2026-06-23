import os
import re

directory = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Reverse the blind replacements
    new_content = new_content.replace(' rounded-t', ' -t')
    new_content = new_content.replace('"rounded-t', '"-t')
    new_content = new_content.replace(' rounded-b', ' -b')
    new_content = new_content.replace('"rounded-b', '"-b')
    new_content = new_content.replace(' rounded-l', ' -l')
    new_content = new_content.replace('"rounded-l', '"-l')
    new_content = new_content.replace(' rounded-r', ' -r')
    new_content = new_content.replace('"rounded-r', '"-r')
    
    # Now we have stray -t, -b, -l, -r, -t-md, -b-lg, etc.
    # Let's remove them safely. They are standalone words starting with dash.
    # E.g., ` -t `, ` -b `, ` -tl `, ` -t-md `, ` -tr-lg `
    # Valid negative classes start with: -m, -p, -space, -inset, -top, -bottom, -left, -right, -translate, -rotate, -skew, -z
    # So we want to remove \b-(t|b|l|r|tl|tr|bl|br)(-[a-z0-9]+)?\b
    # Wait! \b doesn't match before a dash. A space before the dash is \s.
    new_content = re.sub(r'\s-(t|b|l|r|tl|tr|bl|br)(?:-[a-z0-9]+)?(?=\s|")', '', new_content)
    new_content = re.sub(r'"-(t|b|l|r|tl|tr|bl|br)(?:-[a-z0-9]+)?(?=\s|")', '"', new_content)
    
    # Let's also fix double spaces
    new_content = re.sub(r'  +', ' ', new_content)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {os.path.basename(filepath)}")
        return True
    return False

updated_count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')):
            if process_file(os.path.join(root, file)):
                updated_count += 1

print(f"Total files fixed: {updated_count}")
