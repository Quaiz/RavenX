import json
import random

COUNTRIES = [
    'AUSTRALIA', 'INDIA', 'UNITED STATES', 'CHINA', 'VIETNAM', 'RUSSIA',
    'JAPAN', 'BRAZIL', 'UNITED KINGDOM', 'ISRAEL', 'UKRAINE', 'SOUTH KOREA',
    'NORTH KOREA', 'GERMANY', 'FRANCE', 'ITALY', 'CANADA', 'TURKEY',
    'SAUDI ARABIA', 'IRAN', 'INDONESIA'
]

NEWS_TEMPLATES = [
    {'tag': 'HIGH', 'title': 'Strategic forces conducting unannounced readiness exercises in {region}', 'source': 'SIGINT'},
    {'tag': 'MED',  'title': 'Central Bank announces unexpected revision to quarterly growth forecasts', 'source': 'REUTERS'},
    {'tag': 'LOW',  'title': 'New infrastructure project finalized along critical supply corridor', 'source': 'OSINT'},
    {'tag': 'INFO', 'title': 'Automated cyber-defense grid logs elevated probing activity', 'source': 'CYBERCOM'},
    {'tag': 'HIGH', 'title': 'Naval assets redeployed to protect key maritime chokepoint', 'source': 'SAT_NET'},
    {'tag': 'MED',  'title': 'Diplomatic summit concludes with new bilateral trade agreement', 'source': 'AFP'},
    {'tag': 'INFO', 'title': 'Energy sector reports successful test of next-gen grid stabilization', 'source': 'DOE'},
    {'tag': 'LOW',  'title': 'Major tech conglomerate announces pivot towards sovereign AI development', 'source': 'BLOOMBERG'},
    {'tag': 'HIGH', 'title': 'Unidentified airspace incursions intercepted by border defense units', 'source': 'EARLY_WARNING'},
    {'tag': 'MED',  'title': 'Emergency legislative session called to address fiscal deficit', 'source': 'AP'},
    {'tag': 'INFO', 'title': 'National secure communications network upgrade reaches Phase 3', 'source': 'TELECOM'},
    {'tag': 'LOW',  'title': 'Agricultural exports show resilience despite supply chain disruptions', 'source': 'TRADE_MIN'},
]

def get_news(country):
    num_news = random.randint(6, 12)
    news = []
    for i in range(num_news):
        template = random.choice(NEWS_TEMPLATES)
        hours_ago = random.randint(1, 48)
        time_str = f"{hours_ago}h ago" if hours_ago < 24 else f"{hours_ago//24}d ago"
        region = random.choice(['northern sector', 'coastal regions', 'capital district', 'border zone'])
        title = template['title'].replace('{region}', region).replace('{country}', country.title())
        news.append({
            'id': i+1,
            'tag': template['tag'],
            'time': time_str,
            'title': title,
            'source': template['source']
        })
    news.sort(key=lambda x: int(x['time'].split('h')[0]) if 'h' in x['time'] else int(x['time'].split('d')[0])*24)
    return news

def generate_intel():
    data = {}
    for country in COUNTRIES:
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
                'summary': f"Strategic assessment for {country} indicates {'high volatility' if is_conflict else 'baseline normalization'}. Advanced monitoring protocols active."
            },
            'economy': {
                'gdp': f"${gdp_val}B" if gdp_val < 1000 else f"${gdp_val/1000:.1f}T",
                'gdp_capita': f"${random.randint(2000, 70000):,}",
                'growth': f"{(random.random() * 8 - 2):.1f}%",
                'inflation': f"{random.random() * 15 + 1:.1f}%",
                'unemployment': f"{random.random() * 10 + 2:.1f}%",
                'debt_gdp': f"{random.randint(20, 250)}%",
                'reserves': f"${random.randint(50, 3000)}B",
                'cb_rate': f"{random.random() * 10:.2f}%",
                'credit_rating': random.choice(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC']),
                'sectors': [
                    {'name': 'Agriculture', 'val': random.randint(1, 20), 'color': '#22c55e'},
                    {'name': 'Industry', 'val': random.randint(20, 45), 'color': '#f59e0b'},
                    {'name': 'Services', 'val': random.randint(40, 75), 'color': '#3b82f6'},
                ],
                'trend': [{'year': str(y), 'val': gdp_val * (1 + (y-2018)*0.02)} for y in [2018, 2020, 2022, 2023]]
            },
            'trade': {
                'exports_gdp': f"{random.randint(10, 80)}%",
                'imports_gdp': f"{random.randint(10, 80)}%",
                'energy_dependence': f"{random.randint(0, 90)}%",
                'chokepoints': random.sample(['Strait of Hormuz', 'Malacca Strait', 'Suez Canal', 'Panama Canal', 'Bab el-Mandeb', 'Bosphorus', 'Taiwan Strait'], k=random.randint(0,3)),
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
                'critical_minerals': random.sample(['Rare Earths', 'Lithium', 'Cobalt', 'Uranium', 'Copper', 'Nickel'], k=random.randint(1,4)),
                'water_risk': random.choice(['LOW', 'MODERATE', 'HIGH', 'SEVERE']),
                'grid_mix': [
                    {'name': 'Fossil', 'val': random.randint(20, 80), 'color': '#ef4444'},
                    {'name': 'Nuclear', 'val': random.randint(0, 40), 'color': '#8b5cf6'},
                    {'name': 'Renewable', 'val': random.randint(10, 60), 'color': '#22c55e'},
                ]
            },
            'intel': get_news(country)
        }
        data[country] = c
    return data

