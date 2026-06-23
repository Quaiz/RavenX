import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { Search, X, Check, Clock, Globe, Pin } from 'lucide-react';

const ALL_TIMEZONES = [
 { id: 'utc', city: 'UTC', country: 'Coordinated', zone: 'UTC', offset: 'GMT+0' },
 { id: 'nyc', city: 'NEW YORK', country: 'United States', zone: 'America/New_York', offset: 'GMT-4' },
 { id: 'lon', city: 'LONDON', country: 'United Kingdom', zone: 'Europe/London', offset: 'GMT+1' },
 { id: 'hanoi', city: 'HANOI', country: 'Vietnam', zone: 'Asia/Ho_Chi_Minh', offset: 'GMT+7' },
 { id: 'tokyo', city: 'TOKYO', country: 'Japan', zone: 'Asia/Tokyo', offset: 'GMT+9' },
 { id: 'shanghai', city: 'SHANGHAI', country: 'China', zone: 'Asia/Shanghai', offset: 'GMT+8' },
 { id: 'dubai', city: 'DUBAI', country: 'UAE', zone: 'Asia/Dubai', offset: 'GMT+4' },
 { id: 'sydney', city: 'SYDNEY', country: 'Australia', zone: 'Australia/Sydney', offset: 'GMT+10' },
 { id: 'moscow', city: 'MOSCOW', country: 'Russia', zone: 'Europe/Moscow', offset: 'GMT+3' },
 { id: 'paris', city: 'PARIS', country: 'France', zone: 'Europe/Paris', offset: 'GMT+2' },
 { id: 'berlin', city: 'BERLIN', country: 'Germany', zone: 'Europe/Berlin', offset: 'GMT+2' },
];

