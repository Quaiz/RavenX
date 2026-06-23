import React, { useState, useEffect, useRef, useMemo } from 'react';
import useStore from '../store';
import { Search, ShieldAlert, Cpu, Activity, MapPin, Anchor, Plane, Radio, Loader2, RefreshCw, X } from 'lucide-react';
import { streamAiResponse } from '../aiManager';

const MilitaryRegistry = () => {
 const bases = useStore(s => s.feeds.militaryBases);
 const fetchMilitaryBases = useStore(s => s.fetchMilitaryBases);
 const setMapPin = useStore(s => (pin) => useStore.setState({ activePin: pin }));
 
 const [search, setSearch] = useState('');
 const [filterType, setFilterType] = useState('ALL');
 const [selectedBase, setSelectedBase] = useState(() => {
 const saved = localStorage.getItem('raven_mil_base');
 return saved ? JSON.parse(saved) : null;
 });
 const [aiAnalysis, setAiAnalysis] = useState(() => {
 return localStorage.getItem('raven_mil_analysis') || '';
 });
 const [isAiLoading, setIsAiLoading] = useState(false);
 const abortRef = useRef(null);

 // Colors based on type
 const typeConfig = {
 'NAVAL': { icon: Anchor, color: 'text-blue-400', bg: 'bg-blue-500/10' },
 'AIR': { icon: Plane, color: 'text-sky-400', bg: 'bg-sky-500/10' },
 'SIGINT': { icon: Radio, color: 'text-purple-400', bg: 'bg-purple-500/10' },
 'STRATEGIC': { icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10' },
 'GENERAL': { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-600/10' },
 };

 useEffect(() => {
 if (selectedBase) localStorage.setItem('raven_mil_base', JSON.stringify(selectedBase));
 else localStorage.removeItem('raven_mil_base');
 }, [selectedBase]);

 useEffect(() => {
 localStorage.setItem('raven_mil_analysis', aiAnalysis);
 }, [aiAnalysis]);

 useEffect(() => {
 if (!bases || bases.length === 0) {
 fetchMilitaryBases();
 }
 }, [fetchMilitaryBases, bases]);

 const filteredBases = useMemo(() => {
 if (!bases) return [];
 return bases.filter(b => {
 const matchType = filterType === 'ALL' || b.type === filterType;
 const matchSearch = (b.name + ' ' + b.country).toLowerCase().includes(search.toLowerCase());
 return matchType && matchSearch;
 });
 }, [bases, search, filterType]);

 const deployAiAssessment = async () => {
 if (!selectedBase) return;
 
 setAiAnalysis('');
 setIsAiLoading(true);

 if (abortRef.current) {
 abortRef.current.abort();
 }
 abortRef.current = new AbortController();
 
 const prompt = `You are RAVEN, an elite tactical AI military intelligence analyst.
Provide a highly detailed, clinical strategic assessment of the following military installation.
Base Name: ${selectedBase.name}
Country: ${selectedBase.country}
Designation Type: ${selectedBase.type}
Coordinates: ${selectedBase.lat}, ${selectedBase.lon}

Focus your briefing on:
1) Primary Function & Capabilities (Known assets, weapon systems, radar range)
2) Strategic Geopolitical Value (Why does this base matter?)
3) Proximity to Flashpoints
4) Overall Threat Posture

Do not use markdown headers (#), just bold text. Write like a Pentagon classified dossier.`;
 
 try {
 let firstChunkReceived = false;
 await streamAiResponse(prompt, {
 signal: abortRef.current.signal,
 config: { temperature: 0.7, maxOutputTokens: 600 },
 onStart: () => console.log('[MILITARY INTEL] AI link established.'),
 onChunk: (textChunk) => {
 if (!firstChunkReceived) {
 setAiAnalysis(''); 
 firstChunkReceived = true;
 }
 setAiAnalysis(prev => prev + textChunk);
 },
 onComplete: () => setIsAiLoading(false),
 onError: (err) => {
 if (err.name !== 'AbortError') setAiAnalysis('ERROR: Secure link severed.');
 setIsAiLoading(false);
 }
 });
 } catch (err) {
 if (err.name !== 'AbortError') setAiAnalysis('CRITICAL ERROR: Failed to establish link.');
 setIsAiLoading(false);
 }
 };

 const handleSelect = (base) => {
 setSelectedBase(base);
 setAiAnalysis('');
 setMapPin({ label: base.name, lat: base.lat, lon: base.lon });
 };

 const renderAnalysis = () => {
 if (!aiAnalysis) return null;
 return aiAnalysis.split('\n').map((line, idx) => {
 let content = line.replace(/\*\*(.+?)\*\*/g, '<b class="text-[#8B9B7B] font-bold">$1</b>');
 if (content.startsWith('- ')) {
 return (
 <div key={idx} className="flex gap-2 text-white/70 text-[10px] leading-relaxed pl-2 mt-1">
 <span className="text-[#8B9B7B]/60 shrink-0 mt-0.5">▸</span>
 <span dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
 </div>
 );
 }
 if (content.match(/^\d\)/)) {
 return (
 <div key={idx} className="text-[11px] font-bold text-[#A5B793] tracking-wider uppercase mt-3 mb-1 border-b border-[#8B9B7B]/20 pb-1"dangerouslySetInnerHTML={{ __html: content }} />
 );
 }
 return (
 <p key={idx} className="text-white/60 text-[10px] leading-relaxed mt-1"dangerouslySetInnerHTML={{ __html: content }} />
 );
 });
 };

 return (
 <div className="h-full flex flex-col bg-[#0a0a0a] border border-[#2a2d24]">
 
 {/* Header - Olive Drab Theme */}
 <div className="shrink-0 flex items-center justify-between p-3 border-b border-[#3a3f32] bg-[#1a1c15]">
 <div className="flex items-center gap-2">
 <div className="relative flex items-center justify-center w-6 h-6 bg-[#4a5240]/20 border border-[#4a5240]">
 <ShieldAlert size={12} className="text-[#8B9B7B]" />
 </div>
 <div>
 <div className="text-[11px] font-bold text-[#8B9B7B] tracking-widest">MILITARY REGISTRY</div>
 <div className="text-[9px] text-[#6d7a60] tracking-wider font-mono">GLOBAL STRATEGIC INSTALLATIONS</div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex flex-col items-end">
 <div className="text-[14px] font-bold text-[#A5B793] tracking-wider font-mono">{bases?.length || 0}</div>
 <div className="text-[8px] text-[#6d7a60] tracking-widest">KNOWN BASES</div>
 </div>
 <button 
 onClick={fetchMilitaryBases}
 className="w-6 h-6 border border-[#3a3f32] flex items-center justify-center text-[#8B9B7B]/60 hover:text-[#A5B793] hover:bg-[#2a2d24] transition-colors"
 >
 <RefreshCw size={12} />
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 flex overflow-hidden">
 
 {/* Left Col: Registry List */}
 <div className="w-[45%] shrink-0 flex flex-col border-r border-[#2a2d24] bg-[#0c0d0a]">
 
 {/* Search & Filter */}
 <div className="p-2 border-b border-[#2a2d24] bg-[#11130e] space-y-2">
 <div className="relative">
 <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#4a5240]" />
 <input 
 type="text"
 placeholder="SEARCH INSTALLATION..." 
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full bg-[#0a0a0a] border border-[#2a2d24] py-1 pl-6 pr-2 text-[9px] font-mono text-[#A5B793] placeholder:text-[#4a5240] focus:outline-none focus:border-[#4a5240] uppercase"
 />
 </div>
 <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
 {['ALL', 'STRATEGIC', 'NAVAL', 'AIR', 'SIGINT'].map(t => (
 <button 
 key={t}
 onClick={() => setFilterType(t)}
 className={`shrink-0 px-2 py-0.5 text-[8px] font-bold tracking-widest border transition-colors ${
 filterType === t 
 ? 'bg-[#4a5240]/40 border-[#8B9B7B] text-[#A5B793]' 
 : 'bg-[#0a0a0a] border-[#2a2d24] text-[#4a5240] hover:text-[#8B9B7B]'
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 </div>

 {/* List */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
 {!bases || bases.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-[#4a5240]">
 <Loader2 size={16} className="animate-spin mb-2"/>
 <div className="text-[9px] font-mono tracking-widest">DOWNLOADING DOSSIERS...</div>
 </div>
 ) : filteredBases.length === 0 ? (
 <div className="text-center p-4 text-[9px] text-[#4a5240] font-mono">NO INSTALLATIONS MATCHING CRITERIA</div>
 ) : filteredBases.map(base => {
 const Icon = typeConfig[base.type]?.icon || ShieldAlert;
 const color = typeConfig[base.type]?.color || 'text-amber-600';
 return (
 <div 
 key={base.id}
 onClick={() => handleSelect(base)}
 className={`flex items-center gap-2 p-2 cursor-pointer transition-all border group ${
 selectedBase?.id === base.id 
 ? 'bg-[#1a1c15] border-[#4a5240]' 
 : 'bg-black/20 border-transparent hover:border-[#2a2d24]'
 }`}
 >
 <div className={`shrink-0 w-6 h-6 flex items-center justify-center border border-white/5 ${typeConfig[base.type]?.bg || 'bg-white/5'}`}>
 <Icon size={10} className={color} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-[10px] font-bold text-white/80 truncate group-hover:text-[#A5B793] transition-colors">{base.name}</div>
 <div className="text-[8px] text-[#6d7a60] font-mono truncate">{base.country}</div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Right Col: Base Dossier */}
 <div className="flex-1 flex flex-col bg-[#050604] relative">
 
 {/* Static Scanlines */}
 <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>

 {selectedBase ? (
 <>
 {/* Dossier Header */}
 <div className="shrink-0 p-4 border-b border-[#2a2d24] relative z-10 bg-[#0a0a0a]">
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="text-[8px] text-[#4a5240] font-mono tracking-widest mb-1">CLASSIFIED DOSSIER // {selectedBase.id}</div>
 <div className="text-[13px] font-bold text-[#A5B793] tracking-wider leading-tight">{selectedBase.name.toUpperCase()}</div>
 <div className="text-[9px] text-[#6d7a60] uppercase mt-0.5">{selectedBase.country}</div>
 </div>
 <div className={`px-2 py-0.5 border text-[8px] font-bold tracking-widest ${typeConfig[selectedBase.type]?.color} ${typeConfig[selectedBase.type]?.bg} border-current opacity-70`}>
 {selectedBase.type}
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-2 mb-4">
 <div className="p-2 bg-black/40 border border-[#2a2d24]">
 <div className="flex items-center gap-1 text-[8px] text-[#4a5240] tracking-widest mb-1">
 <MapPin size={8} /> LATITUDE
 </div>
 <div className="text-[10px] text-[#8B9B7B] font-mono">{selectedBase.lat.toFixed(4)}°</div>
 </div>
 <div className="p-2 bg-black/40 border border-[#2a2d24]">
 <div className="flex items-center gap-1 text-[8px] text-[#4a5240] tracking-widest mb-1">
 <MapPin size={8} /> LONGITUDE
 </div>
 <div className="text-[10px] text-[#8B9B7B] font-mono">{selectedBase.lon.toFixed(4)}°</div>
 </div>
 </div>

 {/* Deploy button */}
 <button
 onClick={deployAiAssessment}
 disabled={isAiLoading}
 className="w-full flex items-center justify-between p-2 bg-[#1a1c15] border border-[#3a3f32] hover:bg-[#2a2d24] hover:border-[#4a5240] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <div className="flex items-center gap-2">
 <Cpu size={14} className="text-[#8B9B7B] group-hover:text-[#A5B793]" />
 <span className="text-[9px] font-bold tracking-widest text-[#8B9B7B] group-hover:text-[#A5B793]">GENERATE STRATEGIC ASSESSMENT</span>
 </div>
 {isAiLoading ? (
 <Loader2 size={12} className="text-[#8B9B7B] animate-spin"/>
 ) : (
 <Activity size={14} className="text-[#4a5240] group-hover:text-[#8B9B7B] transition-colors"/>
 )}
 </button>
 </div>

 {/* Analysis Output */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10">
 {isAiLoading && !aiAnalysis ? (
 <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70">
 <div className="text-[#4a5240] animate-pulse"><ShieldAlert size={24} /></div>
 <span className="text-[9px] font-mono tracking-widest text-[#6d7a60] uppercase">Compiling classified intelligence...</span>
 </div>
 ) : aiAnalysis ? (
 <div className="font-mono">
 {renderAnalysis()}
 </div>
 ) : (
 <div className="flex flex-col h-full items-center justify-center opacity-30 text-center px-4">
 <ShieldAlert size={20} className="text-[#4a5240] mb-2"/>
 <div className="text-[9px] font-mono tracking-widest text-[#8B9B7B]">DOSSIER CLOSED<br/>AWAITING ASSESSMENT DIRECTIVE</div>
 </div>
 )}
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-20">
 <ShieldAlert size={32} className="text-[#8B9B7B] mb-4"/>
 <div className="text-[10px] font-mono tracking-widest text-[#8B9B7B]">SELECT AN INSTALLATION TO VIEW INTEL DOSSIER</div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default MilitaryRegistry;
