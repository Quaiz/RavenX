import urllib.request
import re
import sys

ids = ['RCcYUBA5wT4', 'RhVrAcbnV-Y', 'vHE4mnXZb4o', 'hmmxCdSVvNk', '4g83ZW3yxw4', 'zuSIKbO9RuU', 'JqhGMWs-A1w', 'GNViGAvL-NE', 'bs-bFnZSDT0', 'TGfpe1mA3W4']
for vid in ids:
    try:
        html = urllib.request.urlopen(f'https://www.youtube.com/watch?v={vid}').read().decode('utf-8')
        if '"isLive":true' in html or '"isLiveNow":true' in html or 'Live streaming' in html:
            title = re.search(r'"title":"(.*?)"', html)
            print(f"LIVE: {vid} - {title.group(1) if title else 'Unknown'}")
    except Exception as e:
        pass
