import React, { useState, useEffect } from 'react';
import { Activity, Waves, MapPin, RefreshCcw, AlertTriangle } from 'lucide-react';

const getMagColor = (mag) => {
 if (mag >= 6.0) return { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-950/40', pulse: true, label: 'CRITICAL' };
 if (mag >= 5.0) return { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-950/30', pulse: false, label: 'SEVERE' };
 if (mag >= 4.0) return { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-950/20', pulse: false, label: 'MODERATE' };
 return { border: 'border-cyan-500/50', text: 'text-cyan-400', bg: 'bg-cyan-950/10', pulse: false, label: 'MINOR' };
};

const SeismicMonitor = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/seismic');
 const json = await res.json();
 if (!json.error) {
 setData(json);
 setLastUpdate(new Date());
 }
 } catch (err) {
 console.error("Failed to fetch seismic data:", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 60000); // 1 min update (USGS updates often)
 return () => clearInterval(interval);
 }, []);

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Activity size={16} className="text-red-500"style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }} />
 <div>
 <div className="text-[12px] font-bold tracking-widest text-red-500 uppercase">SEISMIC MONITOR</div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase">USGS GLOBAL M2.5+ · 24H FEED</div>
 </div>
 </div>
 <span className="text-[9px] text-white/60 font-mono">SYNCED: {lastUpdate.toLocaleTimeString()}</span>
 </div>

 {/* Overview Banner */}
 {data && (
 <div className="p-3 border-b border-white/10 bg-black/40 flex justify-between items-center">
 <div className="flex flex-col">
 <span className="text-[9px] text-white/50 tracking-widest uppercase">24H Activity</span>
 <span className="text-[14px] font-bold font-mono text-cyan-400">{data.count} Events</span>
 </div>
 <div className="flex flex-col text-right">
 <span className="text-[9px] text-white/50 tracking-widest uppercase">Max Magnitude</span>
 <div className="flex items-center justify-end gap-2">
 <span className={`text-[14px] font-bold font-mono ${getMagColor(data.max_mag).text}`}>
 M {data.max_mag.toFixed(1)}
 </span>
 {data.max_quake && (
 <span className="text-[9px] text-white/40 max-w-[120px] truncate">{data.max_quake.place}</span>
 )}
 </div>
 </div>
 </div>
 )}

 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
 {loading && !data ? (
 <div className="flex flex-col items-center justify-center h-full">
 <RefreshCcw size={24} className="text-red-500 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase animate-pulse">
 Scanning Tectonic Plates...
 </span>
 </div>
 ) : data && data.quakes && data.quakes.length > 0 ? (
 data.quakes.map((q) => {
 const meta = getMagColor(q.mag);
 const date = new Date(q.time);
 
 return (
 <div key={q.id} className={`p-2 border relative overflow-hidden ${meta.bg} ${meta.border}`}>
 {/* Tsunami Warning Badge */}
 {q.tsunami === 1 && (
 <div className="absolute top-0 right-0 p-1.5 bg-red-600/30 border-b border-l border-red-500 flex items-center gap-1 z-10">
 <Waves size={10} className="text-red-400 animate-pulse"/>
 <span className="text-[8px] font-bold text-red-100 tracking-widest uppercase animate-pulse">TSUNAMI WARNING</span>
 </div>
 )}
 
 {/* Magnitude Background Glow for M6+ */}
 {meta.pulse && (
 <div className="absolute left-0 top-0 bottom-0 w-8 bg-red-500/20 animate-pulse pointer-events-none"/>
 )}

 <div className="flex gap-3 relative z-0">
 {/* Magnitude Block */}
 <div className={`flex flex-col items-center justify-center min-w-[50px] p-2 border bg-black/40 ${meta.border}`}>
 <span className="text-[8px] text-white/40 uppercase tracking-widest mb-0.5">MAG</span>
 <span className={`text-[18px] font-bold font-mono leading-none ${meta.text}`} 
 style={{ textShadow: meta.pulse ? '0 0 10px rgba(239,68,68,0.5)' : 'none' }}>
 {q.mag.toFixed(1)}
 </span>
 </div>

 {/* Details */}
 <div className="flex-1 flex flex-col justify-center">
 <div className="text-[11px] font-bold text-white/90 leading-tight mb-1 pr-24">
 {q.place}
 </div>
 
 <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px]">
 <div className="flex items-center gap-1 text-white/50">
 <MapPin size={10} className="text-blue-400"/>
 <span className="font-mono">{q.depth.toFixed(1)} km depth</span>
 </div>
 <div className="text-white/40 font-mono">
 {date.toLocaleTimeString()}
 </div>
 {q.url && (
 <a href={q.url} target="_blank"rel="noopener noreferrer"
 className="text-cyan-400/80 hover:text-cyan-300 border-b border-dashed border-cyan-500/30 transition-colors ml-auto">
 USGS Report →
 </a>
 )}
 </div>
 </div>
 </div>
 </div>
 );
 })
 ) : (
 <div className="flex items-center justify-center h-full text-white/40 text-[10px] uppercase tracking-widest">
 No Seismic Activity Detected
 </div>
 )}
 </div>
 </div>
 );
};

export default SeismicMonitor;
