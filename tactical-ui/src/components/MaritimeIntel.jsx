import React, { useState, useEffect } from 'react';
import { Anchor, ShieldAlert, Waves, Cable, MapPin, RefreshCcw, Navigation } from 'lucide-react';

const DEFAULT_CHOKEPOINTS = [
  { id: 'bab_el_mandeb', name: 'Bab el-Mandeb / Red Sea', level: 'NORMAL', threat: 'Analyzing live threat feeds...', impact: 'Monitoring transit volume...' },
  { id: 'hormuz', name: 'Strait of Hormuz', level: 'NORMAL', threat: 'Analyzing live threat feeds...', impact: 'Monitoring oil supply lines...' },
  { id: 'taiwan', name: 'Taiwan Strait', level: 'NORMAL', threat: 'Analyzing live threat feeds...', impact: 'Monitoring semiconductor logistics...' },
  { id: 'panama', name: 'Panama Canal', level: 'NORMAL', threat: 'Analyzing live threat feeds...', impact: 'Monitoring drought levels...' },
  { id: 'suez', name: 'Suez Canal', level: 'NORMAL', threat: 'Analyzing live threat feeds...', impact: 'Monitoring maritime traffic...' }
];

const LEVEL_META = {
 CRITICAL: { border: 'border-red-500', bg: 'bg-red-950/40', text: 'text-red-500', icon: 'text-red-400', pulse: true },
 ELEVATED: { border: 'border-orange-500', bg: 'bg-orange-950/30', text: 'text-orange-400', icon: 'text-orange-400', pulse: false },
 NORMAL: { border: 'border-cyan-500/50', bg: 'bg-cyan-950/20', text: 'text-cyan-400', icon: 'text-cyan-500', pulse: false },
};

const MaritimeIntel = () => {
 const [cables, setCables] = useState(null);
 const [chokepoints, setChokepoints] = useState(DEFAULT_CHOKEPOINTS);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cables?t=${new Date().getTime()}`);
 const json = await res.json();
 if (!json.error) {
 setCables(json);
 }
 } catch (err) {
 console.error("Failed to fetch cable data:", err);
 }
 try {
 const cpRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chokepoints`);
 const cpJson = await cpRes.json();
 if (cpJson.chokepoints) {
 // Merge live data with static descriptions
 const updated = DEFAULT_CHOKEPOINTS.map(cp => {
   const liveData = cpJson.chokepoints.find(l => l.id === cp.id);
   if (liveData) {
     return {
       ...cp,
       level: liveData.level,
       threat: liveData.recent_incidents > 0 ? `Detected ${liveData.recent_incidents} recent maritime incidents via global OSINT.` : 'No significant incidents reported.',
       impact: liveData.level === 'CRITICAL' ? 'Severe disruption to global supply chain.' : liveData.level === 'ELEVATED' ? 'Potential delays and rerouting.' : 'Normal operations.'
     };
   }
   return cp;
 });
 setChokepoints(updated);
 }
 } catch (err) {}
 setLastUpdate(new Date());
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 // Cables don't change often, 10 min interval is fine
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 600000); 
 return () => clearInterval(interval);
 }, []);

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Anchor size={16} className="text-cyan-400"style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
 <div>
 <div className="text-[12px] font-bold tracking-widest text-cyan-400 uppercase">MARITIME INTEL</div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase">Strategic Chokepoints & Subsea Cables</div>
 </div>
 </div>
 <span className="text-[9px] text-white/60 font-mono">SYNCED: {lastUpdate.toLocaleTimeString()}</span>
 </div>

 <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
 
 {/* PANEL 1: Strategic Chokepoints */}
 <div className="flex-1 border-r border-white/10 p-3 space-y-3 flex flex-col">
 <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 shrink-0">
 <Navigation size={14} className="text-white/50"/>
 <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">Global Chokepoint Assessment</span>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
 {chokepoints.map(cp => {
 const meta = LEVEL_META[cp.level];
 return (
 <div key={cp.id} className={`p-2 border relative overflow-hidden ${meta.bg} ${meta.border}`}>
 <div className="flex gap-2">
 <div className={`mt-0.5 ${meta.icon} shrink-0`}>
 <ShieldAlert size={14} />
 </div>
 <div className="flex-1">
 <div className="flex items-start justify-between mb-1 gap-2">
 <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">{cp.name}</span>
 <span className={`shrink-0 text-[9px] font-bold tracking-widest uppercase px-1 border ${meta.text} ${meta.border} ${meta.pulse ? 'animate-pulse bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`}>
 {cp.level}
 </span>
 </div>
 <div className="text-[9px] text-white/70 mb-1 leading-relaxed">
 <span className="text-white/40 font-mono">THREAT: </span>{cp.threat}
 </div>
 <div className="text-[9px] text-white/70 leading-relaxed">
 <span className="text-white/40 font-mono">IMPACT: </span>{cp.impact}
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* PANEL 2: Undersea Cables */}
 <div className="flex-1 p-3 space-y-3 flex flex-col min-h-[300px]">
 <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 shrink-0">
 <div className="flex items-center gap-2">
 <Cable size={14} className="text-white/50"/>
 <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">Subsea Cable Registry</span>
 </div>
 {cables && (
 <span className="text-[9px] text-cyan-400 font-mono font-bold">{cables.count} ACTIVE LINKS</span>
 )}
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5">
 {loading && !cables ? (
 <div className="flex flex-col items-center justify-center h-full">
 <RefreshCcw size={20} className="text-cyan-400 animate-spin mb-4"/>
 <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase animate-pulse">
 Querying Telegeography DB...
 </span>
 </div>
 ) : cables && cables.cables ? (
 cables.cables.map((cable, idx) => (
 <div key={idx} className="p-2 border border-white/10 bg-black/40 hover:bg-white/5 transition-colors group">
 <div className="flex items-start justify-between mb-1">
 <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
 {cable.name}
 </span>
 <span className="text-[9px] font-mono text-cyan-500/70">{cable.length}</span>
 </div>
 <div className="flex items-center justify-between">
 <div className="text-[8px] text-white/40 font-mono truncate max-w-[70%]">
 OWNER: {cable.owners || 'UNKNOWN CONSORTIUM'}
 </div>
 <div className="text-[8px] text-white/50 font-mono">
 RFS: {cable.rfs || 'N/A'}
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="flex items-center justify-center h-full text-white/40 text-[10px] uppercase tracking-widest">
 Registry Offline
 </div>
 )}
 </div>
 </div>

 </div>
 </div>
 );
};

export default MaritimeIntel;
