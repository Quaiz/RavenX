import json
import codecs

with codecs.open('logs.json', 'r', 'utf-16le') as f:
    content = f.read().strip()
    
# It might be multiple JSON lines
for line in content.split('\n'):
    if not line.strip(): continue
    try:
        obj = json.loads(line)
        print(obj.get('message', ''))
    except:
        print("FAILED TO PARSE LINE:", line[:100])
