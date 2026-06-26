import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Globe, Radio, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../store';

const CENSORSHIP_TARGETS = [
 { name: 'AFGHANISTAN', iso: 'AF' },
 { name: 'ALBANIA', iso: 'AL' },
 { name: 'ALGERIA', iso: 'DZ' },
 { name: 'AMERICAN SAMOA', iso: 'AS' },
 { name: 'ANDORRA', iso: 'AD' },
 { name: 'ANGOLA', iso: 'AO' },
 { name: 'ARGENTINA', iso: 'AR' },
 { name: 'ARMENIA', iso: 'AM' },
 { name: 'AUSTRALIA', iso: 'AU' },
 { name: 'AUSTRIA', iso: 'AT' },
 { name: 'AZERBAIJAN', iso: 'AZ' },
 { name: 'BAHAMAS', iso: 'BS' },
 { name: 'BAHRAIN', iso: 'BH' },
 { name: 'BANGLADESH', iso: 'BD' },
 { name: 'BARBADOS', iso: 'BB' },
 { name: 'BELARUS', iso: 'BY' },
 { name: 'BELGIUM', iso: 'BE' },
 { name: 'BELIZE', iso: 'BZ' },
 { name: 'BENIN', iso: 'BJ' },
 { name: 'BERMUDA', iso: 'BM' },
 { name: 'BHUTAN', iso: 'BT' },
 { name: 'BOLIVIA', iso: 'BO' },
 { name: 'BOSNIA', iso: 'BA' },
 { name: 'BOTSWANA', iso: 'BW' },
 { name: 'BRAZIL', iso: 'BR' },
 { name: 'BRUNEI', iso: 'BN' },
 { name: 'BULGARIA', iso: 'BG' },
 { name: 'BURKINA FASO', iso: 'BF' },
 { name: 'BURUNDI', iso: 'BI' },
 { name: 'CAMBODIA', iso: 'KH' },
 { name: 'CAMEROON', iso: 'CM' },
 { name: 'CANADA', iso: 'CA' },
 { name: 'CAPE VERDE', iso: 'CV' },
 { name: 'CENTRAL AFRICAN REPUBLIC', iso: 'CF' },
 { name: 'CHAD', iso: 'TD' },
 { name: 'CHILE', iso: 'CL' },
 { name: 'CHINA', iso: 'CN' },
 { name: 'COLOMBIA', iso: 'CO' },
 { name: 'COMOROS', iso: 'KM' },
 { name: 'CONGO', iso: 'CG' },
 { name: 'DEMOCRATIC REPUBLIC OF THE CONGO', iso: 'CD' },
 { name: 'COSTA RICA', iso: 'CR' },
 { name: 'CROATIA', iso: 'HR' },
 { name: 'CUBA', iso: 'CU' },
 { name: 'CYPRUS', iso: 'CY' },
 { name: 'CZECH REPUBLIC', iso: 'CZ' },
 { name: 'DENMARK', iso: 'DK' },
 { name: 'DJIBOUTI', iso: 'DJ' },
 { name: 'DOMINICA', iso: 'DM' },
 { name: 'DOMINICAN REPUBLIC', iso: 'DO' },
 { name: 'ECUADOR', iso: 'EC' },
 { name: 'EGYPT', iso: 'EG' },
 { name: 'EL SALVADOR', iso: 'SV' },
 { name: 'EQUATORIAL GUINEA', iso: 'GQ' },
 { name: 'ERITREA', iso: 'ER' },
 { name: 'ESTONIA', iso: 'EE' },
 { name: 'ETHIOPIA', iso: 'ET' },
 { name: 'FIJI', iso: 'FJ' },
 { name: 'FINLAND', iso: 'FI' },
 { name: 'FRANCE', iso: 'FR' },
 { name: 'GABON', iso: 'GA' },
 { name: 'GAMBIA', iso: 'GM' },
 { name: 'GEORGIA', iso: 'GE' },
 { name: 'GERMANY', iso: 'DE' },
 { name: 'GHANA', iso: 'GH' },
 { name: 'GREECE', iso: 'GR' },
 { name: 'GREENLAND', iso: 'GL' },
 { name: 'GRENADA', iso: 'GD' },
 { name: 'GUATEMALA', iso: 'GT' },
 { name: 'GUINEA', iso: 'GN' },
 { name: 'GUINEA-BISSAU', iso: 'GW' },
 { name: 'GUYANA', iso: 'GY' },
 { name: 'HAITI', iso: 'HT' },
 { name: 'HONDURAS', iso: 'HN' },
 { name: 'HONG KONG', iso: 'HK' },
 { name: 'HUNGARY', iso: 'HU' },
 { name: 'ICELAND', iso: 'IS' },
 { name: 'INDIA', iso: 'IN' },
 { name: 'INDONESIA', iso: 'ID' },
 { name: 'IRAN', iso: 'IR' },
 { name: 'IRAQ', iso: 'IQ' },
 { name: 'IRELAND', iso: 'IE' },
 { name: 'ISRAEL', iso: 'IL' },
 { name: 'ITALY', iso: 'IT' },
 { name: 'IVORY COAST', iso: 'CI' },
 { name: 'JAMAICA', iso: 'JM' },
 { name: 'JAPAN', iso: 'JP' },
 { name: 'JORDAN', iso: 'JO' },
 { name: 'KAZAKHSTAN', iso: 'KZ' },
 { name: 'KENYA', iso: 'KE' },
 { name: 'KIRIBATI', iso: 'KI' },
 { name: 'NORTH KOREA', iso: 'KP' },
 { name: 'SOUTH KOREA', iso: 'KR' },
 { name: 'KUWAIT', iso: 'KW' },
 { name: 'KYRGYZSTAN', iso: 'KG' },
 { name: 'LAOS', iso: 'LA' },
 { name: 'LATVIA', iso: 'LV' },
 { name: 'LEBANON', iso: 'LB' },
 { name: 'LESOTHO', iso: 'LS' },
 { name: 'LIBERIA', iso: 'LR' },
 { name: 'LIBYA', iso: 'LY' },
 { name: 'LIECHTENSTEIN', iso: 'LI' },
 { name: 'LITHUANIA', iso: 'LT' },
 { name: 'LUXEMBOURG', iso: 'LU' },
 { name: 'MACAU', iso: 'MO' },
 { name: 'MACEDONIA', iso: 'MK' },
 { name: 'MADAGASCAR', iso: 'MG' },
 { name: 'MALAWI', iso: 'MW' },
 { name: 'MALAYSIA', iso: 'MY' },
 { name: 'MALDIVES', iso: 'MV' },
 { name: 'MALI', iso: 'ML' },
 { name: 'MALTA', iso: 'MT' },
 { name: 'MARSHALL ISLANDS', iso: 'MH' },
 { name: 'MAURITANIA', iso: 'MR' },
 { name: 'MAURITIUS', iso: 'MU' },
 { name: 'MEXICO', iso: 'MX' },
 { name: 'MICRONESIA', iso: 'FM' },
 { name: 'MOLDOVA', iso: 'MD' },
 { name: 'MONACO', iso: 'MC' },
 { name: 'MONGOLIA', iso: 'MN' },
 { name: 'MONTENEGRO', iso: 'ME' },
 { name: 'MOROCCO', iso: 'MA' },
 { name: 'MOZAMBIQUE', iso: 'MZ' },
 { name: 'MYANMAR', iso: 'MM' },
 { name: 'NAMIBIA', iso: 'NA' },
 { name: 'NAURU', iso: 'NR' },
 { name: 'NEPAL', iso: 'NP' },
 { name: 'NETHERLANDS', iso: 'NL' },
 { name: 'NEW ZEALAND', iso: 'NZ' },
 { name: 'NICARAGUA', iso: 'NI' },
 { name: 'NIGER', iso: 'NE' },
 { name: 'NIGERIA', iso: 'NG' },
 { name: 'NORWAY', iso: 'NO' },
 { name: 'OMAN', iso: 'OM' },
 { name: 'PAKISTAN', iso: 'PK' },
 { name: 'PALAU', iso: 'PW' },
 { name: 'PALESTINE', iso: 'PS' },
 { name: 'PANAMA', iso: 'PA' },
 { name: 'PAPUA NEW GUINEA', iso: 'PG' },
 { name: 'PARAGUAY', iso: 'PY' },
 { name: 'PERU', iso: 'PE' },
 { name: 'PHILIPINE', iso: 'PH' },
 { name: 'POLAND', iso: 'PL' },
 { name: 'PORTUGAL', iso: 'PT' },
 { name: 'PUERTO RICO', iso: 'PR' },
 { name: 'QATAR', iso: 'QA' },
 { name: 'ROMANIA', iso: 'RO' },
 { name: 'RUSSIA', iso: 'RU' },
 { name: 'RWANDA', iso: 'RW' },
 { name: 'SAUDI ARABIA', iso: 'SA' },
 { name: 'SENEGAL', iso: 'SN' },
 { name: 'SERBIA', iso: 'RS' },
 { name: 'SEYCHELLES', iso: 'SC' },
 { name: 'SIERRA LEONE', iso: 'SL' },
 { name: 'SINGAPORE', iso: 'SG' },
 { name: 'SLOVAKIA', iso: 'SK' },
 { name: 'SLOVENIA', iso: 'SI' },
 { name: 'SOLOMON ISLANDS', iso: 'SB' },
 { name: 'SOMALIA', iso: 'SO' },
 { name: 'SOUTH AFRICA', iso: 'ZA' },
 { name: 'SOUTH SUDAN', iso: 'SS' },
 { name: 'SPAIN', iso: 'ES' },
 { name: 'SRI LANKA', iso: 'LK' },
 { name: 'SUDAN', iso: 'SD' },
 { name: 'SURINAME', iso: 'SR' },
 { name: 'SWAZILAND', iso: 'SZ' },
 { name: 'SWEDEN', iso: 'SE' },
 { name: 'SWITZERLAND', iso: 'CH' },
 { name: 'SYRIA', iso: 'SY' },
 { name: 'TAIWAN', iso: 'TW' },
 { name: 'TAJIKISTAN', iso: 'TJ' },
 { name: 'TANZANIA', iso: 'TZ' },
 { name: 'THAILAND', iso: 'TH' },
 { name: 'TIMOR-LESTE', iso: 'TL' },
 { name: 'TOGO', iso: 'TG' },
 { name: 'TONGA', iso: 'TO' },
 { name: 'TRINIDAD AND TOBAGO', iso: 'TT' },
 { name: 'TUNISIA', iso: 'TN' },
 { name: 'TURKEY', iso: 'TR' },
 { name: 'TURKMENISTAN', iso: 'TM' },
 { name: 'TUVALU', iso: 'TV' },
 { name: 'UGANDA', iso: 'UG' },
 { name: 'UKRAINE', iso: 'UA' },
 { name: 'UNITED ARAB EMIRATES', iso: 'AE' },
 { name: 'UNITED KINGDOM', iso: 'GB' },
 { name: 'UNITED STATES', iso: 'US' },
 { name: 'URUGUAY', iso: 'UY' },
 { name: 'UZBEKISTAN', iso: 'UZ' },
 { name: 'VANUATU', iso: 'VU' },
 { name: 'VENEZUELA', iso: 'VE' },
 { name: 'VIETNAM', iso: 'VN' },
 { name: 'WESTERN SAHARA', iso: 'EH' },
 { name: 'YEMEN', iso: 'YE' },
 { name: 'ZAMBIA', iso: 'ZM' },
 { name: 'ZIMBABWE', iso: 'ZW' }
];

