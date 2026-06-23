import json
import random

COUNTRIES = [
    'AUSTRALIA', 'INDIA', 'UNITED STATES', 'CHINA', 'VIETNAM', 'RUSSIA',
    'JAPAN', 'BRAZIL', 'UNITED KINGDOM', 'ISRAEL', 'UKRAINE', 'SOUTH KOREA',
    'NORTH KOREA', 'GERMANY', 'FRANCE', 'ITALY', 'CANADA', 'TURKEY',
    'SAUDI ARABIA', 'IRAN', 'INDONESIA'
]

def generate_intel():
    data = {}
    for country in COUNTRIES:
        # Base values
        is_superpower = country in ['UNITED STATES', 'CHINA', 'RUSSIA']
        is_conflict = country in ['RUSSIA', 'UKRAINE', 'ISRAEL']
        
        gdp_val = random.randint(100, 25000)
        pop_val = random.randint(10, 1400)
        risk_val = random.randint(10, 95)
        if is_conflict: risk_val = random.randint(70, 95)
        
        c = {
            'overview': {
                'risk': risk_val,
                'status': 'CRITICAL' if risk_val > 75 else 'ELEVATED' if risk_val > 50 else 'STABLE',
                'metrics': [
                    {'label': 'UNREST', 'val': random.randint(5, 95), 'color': '#ffb800'},
                    {'label': 'CONFLICT', 'val': random.randint(5, 95), 'color': '#ef4444'},
                    {'label': 'SECURITY', 'val': random.randint(5, 95), 'color': '#3b82f6'},
                    {'label': 'INFO WAR', 'val': random.randint(20, 95), 'color': '#8b5cf6'},
                ],
                'summary': f"{country} maintains its strategic posture amidst evolving regional dynamics. Automated deep-field analysis active."
            },
            'economy': {
                'gdp': f"${gdp_val}B" if gdp_val < 1000 else f"${gdp_val/1000:.1f}T",
                'gdp_capita': f"${random.randint(2000, 70000)}",
                'growth': f"{(random.random() * 8 - 2):.1f}%",
                'inflation': f"{random.random() * 15 + 1:.1f}%",
                'unemployment': f"{random.random() * 10 + 2:.1f}%",
                'debt_gdp': f"{random.randint(20, 250)}%",
                'reserves': f"${random.randint(50, 3000)}B",
                'cb_rate': f"{random.random() * 10:.2f}%",
                'credit_rating': random.choice(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC']),
                'sectors': [
                    {'name': 'Agriculture', 'val': random.randint(1, 15), 'color': '#22c55e'},
                    {'name': 'Industry', 'val': random.randint(20, 45), 'color': '#f59e0b'},
                    {'name': 'Services', 'val': random.randint(40, 80), 'color': '#3b82f6'},
                ],
                'trend': [{'year': str(y), 'val': gdp_val * (1 + (y-2018)*0.02)} for y in [2018, 2020, 2022, 2023]]
            },
            'trade': {
                'exports_gdp': f"{random.randint(10, 80)}%",
                'imports_gdp': f"{random.randint(10, 80)}%",
                'energy_dependence': f"{random.randint(0, 90)}%",
                'chokepoints': random.sample(['Strait of Hormuz', 'Malacca Strait', 'Suez Canal', 'Panama Canal', 'Bab el-Mandeb', 'Bosphorus', 'Taiwan Strait'], k=random.randint(1,3)),
                'partners': [
                    {'name': 'USA', 'type': 'Export', 'val': random.randint(10, 40)},
                    {'name': 'CHN', 'type': 'Export', 'val': random.randint(10, 40)},
                    {'name': 'EU', 'type': 'Import', 'val': random.randint(10, 40)},
                ],
                'balance': [{'year': str(y), 'exports': random.randint(20, 50), 'imports': random.randint(20, 50)} for y in [2018, 2020, 2022, 2023]]
            },
            'society': {
                'population': f"{pop_val}M",
                'urbanization': f"{random.randint(40, 95)}%",
                'connectivity': f"{random.randint(30, 99)}%",
                'literacy': f"{random.randint(70, 99)}%",
                'stability_index': random.randint(20, 95),
                'cyber_resilience': random.randint(30, 95),
                'mil_age_pop': f"{int(pop_val * random.uniform(0.15, 0.25))}M"
            },
            'demographics': {
                'age_structure': [
                    {'year': '2018', '0-14': 20, '15-64': 65, '65+': 15},
                    {'year': '2023', '0-14': 18, '15-64': 64, '65+': 18}
                ],
                'pyramid': [
                    {'ageGroup': '0-14', 'male': -random.randint(5,15), 'female': random.randint(5,15)},
                    {'ageGroup': '15-24', 'male': -random.randint(5,15), 'female': random.randint(5,15)},
                    {'ageGroup': '25-54', 'male': -random.randint(15,30), 'female': random.randint(15,30)},
                    {'ageGroup': '55-64', 'male': -random.randint(5,15), 'female': random.randint(5,15)},
                    {'ageGroup': '65+', 'male': -random.randint(2,10), 'female': random.randint(2,12)},
                ],
                'indicators': {'youth_unemp': f"{random.randint(5, 30)}%", 'net_migration': f"{random.randint(-500, 500)}K", 'fertility': f"{random.uniform(0.8, 3.5):.1f}"}
            },
            'security': {
                'vectors': [{'label': 'CYBER', 'val': random.randint(30, 90), 'color': '#3b82f6'}, {'label': 'KINETIC', 'val': random.randint(10, 90), 'color': '#ef4444'}],
                'personnel': {'active': f"{random.randint(50, 2000)}K", 'reserve': f"{random.randint(0, 3000)}K"},
                'gfp_rank': random.randint(1, 140),
                'nuclear': 'YES' if is_superpower or country in ['ISRAEL', 'NORTH KOREA', 'INDIA', 'UNITED KINGDOM', 'FRANCE'] else 'NO',
                'alliances': random.sample(['NATO', 'CSTO', 'BRICS', 'AUKUS', 'QUAD', 'ASEAN', 'EU'], k=random.randint(1,3)),
                'hardware': [
                    {'type': 'Fighters', 'count': random.randint(50, 3000)},
                    {'type': 'Armor', 'count': random.randint(200, 10000)},
                    {'type': 'Naval', 'count': random.randint(10, 500)},
                ],
                'mil_spending': [{'year': '2023', 'val': random.randint(10, 800)}]
            },
            'environment': {
                'critical_minerals': random.sample(['Rare Earths', 'Lithium', 'Cobalt', 'Uranium', 'Copper', 'Nickel'], k=random.randint(2,4)),
                'water_risk': random.choice(['LOW', 'MODERATE', 'HIGH', 'SEVERE']),
                'grid_mix': [
                    {'name': 'Fossil', 'val': random.randint(20, 80), 'color': '#ef4444'},
                    {'name': 'Nuclear', 'val': random.randint(0, 40), 'color': '#8b5cf6'},
                    {'name': 'Renewable', 'val': random.randint(10, 60), 'color': '#22c55e'},
                ]
            },
            'intel': [
                {'id': 1, 'tag': 'INFO', 'time': '1h ago', 'title': f"Automated wide-area scan completed for {country} sector", 'source': 'RAVEN_SYS'},
                {'id': 2, 'tag': 'MED', 'time': '4h ago', 'title': f"Regional economic indicators show stabilization pattern", 'source': 'OSINT'},
            ]
        }
        data[country] = c
    return data

js_content = f"export const MOCK_COUNTRY_DATA = {json.dumps(generate_intel(), indent=2)};\n\n"
js_content += """
export const generateProceduralIntel = (name) => {
    // Basic fallback if country not found in MOCK_COUNTRY_DATA
    return null; 
};

export const emptyFallback = {
    overview: {
      risk: '---',
      status: 'SECTOR OFFLINE',
      metrics: [
        { label: 'UNREST', val: 0, color: '#3b82f6' },
        { label: 'CONFLICT', val: 0, color: '#ef4444' },
        { label: 'SECURITY', val: 0, color: '#3b82f6' },
        { label: 'INFO WAR', val: 0, color: '#8b5cf6' },
      ],
      summary: `Awaiting deep-field intelligence. Routing secondary satellite uplink via RAVEN_ALPHA.`,
    },
    economy: { gdp: '---', gdp_capita: '---', growth: '---', inflation: '---', unemployment: '---', debt_gdp: '---', trend: [], sectors: [] },
    trade: { exports_gdp: '---', imports_gdp: '---', balance: [], partners: [], chokepoints: [] },
    society: { population: '---', urbanization: '---', connectivity: '---', literacy: '---', mil_age_pop: '---', stability_index: 0, cyber_resilience: 0 },
    demographics: { age_structure: [], pyramid: [], indicators: { youth_unemp: '---', net_migration: '---', fertility: '---' } },
    security: { vectors: [], personnel: {active: '---', reserve: '---'}, hardware: [], alliances: [], gfp_rank: '---', nuclear: '---', mil_spending: [] },
    environment: { critical_minerals: [], water_risk: '---', grid_mix: [] },
    intel: [
      { id: 1, tag: 'INFO', time: 'LIVE', title: `// SECTOR_OFFLINE`, source: 'RAVEN_SYS' }
    ]
};
"""

with open('src/country_intel_data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
