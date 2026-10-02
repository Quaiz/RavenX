import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
try:
    req = urllib.request.Request('https://www.vesselfinder.com/embed', headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        m = re.findall(r'src="([^"]*aismap[^"]*)"', html)
        print("Found aismap src:", m)
except Exception as e:
    print("Error:", e)

# Test MyShipTracking embed
try:
    req = urllib.request.Request('https://www.myshiptracking.com/?mmsi=0', headers=headers)
    with urllib.request.urlopen(req) as resp:
        print("MyShipTracking status:", resp.getcode())
except Exception as e:
    print("MyShipTracking error:", e)