js_content = f"export const MOCK_COUNTRY_DATA = {json.dumps(generate_intel(), indent=2)};\n\n"

js_content += """
export const generateProceduralIntel = (name) => {
    if (!name || name === 'NONE') return null;
    
    // Hash function for procedural generation so the same country gets the same data
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const seededRandom = (max) => {
      hash = Math.abs((hash * 9301 + 49297) % 233280);
      return (hash / 233280) * max;
    };
    
    const risk = Math.floor(seededRandom(80)) + 10;
    const gdpBase = seededRandom(3000) + 50;
    const popBase = Math.floor(seededRandom(200)) + 2;
    
    return {
      overview: {
        risk: risk,
        status: risk > 70 ? 'ELEVATED RISK' : risk > 40 ? 'MODERATE - WATCH' : 'STABLE - BASELINE',
        metrics: [
          { label: 'UNREST', val: Math.floor(seededRandom(100)), color: '#ffb800' },
          { label: 'CONFLICT', val: Math.floor(seededRandom(50)), color: '#ef4444' },
          { label: 'SECURITY', val: Math.floor(seededRandom(100)), color: '#3b82f6' },
          { label: 'INFO WAR', val: Math.floor(seededRandom(100)), color: '#8b5cf6' },
        ],
        summary: `Strategic assessment for ${name} indicates regional baseline normalization. RavenX deep-field analysis is dynamically simulating localized intelligence vectors.`,
      },
      economy: {
        gdp: `$${gdpBase.toFixed(1)}B`, gdp_capita: `$${Math.floor(seededRandom(40000)) + 1500}`,
        growth: `${(seededRandom(8) - 2).toFixed(1)}%`, inflation: `${seededRandom(15).toFixed(1)}%`,
        unemployment: `${(seededRandom(10) + 2).toFixed(1)}%`, debt_gdp: `${Math.floor(seededRandom(100)) + 20}%`,
        reserves: `$${Math.floor(seededRandom(500))}B`, cb_rate: `${(seededRandom(8)).toFixed(2)}%`,
        credit_rating: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'][Math.floor(seededRandom(7))],
        sectors: [
          { name: 'Agriculture', val: Math.floor(seededRandom(20)), color: '#22c55e' },
          { name: 'Industry', val: Math.floor(seededRandom(30)) + 10, color: '#f59e0b' },
          { name: 'Services', val: Math.floor(seededRandom(40)) + 30, color: '#3b82f6' },
        ],
        trend: [{ year: '2018', val: gdpBase*0.8 }, { year: '2020', val: gdpBase*0.85 }, { year: '2022', val: gdpBase*0.95 }, { year: '2023', val: gdpBase }]
      },
      trade: { 
        exports_gdp: `${Math.floor(seededRandom(40)) + 10}%`, imports_gdp: `${Math.floor(seededRandom(40)) + 10}%`,
        energy_dependence: `${Math.floor(seededRandom(80))}%`,
        chokepoints: ['Local Transit Route', 'Regional Port'].slice(0, Math.floor(seededRandom(2))+1),
        partners: [
          { name: 'REG_P1', type: 'Export', val: Math.floor(seededRandom(20))+10 },
          { name: 'REG_P2', type: 'Import', val: Math.floor(seededRandom(20))+10 }
        ],
        balance: [
          { year: '2018', exports: Math.floor(seededRandom(50)), imports: Math.floor(seededRandom(50)) }, 
          { year: '2023', exports: Math.floor(seededRandom(50)), imports: Math.floor(seededRandom(50)) }
        ]
      },
      society: { 
        population: `${popBase}M`, urbanization: `${Math.floor(seededRandom(50)) + 40}%`, 
        connectivity: `${Math.floor(seededRandom(60)) + 30}%`, literacy: `${Math.floor(seededRandom(30)) + 70}%`,
        stability_index: Math.floor(seededRandom(80)) + 20, cyber_resilience: Math.floor(seededRandom(80)) + 20,
        mil_age_pop: `${Math.floor(popBase * 0.2)}M`
      },
      demographics: {
        age_structure: [],
        pyramid: [
          { ageGroup: '0-14', male: -Math.floor(seededRandom(15)), female: Math.floor(seededRandom(15)) },
          { ageGroup: '15-24', male: -Math.floor(seededRandom(15)), female: Math.floor(seededRandom(15)) },
          { ageGroup: '25-54', male: -Math.floor(seededRandom(30)), female: Math.floor(seededRandom(30)) },
          { ageGroup: '55-64', male: -Math.floor(seededRandom(15)), female: Math.floor(seededRandom(15)) },
          { ageGroup: '65+', male: -Math.floor(seededRandom(10)), female: Math.floor(seededRandom(10)) },
        ],
        indicators: { youth_unemp: `${seededRandom(20).toFixed(1)}%`, net_migration: `${Math.floor(seededRandom(200))-100}K`, fertility: `${(seededRandom(3) + 1).toFixed(1)}` }
      },
      security: {
        vectors: [{ label: 'CYBER', val: Math.floor(seededRandom(100)), color: '#3b82f6' }, { label: 'BORDER', val: Math.floor(seededRandom(100)), color: '#ef4444' }],
        personnel: { active: `${Math.floor(seededRandom(500))}K`, reserve: `${Math.floor(seededRandom(500))}K` },
        gfp_rank: Math.floor(seededRandom(140)) + 1,
        nuclear: seededRandom(100) > 95 ? 'YES' : 'NO',
        alliances: ['UN', 'REGIONAL'].slice(0, Math.floor(seededRandom(2))+1),
        hardware: [
          { type: 'Fighters', count: Math.floor(seededRandom(500)) },
          { type: 'Armor', count: Math.floor(seededRandom(2000)) },
          { type: 'Naval', count: Math.floor(seededRandom(100)) }
        ],
        mil_spending: [{ year: '2023', val: seededRandom(10).toFixed(1) }]
      },
      environment: {
        critical_minerals: ['Copper', 'Iron', 'Zinc'].slice(0, Math.floor(seededRandom(3))+1),
        water_risk: ['LOW', 'MODERATE', 'HIGH'][Math.floor(seededRandom(3))],
        grid_mix: [
          { name: 'Fossil', val: Math.floor(seededRandom(50)) + 20, color: '#ef4444' },
          { name: 'Renewable', val: Math.floor(seededRandom(30)) + 10, color: '#22c55e' }
        ]
      },
      intel: [
        { id: 1, tag: 'HIGH', time: '1h ago', title: `Automated satellite sweep detects anomalous thermal signatures in ${name}`, source: 'RAVEN_SYS' },
        { id: 2, tag: 'MED', time: '4h ago', title: `Regional economic indicators show stabilization pattern across major hubs`, source: 'OSINT' },
        { id: 3, tag: 'LOW', time: '8h ago', title: `Infrastructure maintenance cycle logged by satellite feed`, source: 'SAT_NET' },
        { id: 4, tag: 'INFO', time: '12h ago', title: `Communications grid stress-test successfully completed`, source: 'CYBER_CMD' },
        { id: 5, tag: 'HIGH', time: '16h ago', title: `Unconfirmed reports of troop movements near contested borders`, source: 'SIGINT' },
        { id: 6, tag: 'MED', time: '1d ago', title: `New bilateral energy agreements signed in capital`, source: 'REUTERS' },
        { id: 7, tag: 'LOW', time: '1d ago', title: `Agricultural yield projections updated for Q3`, source: 'OSINT' },
        { id: 8, tag: 'INFO', time: '2d ago', title: `Scheduled airspace restrictions implemented for training exercises`, source: 'FAA_EQUIV' },
      ]
    };
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
