import os

filepath = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\store.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "3: ['MARKET_TERMINAL', 'CRYPTO', 'FOREX', 'MACRO_FEEDS', 'MONETARY_POLICY', 'CORPORATE_INTEL', 'MILITARY_BASES', 'NUCLEAR_FACILITIES', 'MARITIME_INTEL']"
replacement = "3: ['MARKET_TERMINAL', 'CRYPTO', 'FOREX', 'MACRO_FEEDS', 'MONETARY_POLICY', 'CORPORATE_INTEL', 'MILITARY_BASES', 'NUCLEAR_FACILITIES', 'MARITIME_INTEL', 'MILITARY_HARDWARE']"

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("store.js WORKSPACE updated successfully")
else:
    print("target string not found in store.js")