const WorldClock = () => {
 const [isSelecting, setIsSelecting] = useState(false);
 const [search, setSearch] = useState('');
 const [now, setNow] = useState(new Date());

 // Persisted state
 const [is24H, setIs24H] = useState(() => localStorage.getItem('clock_24h') === 'true');
 const [heroId, setHeroId] = useState(() => localStorage.getItem('clock_hero') || 'utc');
 const [selectedIds, setSelectedIds] = useState(() => {
 const saved = localStorage.getItem('clock_selected');
 return saved ? JSON.parse(saved) : ['utc', 'nyc', 'lon', 'tokyo', 'shanghai', 'dubai', 'sydney', 'moscow'];
 });

 useEffect(() => {
 localStorage.setItem('clock_24h', is24H);
 localStorage.setItem('clock_hero', heroId);
 localStorage.setItem('clock_selected', JSON.stringify(selectedIds));
 }, [is24H, heroId, selectedIds]);

 useEffect(() => {
 const timer = setInterval(() => setNow(new Date()), 1000);
 return () => clearInterval(timer);
 }, []);

 const formatTime = (date, zone) => {
 return new Intl.DateTimeFormat('en-US', {
 timeZone: zone,
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit',
 hour12: !is24H
 }).format(date);
 };

 const formatDate = (date, zone) => {
 return new Intl.DateTimeFormat('en-US', {
 timeZone: zone,
 weekday: 'short',
 month: 'short',
 day: 'numeric'
 }).format(date);
 };

 const AnalogIcon = ({ date, zone }) => {
 const parts = new Intl.DateTimeFormat('en-US', {
 timeZone: zone,
 hour: 'numeric',
 minute: 'numeric',
 second: 'numeric',
 hourCycle: 'h23'
 }).formatToParts(date);
 
 let h = 0, m = 0, s = 0;
 parts.forEach(p => {
 if(p.type === 'hour') h = parseInt(p.value);
 if(p.type === 'minute') m = parseInt(p.value);
 if(p.type === 'second') s = parseInt(p.value);
 });

 const secDeg = s * 6;
 const minDeg = m * 6 + s * 0.1;
 const hrDeg = (h % 12) * 30 + m * 0.5;

 return (
 <div className="w-5 h-5 border border-white/20 rounded-full relative flex items-center justify-center bg-black/40 shadow-[inset_0_0_4px_rgba(255,255,255,0.1)] shrink-0">
 <div className="w-[1px] h-1.5 bg-white absolute bottom-1/2 origin-bottom rounded-full"style={{ transform: `rotate(${hrDeg}deg)` }} />
 <div className="w-[1px] h-2 bg-cyan-400 absolute bottom-1/2 origin-bottom rounded-full shadow-[0_0_2px_#22d3ee]" style={{ transform: `rotate(${minDeg}deg)` }} />
 <div className="w-px h-2.5 bg-red-500 absolute bottom-1/2 origin-bottom opacity-70"style={{ transform: `rotate(${secDeg}deg)` }} />
 <div className="w-1 h-1 rounded-full bg-cyan-400 absolute shadow-[0_0_4px_#22d3ee]" />
 </div>
 );
 };

 if (isSelecting) {
 return (
 <div className="h-full bg-panel flex flex-col font-mono text-white overflow-hidden">
 <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
 <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Select Timezones</span>
 <button onClick={() => setIsSelecting(false)} className="text-cyan-400 text-[10px] font-bold hover:text-white transition-colors uppercase tracking-widest">Done</button>
 </div>
 <div className="p-3 border-b border-white/5 bg-black/40">
 <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 border border-white/10">
 <Search size={12} className="text-white/20"/>
 <input 
 type="text"
 placeholder="Search cities..." 
 className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder:text-white/10 uppercase"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 </div>
 <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
 {ALL_TIMEZONES.filter(t => t.city.toLowerCase().includes(search.toLowerCase())).map(t => (
 <div 
 key={t.id} 
 className="flex items-center justify-between p-2 hover:bg-white/5 cursor-pointer group"
 onClick={() => setSelectedIds(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])}
 >
 <div className="flex items-center gap-3">
 <div className={`w-3 h-3 border ${selectedIds.includes(t.id) ? 'bg-cyan-400 border-cyan-400' : 'border-white/20'} flex items-center justify-center transition-colors`}>
 {selectedIds.includes(t.id) && <Check size={8} className="text-black"/>}
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-bold tracking-widest uppercase">{t.city} <span className="text-white/20 font-normal">{t.country}</span></span>
 </div>
 </div>
 <span className="text-[8px] text-white/10 uppercase">{t.zone}</span>
 </div>
 ))}
 </div>
 </div>
 );
 }

 const selectedZones = ALL_TIMEZONES.filter(t => selectedIds.includes(t.id));
 
 // Determine actual hero clock (fallback to first selected if hero is unselected)
 const actualHeroId = selectedIds.includes(heroId) ? heroId : (selectedIds[0] || 'utc');
 const heroZone = ALL_TIMEZONES.find(t => t.id === actualHeroId) || ALL_TIMEZONES[0];

 return (
 <div className="h-full bg-panel flex flex-col font-mono text-white overflow-hidden">
 <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
 <span className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase">World Clock</span>
 <div className="flex items-center gap-3">
 <button 
 onClick={() => setIs24H(!is24H)}
 className="text-[9px] px-1.5 py-0.5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 uppercase transition-colors"
 >
 {is24H ? '24H' : '12H'}
 </button>
 <button onClick={() => setIsSelecting(true)} className="text-white/20 hover:text-white transition-colors">
 <Globe size={14} />
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {/* HERO CLOCK */}
 {heroZone && (
 <div className="p-6 border-b border-cyan-400/20 bg-cyan-400/[0.03] relative overflow-hidden">
 {/* Background decoration */}
 <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
 <Globe size={120} />
 </div>
 <div className="flex items-center gap-3 mb-2 relative z-10">
 <AnalogIcon date={now} zone={heroZone.zone} />
 <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-2">
 {heroZone.city} <span className="text-white/40">{heroZone.country}</span>
 </span>
 <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse ml-auto"/>
 </div>
 <div className="text-4xl font-bold tracking-tighter text-white mb-1 relative z-10 shadow-black drop-shadow-md">
 {formatTime(now, heroZone.zone)}
 </div>
 <div className="text-[9px] text-white/40 uppercase tracking-widest flex justify-between items-center">
 <span>{formatDate(now, heroZone.zone)}</span>
 <span className="text-cyan-400/50">{heroZone.offset}</span>
 </div>
 </div>
 )}

 {/* OTHER ZONES */}
 <div className="divide-y divide-white/5">
 {selectedZones.filter(t => t.id !== actualHeroId).map(t => (
 <div 
 key={t.id} 
 onClick={() => setHeroId(t.id)}
 className="p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors cursor-pointer group"
 title="Click to pin this timezone"
 >
 <div className="flex items-center gap-4">
 <div className="opacity-50 group-hover:opacity-100 transition-opacity">
 <AnalogIcon date={now} zone={t.zone} />
 </div>
 <div className="flex flex-col">
 <div className="text-[10px] font-bold tracking-widest uppercase group-hover:text-cyan-400 transition-colors flex items-center gap-2">
 {t.city} <span className="text-white/20 font-normal">{t.country}</span>
 <Pin size={8} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400"/>
 </div>
 <div className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">
 {formatDate(now, t.zone)}
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-[11px] font-bold tracking-tighter text-white/90">
 {formatTime(now, t.zone)} <span className="text-[8px] text-white/30 ml-1">{t.offset}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default WorldClock;
