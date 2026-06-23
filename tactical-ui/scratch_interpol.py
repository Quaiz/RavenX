import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://ws-public.interpol.int/notices/v1/red?nationality=VN&resultPerPage=1', headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req, context=ctx).read()
data = json.loads(res)
notice_id = data['_embedded']['notices'][0]['entity_id'].replace('/', '-')

req2 = urllib.request.Request(f'https://ws-public.interpol.int/notices/v1/red/{notice_id}', headers={'User-Agent': 'Mozilla/5.0'})
res2 = urllib.request.urlopen(req2, context=ctx).read()
print("DETAILS:", json.dumps(json.loads(res2), indent=2))

try:
    req3 = urllib.request.Request(f'https://ws-public.interpol.int/notices/v1/red/{notice_id}/images', headers={'User-Agent': 'Mozilla/5.0'})
    res3 = urllib.request.urlopen(req3, context=ctx).read()
    print("IMAGES:", json.dumps(json.loads(res3), indent=2))
except Exception as e:
    print("IMAGES ERROR:", e)
