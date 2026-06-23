import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Search, RefreshCcw, ExternalLink, Globe } from 'lucide-react';

const SearchTrends = () => {
 const [trends, setTrends] = useState([]);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchTrends = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/trends');
 const data = await res.json();
 if (data.trends) {
 setTrends(data.trends);
 }
 setLastUpdate(new Date());
 } catch (err) {
 console.error("Failed to fetch search trends", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchTrends();
 const interval = setInterval(() => { if (!document.hidden) fetchTrends(); }, 300000); // 5 minutes
 return () => clearInterval(interval);
 }, []);

 // Parse traffic to number for styling
 const parseTraffic = (trafficStr) => {
 const num = parseInt(trafficStr.replace(/[^0-9]/g, ''));
 if (isNaN(num)) return 0;
 if (trafficStr.toLowerCase().includes('m')) return num * 1000000;
 if (trafficStr.toLowerCase().includes('k')) return num * 1000;
 return num;
 };

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header Panel */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Activity size={16} className="text-cyan-400"/>
 <div className="flex flex-col">
 <span className="text-[12px] font-bold tracking-widest text-cyan-400 uppercase">SEARCH TRENDS</span>
 <span className="text-[8px] text-white/40 tracking-widest uppercase">Global Public Attention Tracker</span>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-white/60 font-mono">
 UPDATED: {lastUpdate.toLocaleTimeString()}
 </span>
 </div>
 </div>

 {/* Feed Area */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative">
 {loading && trends.length === 0 && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
 <RefreshCcw size={24} className="text-cyan-400 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase animate-pulse">
 Scanning Global Queries...
 </span>
 </div>
 )}

 {trends.map((trend, i) => {
 const trafficValue = parseTraffic(trend.traffic);
 
 let heatColor = 'text-green-400';
 let heatBorder = 'border-green-500/30 hover:border-green-500/50';
 let heatBg = 'bg-green-500/10';
 let heatBar = 'bg-green-500/50';
 
 if (trafficValue >= 1000000) {
 heatColor = 'text-red-500';
 heatBorder = 'border-red-500/50 hover:border-red-500';
 heatBg = 'bg-red-500/10';
 heatBar = 'bg-red-500 animate-pulse';
 } else if (trafficValue >= 500000) {
 heatColor = 'text-amber-500';
 heatBorder = 'border-amber-500/40 hover:border-amber-500/80';
 heatBg = 'bg-amber-500/10';
 heatBar = 'bg-amber-500';
 }

 return (
 <div 
 key={i} 
 className={`p-3 border relative group transition-colors pointer-events-auto ${heatBorder} ${heatBg} flex items-center justify-between gap-4`}
 >
 <div className={`absolute left-0 top-0 bottom-0 w-1 ${heatBar}`} />

 <div className="flex items-center gap-3 pl-2 flex-1 min-w-0">
 <div className={`p-2 shrink-0 border border-white/5 bg-black/40`}>
 <Search size={14} className={heatColor} />
 </div>
 
 <div className="flex flex-col gap-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-[12px] font-bold tracking-widest uppercase text-white truncate">
 {trend.query}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <TrendingUp size={10} className={heatColor} />
 <span className={`text-[9px] font-mono font-bold ${heatColor}`}>
 {trend.traffic} SEARCHES
 </span>
 <span className="text-[8px] text-white/40 font-mono hidden md:inline truncate ml-2">
 {trend.published}
 </span>
 </div>
 </div>
 </div>

 <a 
 href={trend.link} 
 target="_blank"
 rel="noopener noreferrer"
 className={`shrink-0 p-2 border border-white/10 hover:bg-white/10 ${heatColor} transition-colors flex items-center justify-center group/link`}
 title="View Trend Data"
 >
 <Globe size={14} className="group-hover/link:animate-pulse"/>
 </a>
 </div>
 );
 })}
 </div>
 </div>
 );
};

export default SearchTrends;
