export { MILITARY_BASES } from './military_bases.js';

export const GPS_INTERFERENCE = [
 { lat: 31.95, lon: 35.91, severity: 'HIGH', radius: 450000, desc: 'Eastern Med / Israel / Jordan Jamming' },
 { lat: 54.71, lon: 20.50, severity: 'HIGH', radius: 300000, desc: 'Kaliningrad / Baltic Sea Spoofing' },
 { lat: 44.43, lon: 33.59, severity: 'HIGH', radius: 600000, desc: 'Crimea / Black Sea Electronic Warfare' },
 { lat: 60.16, lon: 24.93, severity: 'MEDIUM', radius: 250000, desc: 'Gulf of Finland Interference' },
 { lat: 55.75, lon: 37.61, severity: 'HIGH', radius: 150000, desc: 'Moscow Central Spoofing' },
 { lat: 38.00, lon: 127.00, severity: 'MEDIUM', radius: 200000, desc: 'DMZ Korean Peninsula Jamming' }
];

export const DISPLACEMENT_EVENTS = [
 { lat: 14.59, lon: 33.01, type: 'CONFLICT', people: '7.5M', desc: 'Sudan Internal Displacement' },
 { lat: 31.50, lon: 34.46, type: 'CONFLICT', people: '1.9M', desc: 'Gaza Strip Displacement' },
 { lat: 48.37, lon: 31.16, type: 'CONFLICT', people: '5.1M', desc: 'Ukraine Internal Displacement' },
 { lat: -4.32, lon: 15.31, type: 'CONFLICT', people: '6.9M', desc: 'DRC Conflict Zones' },
 { lat: 16.87, lon: 96.19, type: 'CONFLICT', people: '2.6M', desc: 'Myanmar Post-Coup Crisis' },
 { lat: 34.80, lon: 67.82, type: 'CRISIS', people: '3.2M', desc: 'Afghanistan Humanitarian Crisis' }
];

export const LIVE_VESSELS = [
 { mmsi: '366111111', name: 'USS GERALD R FORD', type: 'MILITARY', lat: 34.0, lon: 19.5, heading: 90, speed: 22 },
 { mmsi: '211222222', name: 'HMS QUEEN ELIZABETH', type: 'MILITARY', lat: 55.0, lon: -1.0, heading: 45, speed: 18 },
 { mmsi: '412333333', name: 'SHANDONG', type: 'MILITARY', lat: 20.0, lon: 115.0, heading: 180, speed: 20 },
 { mmsi: '369444444', name: 'EVER GIVEN', type: 'CARGO', lat: 13.0, lon: 50.0, heading: 270, speed: 14 },
 { mmsi: '273555555', name: 'NS CHAMPION', type: 'TANKER', lat: 24.5, lon: 57.5, heading: 135, speed: 12 },
 { mmsi: '564666666', name: 'CSCL GLOBE', type: 'CARGO', lat: 1.2, lon: 104.0, heading: 60, speed: 16 }
];

export const INTERNET_OUTAGES = [
 { lat: 35.68, lon: 51.38, status: 'CENSORED', type: 'SOCIAL_MEDIA', target: 'Iran (Instagram, WhatsApp blocked)' },
 { lat: 15.36, lon: 44.19, status: 'OFFLINE', type: 'FIBER_CUT', target: 'Yemen Subsea Cable Damage' },
 { lat: -4.44, lon: 15.26, status: 'THROTTLED', type: 'GOV_ORDER', target: 'DRC Network Disruption' },
 { lat: 40.40, lon: 49.86, status: 'CENSORED', type: 'NEWS_MEDIA', target: 'Azerbaijan Independent Media Block' },
 { lat: 12.11, lon: 15.04, status: 'OFFLINE', type: 'CONFLICT', target: 'Chad Regional Blackout' }
];

export const HAM_REPEATERS = [
 { callsign: 'W1AW', freq: '147.000', offset: '+0.6', tone: 'None', lat: 41.71, lon: -72.72, desc: 'ARRL HQ Station' },
 { callsign: 'GB3SL', freq: '433.000', offset: '+1.6', tone: '103.5', lat: 51.50, lon: -0.12, desc: 'London UHF Repeater' },
 { callsign: 'JA1RL', freq: '144.000', offset: 'None', tone: 'None', lat: 35.73, lon: 139.73, desc: 'JARL Tokyo HQ' },
 { callsign: 'VK2RWI', freq: '438.025', offset: '-5.0', tone: '91.5', lat: -33.86, lon: 151.20, desc: 'Sydney Wide Coverage' },
 { callsign: 'UA3AW', freq: '145.500', offset: 'None', tone: 'None', lat: 55.75, lon: 37.61, desc: 'Moscow Simplex Call' }
];

