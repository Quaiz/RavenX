import urllib.request
import re

html = urllib.request.urlopen('https://www.youtube.com/results?search_query=VTC+Now+truc+tiep+live+news&sp=EgJAAQ%253D%253D').read().decode('utf-8')
ids = re.findall(r'"videoId":"([^"]+)"', html)
print(list(set(ids))[:10])
