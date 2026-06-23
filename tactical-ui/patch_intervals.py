import os
import re

components_dir = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components"

for filename in os.listdir(components_dir):
    if not filename.endswith('.jsx'):
        continue
    
    filepath = os.path.join(components_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: setInterval(funcName, time)
    content = re.sub(r'\bsetInterval\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_* ]+)\s*\)',
                     r'setInterval(() => { if (!document.hidden) \1(); }, \2)',
                     content)

    # Pattern 2: setInterval(() => funcName(args), delay)
    # example: setInterval(() => fetchRates(base), 600000)
    content = re.sub(r'\bsetInterval\(\s*\(\)\s*=>\s*([a-zA-Z0-9_]+\([^)]*\))\s*,\s*([a-zA-Z0-9_* ]+)\s*\)',
                     r'setInterval(() => { if (!document.hidden) \1; }, \2)',
                     content)

    # Pattern 3: setInterval(() => { ... }, delay)
    # Wait, avoid replacing if already patched
    if 'if (!document.hidden)' not in content and 'if (document.hidden) return;' not in content:
        content = re.sub(r'\bsetInterval\(\s*\(\)\s*=>\s*\{',
                         r'setInterval(() => {\n      if (document.hidden) return;',
                         content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filename}")