export const MESHTASTIC_NODES = [
 { id: '!1a2b', name: 'Mesh-NYC-01', lat: 40.71, lon: -74.00, battery: '85%', snr: 6.2 },
 { id: '!3c4d', name: 'Kiyv-Relay-Alpha', lat: 50.45, lon: 30.52, battery: '100%', snr: 8.1 },
 { id: '!5e6f', name: 'TPE-Mountain-Link', lat: 25.03, lon: 121.56, battery: '42%', snr: 3.5 },
 { id: '!7g8h', name: 'Border-Watch-TX', lat: 31.76, lon: -106.48, battery: '15%', snr: 1.2 },
 { id: '!9i0j', name: 'HK-Protest-Net', lat: 22.31, lon: 114.16, battery: '92%', snr: 7.8 }
];

export { OIL_PIPELINES, UNDERSEA_CABLES, SHIPPING_LANES, STATIC_OSINT } from './tactical_paths.js';

export const US_BORDER_WAIT_TIMES = [
 { port: 'San Ysidro', type: 'PASSENGER', time: '120 mins', lanes: 24, lat: 32.54, lon: -117.02 },
 { port: 'El Paso', type: 'COMMERCIAL', time: '45 mins', lanes: 8, lat: 31.76, lon: -106.45 },
 { port: 'Laredo', type: 'COMMERCIAL', time: '180 mins', lanes: 12, lat: 27.50, lon: -99.50 },
 { port: 'Detroit', type: 'COMMERCIAL', time: '30 mins', lanes: 10, lat: 42.31, lon: -83.07 },
 { port: 'Buffalo', type: 'PASSENGER', time: '15 mins', lanes: 6, lat: 42.90, lon: -78.90 }
];

export const VOLCANOES = [
 { name: 'Mauna Loa', country: 'US', lat: 19.47, lon: -155.60, status: 'WATCH', type: 'Shield' },
 { name: 'Mount Etna', country: 'IT', lat: 37.75, lon: 14.99, status: 'ERUPTING', type: 'Stratovolcano' },
 { name: 'Popocatépetl', country: 'MX', lat: 19.02, lon: -98.62, status: 'WARNING', type: 'Stratovolcano' },
 { name: 'Krakatoa', country: 'ID', lat: -6.10, lon: 105.42, status: 'ERUPTING', type: 'Caldera' },
 { name: 'Fagradalsfjall', country: 'IS', lat: 63.88, lon: -22.27, status: 'WATCH', type: 'Fissure' }
];

export const MARITIME_CHOKES = [
 { id: 'hormuz', name: 'STRAIT OF HORMUZ', lat: 26.57, lon: 56.26, traffic: '21M bbl/day', risk: 'HIGH' },
 { id: 'malacca', name: 'STRAIT OF MALACCA', lat: 2.50, lon: 101.40, traffic: '15M bbl/day', risk: 'HIGH' },
 { id: 'suez', name: 'SUEZ CANAL', lat: 30.50, lon: 32.35, traffic: '10M bbl/day', risk: 'HIGH' },
 { id: 'babelmandeb', name:"BAB-EL-MANDEB", lat: 12.58, lon: 43.45, traffic: '6.2M bbl/day', risk: 'HIGH' },
 { id: 'gibraltar', name: 'STRAIT OF GIBRALTAR', lat: 35.97, lon: -5.45, traffic: '5M bbl/day', risk: 'MEDIUM' },
 { id: 'panama', name: 'PANAMA CANAL', lat: 9.10, lon: -79.68, traffic: '820K bbl/day', risk: 'MEDIUM' },
 { id: 'bosphorus', name: 'BOSPHORUS', lat: 41.13, lon: 29.02, traffic: '3M bbl/day', risk: 'MEDIUM' },
 { id: 'danish', name: 'DANISH STRAITS', lat: 57.50, lon: 11.50, traffic: '3.7M bbl/day', risk: 'LOW' },
 { id: 'goodhope', name: 'CAPE OF GOOD HOPE', lat: -34.36, lon: 18.47, traffic: '6.5M bbl/day', risk: 'LOW' },
 { id: 'luzon', name: 'LUZON STRAIT', lat: 20.20, lon: 121.50, traffic: '2.4M bbl/day', risk: 'MEDIUM' },
];

