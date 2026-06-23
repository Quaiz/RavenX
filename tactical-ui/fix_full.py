import os

directory = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    new_content = new_content.replace(' -full', ' rounded-full')
    new_content = new_content.replace('"-full', '"rounded-full')
    
    new_content = new_content.replace(' -t', ' rounded-t')
    new_content = new_content.replace('"-t', '"rounded-t')
    
    new_content = new_content.replace(' -b', ' rounded-b')
    new_content = new_content.replace('"-b', '"rounded-b')
    
    new_content = new_content.replace(' -l', ' rounded-l')
    new_content = new_content.replace('"-l', '"rounded-l')
    
    new_content = new_content.replace(' -r', ' rounded-r')
    new_content = new_content.replace('"-r', '"rounded-r')

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
