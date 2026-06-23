import requests
import json
import time
import os

overpass_url = "http://overpass-api.de/api/interpreter"
# Query nodes and ways with military=base or military=airfield or military=naval_base that have names
overpass_query = """
[out:json][timeout:90];
(
  node["military"~"base|airfield|naval_base"]["name"](-90,-180,90,180);
  way["military"~"base|airfield|naval_base"]["name"](-90,-180,90,180);
);
out center 1500;
"""

try:
    print("Fetching military bases from Overpass API (this might take 10-20 seconds)...")
    response = requests.post(overpass_url, data={'data': overpass_query}, timeout=100)
    data = response.json()
    bases = []
    
    # We will format this into a JS array export
    js_content = "export const MILITARY_BASES = [\n"
    
    for element in data['elements']:
        name = element.get('tags', {}).get('name', 'Unknown Base').replace("'", "\\'")
        lat = element.get('lat') or element.get('center', {}).get('lat')
        lon = element.get('lon') or element.get('center', {}).get('lon')
        mil_type = element.get('tags', {}).get('military', 'BASE').upper()
        country = element.get('tags', {}).get('is_in:country_code', 'UN').upper()
        
        if lat and lon:
            js_content += f"  {{ name: '{name}', country: '{country}', lat: {lat:.5f}, lon: {lon:.5f}, type: '{mil_type}', desc: 'Global Military Facility' }},\n"
            bases.append(name)
            
    js_content += "];\n"
    
    # Write to a temporary file
    output_path = os.path.join(os.path.dirname(__file__), 'tactical-ui', 'src', 'military_bases.js')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully fetched and generated {len(bases)} bases!")
    print(f"Saved to {output_path}")

except Exception as e:
    print(f"Error: {e}")
