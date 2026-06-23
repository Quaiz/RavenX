import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid } from 'recharts';
import useStore from '../store';
import { MOCK_COUNTRY_DATA, generateProceduralIntel, emptyFallback } from '../country_intel_data';
import { Shield, AlertTriangle, Zap, Anchor, Wind, Battery, Target, Fingerprint, Database, Cpu, Droplet, Flame, Compass, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';
import TypewriterText from './TypewriterText';

const LeaderCard = ({ title, data }) => {
  if (!data || !data.name) return null;
  
  return (
  <div className="p-3 bg-white/[0.02] border border-white/5 flex gap-4 transition-all duration-300">
  <div className="w-20 h-24 bg-black/50 border border-white/10 shrink-0 relative overflow-hidden flex items-center justify-center">
  {data.image ? (
  <img src={data.image} alt={data.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"/>
  ) : (
  <Fingerprint size={24} className="text-white/20"/>
  )}
  <div className="absolute top-0 left-0 w-full h-full border-[1px] border-cyan-400/20 pointer-events-none"/>
  </div>
  <div className="flex flex-col justify-start flex-1">
  <div className="flex justify-between items-start w-full">
  <div>
  <div className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">{title}</div>
  <div className="text-sm font-bold text-white tracking-wide">{data.name}</div>
  </div>
  {data.dob && <div className="text-[8px] font-bold text-white/30 border border-white/10 px-1.5 py-0.5">B. {data.dob}</div>}
  </div>
  
  {data.desc && (
  <div className="text-[9px] text-white/50 mt-2 leading-relaxed tracking-wide">
  <TypewriterText text={data.desc} delay={10} cursor={true} skip={false} />
  </div>
  )}
  
  <div className="mt-3 flex items-center justify-between w-full border-t border-white/5 pt-2">
  <div className="text-[7px] text-white/40 tracking-widest uppercase flex flex-wrap items-center gap-2">
  <span className="flex items-center gap-1 text-cyan-500/70"><Target size={8} /> VERIFIED</span>
  {data.party && <span className="text-white/30 border-l border-white/10 pl-2">{data.party}</span>}
  </div>
  </div>
  </div>
  </div>
  );
};

const CountryIntel = ({ country }) => {
 const [activeTab, setActiveTab] = useState('OVERVIEW');
 const { activeCountryCode, feeds, fetchCountryNews } = useStore();
 const [newsLoading, setNewsLoading] = useState(false);
 const [newsError, setNewsError] = useState(null);
 
 // Fetch real news when country changes
 useEffect(() => {
 if (country) {
 setNewsLoading(true);
 setNewsError(null);
 fetchCountryNews(country)
 .then(() => setNewsLoading(false))
 .catch(() => {
 setNewsLoading(false);
 setNewsError('FEED_OFFLINE');
 });
 }
 }, [country]);

 // Auto-refresh news every 60 seconds
 useEffect(() => {
 if (!country) return;
 const interval = setInterval(() => {
 if (document.hidden) return;
 fetchCountryNews(country);
 }, 60000);
 return () => clearInterval(interval);
 }, [country]);

 const activeCountryName = country || 'NONE';
 const data = MOCK_COUNTRY_DATA[activeCountryName] || generateProceduralIntel(activeCountryName) || emptyFallback;
 const [leadersData, setLeadersData] = useState(null);

 useEffect(() => {
 fetch('/leaders_data.json')
 .then(res => res.json())
 .then(data => setLeadersData(data))
 .catch(err => console.error("Failed to load leaders data", err));
 }, []);

 const tabs = ['OVERVIEW', 'GOVERNMENT', 'ECONOMY', 'TRADE', 'SOCIETY', 'DEMOGRAPHICS', 'SECURITY', 'ENVIRONMENT', 'INTEL'];

 const getFlagCode = (name, isoCode) => {
 if (isoCode) {
 const code = isoCode.toLowerCase();
 if (code.length === 2 && code !== '-99') return code;
 const iso3to2 = {"afg":"af","ala":"ax","alb":"al","dza":"dz","asm":"as","and":"ad","ago":"ao","aia":"ai","ata":"aq","atg":"ag","arg":"ar","arm":"am","abw":"aw","aus":"au","aut":"at","aze":"az","bhs":"bs","bhr":"bh","bgd":"bd","brb":"bb","blr":"by","bel":"be","blz":"bz","ben":"bj","bmu":"bm","btn":"bt","bol":"bo","bes":"bq","bih":"ba","bwa":"bw","bvt":"bv","bra":"br","iot":"io","brn":"bn","bgr":"bg","bfa":"bf","bdi":"bi","cpv":"cv","khm":"kh","cmr":"cm","can":"ca","cym":"ky","caf":"cf","tcd":"td","chl":"cl","chn":"cn","cxr":"cx","cck":"cc","col":"co","com":"km","cog":"cg","cod":"cd","cok":"ck","cri":"cr","civ":"ci","hrv":"hr","cub":"cu","cuw":"cw","cyp":"cy","cze":"cz","dnk":"dk","dji":"dj","dma":"dm","dom":"do","ecu":"ec","egy":"eg","slv":"sv","gnq":"gq","eri":"er","est":"ee","swz":"sz","eth":"et","flk":"fk","fro":"fo","fji":"fj","fin":"fi","fra":"fr","guf":"gf","pyf":"pf","atf":"tf","gab":"ga","gmb":"gm","geo":"ge","deu":"de","gha":"gh","gib":"gi","grc":"gr","grl":"gl","grd":"gd","glp":"gp","gum":"gu","gtm":"gt","ggy":"gg","gin":"gn","gnb":"gw","guy":"gy","hti":"ht","hmd":"hm","vat":"va","hnd":"hn","hkg":"hk","hun":"hu","isl":"is","ind":"in","idn":"id","irn":"ir","irq":"iq","irl":"ie","imn":"im","isr":"il","ita":"it","jam":"jm","jpn":"jp","jey":"je","jor":"jo","kaz":"kz","ken":"ke","kir":"ki","prk":"kp","kor":"kr","kwt":"kw","kgz":"kg","lao":"la","lva":"lv","lbn":"lb","lso":"ls","lbr":"lr","lby":"ly","lie":"li","ltu":"lt","lux":"lu","mac":"mo","mdg":"mg","mwi":"mw","mys":"my","mdv":"mv","mli":"ml","mlt":"mt","mhl":"mh","mtq":"mq","mrt":"mr","mus":"mu","myt":"yt","mex":"mx","fsm":"fm","mda":"md","mco":"mc","mng":"mn","mne":"me","msr":"ms","mar":"ma","moz":"mz","mmr":"mm","nam":"na","nru":"nr","npl":"np","nld":"nl","ncl":"nc","nzl":"nz","nic":"ni","ner":"ne","nga":"ng","niu":"nu","nfk":"nf","mkd":"mk","mnp":"mp","nor":"no","omn":"om","pak":"pk","plw":"pw","pse":"ps","pan":"pa","png":"pg","pry":"py","per":"pe","phl":"ph","pcn":"pn","pol":"pl","prt":"pt","pri":"pr","qat":"qa","reu":"re","rou":"ro","rus":"ru","rwa":"rw","blm":"bl","shn":"sh","kna":"kn","lca":"lc","maf":"mf","spm":"pm","vct":"vc","wsm":"ws","smr":"sm","stp":"st","sau":"sa","sen":"sn","srb":"rs","syc":"sc","sle":"sl","sgp":"sg","sxm":"sx","svk":"sk","svn":"si","slb":"sb","som":"so","zaf":"za","sgs":"gs","ssd":"ss","esp":"es","lka":"lk","sdn":"sd","sur":"sr","sjm":"sj","swe":"se","che":"ch","syr":"sy","twn":"tw","tjk":"tj","tza":"tz","tha":"th","tls":"tl","tgo":"tg","tkl":"tk","ton":"to","tto":"tt","tun":"tn","tur":"tr","tkm":"tm","tca":"tc","tuv":"tv","uga":"ug","ukr":"ua","are":"ae","gbr":"gb","usa":"us","umi":"um","ury":"uy","uzb":"uz","vut":"vu","ven":"ve","vnm":"vn","vgb":"vg","vir":"vi","wlf":"wf","esh":"eh","yem":"ye","zmb":"zm","zwe":"zw"};
 if (iso3to2[code]) return iso3to2[code];
 }
 const uName = (name || '').toUpperCase();
 const countryNameToIso2 = {"AFGHANISTAN":"af","ÅLAND ISLANDS":"ax","ALBANIA":"al","ALGERIA":"dz","AMERICAN SAMOA":"as","ANDORRA":"ad","ANGOLA":"ao","ANGUILLA":"ai","ANTARCTICA":"aq","ANTIGUA AND BARBUDA":"ag","ARGENTINA":"ar","ARMENIA":"am","ARUBA":"aw","AUSTRALIA":"au","AUSTRIA":"at","AZERBAIJAN":"az","BAHAMAS":"bs","BAHRAIN":"bh","BANGLADESH":"bd","BARBADOS":"bb","BELARUS":"by","BELGIUM":"be","BELIZE":"bz","BENIN":"bj","BERMUDA":"bm","BHUTAN":"bt","BOLIVIA, PLURINATIONAL STATE OF":"bo","BONAIRE, SINT EUSTATIUS AND SABA":"bq","BOSNIA AND HERZEGOVINA":"ba","BOTSWANA":"bw","BOUVET ISLAND":"bv","BRAZIL":"br","BRITISH INDIAN OCEAN TERRITORY":"io","BRUNEI DARUSSALAM":"bn","BULGARIA":"bg","BURKINA FASO":"bf","BURUNDI":"bi","CABO VERDE":"cv","CAMBODIA":"kh","CAMEROON":"cm","CANADA":"ca","CAYMAN ISLANDS":"ky","CENTRAL AFRICAN REPUBLIC":"cf","CHAD":"td","CHILE":"cl","CHINA":"cn","CHRISTMAS ISLAND":"cx","COCOS (KEELING) ISLANDS":"cc","COLOMBIA":"co","COMOROS":"km","CONGO":"cg","CONGO, DEMOCRATIC REPUBLIC OF THE":"cd","COOK ISLANDS":"ck","COSTA RICA":"cr","CÔTE D'IVOIRE":"ci","CROATIA":"hr","CUBA":"cu","CURAÇAO":"cw","CYPRUS":"cy","CZECHIA":"cz","DENMARK":"dk","DJIBOUTI":"dj","DOMINICA":"dm","DOMINICAN REPUBLIC":"do","ECUADOR":"ec","EGYPT":"eg","EL SALVADOR":"sv","EQUATORIAL GUINEA":"gq","ERITREA":"er","ESTONIA":"ee","ESWATINI":"sz","ETHIOPIA":"et","FALKLAND ISLANDS (MALVINAS)":"fk","FAROE ISLANDS":"fo","FIJI":"fj","FINLAND":"fi","FRANCE":"fr","FRENCH GUIANA":"gf","FRENCH POLYNESIA":"pf","FRENCH SOUTHERN TERRITORIES":"tf","GABON":"ga","GAMBIA":"gm","GEORGIA":"ge","GERMANY":"de","GHANA":"gh","GIBRALTAR":"gi","GREECE":"gr","GREENLAND":"gl","GRENADA":"gd","GUADELOUPE":"gp","GUAM":"gu","GUATEMALA":"gt","GUERNSEY":"gg","GUINEA":"gn","GUINEA-BISSAU":"gw","GUYANA":"gy","HAITI":"ht","HEARD ISLAND AND MCDONALD ISLANDS":"hm","HOLY SEE":"va","HONDURAS":"hn","HONG KONG":"hk","HUNGARY":"hu","ICELAND":"is","INDIA":"in","INDONESIA":"id","IRAN, ISLAMIC REPUBLIC OF":"ir","IRAQ":"iq","IRELAND":"ie","ISLE OF MAN":"im","ISRAEL":"il","ITALY":"it","JAMAICA":"jm","JAPAN":"jp","JERSEY":"je","JORDAN":"jo","KAZAKHSTAN":"kz","KENYA":"ke","KIRIBATI":"ki","KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF":"kp","KOREA, REPUBLIC OF":"kr","KUWAIT":"kw","KYRGYZSTAN":"kg","LAO PEOPLE'S DEMOCRATIC REPUBLIC":"la","LATVIA":"lv","LEBANON":"lb","LESOTHO":"ls","LIBERIA":"lr","LIBYA":"ly","LIECHTENSTEIN":"li","LITHUANIA":"lt","LUXEMBOURG":"lu","MACAO":"mo","MADAGASCAR":"mg","MALAWI":"mw","MALAYSIA":"my","MALDIVES":"mv","MALI":"ml","MALTA":"mt","MARSHALL ISLANDS":"mh","MARTINIQUE":"mq","MAURITANIA":"mr","MAURITIUS":"mu","MAYOTTE":"yt","MEXICO":"mx","MICRONESIA, FEDERATED STATES OF":"fm","MOLDOVA, REPUBLIC OF":"md","MONACO":"mc","MONGOLIA":"mn","MONTENEGRO":"me","MONTSERRAT":"ms","MOROCCO":"ma","MOZAMBIQUE":"mz","MYANMAR":"mm","NAMIBIA":"na","NAURU":"nr","NEPAL":"np","NETHERLANDS, KINGDOM OF THE":"nl","NEW CALEDONIA":"nc","NEW ZEALAND":"nz","NICARAGUA":"ni","NIGER":"ne","NIGERIA":"ng","NIUE":"nu","NORFOLK ISLAND":"nf","NORTH MACEDONIA":"mk","NORTHERN MARIANA ISLANDS":"mp","NORWAY":"no","OMAN":"om","PAKISTAN":"pk","PALAU":"pw","PALESTINE, STATE OF":"ps","PANAMA":"pa","PAPUA NEW GUINEA":"pg","PARAGUAY":"py","PERU":"pe","PHILIPPINES":"ph","PITCAIRN":"pn","POLAND":"pl","PORTUGAL":"pt","PUERTO RICO":"pr","QATAR":"qa","RÉUNION":"re","ROMANIA":"ro","RUSSIAN FEDERATION":"ru","RWANDA":"rw","SAINT BARTHÉLEMY":"bl","SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA":"sh","SAINT KITTS AND NEVIS":"kn","SAINT LUCIA":"lc","SAINT MARTIN (FRENCH PART)":"mf","SAINT PIERRE AND MIQUELON":"pm","SAINT VINCENT AND THE GRENADINES":"vc","SAMOA":"ws","SAN MARINO":"sm","SAO TOME AND PRINCIPE":"st","SAUDI ARABIA":"sa","SENEGAL":"sn","SERBIA":"rs","SEYCHELLES":"sc","SIERRA LEONE":"sl","SINGAPORE":"sg","SINT MAARTEN (DUTCH PART)":"sx","SLOVAKIA":"sk","SLOVENIA":"si","SOLOMON ISLANDS":"sb","SOMALIA":"so","SOUTH AFRICA":"za","SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS":"gs","SOUTH SUDAN":"ss","SPAIN":"es","SRI LANKA":"lk","SUDAN":"sd","SURINAME":"sr","SVALBARD AND JAN MAYEN":"sj","SWEDEN":"se","SWITZERLAND":"ch","SYRIAN ARAB REPUBLIC":"sy","TAIWAN, PROVINCE OF CHINA":"tw","TAJIKISTAN":"tj","TANZANIA, UNITED REPUBLIC OF":"tz","THAILAND":"th","TIMOR-LESTE":"tl","TOGO":"tg","TOKELAU":"tk","TONGA":"to","TRINIDAD AND TOBAGO":"tt","TUNISIA":"tn","TÜRKIYE":"tr","TURKMENISTAN":"tm","TURKS AND CAICOS ISLANDS":"tc","TUVALU":"tv","UGANDA":"ug","UKRAINE":"ua","UNITED ARAB EMIRATES":"ae","UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND":"gb","UNITED STATES OF AMERICA":"us","UNITED STATES MINOR OUTLYING ISLANDS":"um","URUGUAY":"uy","UZBEKISTAN":"uz","VANUATU":"vu","VENEZUELA, BOLIVARIAN REPUBLIC OF":"ve","VIET NAM":"vn","VIRGIN ISLANDS (BRITISH)":"vg","VIRGIN ISLANDS (U.S.)":"vi","WALLIS AND FUTUNA":"wf","WESTERN SAHARA":"eh","YEMEN":"ye","ZAMBIA":"zm","ZIMBABWE":"zw","UNITED STATES":"us","USA":"us","SOUTH KOREA":"kr","NORTH KOREA":"kp","VIETNAM":"vn","RUSSIA":"ru","SYRIA":"sy","IRAN":"ir","TAIWAN":"tw"};
 return countryNameToIso2[uName] || 'un';
 };

 const renderOverview = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="flex items-end gap-4">
 <div className="text-4xl font-bold text-white tracking-tighter">{data.overview?.risk || '---'}<span className="text-xs text-white/20 ml-1">/ 100</span></div>
 <div className="mb-1 text-[8px] font-bold text-primary tracking-widest uppercase">{data.overview?.status}</div>
 </div>
 <div className="h-1 bg-white/5 w-full">
 <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" style={{ width: `${data.overview?.risk || 0}%` }} />
 </div>
 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
 {data.overview?.metrics?.map(m => (
 <div key={m.label} className="space-y-1">
 <div className="flex justify-between text-[7px] font-bold tracking-widest text-white/40">
 <span>{m.label}</span>
 <span className="text-white">{m.val}</span>
 </div>
 <div className="h-0.5 bg-white/5 w-full">
 <div className="h-full"style={{ width: `${m.val}%`, backgroundColor: m.color }} />
 </div>
 </div>
 ))}
 </div>
 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Threat Matrix Polygon</div>
 <div className="h-[160px] w-full relative"style={{ minHeight: '160px' }}>
 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
 ...(data.overview?.metrics?.map(m => ({ subject: m.label, A: m.val, fullMark: 100 })) || []),
 { subject: 'SYS RISK', A: data.overview?.risk || 50, fullMark: 100 }
 ]}>
 <PolarGrid stroke="rgba(255,255,255,0.1)" />
 <PolarAngleAxis dataKey="subject"tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold' }} />
 <Radar name="Threat"dataKey="A"stroke="#22d3ee"fill="#22d3ee"fillOpacity={0.3} />
 <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px' }} itemStyle={{ color: '#22d3ee' }} />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 </div>
 <div className="p-3 bg-white/[0.02] border border-white/5 text-[9px] text-white/60 leading-relaxed uppercase tracking-wide">
 {data.overview?.summary}
 </div>
 </div>
 );

 const renderGovernment = () => {
 if (!leadersData) {
 return (
 <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
 <Database className="text-white/20 animate-pulse"size={24} />
 <div className="text-[9px] font-bold text-cyan-400/50 tracking-widest uppercase animate-pulse">CONNECTING TO WIKIDATA INTEL NETWORK...</div>
 </div>
 );
 }
 
 const leaderInfo = leadersData[activeCountryName.toUpperCase()];
 
 if (!leaderInfo) {
 return (
 <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
 <Fingerprint size={24} className="text-white/20"/>
 <div className="text-[9px] font-bold text-white/40 tracking-widest uppercase">No leadership intel available for this region</div>
 </div>
 );
 }
 
 // Check if Head of State and Head of Gov are the same person
 const isSamePerson = leaderInfo.head_of_state?.name === leaderInfo.head_of_gov?.name;

 return (
 <div className="space-y-4 animate-in fade-in duration-500">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Command Structure</div>
 <div className="grid grid-cols-1 gap-4">
 {isSamePerson ? (
 <LeaderCard title="Head of State & Government"data={leaderInfo.head_of_state} />
 ) : (
 <>
 <LeaderCard title="Head of State"data={leaderInfo.head_of_state} />
 <LeaderCard title="Head of Government"data={leaderInfo.head_of_gov} />
 </>
 )}
 </div>
 </div>
 );
 };

 const renderEconomy = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="grid grid-cols-2 gap-4">
 {[
 { label: 'GDP', val: data.economy?.gdp, sub: 'EST' },
 { label: 'GROWTH', val: data.economy?.growth, sub: 'YOY', color: 'text-green-400' },
 { label: 'INFLATION', val: data.economy?.inflation, sub: 'CPI', color: 'text-amber-400' },
 { label: 'UNEMPLOYMENT', val: data.economy?.unemployment, sub: 'RATE' },
 { label: 'DEBT/GDP', val: data.economy?.debt_gdp, sub: 'FISCAL', color: 'text-red-400' },
 { label: 'RESERVES', val: data.economy?.reserves, sub: 'FOREX', color: 'text-cyan-400' }
 ].map(m => (
 <div key={m.label} className="p-3 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
 <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">{m.label}</div>
 <div className={`text-sm font-bold ${m.color || 'text-white'}`}>{m.val}</div>
 <div className="text-[6px] font-bold tracking-widest text-white/20 mt-1 uppercase">{m.sub}</div>
 </div>
 ))}
 </div>
 
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Central Bank Rate & Rating</div>
 <div className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/10 px-2 py-0.5">{data.economy?.credit_rating}</div>
 </div>
 <div className="p-3 border border-white/5 bg-black/40 flex justify-between items-center">
 <span className="text-[9px] text-white/50 tracking-widest uppercase">CB Interest Rate</span>
 <span className="text-[11px] font-bold text-cyan-400">{data.economy?.cb_rate}</span>
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// GDP Sector Breakdown</div>
 <div className="h-[120px] w-full mt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data.economy?.sectors || []} layout="vertical"margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
 <XAxis type="number"hide />
 <YAxis dataKey="name"type="category"tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} />
 <Bar dataKey="val"radius={[0, 4, 4, 0]}>
 {data.economy?.sectors?.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );

 const renderTrade = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-white/[0.02] border border-white/5">
 <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">EXPORTS / GDP</div>
 <div className="text-sm font-bold text-cyan-400">{data.trade?.exports_gdp}</div>
 </div>
 <div className="p-3 bg-white/[0.02] border border-white/5">
 <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">IMPORTS / GDP</div>
 <div className="text-sm font-bold text-red-400">{data.trade?.imports_gdp}</div>
 </div>
 </div>
 
 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Strategic Vulnerabilities</div>
 <div className="p-3 border border-red-500/20 bg-red-500/[0.02] flex justify-between items-center group">
 <span className="text-[9px] text-white/50 tracking-widest uppercase flex items-center gap-2"><Flame size={10} className="text-red-400"/> Energy Dependence</span>
 <span className="text-[11px] font-bold text-red-400 group-hover:animate-pulse">{data.trade?.energy_dependence}</span>
 </div>
 <div className="p-3 border border-white/5 bg-white/[0.02]">
 <div className="text-[9px] text-white/50 tracking-widest uppercase mb-2 flex items-center gap-2"><Anchor size={10} className="text-cyan-400"/> Controlled/Reliant Chokepoints</div>
 <div className="flex flex-wrap gap-2">
 {data.trade?.chokepoints?.map(c => (
 <span key={c} className="text-[8px] bg-cyan-400/10 text-cyan-400 px-2 py-1 uppercase tracking-widest border border-cyan-400/20">{c}</span>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Major Trading Partners</div>
 <div className="space-y-1">
 {data.trade?.partners?.map((p, i) => (
 <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-white tracking-widest">{p.name}</span>
 <span className={`text-[7px] px-1 py-0.5 uppercase tracking-widest ${p.type === 'Export' ? 'bg-cyan-400/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>{p.type}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-16 h-1 bg-white/10 overflow-hidden">
 <div className={`h-full ${p.type === 'Export' ? 'bg-cyan-400' : 'bg-red-400'}`} style={{ width: `${p.val}%` }} />
 </div>
 <span className="text-[9px] text-white/60 w-6 text-right">{p.val}%</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );

 const renderSociety = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="grid grid-cols-2 gap-4">
 {[
 { label: 'POPULATION', val: data.society?.population },
 { label: 'MILITARY AGE POP', val: data.society?.mil_age_pop, color: 'text-amber-400' },
 { label: 'URBANIZATION', val: data.society?.urbanization },
 { label: 'LITERACY', val: data.society?.literacy }
 ].map(m => (
 <div key={m.label} className="p-3 bg-white/[0.02] border border-white/5">
 <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">{m.label}</div>
 <div className={`text-sm font-bold ${m.color || 'text-white'}`}>{m.val}</div>
 </div>
 ))}
 </div>

 <div className="space-y-3">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Strategic Society Index</div>
 
 <div className="space-y-2">
 <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/60">
 <span className="flex items-center gap-2"><Target size={10} className="text-cyan-400"/> Political Stability</span>
 <span>{data.society?.stability_index} / 100</span>
 </div>
 <div className="h-1 bg-white/10 w-full overflow-hidden">
 <div className="h-full bg-cyan-400"style={{ width: `${data.society?.stability_index}%` }} />
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/60">
 <span className="flex items-center gap-2"><Fingerprint size={10} className="text-purple-400"/> Cyber Resilience</span>
 <span>{data.society?.cyber_resilience} / 100</span>
 </div>
 <div className="h-1 bg-white/10 w-full overflow-hidden">
 <div className="h-full bg-purple-400"style={{ width: `${data.society?.cyber_resilience}%` }} />
 </div>
 </div>
 
 <div className="space-y-2">
 <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/60">
 <span className="flex items-center gap-2"><Database size={10} className="text-green-400"/> Digital Connectivity</span>
 <span>{data.society?.connectivity}</span>
 </div>
 <div className="h-1 bg-white/10 w-full overflow-hidden">
 <div className="h-full bg-green-400"style={{ width: `${data.society?.connectivity.replace('%','')}%` }} />
 </div>
 </div>
 </div>
 </div>
 );

 const renderDemographics = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="grid grid-cols-3 gap-2">
 <div className="p-2 bg-white/[0.02] border border-white/5 text-center">
 <div className="text-[6px] font-bold tracking-widest text-white/40 mb-1">YOUTH UNEMP</div>
 <div className="text-[10px] font-bold text-white">{data.demographics?.indicators?.youth_unemp}</div>
 </div>
 <div className="p-2 bg-white/[0.02] border border-white/5 text-center">
 <div className="text-[6px] font-bold tracking-widest text-white/40 mb-1">MIGRATION</div>
 <div className="text-[10px] font-bold text-white">{data.demographics?.indicators?.net_migration}</div>
 </div>
 <div className="p-2 bg-white/[0.02] border border-white/5 text-center">
 <div className="text-[6px] font-bold tracking-widest text-white/40 mb-1">FERTILITY</div>
 <div className="text-[10px] font-bold text-white">{data.demographics?.indicators?.fertility}</div>
 </div>
 </div>
 
 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Population Pyramid (Male/Female)</div>
 <div className="h-[200px] w-full mt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart layout="vertical"data={data.demographics?.pyramid || []} stackOffset="sign"margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
 <XAxis type="number"hide />
 <YAxis dataKey="ageGroup"type="category"tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} />
 <Legend iconSize={6} wrapperStyle={{ fontSize: '8px' }} />
 <Bar dataKey="male"name="Male (L)" fill="#3b82f6"stackId="stack"/>
 <Bar dataKey="female"name="Female (R)" fill="#ec4899"stackId="stack"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );

 const renderSecurity = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-red-500/[0.05] border border-red-500/20 text-center group cursor-pointer hover:bg-red-500/10 transition-colors">
 <div className="text-[7px] font-bold tracking-widest text-red-400 mb-1">GLOBAL FIREPOWER</div>
 <div className="text-xl font-bold text-red-500 group-hover:scale-110 transition-transform">#{data.security?.gfp_rank}</div>
 </div>
 <div className={`p-3 border text-center ${data.security?.nuclear === 'YES' ? 'bg-amber-500/[0.05] border-amber-500/20' : 'bg-white/[0.02] border-white/5'}`}>
 <div className={`text-[7px] font-bold tracking-widest mb-1 ${data.security?.nuclear === 'YES' ? 'text-amber-400' : 'text-white/40'}`}>NUCLEAR ARSENAL</div>
 <div className={`text-lg font-bold ${data.security?.nuclear === 'YES' ? 'text-amber-500 animate-pulse' : 'text-white/20'}`}>{data.security?.nuclear}</div>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-white/[0.02] border border-white/5">
 <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">ACTIVE DUTY</div>
 <div className="text-sm font-bold text-cyan-400">{data.security?.personnel?.active}</div>
 </div>
 <div className="p-3 bg-white/[0.02] border border-white/5">
 <div className="text-[7px] font-bold tracking-widest text-white/40 mb-1">RESERVES</div>
 <div className="text-sm font-bold text-white/70">{data.security?.personnel?.reserve}</div>
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Hardware Inventory</div>
 <div className="grid grid-cols-3 gap-2">
 {data.security?.hardware?.map((h, i) => (
 <div key={i} className="p-2 border border-white/10 bg-black/40 flex flex-col items-center justify-center text-center">
 <span className="text-[12px] font-bold text-white">{h.count}</span>
 <span className="text-[6px] tracking-widest text-white/40 uppercase mt-1">{h.type}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Strategic Alliances</div>
 <div className="flex flex-wrap gap-2">
 {data.security?.alliances?.map((a, i) => (
 <span key={i} className="px-2 py-1 text-[8px] font-bold tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">{a}</span>
 ))}
 </div>
 </div>
 </div>
 );

 const renderEnvironment = () => (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Critical Minerals & Supply Chain</div>
 <div className="flex flex-wrap gap-2">
 {data.environment?.critical_minerals?.map((m, i) => (
 <div key={i} className="px-3 py-1.5 bg-white/[0.05] border border-white/10 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]"></div>
 <span className="text-[9px] font-bold text-white tracking-widest uppercase">{m}</span>
 </div>
 ))}
 {(!data.environment?.critical_minerals || data.environment.critical_minerals.length === 0) && (
 <span className="text-[9px] text-white/20 uppercase tracking-widest">No major reserves</span>
 )}
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Water / Climate Security Risk</div>
 <div className={`p-3 border flex justify-between items-center ${
 data.environment?.water_risk === 'SEVERE' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
 data.environment?.water_risk === 'HIGH' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
 }`}>
 <span className="text-[9px] font-bold tracking-widest flex items-center gap-2"><Droplet size={10} /> DROUGHT VULNERABILITY</span>
 <span className="text-[10px] font-bold">{data.environment?.water_risk}</span>
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">// Energy Grid Infrastructure</div>
 <div className="h-[140px] w-full mt-2 relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={data.environment?.grid_mix || []} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="val">
 {data.environment?.grid_mix?.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }} />
 <Legend verticalAlign="middle"align="right"layout="vertical"iconType="circle"wrapperStyle={{ fontSize: '8px', color: '#fff' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );

 const renderIntel = () => {
 if (newsLoading) {
 return (
 <div className="h-full flex flex-col items-center justify-center space-y-4">
 <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"/>
 <div className="text-[9px] font-bold text-cyan-400 tracking-widest uppercase animate-pulse">Decrypting Feed...</div>
 </div>
 );
 }

 const intelData = feeds?.countryNews || [];

 const getTag = (title) => {
 if (!title) return 'INFO';
 const t = title.toLowerCase();
 if (t.match(/war|conflict|strike|attack|missile|nuclear|crisis|urgent|dead/)) return 'HIGH';
 if (t.match(/trade|economy|diplomatic|election|summit|deal|agreement|reform|policy/)) return 'MED';
 return 'INFO';
 };

 const formatTimeAgo = (dateStr) => {
 const date = new Date(dateStr);
 const now = new Date();
 const diffMs = now - date;
 const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
 if (diffHrs < 24) return `${diffHrs}h ago`;
 return `${Math.floor(diffHrs / 24)}d ago`;
 };

 if (intelData.length === 0 && !newsLoading) {
 return (
 <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
 <Fingerprint size={24} className="text-white/20"/>
 <div className="text-[9px] font-bold text-white/40 tracking-widest uppercase">No live intel available for this sector</div>
 </div>
 );
 }

 return (
 <div className="space-y-2 animate-in fade-in duration-500">
 <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-4 flex justify-between">
 <span>// Live Feed</span>
 <span className="text-cyan-400 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"/> SYNCED</span>
 </div>
 {intelData?.map((item, idx) => {
 const tag = item.tag || getTag(item.title);
 const source = (item.source && typeof item.source === 'object' && item.source.name) ? item.source.name : (item.source || 'OSINT');
 const time = item.time || (item.publishedAt ? formatTimeAgo(item.publishedAt) : 'Recent');
 const id = item.id || idx;

 return (
 <a key={id} href={item.url || '#'} target="_blank"rel="noopener noreferrer"className="block p-3 border-l-2 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group">
 <div className="flex justify-between items-start mb-2">
 <span className={`text-[7px] font-bold px-1 py-0.5 tracking-widest ${tag === 'HIGH' ? 'bg-red-500/20 text-red-500' : tag === 'MED' ? 'bg-amber-500/20 text-amber-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
 {tag} PRIORITY
 </span>
 <span className="text-[7px] text-white/40 tracking-widest uppercase">{time}</span>
 </div>
 <div className="text-[10px] font-bold text-white/90 leading-relaxed mb-2 group-hover:text-cyan-400 transition-colors">
 {item.title}
 </div>
 <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
 SRC: <span className="text-white/40">{source}</span>
 </div>
 </a>
 );
 })}
 </div>
 );
 };

 return (
 <div className="h-full bg-panel flex flex-col font-mono text-white overflow-hidden relative">
 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"/>
 
 <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0 relative z-10">
 <div className="flex items-center gap-3">
 {country && country !== 'NONE' && (
 <div className="w-6 h-4 border border-white/20 overflow-hidden shrink-0">
 <img src={`https://flagcdn.com/w40/${getFlagCode(country, activeCountryCode)}.png`} alt="" className="w-full h-full object-cover"onError={(e) => e.target.style.display = 'none'} />
 </div>
 )}
 <span className="text-[9px] font-bold tracking-[0.2em] text-cyan-400 uppercase">{country || 'COUNTRY INTEL'}</span>
 </div>
 <span className="text-[8px] text-white/20 tracking-widest uppercase">Global Feed: {feeds && feeds[country] ? 'Active' : 'Standby'}</span>
 </div>

 <div className="p-2 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0 relative z-10">
 {tabs.map(tab => (
 <button 
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`text-[9px] font-bold tracking-[0.2em] px-2 py-1 whitespace-nowrap transition-all ${activeTab === tab ? 'text-cyan-400 border-b border-cyan-400' : 'text-white/40 hover:text-white/80'}`}
 >
 {tab}
 </button>
 ))}
 </div>

 <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative z-10">
 {activeTab === 'OVERVIEW' && renderOverview()}
 {activeTab === 'GOVERNMENT' && renderGovernment()}
 {activeTab === 'ECONOMY' && renderEconomy()}
 {activeTab === 'TRADE' && renderTrade()}
 {activeTab === 'SOCIETY' && renderSociety()}
 {activeTab === 'DEMOGRAPHICS' && renderDemographics()}
 {activeTab === 'SECURITY' && renderSecurity()}
 {activeTab === 'ENVIRONMENT' && renderEnvironment()}
 {activeTab === 'INTEL' && renderIntel()}
 </div>
 </div>
 );
};

export default CountryIntel;
