import React, { useState, useEffect } from 'react';
import { Zap, ShieldAlert, Activity, Cpu, ServerCrash, BatteryWarning, RadioTower, Globe } from 'lucide-react';

const PowerGridStatus = () => {
 const [gridData, setGridData] = useState(null);
 const [threatNews, setThreatNews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchGridData = async () => {
 try {
 const res = await fetch('https://api.carbonintensity.org.uk/generation', { headers: { 'Accept': 'application/json' } });
 const json = await res.json();
 if (json && json.data) {
 // Sort mix by percentage descending
 const mix = json.data.generationmix.sort((a, b) => b.perc - a.perc);
 setGridData({ ...json.data, generationmix: mix });
 }
 } catch (err) {
 console.error("Grid API Error:", err);
 }
 };

 const fetchThreats = async () => {
 try {
 // Using our existing news proxy to search for grid threats globally, limited to the last 14 days
 const query ="power grid outage OR substation attack OR energy sabotage when:14d";
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/news?country=${encodeURIComponent(query)}&limit=12&t=${Date.now()}`);
 const json = await res.json();
 if (json.articles) {
 setThreatNews(json.articles);
 }
 } catch (err) {
 console.error("Threat News Error:", err);
 }
 };

 const fetchAll = async () => {
 setLoading(true);
 await Promise.all([fetchGridData(), fetchThreats()]);
 setLastUpdate(new Date());
 setLoading(false);
 };

 useEffect(() => {
 fetchAll();
 const interval = setInterval(() => { if (!document.hidden) fetchAll(); }, 300000); // 5 mins
 return () => clearInterval(interval);
 }, []);

 const getFuelColor = (fuel) => {
 switch (fuel.toLowerCase()) {
 case 'nuclear': return 'text-purple-500 bg-purple-500/20 border-purple-500/50';
 case 'wind': return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/50';
 case 'solar': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50';
 case 'gas': return 'text-orange-500 bg-orange-500/20 border-orange-500/50';
 case 'coal': return 'text-red-600 bg-red-600/20 border-red-600/50';
 case 'biomass': return 'text-green-500 bg-green-500/20 border-green-500/50';
 case 'hydro': return 'text-blue-400 bg-blue-400/20 border-blue-400/50';
 case 'imports': return 'text-slate-400 bg-slate-400/20 border-slate-400/50';
 default: return 'text-white/60 bg-white/10 border-white/20';
 }
 };

 return (
 <div className="h-full flex flex-col md:flex-row font-military text-white bg-black/40">
 
 {/* LEFT PANEL: UK GRID TELEMETRY */}
 <div className="w-full md:w-5/12 flex flex-col border-r border-white/10 bg-black/40">
 <div className="p-3 border-b border-white/10 bg-black/60 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <RadioTower size={16} className="text-cyan-400"/>
 <div>
 <div className="text-[12px] font-bold tracking-widest text-cyan-400 uppercase">NATIONAL GRID ESO</div>
 <div className="text-[8px] text-white/40 uppercase">LIVE UK GENERATION MIX</div>
 </div>
 </div>
 <div className="flex items-center gap-1.5 px-2 py-0.5 border border-cyan-400/30 bg-cyan-400/10 ">
 <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
 <span className="text-[9px] font-bold text-cyan-400">ONLINE</span>
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
 {!gridData ? (
 <div className="flex justify-center items-center h-32 text-cyan-400/50">
 <Activity className="animate-pulse"/>
 </div>
 ) : (
 <>
 {/* Telemetry Header */}
 <div className="flex items-end justify-between border-b border-white/10 pb-2 mb-4">
 <div className="text-[10px] text-white/50 uppercase tracking-widest">REAL-TIME LOAD DISTRIBUTION</div>
 <div className="text-[8px] text-white/30 font-mono">{gridData.from.replace('T', ' ').replace('Z', ' UTC')}</div>
 </div>
 
 {/* Generation Mix Bars */}
 <div className="space-y-3">
 {gridData.generationmix.map((item) => {
 const styles = getFuelColor(item.fuel);
 const isMajor = item.perc > 10;
 return (
 <div key={item.fuel} className="relative">
 <div className="flex justify-between items-end mb-1">
 <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.split(' ')[0]}`}>
 {item.fuel}
 </span>
 <span className={`font-mono ${isMajor ? 'text-white' : 'text-white/50'} ${isMajor ? 'text-[14px]' : 'text-[11px]'}`}>
 {item.perc.toFixed(1)}%
 </span>
 </div>
 <div className="h-1.5 w-full bg-white/5 overflow-hidden border border-white/5">
 <div 
 className={`h-full ${styles.split(' ')[1]} transition-all duration-1000 ease-out`}
 style={{ width: `${item.perc}%` }}
 />
 </div>
 </div>
 );
 })}
 </div>
 
 {/* Status Box */}
 <div className="mt-6 p-3 border border-white/10 bg-white/5 relative overflow-hidden group hover:border-cyan-400/30 transition-colors">
 <div className="absolute top-0 right-0 p-2 opacity-10">
 <Zap size={40} />
 </div>
 <div className="text-[9px] text-white/40 uppercase mb-2">Grid Stability Assessment</div>
 <div className="flex items-center gap-2">
 <div className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold tracking-widest">
 NOMINAL
 </div>
 <span className="text-[11px] font-mono text-white/70">ALL SYSTEMS RESPONDING</span>
 </div>
 </div>
 </>
 )}
 </div>
 </div>
 
 {/* RIGHT PANEL: GLOBAL GRID THREAT OSINT */}
 <div className="flex-1 flex flex-col">
 <div className="p-3 border-b border-white/10 bg-black/60 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Globe size={16} className="text-red-500"/>
 <div>
 <div className="text-[12px] font-bold tracking-widest text-red-500 uppercase">GRID THREAT OSINT</div>
 <div className="text-[8px] text-white/40 uppercase">GLOBAL OUTAGES & INFRASTRUCTURE SABOTAGE</div>
 </div>
 </div>
 <span className="text-[9px] text-white/50 font-mono hidden sm:block">UPDATED: {lastUpdate.toLocaleTimeString()}</span>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
 {loading && threatNews.length === 0 ? (
 <div className="flex justify-center items-center h-full text-red-500/50">
 <Activity className="animate-spin"/>
 </div>
 ) : (
 threatNews.map((news, idx) => {
 // Format time ago
 const date = new Date(news.publishedAt);
 const now = new Date();
 const diffMs = now - date;
 const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
 const diffDays = Math.floor(diffHrs / 24);
 let timeStr = 'JUST NOW';
 if (diffDays > 0) {
 timeStr = `${diffDays}D AGO`;
 } else if (diffHrs > 0) {
 timeStr = `${diffHrs}H AGO`;
 }
 
 return (
 <a 
 key={idx} 
 href={news.url} 
 target="_blank"
 rel="noreferrer"
 className="block p-3 border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 transition-all group"
 >
 <div className="flex gap-3">
 <div className="shrink-0 mt-0.5">
 {news.title.toLowerCase().includes('cyber') || news.title.toLowerCase().includes('hacker') || news.title.toLowerCase().includes('ransomware') ? (
 <Cpu size={14} className="text-purple-400"/>
 ) : news.title.toLowerCase().includes('sabotage') || news.title.toLowerCase().includes('attack') ? (
 <ShieldAlert size={14} className="text-red-500"/>
 ) : (
 <ServerCrash size={14} className="text-orange-500"/>
 )}
 </div>
 <div className="flex-1">
 <h4 className="text-[11px] font-bold text-white/90 leading-snug group-hover:text-cyan-400 transition-colors">
 {news.title}
 </h4>
 <div className="flex items-center gap-3 mt-1.5">
 <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{news.source}</span>
 <span className="text-[9px] text-white/30 font-mono">{timeStr}</span>
 </div>
 </div>
 </div>
 </a>
 )})
 )}
 {threatNews.length === 0 && !loading && (
 <div className="flex flex-col items-center justify-center h-32 text-white/30">
 <ShieldAlert size={24} className="mb-2 opacity-50"/>
 <span className="text-[10px] uppercase tracking-widest">No immediate threats detected</span>
 </div>
 )}
 </div>
 </div>

 </div>
 );
};

export default PowerGridStatus;
