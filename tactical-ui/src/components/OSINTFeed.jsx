import React, { useState, useEffect, useMemo, useRef } from 'react';
import useStore from '../store';
import { Radio, Target, AlertTriangle, Shield, Crosshair, Clock, Globe, Fingerprint, Activity, ExternalLink, Loader2 } from 'lucide-react';
import { streamAiResponse } from '../aiManager';

const OSINTFeed = () => {
 const gdeltData = useStore(s => s.feeds.gdelt);
 const fetchGdelt = useStore(s => s.fetchGdelt);
 const [selectedEvent, setSelectedEvent] = useState(null);
 const [filter, setFilter] = useState('ALL');
 
 // AI Assessment State
 const [aiAnalysis, setAiAnalysis] = useState('');
 const [isAiLoading, setIsAiLoading] = useState(false);
 const abortRef = useRef(null);

 const activeOperationId = useStore(state => state.activeOperationId);
 const addNodeToOperation = useStore(state => state.addNodeToOperation);
 const addNotification = useStore(state => state.addNotification);

 useEffect(() => {
 // Initial fetch if empty
 if (!gdeltData || gdeltData.length === 0) {
 fetchGdelt();
 }
 // Auto-refresh every 2 minutes
 const interval = setInterval(() => { if (!document.hidden) fetchGdelt(); }, 120000);
 return () => clearInterval(interval);
 }, [fetchGdelt, gdeltData]);

 // Handle first load selection
 useEffect(() => {
 if (gdeltData && gdeltData.length > 0 && !selectedEvent) {
 setSelectedEvent(gdeltData[0]);
 }
 }, [gdeltData, selectedEvent]);

 // Handle selection change (reset AI)
 useEffect(() => {
 setAiAnalysis('');
 setIsAiLoading(false);
 if (abortRef.current) {
 abortRef.current.abort();
 }
 }, [selectedEvent?.id]);

 const generateAssessment = async () => {
 if (!selectedEvent) return;
 
 setAiAnalysis('');
 setIsAiLoading(true);

 if (abortRef.current) {
 abortRef.current.abort();
 }
 abortRef.current = new AbortController();
 
 const prompt = `You are RAVEN, an elite tactical AI intelligence analyst. Provide a highly detailed, comprehensive strategic assessment of the following OSINT intercept. 
Do not be brief. Provide a thorough analysis using the following structure:
1) Immediate Geopolitical Impact (detailed breakdown)
2) Escalation Vectors & Probabilities
3) Secondary Ripple Effects (Economic/Military)
4) Recommended Monitoring Posture
Event: ${selectedEvent.title}
Location: ${selectedEvent.country || 'Global'}
Threat Level: ${selectedEvent.tag}
Format: Return only the assessment text. Do not use quotes, introductory phrases, or markdown headers (use bold inline instead).`;
 
 try {
 let firstChunkReceived = false;
 await streamAiResponse(prompt, {
 signal: abortRef.current.signal,
 config: { temperature: 0.6, maxOutputTokens: 300 },
 onStart: (modelUsed) => {
 console.log(`[OSINT] Using model: ${modelUsed}`);
 },
 onChunk: (textChunk) => {
 if (!firstChunkReceived) {
 setAiAnalysis(''); 
 firstChunkReceived = true;
 }
 setAiAnalysis(prev => prev + textChunk);
 },
 onComplete: () => {
 setIsAiLoading(false);
 },
 onError: (err) => {
 if (err.name !== 'AbortError') {
 console.error("[AI Assessment Error]", err);
 setAiAnalysis('ERROR: Neural network link severed or rate-limited. Retrying via secondary relays is advised.');
 }
 setIsAiLoading(false);
 }
 });
 } catch (err) {
 if (err.name !== 'AbortError') {
 console.error("[AI Assessment Error]", err);
 setAiAnalysis('ERROR: Neural network link severed.');
 }
 setIsAiLoading(false);
 }
 };

 const filteredData = useMemo(() => {
 if (!gdeltData) return [];
 if (filter === 'ALL') return gdeltData;
 return gdeltData.filter(item => item.tag === filter);
 }, [gdeltData, filter]);

 const stats = useMemo(() => {
 if (!gdeltData) return { high: 0, med: 0, info: 0, total: 0 };
 return {
 high: gdeltData.filter(d => d.tag === 'HIGH').length,
 med: gdeltData.filter(d => d.tag === 'MEDIUM').length,
 info: gdeltData.filter(d => d.tag === 'INFO').length,
 total: gdeltData.length
 };
 }, [gdeltData]);

 const formatTime = (ts) => {
 if (!ts) return 'UNKNOWN';
 try {
 // If it's from Google news format (e.g. 2024-05-30T10:00:00Z)
 if (ts.includes('-')) return ts.replace('T', ' ').replace('Z', ' UTC');
 // GDELT seendate format: YYYYMMDDTHHMMSSZ
 const year = ts.slice(0, 4);
 const month = ts.slice(4, 6);
 const day = ts.slice(6, 8);
 const hr = ts.slice(9, 11);
 const min = ts.slice(11, 13);
 const sec = ts.slice(13, 15);
 return `${year}-${month}-${day} ${hr}:${min}:${sec} UTC`;
 } catch {
 return ts;
 }
 };

 const getTagStyle = (tag) => {
 if (tag === 'HIGH') return 'text-red-500 bg-red-500/20 border-red-500/30';
 if (tag === 'MEDIUM') return 'text-amber-500 bg-amber-500/20 border-amber-500/30';
 return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/30';
 };

 return (
 <div className="h-full bg-panel flex flex-col font-mono text-white overflow-hidden relative">
 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"/>
 
 {/* Header */}
 <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
 <div className="flex items-center gap-3">
 <Radio size={14} className="text-red-500 animate-pulse"/>
 <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">OSINT INTERCEPTS</span>
 </div>
 <div className="flex gap-4 items-center">
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
 <span className="text-[7px] font-bold text-white/50 tracking-widest">{stats.high} CRITICAL</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500"/>
 <span className="text-[7px] font-bold text-white/50 tracking-widest">{stats.med} MEDIUM</span>
 </div>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="px-3 py-2 border-b border-white/5 flex gap-2 shrink-0 bg-black/20">
 {['ALL', 'HIGH', 'MEDIUM', 'INFO'].map(f => (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-2 py-1 text-[7px] font-bold tracking-widest uppercase transition-all border ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-white/30 hover:text-white/60'}`}
 >
 {f}
 </button>
 ))}
 <div className="ml-auto text-[7px] text-white/30 flex items-center gap-1 uppercase tracking-widest">
 <Activity size={10} /> {stats.total} SIGNALS
 </div>
 </div>

 <div className="flex-1 flex overflow-hidden">
 {/* Left Column: Live Feed */}
 <div className="w-1/2 border-r border-white/5 flex flex-col h-full bg-black/10">
 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
 {filteredData.map(item => {
 const isSelected = selectedEvent?.id === item.id;
 const tagStyle = getTagStyle(item.tag);
 return (
 <div 
 key={item.id} 
 onClick={() => setSelectedEvent(item)}
 className={`p-2 border transition-all cursor-pointer group ${isSelected ? 'border-white/20 bg-white/[0.05]' : 'border-white/5 bg-black/40 hover:bg-white/[0.02]'}`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className={`text-[6px] font-bold px-1 py-0.5 border uppercase tracking-widest ${tagStyle}`}>
 {item.tag}
 </span>
 <span className="text-[6px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-1">
 <Clock size={8} /> {formatTime(item.timestamp)}
 </span>
 </div>
 <div className={`text-[9px] font-bold leading-relaxed mb-1 ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white/90'}`}>
 {item.title}
 </div>
 <div className="flex justify-between items-center text-[6px] text-white/30 font-bold uppercase tracking-widest">
 <span className="flex items-center gap-1"><Globe size={8} /> {item.country || 'GLOBAL'}</span>
 <span className="flex items-center gap-1"><Fingerprint size={8} /> {item.domain}</span>
 </div>
 </div>
 );
 })}
 {filteredData.length === 0 && (
 <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
 <Target size={24} className="text-white"/>
 <div className="text-[8px] font-bold tracking-widest uppercase">No intercepts found</div>
 </div>
 )}
 </div>
 </div>

 {/* Right Column: Signal Analysis */}
 <div className="w-1/2 flex flex-col h-full relative">
 {selectedEvent ? (
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
 <div className="space-y-1">
 <div className="text-[7px] text-white/40 font-bold tracking-widest uppercase flex items-center gap-2">
 <AlertTriangle size={10} className={selectedEvent.tag === 'HIGH' ? 'text-red-500' : 'text-cyan-400'} /> 
 SIGNAL DECRYPTED
 </div>
 <div className="text-[10px] font-bold text-white tracking-wide leading-relaxed">
 {selectedEvent.title}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div className="p-2 border border-white/5 bg-white/[0.02] space-y-1">
 <div className="text-[6px] text-white/30 uppercase tracking-widest">SOURCE_COUNTRY</div>
 <div className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest truncate">{selectedEvent.country || 'UNKNOWN'}</div>
 </div>
 <div className="p-2 border border-white/5 bg-white/[0.02] space-y-1">
 <div className="text-[6px] text-white/30 uppercase tracking-widest">THREAT_LEVEL</div>
 <div className={`text-[8px] font-bold uppercase tracking-widest ${selectedEvent.tag === 'HIGH' ? 'text-red-500' : selectedEvent.tag === 'MEDIUM' ? 'text-amber-500' : 'text-cyan-400'}`}>
 {selectedEvent.tag}
 </div>
 </div>
 <div className="p-2 border border-white/5 bg-white/[0.02] space-y-1">
 <div className="text-[6px] text-white/30 uppercase tracking-widest">DATETIME_UTC</div>
 <div className="text-[7px] font-bold text-white/70 tracking-widest truncate">{formatTime(selectedEvent.timestamp)}</div>
 </div>
 <div className="p-2 border border-white/5 bg-white/[0.02] space-y-1">
 <div className="text-[6px] text-white/30 uppercase tracking-widest">DOMAIN_ID</div>
 <div className="text-[7px] font-bold text-white/70 tracking-widest truncate">{selectedEvent.domain}</div>
 </div>
 </div>

 <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
 <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest flex items-center justify-between shrink-0">
 <span className="flex items-center gap-2"><Shield size={10} /> AI_ASSESSMENT {isAiLoading && <Loader2 size={8} className="animate-spin text-cyan-400"/>}</span>
 <div className="flex gap-2">
 <button 
 onClick={() => {
 if (!activeOperationId) return addNotification('SELECT AN ACTIVE OPERATION IN LINK ANALYSIS FIRST', 'WARNING');
 addNodeToOperation(activeOperationId, {
 id: `EVT-${selectedEvent.id || Date.now()}`,
 name: selectedEvent.title.substring(0, 30) + '...',
 type: 'NETWORK',
 desc: selectedEvent.title
 });
 addNotification('EVENT ADDED TO OPERATION', 'SUCCESS');
 }}
 className="flex items-center gap-1 text-red-400 hover:text-red-300 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 transition-colors cursor-pointer z-20"
 >
 <Target size={8} /> ADD TO OP
 </button>
 {!aiAnalysis && !isAiLoading && (
 <button 
 onClick={generateAssessment} 
 className="text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 transition-colors cursor-pointer z-20"
 >
 DEPLOY AI ANALYST
 </button>
 )}
 </div>
 </div>
 <div className={`p-2 border text-[9px] text-white/70 leading-relaxed relative overflow-y-auto custom-scrollbar flex-1 min-h-[60px] max-h-[100px] ${selectedEvent.tag === 'HIGH' ? 'border-red-500/20 bg-red-500/5' : selectedEvent.tag === 'MEDIUM' ? 'border-amber-500/20 bg-amber-500/5' : 'border-cyan-500/20 bg-cyan-500/5'}`}>
 <div className={`absolute top-0 right-0 w-8 h-8 blur-xl rounded-full ${selectedEvent.tag === 'HIGH' ? 'bg-red-500/10' : selectedEvent.tag === 'MEDIUM' ? 'bg-amber-500/10' : 'bg-cyan-500/10'}`} />
 <p className="relative z-10">{aiAnalysis || (isAiLoading ? 'Decrypting signal and generating strategic analysis...' : 'Awaiting manual AI activation to conserve API quota.')}</p>
 {isAiLoading && <span className="inline-block w-1.5 h-3 ml-1 bg-cyan-400 animate-pulse align-middle relative z-10"/>}
 </div>
 </div>

 <a 
 href={selectedEvent.url} 
 target="_blank"
 rel="noopener noreferrer"
 className="flex shrink-0 items-center justify-center gap-2 w-full p-1.5 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-[8px] font-bold tracking-widest text-cyan-400 transition-colors uppercase mt-auto"
 >
 ACCESS RAW INTELLIGENCE <ExternalLink size={10} />
 </a>
 </div>
 ) : (
 <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
 <Crosshair size={24} className="text-white"/>
 <div className="text-[8px] font-bold tracking-widest uppercase text-center max-w-[120px]">
 Select a signal to<br/>begin analysis
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default OSINTFeed;