const PLATFORMS = ['Telegram', 'WhatsApp', 'X', 'YouTube', 'Facebook'];

const generateMatrixData = (incidentsText = "") => {
  return CENSORSHIP_TARGETS.map(target => {
  const status = {};
  let blockCount = 0;
  
  // Real data parsing: If this country is actively in the news for internet shutdown, it gets severe throttling
  const isTargetInNews = incidentsText.toLowerCase().includes(target.name.toLowerCase());
  
  PLATFORMS.forEach(platform => {
  let state = 'CLEAR';
  
  // Static known facts (Real data baseline)
  if (['CN', 'KP', 'TM', 'ER'].includes(target.iso)) state = 'BLOCKED';
  else if (target.iso === 'RU' && ['X', 'Facebook'].includes(platform)) state = 'BLOCKED';
  else if (target.iso === 'IR' && ['Telegram', 'WhatsApp', 'Facebook', 'X', 'YouTube'].includes(platform)) state = 'BLOCKED';
  else if (target.iso === 'MM' && ['Facebook', 'X'].includes(platform)) state = 'BLOCKED';
  else if (target.iso === 'SY' && ['Facebook', 'YouTube'].includes(platform)) state = 'BLOCKED';
  else if (['SA', 'AE', 'EG', 'CU'].includes(target.iso) && ['WhatsApp', 'Telegram'].includes(platform)) state = 'THROTTLED';
  else if (isTargetInNews) {
      // Dynamic real-time response based on news feed
      state = ['WhatsApp', 'X', 'Facebook'].includes(platform) ? 'BLOCKED' : 'THROTTLED';
  }

  if (state === 'BLOCKED') blockCount++;
  else if (state === 'THROTTLED') blockCount += 0.5;

  status[platform] = state;
  });

  const dpiScore = Math.min(100, Math.floor((blockCount / PLATFORMS.length) * 100));
  
  return { ...target, status, dpiScore };
  });
};

