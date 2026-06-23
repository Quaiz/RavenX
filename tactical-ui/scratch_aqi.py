import urllib.request
import json

latitudes = "39.9,51.5,40.7,35.6,28.6,55.7,37.5,1.3,14.5,-23.5,-33.8,48.8,41.9,21.0"
longitudes = "116.4,-0.1,-74.0,139.6,77.2,37.6,126.9,103.8,121.0,-46.6,151.2,2.3,12.5,105.8"
url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={latitudes}&longitude={longitudes}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide&domains=auto"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req).read()
data = json.loads(res)
print(data)