export const GLOBAL_PORTS = [
 { name: 'SHANGHAI', lat: 31.23, lon: 121.47, teu: '47.3M TEU', rank: 1 },
 { name: 'SINGAPORE', lat: 1.26, lon: 103.82, teu: '37.5M TEU', rank: 2 },
 { name: 'NINGBO-ZHOUSHAN', lat: 29.87, lon: 121.55, teu: '33.4M TEU', rank: 3 },
 { name: 'SHENZHEN', lat: 22.54, lon: 114.06, teu: '30.0M TEU', rank: 4 },
 { name: 'GUANGZHOU', lat: 23.10, lon: 113.32, teu: '24.0M TEU', rank: 5 },
 { name: 'QINGDAO', lat: 36.07, lon: 120.38, teu: '23.7M TEU', rank: 6 },
 { name: 'BUSAN', lat: 35.10, lon: 129.04, teu: '21.7M TEU', rank: 7 },
 { name: 'TIANJIN', lat: 39.02, lon: 117.72, teu: '20.4M TEU', rank: 8 },
 { name: 'HONG KONG', lat: 22.29, lon: 114.17, teu: '18.1M TEU', rank: 9 },
 { name: 'ROTTERDAM', lat: 51.90, lon: 4.48, teu: '14.8M TEU', rank: 10 },
 { name: 'DUBAI (JEBEL ALI)', lat: 24.98, lon: 55.06, teu: '14.4M TEU', rank: 11 },
 { name: 'PORT KLANG', lat: 3.00, lon: 101.39, teu: '13.7M TEU', rank: 12 },
 { name: 'ANTWERP', lat: 51.23, lon: 4.42, teu: '12.0M TEU', rank: 13 },
 { name: 'LOS ANGELES', lat: 33.74, lon: -118.25,teu: '10.7M TEU', rank: 14 },
 { name: 'HAMBURG', lat: 53.55, lon: 10.00, teu: '8.9M TEU', rank: 15 },
 { name: 'NEW YORK / NJ', lat: 40.70, lon: -74.02, teu: '9.5M TEU', rank: 16 },
 { name: 'KAOHSIUNG', lat: 22.62, lon: 120.28, teu: '10.4M TEU', rank: 17 },
 { name: 'TANJUNG PELEPAS', lat: 1.36, lon: 103.55, teu: '9.5M TEU', rank: 18 },
 { name: 'COLOMBO', lat: 6.93, lon: 79.85, teu: '7.2M TEU', rank: 19 },
 { name: 'LONG BEACH', lat: 33.77, lon: -118.20,teu: '9.0M TEU', rank: 20 },
];

export const GLOBAL_CITIES = [
 { name: 'NEW YORK', lat: 40.71, lon: -74.00 },
 { name: 'LONDON', lat: 51.50, lon: -0.12 },
 { name: 'TOKYO', lat: 35.67, lon: 139.65 },
 { name: 'PARIS', lat: 48.85, lon: 2.35 },
 { name: 'BEIJING', lat: 39.90, lon: 116.40 },
 { name: 'MOSCOW', lat: 55.75, lon: 37.61 },
 { name: 'DELHI', lat: 28.61, lon: 77.20 },
 { name: 'CAIRO', lat: 30.04, lon: 31.23 },
 { name: 'SYDNEY', lat: -33.86, lon: 151.20 },
 { name: 'RIO DE JANEIRO', lat: -22.90, lon: -43.20 },
 { name: 'DUBAI', lat: 25.20, lon: 55.27 },
 { name: 'SINGAPORE', lat: 1.28, lon: 103.83 },
 { name: 'LOS ANGELES', lat: 34.05, lon: -118.24 },
 { name: 'JOHANNESBURG', lat: -26.20, lon: 28.04 },
 { name: 'SAO PAULO', lat: -23.55, lon: -46.63 },
 { name: 'MEXICO CITY', lat: 19.43, lon: -99.13 },
 { name: 'ISTANBUL', lat: 41.00, lon: 28.97 },
 { name: 'SEOUL', lat: 37.56, lon: 126.97 },
 { name: 'MUMBAI', lat: 19.07, lon: 72.87 },
 { name: 'JAKARTA', lat: -6.20, lon: 106.81 }
];

export const NUCLEAR_FACILITIES = [
 { Name: 'Zaporizhzhia', Country: 'Ukraine', Latitude: 47.51, Longitude: 34.58, Status: 'AT RISK', Capacity: 5700 },
 { Name: 'Kashiwazaki-Kariwa', Country: 'Japan', Latitude: 37.42, Longitude: 138.59, Status: 'SHUTDOWN', Capacity: 7965 },
 { Name: 'Bruce', Country: 'Canada', Latitude: 44.32, Longitude: -81.59, Status: 'OPERATIONAL', Capacity: 6384 },
 { Name: 'Hanul', Country: 'South Korea', Latitude: 37.08, Longitude: 129.38, Status: 'OPERATIONAL', Capacity: 5928 },
 { Name: 'Hanbit', Country: 'South Korea', Latitude: 35.41, Longitude: 126.42, Status: 'OPERATIONAL', Capacity: 5875 },
 { Name: 'Gravelines', Country: 'France', Latitude: 51.01, Longitude: 2.13, Status: 'OPERATIONAL', Capacity: 5460 },
 { Name: 'Cattenom', Country: 'France', Latitude: 49.41, Longitude: 6.21, Status: 'OPERATIONAL', Capacity: 5200 },
 { Name: 'Palo Verde', Country: 'US', Latitude: 33.38, Longitude: -112.86, Status: 'OPERATIONAL', Capacity: 3937 }
];