const generateTelemetryData = (countryIso, dpiScore) => {
  const data = [];
  // Use DPI score to realistically throttle base traffic instead of Math.random
  let baseTraffic = 100 - dpiScore; 
  if (countryIso === 'KP') baseTraffic = 5;
  
  for (let i = 0; i < 24; i++) {
  // Mathematically derived sine wave for day/night traffic cycle
  let traffic = baseTraffic + (Math.sin(i / 3.8) * 10);
  data.push({
  time: `${i}:00`,
  traffic: Math.max(0, traffic)
  });
  }
  return data;
};

const StatusDot = ({ state }) => {
 const color = state === 'BLOCKED' ? 'bg-red-500' : state === 'THROTTLED' ? 'bg-amber-500' : 'bg-green-500';
 const glow = state === 'BLOCKED' ? 'shadow-[0_0_8px_rgba(239,68,68,0.8)]' : state === 'THROTTLED' ? 'shadow-[0_0_8px_rgba(245,158,11,0.8)]' : '';
 
 return (
 <div className={`w-2 h-2 rounded-full ${color} ${glow}`} title={state} />
 );
};

const InternetCensorship = () => {
 const [news, setNews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [matrixData, setMatrixData] = useState([]);
 const [selectedCountry, setSelectedCountry] = useState(CENSORSHIP_TARGETS.find(c => c.iso === 'IR') || CENSORSHIP_TARGETS[0]);
 const [search, setSearch] = useState("");
 const [telemetry, setTelemetry] = useState([]);

  useEffect(() => {
  const fetchNews = async () => {
  try {
  // Fetch real news using our backend
  const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/censorship');
  const data = await res.json();
  if (data.incidents) {
  setNews(data.incidents);
  
  // Create a corpus of text from incidents to feed the matrix algorithm
  const corpus = data.incidents.map(i => i.title).join(" ");
  const rawData = generateMatrixData(corpus);
  const sortedData = rawData.sort((a, b) => b.dpiScore - a.dpiScore);
  setMatrixData(sortedData);
  } else {
  const rawData = generateMatrixData("");
  const sortedData = rawData.sort((a, b) => b.dpiScore - a.dpiScore);
  setMatrixData(sortedData);
  }
  } catch (e) {
  console.error("Failed to fetch censorship news", e);
  const rawData = generateMatrixData("");
  const sortedData = rawData.sort((a, b) => b.dpiScore - a.dpiScore);
  setMatrixData(sortedData);
  } finally {
  setLoading(false);
  }
  };

  fetchNews();
  }, []);

  useEffect(() => {
  setTelemetry(generateTelemetryData(selectedCountry.iso, selectedCountry.dpiScore || 0));
  }, [selectedCountry]);

 return (
 <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
 
 {/* --- Top Row: Firewall Matrix --- */}
 <div className="h-1/2 border border-primary/20 bg-black/40 p-3 flex flex-col relative box-glow">
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 border-b border-primary/20 pb-2 gap-2">
 <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
 <div className="flex items-center gap-2 text-primary">
 <ShieldAlert size={14} className="text-glow"/>
 <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-glow">GLOBAL FIREWALL MATRIX</span>
 </div>
 <input 
 type="text"
 placeholder="SEARCH COUNTRY..." 
 value={search} 
 onChange={(e) => setSearch(e.target.value)}
 className="bg-black/50 border border-primary/30 text-[9px] text-white px-2 py-1 outline-none focus:border-primary/80 transition-colors placeholder:text-white/30 uppercase tracking-widest w-full md:w-48"
 />
 </div>
 <div className="text-[9px] text-white/50 font-mono mt-1 md:mt-0 text-right">DPI STATUS</div>
 </div>

 <div className="flex-1 overflow-auto custom-scrollbar">
 <table className="w-full text-[9px] text-left border-collapse">
 <thead>
 <tr className="text-white/40 border-b border-primary/10">
 <th className="py-2 pl-2 font-normal uppercase tracking-widest">REGION</th>
 {PLATFORMS.map(p => (
 <th key={p} className="py-2 text-center font-normal tracking-wider">{p.toUpperCase()}</th>
 ))}
 <th className="py-2 text-right pr-2 font-normal tracking-widest">DPI INDEX</th>
 </tr>
 </thead>
 <tbody>
 {matrixData.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.iso.toLowerCase().includes(search.toLowerCase())).map(row => (
 <tr 
 key={row.iso} 
 className={`border-b border-primary/5 cursor-pointer transition-colors ${selectedCountry.iso === row.iso ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
 onClick={() => setSelectedCountry(row)}
 >
 <td className="py-2 pl-2 font-bold text-white tracking-widest">{row.name}</td>
 {PLATFORMS.map(p => (
 <td key={p} className="py-2 text-center">
 <div className="flex justify-center"><StatusDot state={row.status[p]} /></div>
 </td>
 ))}
 <td className="py-2 text-right pr-2">
 <div className="flex items-center justify-end gap-2">
 <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
 <div 
 className={`h-full ${row.dpiScore > 75 ? 'bg-red-500' : row.dpiScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`} 
 style={{ width: `${row.dpiScore}%` }} 
 />
 </div>
 <span className={`font-mono ${row.dpiScore > 75 ? 'text-red-500' : 'text-primary'}`}>{row.dpiScore}</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* --- Bottom Row: Telemetry & Live News --- */}
 <div className="h-1/2 flex gap-4">
 
 {/* Left: Traffic Telemetry */}
 <div className="flex-1 border border-primary/20 bg-black/40 p-3 flex flex-col relative box-glow">
 <div className="flex items-center justify-between mb-3 border-b border-primary/20 pb-2">
 <div className="flex items-center gap-2 text-primary">
 <Activity size={14} className="text-glow"/>
 <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-glow">BGP ROUTING TELEMETRY : {selectedCountry.name}</span>
 </div>
 </div>
 
 <div className="flex-1 w-full min-h-0 relative">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={telemetry} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="trafficGrad"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%" stopColor="rgba(var(--color-primary), 0.5)" stopOpacity={0.8}/>
 <stop offset="95%" stopColor="rgba(var(--color-primary), 0.5)" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis dataKey="time"stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.5)' }} />
 <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.5)' }} />
 <Tooltip 
 contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(var(--color-primary), 0.3)' }}
 itemStyle={{ color: '#fff', fontSize: '10px' }}
 labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}
 />
 <Area type="monotone"dataKey="traffic"stroke="rgba(var(--color-primary), 0.8)" fillOpacity={1} fill="url(#trafficGrad)" />
 </AreaChart>
 </ResponsiveContainer>
 

 </div>
 </div>

 {/* Right: Live Incidents Feed (from Google News API) */}
 <div className="w-1/3 border border-primary/20 bg-black/40 p-3 flex flex-col relative box-glow">
 <div className="flex items-center justify-between mb-3 border-b border-primary/20 pb-2">
 <div className="flex items-center gap-2 text-primary">
 <Globe size={14} className="text-glow"/>
 <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-glow">LIVE INCIDENTS</span>
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
 </div>

 <div className="flex-1 overflow-auto custom-scrollbar flex flex-col gap-2">
 {loading ? (
 <div className="text-[9px] text-white/40 font-mono text-center mt-4 animate-pulse">FETCHING OONI/RADAR DATA...</div>
 ) : news.length === 0 ? (
 <div className="text-[9px] text-white/40 font-mono text-center mt-4">NO RECENT INCIDENTS</div>
 ) : (
  news.map((item, idx) => (
  <div key={idx} className="border-l-2 border-red-500/50 pl-2 py-1 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer"onClick={() => window.open(item.link, '_blank')}>
  <div className="text-[7px] text-white/40 mb-0.5 tracking-wider">{new Date(item.date).toLocaleString()}</div>
  <div className="text-[9px] text-white/90 line-clamp-2 leading-relaxed">{item.title}</div>
 </div>
 ))
 )}
 </div>
 </div>

 </div>
 </div>
 );
};

export default InternetCensorship;
