import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, User, Globe, MapPin, Loader2, Fingerprint, ShieldAlert, ChevronRight, Scale, X, Target, Radio, Activity } from 'lucide-react';
import useStore from '../store';
import { streamAiResponse } from '../aiManager';

const renderSafe = (val) => {
 if (!val) return '';
 if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
 if (typeof val === 'object') return JSON.stringify(val);
 return String(val);
};

const COUNTRY_MAP = {
 'RUSSIA': 'RU', 'RUSSIAN FEDERATION': 'RU',
 'USA': 'US', 'UNITED STATES': 'US', 'AMERICA': 'US',
 'CHINA': 'CN', 'PRC': 'CN',
 'IRAN': 'IR',
 'NORTH KOREA': 'KP', 'DPRK': 'KP',
 'VIETNAM': 'VN', 'VIET NAM': 'VN',
 'INDIA': 'IN',
 'PAKISTAN': 'PK',
 'SYRIA': 'SY',
 'IRAQ': 'IQ',
 'AFGHANISTAN': 'AF',
 'UKRAINE': 'UA',
 'ISRAEL': 'IL',
 'PALESTINE': 'PS',
 'YEMEN': 'YE',
 'MEXICO': 'MX',
 'COLOMBIA': 'CO',
 'BRAZIL': 'BR',
 'VENEZUELA': 'VE',
 'FRANCE': 'FR',
 'UK': 'GB', 'UNITED KINGDOM': 'GB', 'ENGLAND': 'GB',
 'GERMANY': 'DE',
 'ITALY': 'IT',
 'SPAIN': 'ES',
 'JAPAN': 'JP',
 'SOUTH KOREA': 'KR', 'KOREA': 'KR',
 'TURKEY': 'TR', 'TURKIYE': 'TR',
 'SAUDI ARABIA': 'SA',
 'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE',
 'EGYPT': 'EG',
 'SOUTH AFRICA': 'ZA',
 'NIGERIA': 'NG',
 'KENYA': 'KE',
 'SOMALIA': 'SO',
 'SUDAN': 'SD',
 'MYANMAR': 'MM', 'BURMA': 'MM',
 'THAILAND': 'TH',
 'PHILIPPINES': 'PH',
 'INDONESIA': 'ID',
 'MALAYSIA': 'MY',
 'AUSTRALIA': 'AU',
 'CANADA': 'CA',
 'ARGENTINA': 'AR',
 'PERU': 'PE',
 'CHILE': 'CL',
 'CUBA': 'CU',
 'BELARUS': 'BY',
 'SERBIA': 'RS',
 'TAIWAN': 'TW',
 'URUGUAY': 'UY',
 'POLAND': 'PL',
 'ROMANIA': 'RO',
 'HUNGARY': 'HU',
 'GREECE': 'GR',
 'NETHERLANDS': 'NL',
 'BELGIUM': 'BE',
 'SWEDEN': 'SE',
 'NORWAY': 'NO',
 'FINLAND': 'FI',
 'DENMARK': 'DK',
 'SWITZERLAND': 'CH',
 'AUSTRIA': 'AT'
};

const HAIR_COLORS = {
 'BLA': 'BLACK', 'BRO': 'BROWN', 'GRE': 'GREY/GRAY', 'RED': 'RED', 'BLO': 'BLONDE', 'BAL': 'BALD', 'WHI': 'WHITE'
};

const EYE_COLORS = {
 'BLA': 'BLACK', 'BRO': 'BROWN', 'GRE': 'GREEN', 'BLU': 'BLUE', 'HAZ': 'HAZEL', 'GRY': 'GREY/GRAY'
};

const mapTraits = (arr, mapObj) => {
 if (!arr || !Array.isArray(arr)) return null;
 return arr.map(code => mapObj[code] || code).join(', ');
};

