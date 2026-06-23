import React, { useState, useEffect } from 'react';
import { CloudLightning, Tornado, Waves, AlertTriangle, Wind, ThermometerSun, MapPin, RefreshCcw, Activity } from 'lucide-react';

const SEVERITY_COLORS = {
 CRITICAL: { border: 'border-red-500', bg: 'bg-red-950/40', text: 'text-red-400', icon: 'text-red-500', pulse: true },
 SEVERE: { border: 'border-orange-500', bg: 'bg-orange-950/30', text: 'text-orange-400', icon: 'text-orange-500', pulse: false },
 MODERATE: { border: 'border-yellow-500', bg: 'bg-yellow-950/20', text: 'text-yellow-400', icon: 'text-yellow-500', pulse: false },
};

const getEventIcon = (type) => {
 const t = type.toLowerCase();
 if (t.includes('tornado')) return <Tornado size={16} />;
 if (t.includes('thunderstorm') || t.includes('lightning')) return <CloudLightning size={16} />;
 if (t.includes('flood') || t.includes('tsunami') || t.includes('waves')) return <Waves size={16} />;
 if (t.includes('hurricane') || t.includes('cyclone') || t.includes('wind')) return <Wind size={16} />;
 if (t.includes('heat') || t.includes('fire')) return <ThermometerSun size={16} />;
 return <AlertTriangle size={16} />;
};

const WeatherAlerts = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/weather-alerts');
 const json = await res.json();
 if (!json.error) {
 setData(json.alerts || []);
 setLastUpdate(new Date());
 }
 } catch (err) {
 console.error("Failed to fetch weather alerts:", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 120000); // 2 min
 return () => clearInterval(interval);
 }, []);

 const criticalCount = data ? data.filter(a => a.severity === 'CRITICAL').length : 0;
 const severeCount = data ? data.filter(a => a.severity === 'SEVERE').length : 0;

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <CloudLightning size={16} className="text-orange-400"style={{ filter: 'drop-shadow(0 0 6px #fb923c)' }} />
 <div>
 <div className="text-[12px] font-bold tracking-widest text-orange-400 uppercase">WEATHER & DISASTERS</div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase">NWS · GDACS Global Monitor</div>
 </div>
 </div>
 <span className="text-[9px] text-white/60 font-mono">SYNCED: {lastUpdate.toLocaleTimeString()}</span>
 </div>

 {/* Threat Summary Banner */}
 {data && (
 <div className={`p-2 border-b flex items-center justify-between ${
 criticalCount > 0 ? 'bg-red-950/40 border-red-500/50' : 'bg-orange-950/20 border-orange-500/30'
 }`}>
 <div className="flex items-center gap-2">
 <Activity size={12} className={criticalCount > 0 ? 'text-red-500 animate-pulse' : 'text-orange-500'} />
 <span className="text-[9px] font-bold tracking-widest uppercase text-white/70">GLOBAL THREAT DETECTIONS</span>
 </div>
 <div className="flex gap-3">
 <span className="text-[10px] font-mono font-bold text-red-400">{criticalCount} CRITICAL</span>
 <span className="text-[10px] font-mono font-bold text-orange-400">{severeCount} SEVERE</span>
 </div>
 </div>
 )}

 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
 {loading && !data ? (
 <div className="flex flex-col items-center justify-center h-full">
 <RefreshCcw size={24} className="text-orange-400 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase animate-pulse">
 Scanning Global Radar...
 </span>
 </div>
 ) : data && data.length > 0 ? (
 data.map((alert, idx) => {
 const meta = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.MODERATE;
 return (
 <div key={idx} className={`p-3 border relative overflow-hidden ${meta.bg} ${meta.border}`}>
 {meta.pulse && (
 <div className="absolute top-0 right-0 p-1.5 bg-red-500/20 border-b border-l border-red-500/40 flex items-center gap-1">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
 <span className="text-[7px] font-bold text-red-400 tracking-widest">CRITICAL</span>
 </div>
 )}

 <div className="flex items-start gap-3">
 <div className={`p-2 border bg-black/40 ${meta.border} ${meta.icon}`}>
 {getEventIcon(alert.type)}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className={`text-[10px] font-bold tracking-widest uppercase ${meta.text}`}>
 {alert.type}
 </span>
 <span className="text-[9px] text-white/40 px-1 border border-white/20 ">
 {alert.source}
 </span>
 </div>
 
 <div className="text-[11px] text-white/90 leading-tight mb-2 pr-12">
 {alert.headline}
 </div>

 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px]">
 <div className="flex items-center gap-1 text-white/60">
 <MapPin size={10} className="text-blue-400"/>
 <span className="truncate max-w-[200px]">{alert.area}</span>
 </div>
 <div className="text-white/40 font-mono">
 {alert.time ? alert.time.slice(0, 16).replace('T', ' ') : ''}
 </div>
 {alert.link && (
 <a href={alert.link} target="_blank"rel="noopener noreferrer"
 className="text-orange-400/80 hover:text-orange-300 border-b border-dashed border-orange-500/30 transition-colors ml-auto">
 Read Full Report →
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
 No Severe Global Threats Detected
 </div>
 )}
 </div>
 </div>
 );
};

export default WeatherAlerts;
