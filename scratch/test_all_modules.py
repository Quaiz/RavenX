import urllib.request
import json
import time

BASE_URL = "https://ravenx-protocol.duckdns.org"

ENDPOINTS = [
    ("/api/health", "GET"),
    ("/api/news?country=Vietnam&limit=10", "GET"),
    ("/api/gdelt", "GET"),
    ("/api/proxy/gdelt", "GET"),
    ("/api/forex/history?base=USD&target=EUR&start=2026-09-01&end=2026-10-01", "GET"),
    ("/api/market-terminal", "GET"),
    ("/api/radiation", "GET"),
    ("/api/censorship", "GET"),
    ("/api/chokepoints", "GET"),
    ("/api/webcam/search?city=Tokyo", "GET"),
    ("/api/tv/search?query=CNN", "GET"),
    ("/api/corporate/filings", "GET"),
    ("/api/humanitarian", "GET"),
    ("/api/monetary", "GET"),
    ("/api/trends", "GET"),
    ("/api/macro", "GET"),
    ("/api/polymarket", "GET"),
    ("/api/space-weather", "GET"),
    ("/api/weather-alerts", "GET"),
    ("/api/seismic", "GET"),
    ("/api/cables", "GET"),
    ("/api/fires", "GET"),
    ("/api/proxy/fires", "GET"),
    ("/api/aqi", "GET"),
    ("/api/nuclear", "GET"),
    ("/api/proxy/aircraft", "GET"),
    ("/api/proxy/satellites", "GET"),
    ("/api/outbreaks", "GET"),
    ("/api/ew-jamming", "GET"),
    ("/api/military-bases", "GET"),
    ("/api/logs", "GET"),
    ("/api/trace?q=8.8.8.8", "GET"),
    ("/api/layout", "GET"),
]

TILE_URLS = [
    ("CartoDB Dark", "https://a.basemaps.cartocdn.com/dark_all/1/0/0.png"),
    ("ArcGIS Satellite", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/1/0/0"),
    ("Sentinel-2 EOX", "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/GoogleMapsCompatible/1/0/0.jpg"),
    ("NASA Daily GIBS", "https://gibs-a.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/1/0/0.jpg"),
    ("OpenTopoMap", "https://a.tile.opentopomap.org/1/0/0.png"),
    ("ArcGIS Topo", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/1/0/0"),
]

results = []

print("=== TESTING RAVEN-X BACKEND APIS ===")
for ep, method in ENDPOINTS:
    url = BASE_URL + ep
    start = time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RavenX-Tester/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            elapsed = round((time.time() - start) * 1000, 1)
            code = resp.getcode()
            body = resp.read()
            size = len(body)
            try:
                data = json.loads(body.decode('utf-8'))
                count = len(data) if isinstance(data, (list, dict)) else 1
            except:
                count = "N/A"
            print(f"[{code}] {elapsed}ms | {ep} -> {size} bytes")
            results.append({"endpoint": ep, "status": code, "latency_ms": elapsed, "size": size, "ok": True})
    except urllib.error.HTTPError as e:
        elapsed = round((time.time() - start) * 1000, 1)
        print(f"[ERR {e.code}] {elapsed}ms | {ep} -> {e.reason}")
        results.append({"endpoint": ep, "status": e.code, "latency_ms": elapsed, "error": str(e), "ok": False})
    except Exception as e:
        elapsed = round((time.time() - start) * 1000, 1)
        print(f"[FAILED] {elapsed}ms | {ep} -> {str(e)}")
        results.append({"endpoint": ep, "status": 0, "latency_ms": elapsed, "error": str(e), "ok": False})

print("\n=== TESTING MAP TILES ===")
for name, url in TILE_URLS:
    start = time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = round((time.time() - start) * 1000, 1)
            print(f"[OK] {elapsed}ms | {name} ({resp.getcode()})")
    except Exception as e:
        elapsed = round((time.time() - start) * 1000, 1)
        print(f"[FAIL] {elapsed}ms | {name} -> {str(e)}")

with open("scratch/api_test_results.json", "w") as f:
    json.dump(results, f, indent=2)