const WantedCriminals = () => {
 const [query, setQuery] = useState(() => localStorage.getItem('raven_wanted_query') || '');
 const [suspects, setSuspects] = useState(() => {
 const saved = localStorage.getItem('raven_wanted_list');
 return saved ? JSON.parse(saved) : [];
 });
 const [selectedSuspect, setSelectedSuspect] = useState(() => {
 const saved = localStorage.getItem('raven_wanted_selected');
 return saved ? JSON.parse(saved) : null;
 });
 const [suspectDetails, setSuspectDetails] = useState(() => {
 const saved = localStorage.getItem('raven_wanted_details');
 return saved ? JSON.parse(saved) : null;
 });
 const [suspectImages, setSuspectImages] = useState(() => {
 const saved = localStorage.getItem('raven_wanted_images');
 return saved ? JSON.parse(saved) : [];
 });
 const [activeImageIndex, setActiveImageIndex] = useState(-1);
 const [isLoading, setIsLoading] = useState(false);
 const [isDetailsLoading, setIsDetailsLoading] = useState(false);

 const activeOperationId = useStore(state => state.activeOperationId);
 const addNodeToOperation = useStore(state => state.addNodeToOperation);
 const addNotification = useStore(state => state.addNotification);
 const setSelectedTarget = useStore(state => state.setSelectedTarget);
 const setTrackingActive = useStore(state => state.setTrackingActive);
 const isTrackingActive = useStore(state => state.isTrackingActive);

 const [aiTranslation, setAiTranslation] = useState('');
 const [isTranslating, setIsTranslating] = useState(false);
 const abortRef = useRef(null);
 const [total, setTotal] = useState(() => {
 const saved = localStorage.getItem('raven_wanted_total');
 return saved ? parseInt(saved, 10) : 0;
 });
 const [page, setPage] = useState(() => {
 const saved = localStorage.getItem('raven_wanted_page');
 return saved ? parseInt(saved, 10) : 1;
 });

 // Persist state
 useEffect(() => {
 localStorage.setItem('raven_wanted_query', query);
 localStorage.setItem('raven_wanted_list', JSON.stringify(suspects));
 localStorage.setItem('raven_wanted_total', total.toString());
 localStorage.setItem('raven_wanted_page', page.toString());
 if (selectedSuspect) localStorage.setItem('raven_wanted_selected', JSON.stringify(selectedSuspect));
 else localStorage.removeItem('raven_wanted_selected');
 if (suspectDetails) localStorage.setItem('raven_wanted_details', JSON.stringify(suspectDetails));
 else localStorage.removeItem('raven_wanted_details');
 if (suspectImages) localStorage.setItem('raven_wanted_images', JSON.stringify(suspectImages));
 else localStorage.removeItem('raven_wanted_images');
 }, [query, suspects, selectedSuspect, suspectDetails, suspectImages]);

 const searchInterpol = async (e) => {
 if (e) e.preventDefault();
 setIsLoading(true);
 try {
 let url = `https://ws-public.interpol.int/notices/v1/red?resultPerPage=50`;
 const trimmedQuery = query.trim().toUpperCase();
 
 if (trimmedQuery) {
 if (COUNTRY_MAP[trimmedQuery]) {
 url += `&nationality=${COUNTRY_MAP[trimmedQuery]}`;
 } else if (trimmedQuery.length === 2) {
 // If they typed a 2 letter code, assume nationality
 url += `&nationality=${trimmedQuery}`;
 } else {
 url += `&name=${encodeURIComponent(query.trim())}`;
 }
 }
 
 const res = await fetch(url, { referrerPolicy: 'no-referrer' });
 const data = await res.json();
 
 if (data && data._embedded && data._embedded.notices) {
 setSuspects(data._embedded.notices);
 setTotal(data.total);
 setPage(1);
 } else {
 setSuspects([]);
 setTotal(0);
 setPage(1);
 }
 } catch (err) {
 console.error("Interpol API Error:", err);
 } finally {
 setIsLoading(false);
 }
 };

 const loadMore = async () => {
 if (suspects.length >= total || isLoading) return;
 setIsLoading(true);
 try {
 const nextPage = page + 1;
 let url = `https://ws-public.interpol.int/notices/v1/red?resultPerPage=50&page=${nextPage}`;
 const trimmedQuery = query.trim().toUpperCase();
 
 if (trimmedQuery) {
 if (COUNTRY_MAP[trimmedQuery]) {
 url += `&nationality=${COUNTRY_MAP[trimmedQuery]}`;
 } else if (trimmedQuery.length === 2) {
 url += `&nationality=${trimmedQuery}`;
 } else {
 url += `&name=${encodeURIComponent(query.trim())}`;
 }
 }
 
 const res = await fetch(url, { referrerPolicy: 'no-referrer' });
 const data = await res.json();
 
 if (data && data._embedded && data._embedded.notices) {
 setSuspects(prev => {
 // Prevent duplicates by checking entity_id
 const newNotices = data._embedded.notices.filter(
 notice => !prev.some(p => p.entity_id === notice.entity_id)
 );
 return [...prev, ...newNotices];
 });
 setPage(nextPage);
 }
 } catch (err) {
 console.error("Interpol API Error:", err);
 } finally {
 setIsLoading(false);
 }
 };

 // Initial fetch if empty
 useEffect(() => {
 if (suspects.length === 0) {
 searchInterpol();
 }
 }, []);

  const fetchDetails = async (suspect) => {
  setSelectedSuspect(suspect);
  setSuspectDetails(null);
  setSuspectImages([]);
  setActiveImageIndex(-1);
  setIsDetailsLoading(true);
  setAiTranslation('');
  setIsTranslating(false);
  if (abortRef.current) abortRef.current.abort();
  setSelectedTarget({
    id: suspect.entity_id,
    name: `${suspect.forename || ''} ${suspect.name || ''}`.trim(),
    nationality: suspect.nationalities?.[0] || 'UNKNOWN',
    birthDate: suspect.date_of_birth || 'UNKNOWN',
    placeOfBirth: suspect.place_of_birth || 'UNKNOWN',
    sex: suspect.sex_id || 'UNKNOWN',
    charge: 'WANTED BY INTERPOL',
    thumb: suspect._links?.thumbnail?.href
  });
  try {
 const fetchUrl = suspect._links?.self?.href || `https://ws-public.interpol.int/notices/v1/red/${suspect.entity_id.replace('/', '-')}`;
 const res = await fetch(fetchUrl, { referrerPolicy: 'no-referrer' });
 if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
 const data = await res.json();
 setSuspectDetails(data);
 setSelectedTarget({
    id: suspect.entity_id,
    name: `${suspect.forename || ''} ${suspect.name || ''}`.trim(),
    nationality: suspect.nationalities?.[0] || 'UNKNOWN',
    birthDate: suspect.date_of_birth || 'UNKNOWN',
    placeOfBirth: suspect.place_of_birth || 'UNKNOWN',
    sex: suspect.sex_id || 'UNKNOWN',
    charge: data.arrest_warrants?.[0]?.charge || 'WANTED BY INTERPOL',
    thumb: suspect._links?.thumbnail?.href
  });
 
 // Fetch additional images if available
 if (data._links && data._links.images) {
 try {
 const imgRes = await fetch(data._links.images.href, { referrerPolicy: 'no-referrer' });
 const imgData = await imgRes.json();
 if (imgData && imgData._embedded && imgData._embedded.images) {
 setSuspectImages(imgData._embedded.images);
 }
 } catch (imgErr) {
 console.error("Failed to fetch suspect images:", imgErr);
 }
 }
 } catch (err) {
 console.error("Failed to fetch suspect details:", err);
 } finally {
 setIsDetailsLoading(false);
 }
 };

 const translateDossier = async () => {
 if (!suspectDetails || !suspectDetails.arrest_warrants) return;
 
 setAiTranslation('');
 setIsTranslating(true);

 if (abortRef.current) abortRef.current.abort();
 abortRef.current = new AbortController();
 
 const chargesText = suspectDetails.arrest_warrants.map(w => w.charge).join(' | ');
 const prompt = `You are RAVEN, an elite tactical intelligence AI. 
The user is requesting a highly detailed tactical dossier expansion for a wanted criminal.
Criminal Charges: ${chargesText}

Task:
1. Translate the charges to formal, classified intelligence terminology.
2. Provide a hypothetical but highly plausible"TACTICAL ASSESSMENT"elaborating on what these charges typically entail (modus operandi, severity, potential risks, criminal network involvement).
3. Provide a"RECOMMENDED PROTOCOL"for field agents encountering this target.
Output ONLY the detailed dossier in a highly structured, immersive, cyber/military format. Do not use markdown backticks, just raw text with uppercase headers. Keep it concise but dense with tactical flavor.`;
 
 try {
 let firstChunk = false;
 await streamAiResponse(prompt, {
 signal: abortRef.current.signal,
 config: { temperature: 0.5, maxOutputTokens: 800 },
 onChunk: (text) => {
 if (!firstChunk) {
 setAiTranslation('');
 firstChunk = true;
 }
 setAiTranslation(prev => prev + text);
 },
 onComplete: () => setIsTranslating(false),
 onError: (err) => {
 if (err.name !== 'AbortError') {
 setAiTranslation('ERROR: Neural network link severed.');
 }
 setIsTranslating(false);
 }
 });
 } catch (err) {
 if (err.name !== 'AbortError') {
 setAiTranslation('ERROR: Neural network link severed.');
 }
 setIsTranslating(false);
 }
 };

   const clearSelection = () => {
   setSelectedSuspect(null);
   setSuspectDetails(null);
   setSuspectImages([]);
   setActiveImageIndex(-1);
   setSelectedTarget(null);
   setTrackingActive(false);
   };

 return (
 <div className="h-full flex flex-col bg-[#0a0000] border border-red-900/30 text-white font-mono">
 
 {/* Header */}
 <div className="shrink-0 flex items-center justify-between p-3 border-b border-red-900/50 bg-red-950/20">
 <div className="flex items-center gap-2">
 <div className="relative flex items-center justify-center w-6 h-6 bg-red-900/30 border border-red-500/50">
 <AlertTriangle size={12} className="text-red-500 animate-pulse"/>
 </div>
 <div>
 <div className="text-[11px] font-bold text-red-500 tracking-widest">INTERPOL RED NOTICES</div>
 <div className="text-[9px] text-red-500/50 tracking-wider">GLOBAL WANTED PERSONS REGISTRY</div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex flex-col items-end">
 <div className="text-[14px] font-bold text-red-500 tracking-wider font-mono">
 {total > 0 ? total.toLocaleString() : suspects.length}
 </div>
 <div className="text-[8px] text-red-500/50 tracking-widest">ACTIVE WARRANTS</div>
 </div>
 </div>
 </div>

 <div className="flex-1 flex overflow-hidden">
 
 {/* Left Col: Search & List */}
 <div className={`shrink-0 flex-col border-r border-red-900/30 bg-black/40 transition-all duration-300 ${
 selectedSuspect ? 'hidden md:flex md:w-[40%]' : 'flex w-full'
 }`}>
 
 <div className="p-3 border-b border-red-900/30 bg-red-950/10">
 <form onSubmit={searchInterpol} className="relative">
 <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-500/50"/>
 <input 
 type="text"
 placeholder="SEARCH BY NAME..." 
 value={query}
 onChange={e => setQuery(e.target.value)}
 className="w-full bg-black/60 border border-red-900/50 py-1.5 pl-7 pr-2 text-[10px] text-red-400 placeholder:text-red-900 focus:outline-none focus:border-red-500 transition-colors uppercase"
 />
 </form>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
 {isLoading ? (
 <div className="flex flex-col items-center justify-center h-full text-red-500/50">
 <Loader2 size={16} className="animate-spin mb-2"/>
 <div className="text-[9px] tracking-widest uppercase">SCANNING INTERPOL DATABASE...</div>
 </div>
 ) : suspects.length === 0 ? (
 <div className="text-center p-4 text-[9px] text-red-500/40 uppercase">NO TARGETS FOUND</div>
 ) : (
 <div className={`grid gap-2 ${selectedSuspect ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
 {suspects.map((suspect, idx) => {
 const isSelected = selectedSuspect?.entity_id === suspect.entity_id;
 const thumb = suspect._links?.thumbnail?.href;
 
 return (
 <div 
 key={`${suspect.entity_id}-${idx}`}
 onClick={() => fetchDetails(suspect)}
 className={`flex items-start gap-3 p-2 cursor-pointer transition-all border group ${
 isSelected 
 ? 'bg-red-900/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
 : 'bg-black/60 border-red-900/30 hover:border-red-500/50 hover:bg-red-950/20'
 }`}
 >
 <div className="shrink-0 w-12 h-14 bg-red-950/30 border border-red-900/50 flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img 
            src={thumb} 
            alt="Suspect"
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
          />
        ) : null}
        <User size={16} className="text-red-900" style={{ display: thumb ? 'none' : 'block' }}/>
 </div>
 <div className="flex-1 min-w-0 py-0.5">
 <div className="text-[10px] font-bold text-red-50 truncate group-hover:text-red-400 transition-colors uppercase">
 {suspect.name}{suspect.forename ? `, ${suspect.forename}` : ''}
 </div>
 <div className="flex items-center gap-2 mt-1">
 <span className="px-1.5 py-0.5 bg-red-950 border border-red-900 text-[8px] text-red-500 tracking-wider">
 {suspect.nationalities?.[0] || 'UNKNOWN'}
 </span>
 <span className="text-[8px] text-red-500/50">{suspect.date_of_birth}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 
 {!isLoading && suspects.length > 0 && suspects.length < total && (
 <button 
 onClick={loadMore}
 className="w-full mt-4 py-3 bg-red-900/10 border border-red-500/20 text-[10px] font-bold tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all uppercase mb-4"
 >
 LOAD MORE TARGETS
 </button>
 )}
 </div>
 </div>

 {/* Right Col: Dossier Details */}
 {selectedSuspect && (
 <div className="flex-1 flex flex-col bg-black/80 relative overflow-hidden border-l border-red-900/50">
 {/* Scanlines */}
 <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(255,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>

 {/* Dossier Header */}
 <div className="shrink-0 p-4 border-b border-red-900/30 relative z-10 bg-red-950/10 flex justify-between items-start">
 <div>
 <button onClick={clearSelection} className="md:hidden flex items-center gap-1 mb-3 text-red-500/70 hover:text-red-400 text-[9px] font-bold tracking-widest uppercase">
 <ChevronRight size={10} className="rotate-180"/> BACK TO TARGETS
 </button>
 <div className="flex items-center gap-2 mb-1">
 <ShieldAlert size={12} className="text-red-500 animate-pulse"/>
 <div className="text-[8px] text-red-500 font-bold tracking-widest uppercase">CLASSIFIED DOSSIER // {renderSafe(selectedSuspect.entity_id)}</div>
 </div>
 <div className="text-[14px] font-bold text-white tracking-wider uppercase mt-1">
 {renderSafe(selectedSuspect.name)} {renderSafe(selectedSuspect.forename)}
 </div>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={() => {
 if (!activeOperationId) return addNotification('SELECT AN ACTIVE OPERATION IN LINK ANALYSIS FIRST', 'WARNING');
 addNodeToOperation(activeOperationId, {
 id: `CRIMINAL-${selectedSuspect.entity_id}`,
 name: `${renderSafe(selectedSuspect.name)} ${renderSafe(selectedSuspect.forename)}`.trim(),
 type: 'PERSON',
 img: suspectImages[0]?._links?.thumbnail?.href || selectedSuspect._links?.thumbnail?.href,
 desc: renderSafe(selectedSuspect.arrest_warrants?.[0]?.charge_translation) || 'WANTED BY INTERPOL'
 });
 addNotification(`TARGET ${selectedSuspect.name} ADDED TO OPERATION`, 'SUCCESS');
 }}
 className="flex items-center gap-1 px-2 py-1 bg-red-900/30 hover:bg-red-500/20 border border-red-500/50 text-red-400 text-[8px] font-bold tracking-widest transition-colors uppercase"
 >
 <Target size={10} /> ADD TO OP
 </button>
 <button onClick={clearSelection} className="p-1 text-red-500/50 hover:text-red-500 hover:bg-red-950/50 transition-colors hidden md:block">
 <X size={14} />
 </button>
 </div>
 </div>

 {/* Dossier Content */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10">
  {isDetailsLoading ? (
 <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70">
 <div className="text-red-500 animate-pulse"><Fingerprint size={24} /></div>
 <span className="text-[9px] tracking-widest text-red-500/50 uppercase">DECRYPTING CLASSIFIED FILES...</span>
 </div>
 ) : suspectDetails ? (
 <div className="space-y-6">
 
 {/* Photo & Basic Info */}
 <div className="flex flex-col xl:flex-row gap-4">
 <div className="shrink-0 space-y-2">
 <div className="w-40 h-48 border-2 border-red-900/50 bg-black/50 p-1 relative">
 {/* Corners */}
 <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500"></div>
 <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-500"></div>
 <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-500"></div>
 <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-500"></div>
 
        {activeImageIndex >= 0 && suspectImages[activeImageIndex] ? (
          <img src={suspectImages[activeImageIndex]._links?.self?.href || suspectImages[activeImageIndex]._links?.thumbnail?.href} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Mugshot" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }}/>
        ) : suspectDetails._links?.thumbnail?.href ? (
          <img src={suspectDetails._links.thumbnail.href} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Mugshot" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }}/>
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-red-900" style={{ display: (suspectDetails._links?.thumbnail?.href || (activeImageIndex >= 0 && suspectImages[activeImageIndex])) ? 'none' : 'flex' }}><User size={40}/></div>
 </div>
 
 {/* Extra Images Gallery */}
 {suspectImages.length > 0 && (
 <div className="grid grid-cols-3 gap-1 w-40">
 {suspectDetails._links?.thumbnail?.href && (
 <button onClick={() => setActiveImageIndex(-1)} className={`block w-full h-12 border transition-colors bg-red-950/20 ${activeImageIndex === -1 ? 'border-red-500 opacity-100' : 'border-red-900/50 opacity-50 hover:border-red-500/80 hover:opacity-100'}`}>
 <img src={suspectDetails._links.thumbnail.href} referrerPolicy="no-referrer" className="w-full h-full object-cover"alt="Default Alias"/>
 </button>
 )}
 {suspectImages.map((img, i) => (
 <button key={i} onClick={() => setActiveImageIndex(i)} className={`block w-full h-12 border transition-colors bg-red-950/20 ${activeImageIndex === i ? 'border-red-500 opacity-100' : 'border-red-900/50 opacity-50 hover:border-red-500/80 hover:opacity-100'}`}>
 <img src={img._links?.thumbnail?.href || img._links?.self?.href} referrerPolicy="no-referrer" className="w-full h-full object-cover"alt={`Alias ${i}`} />
 </button>
 ))}
 </div>
 )}
 </div>
 
 <div className="flex-1 space-y-2">
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
 <div className="p-2 border border-red-900/30 bg-red-950/10">
 <div className="text-[7px] text-red-500/60 tracking-widest mb-0.5">DATE OF BIRTH</div>
 <div className="text-[10px] text-white">{renderSafe(suspectDetails.date_of_birth) || 'UNKNOWN'}</div>
 </div>
 <div className="p-2 border border-red-900/30 bg-red-950/10">
 <div className="text-[7px] text-red-500/60 tracking-widest mb-0.5">PLACE OF BIRTH</div>
 <div className="text-[10px] text-white">{renderSafe(suspectDetails.place_of_birth)} {suspectDetails.country_of_birth_id ? `(${suspectDetails.country_of_birth_id})` : ''}</div>
 </div>
 <div className="p-2 border border-red-900/30 bg-red-950/10">
 <div className="text-[7px] text-red-500/60 tracking-widest mb-0.5">NATIONALITIES</div>
 <div className="text-[10px] text-white">{renderSafe(suspectDetails.nationalities) || 'UNKNOWN'}</div>
 </div>
 <div className="p-2 border border-red-900/30 bg-red-950/10">
 <div className="text-[7px] text-red-500/60 tracking-widest mb-0.5">GENDER</div>
 <div className="text-[10px] text-white">{suspectDetails.sex_id === 'M' ? 'MALE' : suspectDetails.sex_id === 'F' ? 'FEMALE' : 'UNKNOWN'}</div>
 </div>
 <div className="p-2 border border-red-900/30 bg-red-950/10">
 <div className="text-[7px] text-red-500/60 tracking-widest mb-0.5">LANGUAGES</div>
 <div className="text-[10px] text-white">{renderSafe(suspectDetails.languages_spoken_ids) || 'UNKNOWN'}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Charges */}
 {Array.isArray(suspectDetails.arrest_warrants) && suspectDetails.arrest_warrants.length > 0 && (
 <div>
 <div className="flex items-center justify-between mb-2 border-b border-red-900/30 pb-1">
 <div className="flex items-center gap-2">
 <Scale size={12} className="text-red-500"/>
 <span className="text-[10px] font-bold text-red-500 tracking-widest">WARRANT CHARGES</span>
 </div>
 {!aiTranslation && !isTranslating && (
 <button 
 onClick={translateDossier} 
 className="text-[8px] px-2 py-0.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors uppercase font-bold tracking-widest cursor-pointer"
 >
 DECRYPT & TRANSLATE
 </button>
 )}
 </div>
 <div className="space-y-2">
 {suspectDetails.arrest_warrants.map((warrant, idx) => (
 <div key={idx} className="p-2.5 bg-red-900/10 border border-red-900/30 ">
 <div className="text-[8px] text-red-400 mb-1 tracking-widest">ISSUING COUNTRY: {renderSafe(warrant.issuing_country_id)}</div>
 <div className="text-[10px] text-red-50 leading-relaxed uppercase">{renderSafe(warrant.charge)}</div>
 </div>
 ))}
 </div>

 { (aiTranslation || isTranslating) && (
 <div className="mt-2 p-3 border border-red-500/50 bg-red-500/10 relative overflow-hidden">
 <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(255,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>
 <div className="text-[7px] text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-2 relative z-10">
 <ShieldAlert size={10} /> AI TRANSLATED DOSSIER {isTranslating && <Loader2 size={8} className="animate-spin"/>}
 </div>
 <div className="text-[10px] text-red-100 uppercase leading-relaxed font-mono relative z-10">
 {aiTranslation || 'INITIALIZING NEURAL TRANSLATION...'}
 {isTranslating && <span className="inline-block w-1.5 h-3 ml-1 bg-red-400 animate-pulse align-middle"/>}
 </div>
 </div>
 )}
 </div>
 )}

 {/* Physical Description */}
 {(suspectDetails.height || suspectDetails.weight || suspectDetails.eyes_colors_id || suspectDetails.hairs_id || suspectDetails.distinguishing_marks) && (
 <div>
 <div className="flex items-center gap-2 mb-2 border-b border-red-900/30 pb-1">
 <User size={12} className="text-red-500"/>
 <span className="text-[10px] font-bold text-red-500 tracking-widest">PHYSICAL PROFILE</span>
 </div>
 <div className="grid grid-cols-2 gap-2 text-[9px] uppercase">
 {suspectDetails.height && <div><span className="text-red-500/60 mr-1">HEIGHT:</span> {renderSafe(suspectDetails.height)} m</div>}
 {suspectDetails.weight && <div><span className="text-red-500/60 mr-1">WEIGHT:</span> {renderSafe(suspectDetails.weight)} kg</div>}
 {suspectDetails.eyes_colors_id && <div><span className="text-red-500/60 mr-1">EYES:</span> {mapTraits(suspectDetails.eyes_colors_id, EYE_COLORS)}</div>}
 {suspectDetails.hairs_id && <div><span className="text-red-500/60 mr-1">HAIR:</span> {mapTraits(suspectDetails.hairs_id, HAIR_COLORS)}</div>}
 </div>
 {suspectDetails.distinguishing_marks && (
 <div className="mt-2 text-[9px]">
 <div className="text-red-500/60 mb-0.5">MARKS/SCARS:</div>
 <div className="text-red-50 uppercase leading-relaxed">{renderSafe(suspectDetails.distinguishing_marks)}</div>
 </div>
 )}
 </div>
 )}

 </div>
 ) : (
 <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70 p-4 text-center">
 <ShieldAlert size={32} className="text-red-500" />
 <span className="text-[9px] tracking-widest text-red-500/50 uppercase">ERROR: DOSSIER CORRUPTED OR ACCESS DENIED BY INTERPOL.</span>
 </div>
  )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default WantedCriminals;