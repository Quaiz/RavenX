import React, { useState, useEffect } from 'react';
import { Landmark, CalendarDays, AlertCircle, Clock, RefreshCcw, ExternalLink } from 'lucide-react';

const MonetaryPolicy = () => {
 const [data, setData] = useState({ calendar: [], banks: [] });
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/monetary');
 const json = await res.json();
 if (json.calendar || json.banks) {
 setData({
 calendar: json.calendar || [],
 banks: json.banks || []
 });
 }
 setLastUpdate(new Date());
 } catch (err) {
 console.error("Failed to fetch monetary policy intel", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 300000); // 5 minutes
 return () => clearInterval(interval);
 }, []);

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header Panel */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Landmark size={16} className="text-yellow-500"/>
 <div className="flex flex-col">
 <span className="text-[12px] font-bold tracking-widest text-yellow-500 uppercase">MONETARY POLICY</span>
 <span className="text-[8px] text-white/40 tracking-widest uppercase">Global Macro Calendar & Central Bank Intel</span>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <Clock size={10} className="text-white/40"/>
 <span className="text-[9px] text-white/60 font-mono">
 SYNCED: {lastUpdate.toLocaleTimeString()}
 </span>
 </div>
 </div>

 {/* Content Area - Split View */}
 <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
 {loading && data.calendar.length === 0 && data.banks.length === 0 && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
 <RefreshCcw size={24} className="text-yellow-500 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-yellow-500 uppercase animate-pulse">
 Parsing Central Bank Feeds...
 </span>
 </div>
 )}

 {/* Left Column: Macro Calendar */}
 <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 flex flex-col min-h-0">
 <div className="p-2 bg-white/5 border-b border-white/5 flex items-center gap-2 shrink-0">
 <CalendarDays size={12} className="text-blue-400"/>
 <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">High/Med Impact Calendar (This Week)</span>
 </div>
 
 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
 {data.calendar.map((ev, i) => (
 <div key={i} className="flex flex-col p-2 border border-white/5 bg-black/20 pointer-events-auto hover:bg-white/5 transition-colors">
 <div className="flex items-center justify-between gap-2 mb-1">
 <div className="flex items-center gap-2">
 <span className={`text-[9px] font-bold px-1.5 py-0.5 ${
 ev.impact === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
 }`}>
 {ev.country}
 </span>
 <span className="text-[10px] font-mono text-white/50">{ev.date} {ev.time}</span>
 </div>
 </div>
 <span className="text-[11px] text-white/90 leading-tight">{ev.title}</span>
 {(ev.forecast || ev.previous) && (
 <div className="flex items-center gap-3 mt-1 text-[9px] font-mono text-white/40">
 {ev.forecast && <span>FCST: <span className="text-white/70">{ev.forecast}</span></span>}
 {ev.previous && <span>PREV: <span className="text-white/70">{ev.previous}</span></span>}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Right Column: Central Banks */}
 <div className="flex-1 flex flex-col min-h-0">
 <div className="p-2 bg-white/5 border-b border-white/5 flex items-center gap-2 shrink-0">
 <AlertCircle size={12} className="text-yellow-500"/>
 <span className="text-[9px] font-bold tracking-widest text-yellow-500 uppercase">FED & ECB Directives</span>
 </div>
 
 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
 {data.banks.map((bank, i) => (
 <div key={i} className="flex gap-2 p-2 border border-white/5 bg-black/20 pointer-events-auto hover:border-yellow-500/30 transition-colors group">
 <div className="shrink-0 pt-0.5">
 <span className={`text-[8px] font-bold px-1.5 py-0.5 border ${
 bank.bank === 'FED' 
 ? 'border-green-500/30 text-green-400 bg-green-500/10' 
 : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
 }`}>
 {bank.bank}
 </span>
 </div>
 
 <div className="flex flex-col gap-1 min-w-0 flex-1">
 <a href={bank.link} target="_blank"rel="noopener noreferrer"className="text-[10px] text-white/80 leading-tight hover:text-white flex items-start gap-1">
 <span className="line-clamp-2">{bank.title}</span>
 <ExternalLink size={10} className="shrink-0 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"/>
 </a>
 
 {bank.updated && (
 <span className="text-[8px] font-mono text-white/30">
 {new Date(bank.updated).toLocaleDateString([], { month: 'short', day: 'numeric' })}
 </span>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 
 </div>
 </div>
 );
};

export default MonetaryPolicy;
