import re
import requests

filepath = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components\MilitaryHardware.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

urls = re.findall(r"image:\s*'([^']+)'", content)

for url in urls:
    try:
        res = requests.head(url, headers={"User-Agent": "Mozilla/5.0"}, allow_redirects=True, timeout=5)
        if res.status_code == 200:
            print(f"OK: {url}")
        else:
            print(f"FAIL ({res.status_code}): {url}")
    except Exception as e:
        print(f"ERR: {url} - {e}")
