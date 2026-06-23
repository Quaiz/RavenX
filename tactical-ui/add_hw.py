import os

filepath = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\store.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = " { id: 'MILITARY_BASES', name: 'MILITARY REGISTRY', desc: 'Database of global strategic military installations', status: 'ACTIVE' },"
replacement = target + "\n { id: 'MILITARY_HARDWARE', name: 'MILITARY HARDWARE', desc: 'Tactical analysis of global weapon systems and vehicles', status: 'ACTIVE' },"

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("store.js updated successfully")
else:
    print("target string not found in store.js")
