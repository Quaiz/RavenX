import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, HeartHandshake, Search, RefreshCcw, ExternalLink, Clock, Flame, Wind, Droplets } from 'lucide-react';

const HumanitarianIntel = () => {
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());
 const [searchQuery, setSearchQuery] = useState('');

 const fetchEvents = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/humanitarian');
 const data = await res.json();
 if (data.events) {
 setEvents(data.events);
 }
 setLastUpdate(new Date());
 } catch (err) {
 console.error("Failed to fetch humanitarian intel", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchEvents();
 const interval = setInterval(() => { if (!document.hidden) fetchEvents(); }, 120000); // 2 minutes
 return () => clearInterval(interval);
 }, []);

 const filteredEvents = events.filter(e => 
 e.title.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const getDisasterIcon = (title) => {
 const t = title.toLowerCase();
 if (t.includes('earthquake')) return <AlertTriangle size={14} />;
 if (t.includes('flood') || t.includes('tsunami')) return <Droplets size={14} />;
 if (t.includes('cyclone') || t.includes('hurricane') || t.includes('typhoon')) return <Wind size={14} />;
 if (t.includes('fire') || t.includes('volcano')) return <Flame size={14} />;
 return <AlertTriangle size={14} />;
 };

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header Panel */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <HeartHandshake size={16} className="text-cyan-500"/>
 <div className="flex flex-col">
 <span className="text-[12px] font-bold tracking-widest text-cyan-500 uppercase">HUMANITARIAN INTEL</span>
 <span className="text-[8px] text-white/40 tracking-widest uppercase">GDACS Disasters & NGO/Refugee Crises</span>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
 <div className="relative">
 <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40"/>
 <input 
 type="text"
 placeholder="SEARCH REGION/CRISIS..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="bg-black/40 border border-white/10 text-white text-[9px] uppercase font-mono tracking-widest pl-6 pr-2 py-1 w-48 focus:outline-none focus:border-cyan-500/50 transition-colors pointer-events-auto"
 />
 </div>
 
 <div className="flex items-center gap-2">
 <Clock size={10} className="text-white/40"/>
 <span className="text-[9px] text-white/60 font-mono">
 LAST SCAN: {lastUpdate.toLocaleTimeString()}
 </span>
 </div>
 </div>
 </div>

 {/* Feed Area */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative">
 {loading && events.length === 0 && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
 <RefreshCcw size={24} className="text-cyan-500 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-cyan-500 uppercase animate-pulse">
 Syncing Global Crisis Feeds...
 </span>
 </div>
 )}

 {filteredEvents.map((ev, i) => {
 const isDisaster = ev.type === 'DISASTER';
 let borderColor = 'border-white/10';
 let bgColor = 'bg-white/5';
 let textColor = 'text-white/80';
 let labelColor = 'text-white/50';
 
 if (isDisaster) {
 if (ev.severity === 'RED') {
 borderColor = 'border-red-500/50 hover:border-red-500';
 bgColor = 'bg-red-500/10';
 textColor = 'text-red-100';
 labelColor = 'text-red-500';
 } else if (ev.severity === 'ORANGE') {
 borderColor = 'border-amber-500/50 hover:border-amber-500';
 bgColor = 'bg-amber-500/10';
 textColor = 'text-amber-100';
 labelColor = 'text-amber-500';
 } else {
 borderColor = 'border-green-500/30 hover:border-green-500/50';
 bgColor = 'bg-green-500/5';
 textColor = 'text-green-100';
 labelColor = 'text-green-500';
 }
 } else {
 // Refugee / NGO
 borderColor = 'border-cyan-500/30 hover:border-cyan-500/50';
 bgColor = 'bg-cyan-500/10';
 textColor = 'text-cyan-50';
 labelColor = 'text-cyan-400';
 }

 const formatTime = (isoString) => {
 try {
 if (!isoString) return 'RECENT';
 return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
 } catch(e) {
 return 'RECENT';
 }
 };

 return (
 <div 
 key={`${ev.id}-${i}`} 
 className={`p-3 border relative group transition-colors pointer-events-auto ${borderColor} ${bgColor}`}
 >
 {/* Highlight bar */}
 {isDisaster && ev.severity === 'RED' && (
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse"/>
 )}
 {isDisaster && ev.severity === 'ORANGE' && (
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"/>
 )}
 {!isDisaster && (
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50"/>
 )}

 <div className="flex items-start justify-between gap-4 pl-2">
 <div className="flex gap-3">
 <div className={`p-2 mt-0.5 shrink-0 bg-black/40 border border-white/5`}>
 <span className={labelColor}>
 {isDisaster ? getDisasterIcon(ev.title) : <Users size={14} />}
 </span>
 </div>
 
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <span className={`text-[10px] font-bold tracking-widest uppercase ${labelColor}`}>
 {isDisaster ? `GDACS DISASTER ALERT [${ev.severity}]` : 'HUMANITARIAN / NGO REPORT'}
 </span>
 <span className="text-[8px] text-white/30 font-mono bg-black/40 px-1 border border-white/5">
 {formatTime(ev.updated)}
 </span>
 </div>
 
 <span className={`text-[11px] leading-tight ${textColor}`} dangerouslySetInnerHTML={{__html: ev.title.replace(/<[^>]+>/g, '')}} />
 </div>
 </div>

 <a 
 href={ev.link} 
 target="_blank"
 rel="noopener noreferrer"
 className={`shrink-0 p-1.5 border border-white/10 hover:bg-white/10 ${labelColor} transition-colors flex items-center justify-center group/link`}
 title="View Report"
 >
 <ExternalLink size={12} className="group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform"/>
 </a>
 </div>
 </div>
 );
 })}
 
 {!loading && filteredEvents.length === 0 && (
 <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
 <HeartHandshake size={32} className="opacity-20"/>
 <span className="text-[10px] tracking-widest uppercase">No matching intelligence found.</span>
 </div>
 )}
 </div>
 </div>
 );
};

export default HumanitarianIntel;
