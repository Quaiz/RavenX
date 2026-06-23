import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store';
import { WifiOff, Crosshair, AlertOctagon, Activity, Radio, Cpu, Satellite, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { streamAiResponse } from '../aiManager';

const GPSInterference = () => {
 const ewData = useStore(s => s.feeds.ewData);
 const fetchEwData = useStore(s => s.fetchEwData);
 const [selectedZone, setSelectedZone] = useState(() => {
 const saved = localStorage.getItem('raven_gps_zone');
 return saved ? JSON.parse(saved) : null;
 });
 const [aiAnalysis, setAiAnalysis] = useState(() => {
 return localStorage.getItem('raven_gps_analysis') || '';
 });
 const [isAiLoading, setIsAiLoading] = useState(false);
 const abortRef = useRef(null);

 useEffect(() => {
 if (selectedZone) localStorage.setItem('raven_gps_zone', JSON.stringify(selectedZone));
 else localStorage.removeItem('raven_gps_zone');
 }, [selectedZone]);

 useEffect(() => {
 localStorage.setItem('raven_gps_analysis', aiAnalysis);
 }, [aiAnalysis]);

 useEffect(() => {
 // Initial fetch if empty
 if (!ewData || ewData.zones?.length === 0) {
 fetchEwData();
 }
 // Auto-refresh every 2 minutes
 const interval = setInterval(() => { if (!document.hidden) fetchEwData(); }, 120000);
 return () => clearInterval(interval);
 }, [fetchEwData, ewData]);

 // Handle first load selection
 useEffect(() => {
 if (ewData?.zones && ewData.zones.length > 0 && !selectedZone) {
 setSelectedZone(ewData.zones[0]);
 }
 }, [ewData, selectedZone]);

 const deployEwDiagnostics = async () => {
 if (!selectedZone) return;
 
 setAiAnalysis('');
 setIsAiLoading(true);

 if (abortRef.current) {
 abortRef.current.abort();
 }
 abortRef.current = new AbortController();
 
 const prompt = `You are RAVEN, an elite tactical AI electronic warfare (EW) analyst.
We have detected severe GPS Jamming/Degradation in the following region using live ADS-B flight telemetry.
Zone: ${selectedZone.name}
Impacted Aircraft currently flying blind: ${selectedZone.impacted_count}
Average NIC (Navigation Integrity Category): ${selectedZone.avg_nic} (0 = Complete loss of GPS)

Provide a highly detailed, clinical EW diagnostic report on this interference event.
Use the following structure:
1) Primary Suspects & Geopolitical Context (Who is likely jamming and why?)
2) Military Objectives (e.g., Drone defense, exercise, masking troop movements)
3) Secondary Impact (Civilian aviation risk, maritime disruption)
4) Escalation Vector

Do not use markdown headers (#), just bold text. Write like a Pentagon briefing.`;
 
 try {
 let firstChunkReceived = false;
 await streamAiResponse(prompt, {
 signal: abortRef.current.signal,
 config: { temperature: 0.7, maxOutputTokens: 600 },
 onStart: (modelUsed) => {
 console.log(`[EW DIAGNOSTIC] Using model: ${modelUsed}`);
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
 setAiAnalysis('ERROR: EW diagnostic link severed.');
 }
 setIsAiLoading(false);
 }
 });
 } catch (err) {
 if (err.name !== 'AbortError') {
 setAiAnalysis('CRITICAL ERROR: Failed to establish EW diagnostic link.');
 }
 setIsAiLoading(false);
 }
 };

 if (!ewData || !ewData.zones) {
 return (
 <div className="h-full flex flex-col items-center justify-center p-6 text-orange-500/50">
 <WifiOff size={32} className="mb-4 opacity-50 animate-pulse"/>
 <div className="font-mono text-[10px] tracking-widest text-center">INITIALIZING EW SENSORS...<br/>SCANNING GLOBAL AIRSPACE</div>
 </div>
 );
 }

 const renderAnalysis = () => {
 if (!aiAnalysis) return null;
 return aiAnalysis.split('\n').map((line, idx) => {
 let content = line.replace(/\*\*(.+?)\*\*/g, '<b class="text-orange-400 font-bold">$1</b>');
 if (content.startsWith('- ')) {
 return (
 <div key={idx} className="flex gap-2 text-white/70 text-[10px] leading-relaxed pl-2 mt-1">
 <span className="text-orange-500/60 shrink-0 mt-0.5">▸</span>
 <span dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
 </div>
 );
 }
 if (content.match(/^\d\)/)) {
 return (
 <div key={idx} className="text-[11px] font-bold text-orange-400 tracking-wider uppercase mt-3 mb-1 border-b border-orange-500/20 pb-1"dangerouslySetInnerHTML={{ __html: content }} />
 );
 }
 return (
 <p key={idx} className="text-white/60 text-[10px] leading-relaxed mt-1"dangerouslySetInnerHTML={{ __html: content }} />
 );
 });
 };

 return (
 <div className="h-full flex flex-col bg-[#050505]">
 
 {/* Header */}
 <div className="shrink-0 flex items-center justify-between p-3 border-b border-orange-500/20 bg-orange-500/[0.02]">
 <div className="flex items-center gap-2">
 <div className="relative flex items-center justify-center w-6 h-6 bg-orange-500/10 border border-orange-500/30">
 <Radio size={12} className="text-orange-500 animate-pulse"/>
 </div>
 <div>
 <div className="text-[11px] font-bold text-orange-500 tracking-widest">EW INTERFERENCE</div>
 <div className="text-[9px] text-white/40 tracking-wider font-mono">GLOBAL JAMMING & SPOOFING SENSORS</div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex flex-col items-end">
 <div className="text-[14px] font-bold text-orange-400 tracking-wider font-mono">{ewData.total_impacted}</div>
 <div className="text-[8px] text-white/40 tracking-widest">IMPACTED AIRCRAFT</div>
 </div>
 <button 
 onClick={fetchEwData}
 className="w-6 h-6 border border-orange-500/20 flex items-center justify-center text-orange-500/60 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
 >
 <RefreshCw size={12} />
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 flex overflow-hidden">
 
 {/* Left Col: Zones */}
 <div className="w-[45%] flex flex-col border-r border-orange-500/10 bg-black/20">
 <div className="p-2 border-b border-orange-500/10 text-[9px] font-bold text-orange-500/50 tracking-widest bg-orange-500/5">
 ACTIVE JAMMING ZONES
 </div>
 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
 {ewData.zones.length === 0 ? (
 <div className="text-center p-4 text-[10px] text-white/30 font-mono">NO ACTIVE EW ZONES DETECTED</div>
 ) : ewData.zones.map(zone => (
 <div 
 key={zone.name}
 onClick={() => setSelectedZone(zone)}
 className={`relative p-3 cursor-pointer transition-all border group overflow-hidden ${
 selectedZone?.name === zone.name 
 ? 'bg-orange-500/10 border-orange-500/40' 
 : 'bg-black/40 border-white/5 hover:border-orange-500/20'
 }`}
 >
 {/* Glitch Overlay for Critical Zones */}
 {zone.severity === 'CRITICAL' && (
 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay"></div>
 )}
 
 <div className="relative z-10 flex items-start justify-between">
 <div>
 <div className="text-[11px] font-bold text-white/90 tracking-wider mb-1 group-hover:text-orange-400 transition-colors">
 {zone.name.toUpperCase()}
 </div>
 <div className="flex items-center gap-3 text-[9px] font-mono">
 <span className="text-orange-500">BLIND: {zone.impacted_count} A/C</span>
 <span className="text-red-400">NIC: {zone.avg_nic}</span>
 </div>
 </div>
 {zone.severity === 'CRITICAL' ? (
 <AlertOctagon size={14} className="text-red-500 animate-pulse"/>
 ) : (
 <Crosshair size={14} className="text-orange-500/50"/>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Right Col: AI Diagnostics */}
 <div className="flex-1 flex flex-col bg-black/40 relative">
 
 {/* Static Scanlines */}
 <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>

 {selectedZone ? (
 <>
 {/* Zone Details */}
 <div className="shrink-0 p-4 border-b border-orange-500/10 relative z-10">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <Satellite size={14} className="text-orange-500"/>
 <span className="text-[12px] font-bold text-white tracking-widest">{selectedZone.name.toUpperCase()}</span>
 </div>
 <div className="px-2 py-0.5 text-[9px] font-bold font-mono border border-red-500/30 text-red-500 bg-red-500/10">
 GPS DEGRADED
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-2 mb-4">
 <div className="p-2 bg-black/40 border border-white/5">
 <div className="text-[8px] text-white/40 tracking-widest mb-1">IMPACT RADIUS</div>
 <div className="text-[11px] text-white/80 font-mono">~250 NM</div>
 </div>
 <div className="p-2 bg-black/40 border border-white/5">
 <div className="text-[8px] text-white/40 tracking-widest mb-1">AVG NIC ERROR</div>
 <div className="text-[11px] text-red-400 font-mono">{selectedZone.avg_nic} / 11</div>
 </div>
 </div>

 {/* Deploy button */}
 <button
 onClick={deployEwDiagnostics}
 disabled={isAiLoading}
 className="w-full flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <div className="flex items-center gap-2">
 <Cpu size={14} className="text-orange-500 group-hover:animate-pulse"/>
 <span className="text-[10px] font-bold tracking-widest text-orange-500">RUN EW DIAGNOSTIC</span>
 </div>
 {isAiLoading ? (
 <Loader2 size={12} className="text-orange-500 animate-spin"/>
 ) : (
 <ChevronRight size={14} className="text-orange-500/50 group-hover:text-orange-500 transition-colors"/>
 )}
 </button>
 </div>

 {/* Analysis Output */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10">
 {isAiLoading && !aiAnalysis ? (
 <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
 <div className="relative">
 <Activity size={24} className="text-orange-500 animate-pulse"/>
 <div className="absolute inset-0 border-2 border-orange-500 rounded-full animate-ping opacity-20"></div>
 </div>
 <span className="text-[9px] font-mono tracking-widest text-orange-500 uppercase">Trangulating Signal Interference...</span>
 </div>
 ) : aiAnalysis ? (
 <div className="font-mono">
 <div className="flex items-center gap-2 mb-3 border-b border-orange-500/20 pb-2">
 <Activity size={12} className="text-orange-500"/>
 <span className="text-[10px] font-bold tracking-widest text-orange-500">STRATEGIC EW ASSESSMENT</span>
 </div>
 {renderAnalysis()}
 </div>
 ) : (
 <div className="flex h-full items-center justify-center opacity-30 text-[10px] font-mono tracking-widest text-center px-4">
 AWAITING OPERATOR DIRECTIVE TO DEPLOY DIAGNOSTICS
 </div>
 )}
 </div>
 </>
 ) : (
 <div className="flex-1 flex items-center justify-center text-[10px] font-mono tracking-widest text-white/30 p-6 text-center">
 SELECT AN ACTIVE JAMMING ZONE TO VIEW TELEMETRY
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default GPSInterference;
