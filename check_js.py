import requests, re
html = requests.get('https://ravenx-protocol.vercel.app').text
match = re.search(r'assets/index-[^"]*\.js', html)
js_url = match.group(0) if match else ''
if js_url:
    js = requests.get('https://ravenx-protocol.vercel.app/' + js_url).text
    if 'backend-theta-six-87.vercel.app' in js:
        print('FOUND BACKEND URL')
    elif 'http://localhost:5000' in js:
        print('FOUND LOCALHOST')
    else:
        print('FOUND NEITHER')
else:
    print('JS NOT FOUND')
