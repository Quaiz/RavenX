import React, { useState, useEffect } from 'react';
import { Flame, MapPin, RefreshCcw, AlertTriangle, Target, Activity, Satellite } from 'lucide-react';

const ThermalAnomalies = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fires?t=${new Date().getTime()}`);
 const json = await res.json();
 if (!json.error) {
 setData(json);
 setLastUpdate(new Date());
 }
 } catch (err) {
 console.error("Failed to fetch fire data:", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 300000); // 5 minutes
 return () => clearInterval(interval);
 }, []);

 // Determine threat classification based on Fire Radiative Power (MW)
 const getClassification = (frp) => {
 if (frp > 500) return { label: 'MEGAFIRE / KINETIC EVENT', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50' };
 if (frp > 100) return { label: 'SEVERE ANOMALY', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
 if (frp > 50) return { label: 'MODERATE FIRE', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
 return { label: 'MINOR / AGRICULTURAL', color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' };
 };

 const formatCoord = (coord) => {
 return parseFloat(coord).toFixed(4);
 };

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Satellite size={16} className="text-orange-500"style={{ filter: 'drop-shadow(0 0 6px #f97316)' }} />
 <div>
 <div className="text-[12px] font-bold tracking-widest text-orange-500 uppercase">NASA FIRMS THERMAL INTEL</div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase">Global Modis/VIIRS Satellite Detections (24H)</div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 {data && (
 <div className="flex items-center gap-1.5 px-2 py-0.5 border border-red-500/30 bg-red-500/10 ">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
 <span className="text-[10px] font-bold text-red-400 font-mono">{data.count} ACTIVE HOTSPOTS</span>
 </div>
 )}
 <span className="text-[9px] text-white/60 font-mono hidden md:block">SYNCED: {lastUpdate.toLocaleTimeString()}</span>
 </div>
 </div>

 <div className="flex-1 overflow-hidden flex flex-col">
 {/* Analytics Bar */}
 {data && (
 <div className="p-2 border-b border-white/5 bg-black/40 flex items-center gap-6 shrink-0 overflow-x-auto custom-scrollbar">
 <div className="flex items-center gap-2">
 <Activity size={12} className="text-red-500"/>
 <span className="text-[9px] font-mono text-white/60">MEGAFIRES ({'>'}500 MW): </span>
 <span className="text-[10px] font-bold text-red-500">{data.fires.filter(f => f.frp > 500).length}</span>
 </div>
 <div className="flex items-center gap-2">
 <Flame size={12} className="text-orange-500"/>
 <span className="text-[9px] font-mono text-white/60">SEVERE ({'>'}100 MW): </span>
 <span className="text-[10px] font-bold text-orange-500">{data.fires.filter(f => f.frp > 100 && f.frp <= 500).length}</span>
 </div>
 <div className="flex items-center gap-2">
 <Target size={12} className="text-white/40"/>
 <span className="text-[9px] font-mono text-white/60">MINOR ({'<='}50 MW): </span>
 <span className="text-[10px] font-bold text-white/40">{data.fires.filter(f => f.frp <= 50).length}</span>
 </div>
 </div>
 )}

 {/* Data Feed */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative">
 {loading && !data ? (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
 <RefreshCcw size={24} className="text-orange-500 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase animate-pulse">
 Establishing Satellite Uplink...
 </span>
 </div>
 ) : data && data.fires ? (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
 {data.fires.slice(0, 150).map((fire, idx) => {
 const meta = getClassification(fire.frp);
 return (
 <div key={idx} className={`p-2 border ${meta.border} bg-black/40 hover:${meta.bg} transition-colors group relative overflow-hidden`}>
 <div className="flex justify-between items-start mb-1.5">
 <div className="flex flex-col gap-0.5">
 <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest truncate max-w-[200px]">
 {fire.location || 'UNKNOWN LOCATION'}
 </span>
 <div className="flex items-center gap-1.5">
 <MapPin size={10} className={meta.color} />
 <span className="text-[9px] font-mono text-white/60">
 {formatCoord(fire.lat)}°, {formatCoord(fire.lon)}°
 </span>
 </div>
 </div>
 <span className={`text-[8px] font-bold tracking-widest uppercase px-1 border ${meta.color} ${meta.border}`}>
 {meta.label}
 </span>
 </div>
 
 <div className="flex items-end justify-between mt-2">
 <div className="space-y-0.5">
 <div className="text-[8px] text-white/40 font-mono">
 BRIGHTNESS: <span className="text-white/70">{fire.bright} K</span>
 </div>
 <div className="text-[8px] text-white/40 font-mono">
 CONFIDENCE: <span className="text-white/70">{fire.conf}%</span>
 </div>
 <div className="text-[8px] text-white/40 font-mono">
 TIME (UTC): <span className="text-white/70">{fire.time}</span>
 </div>
 </div>
 <div className="text-right">
 <div className="text-[7px] text-white/30 font-mono mb-0.5 uppercase tracking-widest">Radiative Power</div>
 <div className={`text-[14px] font-bold font-mono ${meta.color}`}>
 {fire.frp} <span className="text-[9px]">MW</span>
 </div>
 </div>
 </div>
 
 {/* High Threat Pulse overlay */}
 {fire.frp > 500 && (
 <div className="absolute top-0 right-0 p-4 bg-red-500/10 w-full h-full pointer-events-none animate-pulse"style={{ animationDuration: '2s' }} />
 )}
 </div>
 );
 })}
 
 {data.fires.length > 150 && (
 <div className="col-span-full p-4 text-center border border-dashed border-white/20 text-white/40 text-[9px] font-mono uppercase tracking-widest">
 + {data.fires.length - 150} MORE ANOMALIES LOGGED IN REGISTRY. DISPLAY TRUNCATED FOR TACTICAL EFFICIENCY.
 </div>
 )}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center h-full text-white/40">
 <AlertTriangle size={24} className="mb-2 opacity-50"/>
 <span className="text-[10px] uppercase tracking-widest">No thermal anomalies detected</span>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default ThermalAnomalies;
