import React, { useState, useEffect, useMemo, useRef } from 'react';
import useStore from '../store';
import { Biohazard, Skull, Activity, ShieldAlert, Globe, ExternalLink, Loader2, Microscope, Stethoscope, Droplets, Wind, Syringe } from 'lucide-react';

const DiseaseOutbreaks = () => {
 const outbreaksData = useStore(s => s.feeds.outbreaks);
 const fetchOutbreaks = useStore(s => s.fetchOutbreaks);
 const [selectedEvent, setSelectedEvent] = useState(null);
 const [filter, setFilter] = useState('ALL');

 useEffect(() => {
 if (!outbreaksData || outbreaksData.length === 0) {
 fetchOutbreaks();
 }
 const interval = setInterval(() => { if (!document.hidden) fetchOutbreaks(); }, 120000);
 return () => clearInterval(interval);
 }, [fetchOutbreaks, outbreaksData]);

 useEffect(() => {
 if (outbreaksData && outbreaksData.length > 0 && !selectedEvent) {
 setSelectedEvent(outbreaksData[0]);
 }
 }, [outbreaksData, selectedEvent]);

 const filteredData = useMemo(() => {
 if (!outbreaksData) return [];
 if (filter === 'ALL') return outbreaksData;
 return outbreaksData.filter(item => item.severity === filter);
 }, [outbreaksData, filter]);

 const stats = useMemo(() => {
 if (!outbreaksData) return { pandemic: 0, epidemic: 0, outbreak: 0, total: 0 };
 return {
 pandemic: outbreaksData.filter(d => d.severity === 'PANDEMIC').length,
 epidemic: outbreaksData.filter(d => d.severity === 'EPIDEMIC').length,
 outbreak: outbreaksData.filter(d => d.severity === 'OUTBREAK').length,
 total: outbreaksData.length
 };
 }, [outbreaksData]);

 const getSeverityStyle = (severity) => {
 if (severity === 'PANDEMIC') return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
 if (severity === 'EPIDEMIC') return 'text-red-500 bg-red-500/20 border-red-500/30';
 if (severity === 'OUTBREAK') return 'text-amber-500 bg-amber-500/20 border-amber-500/30';
 return 'text-lime-400 bg-lime-400/20 border-lime-400/30';
 };

 const getVectorIcon = (vector) => {
 switch (vector) {
 case 'AIRBORNE': return <Wind size={10} />;
 case 'WATERBORNE': return <Droplets size={10} />;
 case 'BLOODBORNE': return <Syringe size={10} />;
 case 'ZOONOTIC': return <Activity size={10} />;
 default: return <Microscope size={10} />;
 }
 };

 return (
 <div className="h-full bg-[#030603] flex flex-col font-mono text-white overflow-hidden relative">
 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime-500/50 to-transparent"/>
 
 {/* Background Biohazard Watermark */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
 <Biohazard size={300} className="text-lime-500 animate-[spin_60s_linear_infinite]" />
 </div>

 {/* Header */}
 <div className="p-3 border-b border-lime-500/20 flex justify-between items-center bg-lime-500/[0.02] shrink-0 relative z-10">
 <div className="flex items-center gap-3">
 <Biohazard size={16} className="text-lime-400 animate-pulse drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
 <span className="text-[12px] font-bold tracking-[0.2em] text-lime-400 uppercase text-glow">GLOBAL BIO-SCAN</span>
 </div>
 <div className="flex gap-4 items-center">
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"/>
 <span className="text-[7px] font-bold text-white/60 tracking-widest">{stats.pandemic} PANDEMIC</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-red-500"/>
 <span className="text-[7px] font-bold text-white/60 tracking-widest">{stats.epidemic} EPIDEMIC</span>
 </div>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="px-3 py-2 border-b border-lime-500/10 flex gap-2 shrink-0 bg-black/40 relative z-10">
 {['ALL', 'PANDEMIC', 'EPIDEMIC', 'OUTBREAK', 'WATCHLIST'].map(f => (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-2 py-1 text-[7px] font-bold tracking-widest uppercase transition-all border ${filter === f ? 'bg-lime-500/10 border-lime-500/30 text-lime-400' : 'bg-transparent border-transparent text-white/30 hover:text-white/60 hover:bg-white/5'}`}
 >
 {f}
 </button>
 ))}
 <div className="ml-auto text-[7px] text-lime-500/50 flex items-center gap-1 uppercase tracking-widest">
 <Activity size={10} /> {stats.total} THREATS
 </div>
 </div>

 <div className="flex-1 flex overflow-hidden relative z-10">
 {/* Left Column: Live Feed */}
 <div className="w-1/2 border-r border-lime-500/10 flex flex-col h-full bg-black/20">
 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
 {filteredData.map(item => {
 const isSelected = selectedEvent?.id === item.id;
 const sevStyle = getSeverityStyle(item.severity);
 return (
 <div 
 key={item.id} 
 onClick={() => setSelectedEvent(item)}
 className={`p-2 border transition-all cursor-pointer group ${isSelected ? 'border-lime-500/30 bg-lime-500/[0.05]' : 'border-white/5 bg-black/40 hover:bg-lime-500/[0.02] hover:border-lime-500/10'}`}
 >
 <div className="flex justify-between items-start mb-1.5">
 <span className={`text-[6px] font-bold px-1 py-0.5 border uppercase tracking-widest flex items-center gap-1 ${sevStyle}`}>
 {item.severity === 'PANDEMIC' && <Skull size={8} />}
 {item.severity}
 </span>
 <span className="text-[6px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
 <Stethoscope size={8} className="text-lime-500/50"/> {item.sourceType === 'WHO_OFFICIAL' ? 'WHO/RW' : 'OSINT'}
 </span>
 </div>
 <div className={`text-[9px] font-bold leading-relaxed mb-1.5 ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-lime-100'}`}>
 {item.title}
 </div>
 <div className="flex justify-between items-center text-[6px] text-white/30 font-bold uppercase tracking-widest">
 <span className="flex items-center gap-1 text-lime-400/50"><Globe size={8} /> {item.country || 'GLOBAL'}</span>
 <span className="flex items-center gap-1 text-cyan-400/50"title={item.vector}>{getVectorIcon(item.vector)} {item.vector}</span>
 </div>
 </div>
 );
 })}
 {filteredData.length === 0 && (
 <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
 <ShieldAlert size={24} className="text-lime-500"/>
 <div className="text-[8px] font-bold tracking-widest uppercase text-lime-500">No active threats detected</div>
 </div>
 )}
 </div>
 </div>

 {/* Right Column: Signal Analysis */}
 <div className="w-1/2 flex flex-col h-full relative bg-gradient-to-b from-black/0 to-lime-900/5">
 {selectedEvent ? (
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
 <div className="space-y-1">
 <div className="text-[7px] text-lime-500/40 font-bold tracking-widest uppercase flex items-center gap-2">
 <Biohazard size={10} className={selectedEvent.severity === 'PANDEMIC' ? 'text-purple-500' : 'text-lime-400'} /> 
 PATHOGEN DETECTED
 </div>
 <div className="text-[10px] font-bold text-white tracking-wide leading-relaxed">
 {selectedEvent.title}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 flex-1 content-start">
 <div className="p-2 border border-lime-500/10 bg-lime-500/[0.02] space-y-1">
 <div className="text-[6px] text-lime-500/50 uppercase tracking-widest">ORIGIN_ZONE</div>
 <div className="text-[8px] font-bold text-lime-400 uppercase tracking-widest truncate">{selectedEvent.country || 'UNKNOWN'}</div>
 </div>
 <div className="p-2 border border-lime-500/10 bg-lime-500/[0.02] space-y-1">
 <div className="text-[6px] text-lime-500/50 uppercase tracking-widest">THREAT_SEVERITY</div>
 <div className={`text-[8px] font-bold uppercase tracking-widest ${selectedEvent.severity === 'PANDEMIC' ? 'text-purple-500' : selectedEvent.severity === 'EPIDEMIC' ? 'text-red-500' : 'text-amber-500'}`}>
 {selectedEvent.severity}
 </div>
 </div>
 <div className="p-2 border border-lime-500/10 bg-lime-500/[0.02] space-y-1">
 <div className="text-[6px] text-lime-500/50 uppercase tracking-widest">SPREAD_VECTOR</div>
 <div className="text-[7px] font-bold text-cyan-400 tracking-widest truncate flex items-center gap-1">
 {getVectorIcon(selectedEvent.vector)} {selectedEvent.vector}
 </div>
 </div>
 <div className="p-2 border border-lime-500/10 bg-lime-500/[0.02] space-y-1">
 <div className="text-[6px] text-lime-500/50 uppercase tracking-widest">SOURCE_NETWORK</div>
 <div className="text-[7px] font-bold text-white/70 tracking-widest truncate">{selectedEvent.source}</div>
 </div>
 </div>

 <a 
 href={selectedEvent.url} 
 target="_blank"
 rel="noopener noreferrer"
 className="flex shrink-0 items-center justify-center gap-2 w-full p-1.5 border border-lime-500/30 bg-lime-500/10 hover:bg-lime-500/20 text-[8px] font-bold tracking-widest text-lime-400 transition-colors uppercase mt-auto"
 >
 ACCESS MEDICAL DOSSIER <ExternalLink size={10} />
 </a>
 </div>
 ) : (
 <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
 <Activity size={24} className="text-lime-500"/>
 <div className="text-[8px] font-bold tracking-widest uppercase text-center max-w-[120px] text-lime-500">
 Select a bio-threat to<br/>begin analysis
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default DiseaseOutbreaks;
