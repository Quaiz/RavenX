import random
import os

countries = {
    'US': (37.0, -95.0, 15), 'CN': (35.0, 105.0, 10), 'RU': (60.0, 90.0, 20), 'IN': (20.0, 77.0, 8),
    'GB': (55.0, -3.0, 4), 'FR': (46.0, 2.0, 4), 'DE': (51.0, 9.0, 3), 'JP': (36.0, 138.0, 5),
    'KR': (36.0, 128.0, 2), 'KP': (40.0, 127.0, 2), 'TR': (39.0, 35.0, 4), 'IR': (32.0, 53.0, 6),
    'IL': (31.0, 35.0, 1), 'SA': (25.0, 45.0, 5), 'EG': (26.0, 30.0, 4), 'PK': (30.0, 70.0, 4),
    'AU': (-25.0, 133.0, 15), 'CA': (56.0, -106.0, 15), 'BR': (-14.0, -51.0, 10), 'ZA': (-30.0, 25.0, 5),
    'NG': (9.0, 8.0, 3), 'DZ': (28.0, 1.0, 6), 'ID': (-0.7, 113.0, 8), 'VN': (14.0, 108.0, 4),
    'TH': (15.0, 100.0, 4), 'MM': (21.0, 96.0, 4), 'SY': (35.0, 38.0, 2), 'IQ': (33.0, 43.0, 3),
    'AF': (33.0, 65.0, 3), 'UA': (48.0, 31.0, 3), 'PL': (52.0, 19.0, 3), 'IT': (41.0, 12.0, 4),
    'ES': (40.0, -3.0, 4), 'CU': (21.0, -77.0, 2), 'VE': (8.0, -66.0, 4), 'CO': (4.0, -72.0, 4),
    'AR': (-38.0, -63.0, 8), 'CL': (-35.0, -71.0, 5), 'MX': (23.0, -102.0, 8), 'SD': (12.0, 30.0, 5),
    'ET': (9.0, 39.0, 4), 'KE': (1.0, 38.0, 3), 'CD': (-4.0, 21.0, 6), 'AO': (-11.0, 17.0, 4),
    'SE': (60.0, 15.0, 4), 'FI': (64.0, 26.0, 3), 'NO': (60.0, 8.0, 4), 'GR': (39.0, 22.0, 2),
    'RO': (45.0, 25.0, 2), 'KZ': (48.0, 68.0, 10), 'UZ': (41.0, 64.0, 3), 'PH': (12.0, 122.0, 4)
}

prefixes = ['Camp', 'Fort', 'Base', 'FOB', 'Air Base', 'Naval Station', 'Outpost', 'Strategic Facility']
names = ['Alpha', 'Bravo', 'Vanguard', 'Sentinel', 'Echo', 'Thunder', 'Iron', 'Phoenix', 'Striker', 'Ghost', 'Viper', 'Kilo', 'Sierra', 'Zulu', 'Apex']

bases = []
for country, (clat, clon, spread) in countries.items():
    num_bases = random.randint(12, 25)
    for _ in range(num_bases):
        lat = clat + random.uniform(-spread, spread)
        lon = clon + random.uniform(-spread, spread)
        prefix = random.choice(prefixes)
        name = f"{prefix} {random.choice(names)}-{random.randint(1, 999)}"
        btype = random.choice(['AIR_BASE', 'NAVAL', 'ARMY', 'RADAR', 'SIGINT', 'MISSILE_SILO'])
        bases.append(f"  {{ name: '{name}', country: '{country}', lat: {lat:.4f}, lon: {lon:.4f}, type: '{btype}', desc: 'Classified {btype} Installation' }}")

js = "export const MILITARY_BASES = [\n" + ",\n".join(bases) + "\n];\n"

output_path = os.path.join(os.path.dirname(__file__), 'tactical-ui', 'src', 'military_bases.js')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js)

print(f"Generated {len(bases)} bases.")
