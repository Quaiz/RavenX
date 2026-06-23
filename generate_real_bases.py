import json
import os

real_bases = [
    # UNITED STATES
    {"name": "Fort Liberty (Bragg)", "country": "US", "lat": 35.1390, "lon": -79.0060, "type": "ARMY", "desc": "USASOC Headquarters / Airborne"},
    {"name": "Naval Station Norfolk", "country": "US", "lat": 36.9450, "lon": -76.3276, "type": "NAVAL", "desc": "Largest Naval Base globally"},
    {"name": "Joint Base Lewis-McChord", "country": "US", "lat": 47.1022, "lon": -122.5857, "type": "ARMY", "desc": "I Corps Headquarters"},
    {"name": "Nellis Air Force Base", "country": "US", "lat": 36.2361, "lon": -115.0343, "type": "AIR_BASE", "desc": "USAF Warfare Center"},
    {"name": "Naval Base San Diego", "country": "US", "lat": 32.6784, "lon": -117.1166, "type": "NAVAL", "desc": "Pacific Fleet Surface Forces"},
    {"name": "Camp Pendleton", "country": "US", "lat": 33.3039, "lon": -117.3073, "type": "MARINE", "desc": "USMC West Coast Force"},
    {"name": "Minot Air Force Base", "country": "US", "lat": 48.4150, "lon": -101.3533, "type": "STRATEGIC", "desc": "B-52s & ICBM Silos"},
    {"name": "Kings Bay Naval Submarine Base", "country": "US", "lat": 30.7937, "lon": -81.5476, "type": "STRATEGIC", "desc": "Atlantic SSBN Fleet"},
    {"name": "Fort Cavazos (Hood)", "country": "US", "lat": 31.1351, "lon": -97.7710, "type": "ARMY", "desc": "III Armored Corps HQ"},
    
    # RUSSIA
    {"name": "Severomorsk Naval Base", "country": "RU", "lat": 69.0683, "lon": 33.4161, "type": "NAVAL", "desc": "Russian Northern Fleet HQ"},
    {"name": "Baltiysk Naval Base", "country": "RU", "lat": 54.6433, "lon": 19.9147, "type": "NAVAL", "desc": "Russian Baltic Fleet HQ"},
    {"name": "Vladivostok Naval Base", "country": "RU", "lat": 43.1155, "lon": 131.8855, "type": "NAVAL", "desc": "Russian Pacific Fleet HQ"},
    {"name": "Engels-2 Air Base", "country": "RU", "lat": 51.4820, "lon": 46.2085, "type": "STRATEGIC", "desc": "Strategic Bomber Base"},
    {"name": "Sevastopol Naval Base", "country": "RU", "lat": 44.6166, "lon": 33.5254, "type": "NAVAL", "desc": "Black Sea Fleet Base"},
    {"name": "Olenya Air Base", "country": "RU", "lat": 68.1528, "lon": 33.4561, "type": "STRATEGIC", "desc": "Strategic Aviation / Arctic Base"},
    {"name": "Kaspiysk Naval Base", "country": "RU", "lat": 42.8872, "lon": 47.6480, "type": "NAVAL", "desc": "Caspian Flotilla HQ"},
    {"name": "Plesetsk Cosmodrome", "country": "RU", "lat": 62.9256, "lon": 40.5778, "type": "SPACE", "desc": "Military Spaceport & ICBM Testing"},

    # CHINA (PRC)
    {"name": "Yulin Naval Base", "country": "CN", "lat": 18.2172, "lon": 109.5284, "type": "NAVAL", "desc": "PLAN SSBN Submarine Base (Hainan)"},
    {"name": "Jianggezhuang Naval Base", "country": "CN", "lat": 36.1186, "lon": 120.5739, "type": "NAVAL", "desc": "North Sea Fleet SSN Base"},
    {"name": "Zhanjiang Naval Base", "country": "CN", "lat": 21.2052, "lon": 110.4048, "type": "NAVAL", "desc": "South Sea Fleet HQ"},
    {"name": "Dingxin Air Base", "country": "CN", "lat": 40.3846, "lon": 99.8805, "type": "AIR_BASE", "desc": "PLAAF Flight Test Center"},
    {"name": "Jiuquan Satellite Launch Center", "country": "CN", "lat": 40.9605, "lon": 100.2983, "type": "SPACE", "desc": "Military Space & Missile Hub"},
    {"name": "Zhurihe Training Base", "country": "CN", "lat": 42.2471, "lon": 112.7533, "type": "ARMY", "desc": "Largest PLA Training Area"},
    {"name": "Mischief Reef", "country": "CN", "lat": 9.9056, "lon": 115.5342, "type": "FORTIFICATION", "desc": "Artificial Island Base"},
    {"name": "Subi Reef", "country": "CN", "lat": 10.9169, "lon": 114.0766, "type": "FORTIFICATION", "desc": "Spratly Islands Outpost"},
    {"name": "Fiery Cross Reef", "country": "CN", "lat": 9.5539, "lon": 112.8881, "type": "FORTIFICATION", "desc": "Military Airstrip & Radar"},

    # JAPAN & SOUTH KOREA (US/ALLIED)
    {"name": "Kadena Air Base", "country": "JP", "lat": 26.3544, "lon": 127.7674, "type": "AIR_BASE", "desc": "USAF Pacific HQ"},
    {"name": "Yokosuka Naval Base", "country": "JP", "lat": 35.2926, "lon": 139.6631, "type": "NAVAL", "desc": "US 7th Fleet HQ"},
    {"name": "Misawa Air Base", "country": "JP", "lat": 40.7061, "lon": 141.3705, "type": "AIR_BASE", "desc": "Joint US-Japan Base"},
    {"name": "Okinawa Futenma", "country": "JP", "lat": 26.2736, "lon": 127.7562, "type": "MARINE", "desc": "USMC Air Station"},
    {"name": "Camp Humphreys", "country": "KR", "lat": 36.9535, "lon": 127.0326, "type": "ARMY", "desc": "US Forces Korea HQ"},
    {"name": "Osan Air Base", "country": "KR", "lat": 37.0864, "lon": 127.0264, "type": "AIR_BASE", "desc": "USAF 7th Air Force HQ"},
    {"name": "Jinhae Naval Base", "country": "KR", "lat": 35.1481, "lon": 128.6653, "type": "NAVAL", "desc": "ROK Navy Fleet HQ"},

    # UK & EUROPE
    {"name": "HMNB Clyde (Faslane)", "country": "GB", "lat": 56.0645, "lon": -4.8166, "type": "STRATEGIC", "desc": "UK Trident Submarine Base"},
    {"name": "HMNB Portsmouth", "country": "GB", "lat": 50.8038, "lon": -1.1042, "type": "NAVAL", "desc": "Royal Navy HQ / Carrier Base"},
    {"name": "RAF Lakenheath", "country": "GB", "lat": 52.4087, "lon": 0.5599, "type": "AIR_BASE", "desc": "USAF 48th Fighter Wing"},
    {"name": "RAF Menwith Hill", "country": "GB", "lat": 54.0097, "lon": -1.6853, "type": "SIGINT", "desc": "Echelon Intelligence Hub"},
    {"name": "Ramstein Air Base", "country": "DE", "lat": 49.4361, "lon": 7.6006, "type": "AIR_BASE", "desc": "USAFE HQ"},
    {"name": "Île Longue", "country": "FR", "lat": 48.3045, "lon": -4.5065, "type": "STRATEGIC", "desc": "French SSBN Base"},
    {"name": "Toulon Naval Base", "country": "FR", "lat": 43.1182, "lon": 5.9189, "type": "NAVAL", "desc": "French Mediterranean Fleet HQ"},
    {"name": "Naval Station Rota", "country": "ES", "lat": 36.6343, "lon": -6.3315, "type": "NAVAL", "desc": "US 6th Fleet Forward Base"},
    {"name": "Aviano Air Base", "country": "IT", "lat": 46.0315, "lon": 12.5960, "type": "AIR_BASE", "desc": "USAF 31st Fighter Wing"},
    {"name": "NAS Sigonella", "country": "IT", "lat": 37.4042, "lon": 14.9221, "type": "NAVAL", "desc": "Mediterranean Maritime Patrol Hub"},
    {"name": "Incirlik Air Base", "country": "TR", "lat": 37.0019, "lon": 35.4258, "type": "AIR_BASE", "desc": "NATO Tactical Nuclear Storage"},
    {"name": "Aksaz Naval Base", "country": "TR", "lat": 36.8394, "lon": 28.3847, "type": "NAVAL", "desc": "Turkish Navy Southern Fleet"},
    {"name": "Mihail Kogalniceanu Air Base", "country": "RO", "lat": 44.3621, "lon": 28.4870, "type": "AIR_BASE", "desc": "NATO Black Sea Hub"},

    # MIDDLE EAST
    {"name": "Al Udeid Air Base", "country": "QA", "lat": 25.1186, "lon": 51.3148, "type": "AIR_BASE", "desc": "US CENTCOM Forward HQ"},
    {"name": "NSA Bahrain", "country": "BH", "lat": 26.2081, "lon": 50.6053, "type": "NAVAL", "desc": "US 5th Fleet HQ"},
    {"name": "Camp Arifjan", "country": "KW", "lat": 28.8752, "lon": 48.1633, "type": "ARMY", "desc": "US Army Central Logistics Base"},
    {"name": "Ali Al Salem Air Base", "country": "KW", "lat": 29.3470, "lon": 47.5204, "type": "AIR_BASE", "desc": "Tactical Airlift Hub"},
    {"name": "Prince Sultan Air Base", "country": "SA", "lat": 24.0620, "lon": 47.5801, "type": "AIR_BASE", "desc": "RSAF & US Expeditionary Base"},
    {"name": "King Abdulaziz Naval Base", "country": "SA", "lat": 26.9749, "lon": 49.7042, "type": "NAVAL", "desc": "RSAF Eastern Fleet HQ"},
    {"name": "Bandar Abbas Naval Base", "country": "IR", "lat": 27.1420, "lon": 56.1950, "type": "NAVAL", "desc": "IRIN/IRGC Main Naval Base"},
    {"name": "Khatam Al-Anbiya Air Base (TFB.10)", "country": "IR", "lat": 27.1444, "lon": 60.6272, "type": "AIR_BASE", "desc": "Chabahar Air Base"},
    {"name": "Nevatim Airbase", "country": "IL", "lat": 31.2081, "lon": 35.0116, "type": "AIR_BASE", "desc": "IAF F-35 Fighter Hub"},
    {"name": "Haifa Naval Base", "country": "IL", "lat": 32.8315, "lon": 34.9863, "type": "NAVAL", "desc": "Israeli Navy HQ (Submarine Fleet)"},
    {"name": "Hmeymim Air Base", "country": "SY", "lat": 35.4087, "lon": 35.9472, "type": "AIR_BASE", "desc": "Russian Air Facility in Syria"},
    {"name": "Tartus Naval Facility", "country": "SY", "lat": 34.9122, "lon": 35.8756, "type": "NAVAL", "desc": "Russian Mediterranean Facility"},

    # AFRICA
    {"name": "Camp Lemonnier", "country": "DJ", "lat": 11.5456, "lon": 43.1481, "type": "EXPEDITIONARY", "desc": "US AFRICOM Hub"},
    {"name": "Djibouti Support Base", "country": "CN", "lat": 11.5847, "lon": 43.1098, "type": "LOGISTICS", "desc": "PLAN Overseas Support Base"},
    {"name": "Base Aérienne 104 Dugny", "country": "FR", "lat": 14.7314, "lon": -17.4764, "type": "EXPEDITIONARY", "desc": "French Base in Senegal"},
    {"name": "Simon's Town Naval Base", "country": "ZA", "lat": -34.1873, "lon": 18.4322, "type": "NAVAL", "desc": "South African Navy HQ"},
    {"name": "Berenice Naval Base", "country": "EG", "lat": 23.9786, "lon": 35.4851, "type": "NAVAL", "desc": "Egyptian Red Sea Fleet Hub"},

    # ASIA-PACIFIC / OCEANIA
    {"name": "Naval Base Guam", "country": "US", "lat": 13.4357, "lon": 144.6468, "type": "NAVAL", "desc": "Strategic Pacific Submarine Hub"},
    {"name": "Andersen Air Force Base", "country": "US", "lat": 13.5794, "lon": 144.9277, "type": "AIR_BASE", "desc": "Guam Strategic Bomber Forward Base"},
    {"name": "Diego Garcia", "country": "IO", "lat": -7.3116, "lon": 72.4147, "type": "STRATEGIC", "desc": "Joint US/UK Military Facility"},
    {"name": "Pine Gap", "country": "AU", "lat": -23.7997, "lon": 133.7371, "type": "SIGINT", "desc": "Joint Defense Facility - Satellite Tracking"},
    {"name": "Fleet Base East (Garden Island)", "country": "AU", "lat": -33.8617, "lon": 151.2269, "type": "NAVAL", "desc": "Royal Australian Navy HQ"},
    {"name": "RAAF Base Tindal", "country": "AU", "lat": -14.5244, "lon": 132.3784, "type": "AIR_BASE", "desc": "Australian Northern Air Hub"},
    {"name": "Karwar Naval Base (INS Kadamba)", "country": "IN", "lat": 14.7578, "lon": 74.1373, "type": "NAVAL", "desc": "Indian Navy Project Seabird Base"},
    {"name": "Eastern Naval Command (Visakhapatnam)", "country": "IN", "lat": 17.6853, "lon": 83.2798, "type": "NAVAL", "desc": "Indian Eastern Fleet HQ"},
    {"name": "Changi Naval Base", "country": "SG", "lat": 1.3094, "lon": 104.0194, "type": "NAVAL", "desc": "Singapore Maritime Command"},
    {"name": "Cam Ranh Base", "country": "VN", "lat": 11.9023, "lon": 109.2155, "type": "NAVAL", "desc": "Vietnam People's Navy Deepwater Port"},

    # AMERICAS (Non-US)
    {"name": "CFB Halifax", "country": "CA", "lat": 44.6599, "lon": -63.5878, "type": "NAVAL", "desc": "Canadian Atlantic Fleet HQ"},
    {"name": "CFB Esquimalt", "country": "CA", "lat": 48.4319, "lon": -123.4357, "type": "NAVAL", "desc": "Canadian Pacific Fleet HQ"},
    {"name": "Guantanamo Bay", "country": "CU", "lat": 19.9077, "lon": -75.1484, "type": "NAVAL", "desc": "US Naval Station Cuba"},
    {"name": "Mount Pleasant Complex", "country": "FK", "lat": -51.8214, "lon": -58.4485, "type": "AIR_BASE", "desc": "UK South Atlantic Hub"},
    {"name": "Puerto Belgrano Naval Base", "country": "AR", "lat": -38.8950, "lon": -62.1006, "type": "NAVAL", "desc": "Argentine Navy Main Base"},
    
    # NEW EXPANDED BASES
    # US CONTINENTAL
    {"name": "Offutt Air Force Base", "country": "US", "lat": 41.1189, "lon": -95.9125, "type": "STRATEGIC", "desc": "US Strategic Command HQ"},
    {"name": "Peterson Space Force Base", "country": "US", "lat": 38.8239, "lon": -104.7003, "type": "SPACE", "desc": "NORAD and USNORTHCOM HQ"},
    {"name": "Naval Air Station Patuxent River", "country": "US", "lat": 38.2867, "lon": -76.4116, "type": "NAVAL", "desc": "Naval Air Systems Command HQ"},
    {"name": "Vandenberg Space Force Base", "country": "US", "lat": 34.7327, "lon": -120.5683, "type": "SPACE", "desc": "West Coast Space Launch Hub"},
    {"name": "Fort Drum", "country": "US", "lat": 44.0538, "lon": -75.7766, "type": "ARMY", "desc": "10th Mountain Division HQ"},
    {"name": "Whiteman Air Force Base", "country": "US", "lat": 38.7303, "lon": -93.5489, "type": "STRATEGIC", "desc": "B-2 Spirit Stealth Bomber Base"},
    {"name": "Naval Station Mayport", "country": "US", "lat": 30.3953, "lon": -81.4162, "type": "NAVAL", "desc": "US 4th Fleet HQ"},
    
    # EUROPE & NATO
    {"name": "Naval Base Taranto", "country": "IT", "lat": 40.4216, "lon": 17.2415, "type": "NAVAL", "desc": "Italian Navy Ionian Fleet HQ"},
    {"name": "Naval Base Kiel", "country": "DE", "lat": 54.3637, "lon": 10.1554, "type": "NAVAL", "desc": "German Navy Baltic Fleet HQ"},
    {"name": "Croughton RAF", "country": "GB", "lat": 51.9892, "lon": -1.1802, "type": "COMM", "desc": "USAF Communications Hub"},
    {"name": "Keflavik Naval Air Station", "country": "IS", "lat": 63.9786, "lon": -22.6046, "type": "AIR_BASE", "desc": "NATO GIUK Gap Patrol Base"},
    {"name": "Bodo Main Air Station", "country": "NO", "lat": 67.2692, "lon": 14.3653, "type": "AIR_BASE", "desc": "Norwegian F-35 Base"},
    {"name": "Suda Bay Naval Base", "country": "GR", "lat": 35.4950, "lon": 24.1481, "type": "NAVAL", "desc": "NATO Hellenic Navy Base"},
    {"name": "Moron Air Base", "country": "ES", "lat": 37.1706, "lon": -5.6158, "type": "AIR_BASE", "desc": "USAF/Spanish AF Transit Hub"},
    {"name": "Camp Bondsteel", "country": "XK", "lat": 42.3687, "lon": 21.2464, "type": "ARMY", "desc": "KFOR Headquarters (Kosovo)"},
    {"name": "Eckernforde Naval Base", "country": "DE", "lat": 54.4716, "lon": 9.8394, "type": "NAVAL", "desc": "German Submarine HQ"},

    # ASIA
    {"name": "Subic Bay Naval Base", "country": "PH", "lat": 14.8197, "lon": 120.2731, "type": "NAVAL", "desc": "Philippine Navy / US Rotational Base"},
    {"name": "Clark Air Base", "country": "PH", "lat": 15.1856, "lon": 120.5511, "type": "AIR_BASE", "desc": "Philippine Air Force Hub"},
    {"name": "Andaman & Nicobar Command (Port Blair)", "country": "IN", "lat": 11.6667, "lon": 92.7359, "type": "JOINT", "desc": "Indian Armed Forces Tri-Service Command"},
    {"name": "Gwalior Air Force Station", "country": "IN", "lat": 26.2941, "lon": 78.2255, "type": "AIR_BASE", "desc": "Indian Air Force Mirage 2000 Hub"},
    {"name": "Sattahip Naval Base", "country": "TH", "lat": 12.6375, "lon": 100.9161, "type": "NAVAL", "desc": "Royal Thai Navy Fleet HQ"},
    {"name": "Yokota Air Base", "country": "JP", "lat": 35.7486, "lon": 139.3486, "type": "AIR_BASE", "desc": "US Forces Japan HQ"},
    {"name": "Lingshui Air Base", "country": "CN", "lat": 18.4947, "lon": 109.9928, "type": "AIR_BASE", "desc": "PLANAF South Sea Fleet Forward Base"},
    {"name": "Guaning Air Base", "country": "CN", "lat": 38.3094, "lon": 105.7877, "type": "AIR_BASE", "desc": "PLAAF Heavy Bomber Base"},
    {"name": "Kure Naval Base", "country": "JP", "lat": 34.2389, "lon": 132.5484, "type": "NAVAL", "desc": "JMSDF Submarine Flotilla"},
    {"name": "Chinhae Naval Base", "country": "KR", "lat": 35.1522, "lon": 128.6675, "type": "NAVAL", "desc": "South Korean Main Naval Hub"},
    {"name": "U-Tapao Royal Thai Navy Airfield", "country": "TH", "lat": 12.6800, "lon": 101.0050, "type": "AIR_BASE", "desc": "US Indo-Pacom Rotational Base"},
    {"name": "Iwakuni Marine Corps Air Station", "country": "JP", "lat": 34.1436, "lon": 132.2356, "type": "MARINE", "desc": "USMC F-35B Forward Hub"},

    # MIDDLE EAST & AFRICA
    {"name": "King Khalid Military City", "country": "SA", "lat": 27.9866, "lon": 45.5414, "type": "ARMY", "desc": "Saudi Ground Forces Cantonment"},
    {"name": "Muş Air Base", "country": "TR", "lat": 38.7483, "lon": 41.7608, "type": "AIR_BASE", "desc": "Turkish Air Force Forward Base"},
    {"name": "Thumrait Air Base", "country": "OM", "lat": 17.6669, "lon": 54.0247, "type": "AIR_BASE", "desc": "Oman/US Forward Operations Hub"},
    {"name": "Hatzerim Airbase", "country": "IL", "lat": 31.2333, "lon": 34.6625, "type": "AIR_BASE", "desc": "Israeli Air Force Academy & Combat Base"},
    {"name": "Naval Base Eilat", "country": "IL", "lat": 29.5392, "lon": 34.9458, "type": "NAVAL", "desc": "Israeli Navy Red Sea Fleet HQ"},
    {"name": "Al Dhafra Air Base", "country": "AE", "lat": 24.2483, "lon": 54.5478, "type": "AIR_BASE", "desc": "UAE / US Central Command Air Hub"},
    {"name": "King Abdullah II Special Operations Training Center", "country": "JO", "lat": 32.0642, "lon": 36.0078, "type": "TRAINING", "desc": "International Special Forces Hub"},
    {"name": "Air Base 201 Agadez", "country": "NE", "lat": 16.9456, "lon": 7.9944, "type": "AIR_BASE", "desc": "US Drone Base (Transitioning)"},
    {"name": "Manda Bay (Camp Simba)", "country": "KE", "lat": -2.2683, "lon": 40.9039, "type": "EXPEDITIONARY", "desc": "US/Kenyan Counter-Terror Hub"},
    {"name": "Alexandria Naval Base", "country": "EG", "lat": 31.1897, "lon": 29.8784, "type": "NAVAL", "desc": "Egyptian Mediterranean Fleet HQ"},
    {"name": "Muscat Naval Base", "country": "OM", "lat": 23.6339, "lon": 58.5583, "type": "NAVAL", "desc": "Royal Navy of Oman HQ"},

    # RUSSIA & CIS
    {"name": "Gadzhiyevo Naval Base", "country": "RU", "lat": 69.2558, "lon": 33.3236, "type": "NAVAL", "desc": "Russian Northern Fleet SSBN Hub"},
    {"name": "Vilyuchinsk Naval Base", "country": "RU", "lat": 52.9239, "lon": 158.4069, "type": "NAVAL", "desc": "Russian Pacific Fleet Submarine Base"},
    {"name": "Ivanovo Severny Air Base", "country": "RU", "lat": 57.0594, "lon": 40.9856, "type": "AIR_BASE", "desc": "Russian Airborne Early Warning Hub"},
    {"name": "Komsomolsk-on-Amur Air Base", "country": "RU", "lat": 50.6017, "lon": 136.9367, "type": "AIR_BASE", "desc": "Russian Fighter Production Hub"},
    {"name": "Grozny Severny Air Base", "country": "RU", "lat": 43.3289, "lon": 45.6983, "type": "AIR_BASE", "desc": "Russian Tactical Aviation Chechnya"},
    {"name": "Kant Air Base", "country": "KG", "lat": 42.8594, "lon": 74.8467, "type": "AIR_BASE", "desc": "Russian Aerospace Forces Base in Kyrgyzstan"},
    {"name": "201st Military Base", "country": "TJ", "lat": 38.5367, "lon": 68.7844, "type": "ARMY", "desc": "Russian Army Base in Tajikistan"},

    # SOUTH AMERICA
    {"name": "Talcahuano Naval Base", "country": "CL", "lat": -36.7167, "lon": -73.1167, "type": "NAVAL", "desc": "Chilean Navy Main Base & Shipyard"},
    {"name": "Galeão Air Force Base", "country": "BR", "lat": -22.8100, "lon": -43.2506, "type": "AIR_BASE", "desc": "Brazilian Air Force Transport Hub"},
    {"name": "Base Naval de Castro Aguiar", "country": "BR", "lat": -22.8953, "lon": -43.1672, "type": "NAVAL", "desc": "Brazilian Navy HQ (Rio de Janeiro)"},
    {"name": "Palo Negro Air Base", "country": "VE", "lat": 10.1836, "lon": -67.5683, "type": "AIR_BASE", "desc": "Venezuelan Air Force Fighter Base"},
    {"name": "Bahía Málaga Naval Base", "country": "CO", "lat": 3.9789, "lon": -77.3278, "type": "NAVAL", "desc": "Colombian Pacific Fleet HQ"}
]

js_content = "export const MILITARY_BASES = [\n"
for b in real_bases:
    # Escape any single quotes to prevent JS syntax errors
    safe_name = b['name'].replace("'", "\\'")
    safe_desc = b['desc'].replace("'", "\\'")
    js_content += f"  {{ name: '{safe_name}', country: '{b['country']}', lat: {b['lat']}, lon: {b['lon']}, type: '{b['type']}', desc: '{safe_desc}' }},\n"
js_content += "];\n"

output_path = os.path.join(os.path.dirname(__file__), 'tactical-ui', 'src', 'military_bases.js')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated {len(real_bases)} real bases.")
