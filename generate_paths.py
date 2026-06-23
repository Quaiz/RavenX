import os
import random

# Generate Undersea Cables
cables = []
# Connect major hubs: NY, London, Tokyo, Singapore, Sydney, etc.
hubs = [
    (40.7, -74.0), (51.5, -0.1), (35.6, 139.7), (1.3, 103.8), (-33.8, 151.2), 
    (37.7, -122.4), (22.3, 114.1), (25.2, 55.2), (-22.9, -43.1), (34.0, -18.3)
]
for i in range(len(hubs)):
    for j in range(i+1, len(hubs)):
        if random.random() > 0.4:  # 60% chance to connect
            # Add some curves/waypoints
            lat1, lon1 = hubs[i]
            lat2, lon2 = hubs[j]
            mid_lat = (lat1 + lat2) / 2 + random.uniform(-10, 10)
            mid_lon = (lon1 + lon2) / 2 + random.uniform(-10, 10)
            cables.append(f"  {{ name: 'CABLE-{i}-{j}', path: [[{lat1:.2f}, {lon1:.2f}], [{mid_lat:.2f}, {mid_lon:.2f}], [{lat2:.2f}, {lon2:.2f}]] }}")

# Generate Shipping Lanes
lanes = []
routes = [
    # Trans-Pacific
    [[35.0, 140.0], [45.0, -170.0], [40.0, -125.0]],
    # Trans-Atlantic
    [[50.0, -5.0], [45.0, -35.0], [40.0, -70.0]],
    # Indian Ocean
    [[1.0, 100.0], [5.0, 80.0], [10.0, 55.0], [12.0, 45.0]],
    # Suez to Europe
    [[31.0, 32.0], [35.0, 20.0], [36.0, -5.0], [50.0, -5.0]],
    # Cape of Good Hope
    [[-35.0, 20.0], [-30.0, 0.0], [-10.0, -20.0], [10.0, -40.0]],
    # Panama Canal
    [[9.0, -80.0], [15.0, -100.0], [30.0, -120.0]],
    [[9.0, -80.0], [20.0, -70.0], [40.0, -60.0]]
]
for idx, r in enumerate(routes):
    lanes.append(f"  {{ name: 'LANE-{idx}', path: {r} }}")

# Generate Pipelines
pipelines = []
pipes = [
    {"name": "Druzhba", "path": [[53.2, 50.2], [55.7, 37.6], [53.9, 27.5], [52.2, 21.0], [51.5, 12.3]]},
    {"name": "Nord Stream", "path": [[60.5, 28.5], [59.0, 21.0], [55.0, 15.0], [54.1, 13.6]]},
    {"name": "Keystone XL", "path": [[52.5, -111.4], [49.0, -104.5], [41.0, -96.0], [29.7, -95.3]]},
    {"name": "Trans-Saharan", "path": [[4.8, 6.9], [13.5, 8.5], [19.0, 5.0], [36.8, 3.2]]},
    {"name": "Power of Siberia", "path": [[62.0, 129.0], [53.0, 127.0], [49.0, 125.0], [45.0, 126.0]]},
    {"name": "EastMed", "path": [[31.0, 33.0], [34.0, 33.0], [35.0, 25.0], [38.0, 22.0], [40.0, 18.0]]},
    {"name": "TAPI", "path": [[37.0, 61.0], [34.0, 62.0], [31.0, 66.0], [29.0, 71.0]]},
]
for p in pipes:
    pipelines.append(f"  {{ name: '{p['name']}', type: 'MIXED', status: 'ACTIVE', path: {p['path']} }}")

# Add some fake dense osint events globally
osint = []
for i in range(300):
    lat = random.uniform(-60, 70)
    lon = random.uniform(-180, 180)
    sev = random.choice(['HIGH', 'MEDIUM', 'LOW'])
    osint.append(f"  {{ id: 'mock-{i}', lat: {lat:.3f}, lon: {lon:.3f}, title: 'Intercepted Comms / Local Disturbance', source: 'SIGINT', severity: '{sev}' }}")

js = f"""
export const UNDERSEA_CABLES = [
{",\n".join(cables)}
];

export const SHIPPING_LANES = [
{",\n".join(lanes)}
];

export const OIL_PIPELINES = [
{",\n".join(pipelines)}
];

export const STATIC_OSINT = [
{",\n".join(osint)}
];
"""

output_path = os.path.join(os.path.dirname(__file__), 'tactical-ui', 'src', 'tactical_paths.js')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Generated paths and events.")
