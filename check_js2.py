import requests, re
html = requests.get('https://ravenx-protocol.vercel.app').text
match = re.search(r'assets/index-[^"]*\.js', html)
js_url = match.group(0) if match else ''
if js_url:
    js = requests.get('https://ravenx-protocol.vercel.app/' + js_url).text
    for m in re.finditer(r'.{0,50}backend-theta-six-87\.vercel\.app.{0,50}', js):
        print("MATCH:", m.group(0))
else:
    print('JS NOT FOUND')
