import React, { useState, useEffect } from 'react';
import { Building2, Briefcase, AlertTriangle, TrendingUp, Clock, ExternalLink, Search, RefreshCcw } from 'lucide-react';

const CorporateIntel = () => {
 const [filings, setFilings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());
 const [searchQuery, setSearchQuery] = useState('');

 const fetchFilings = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/corporate/filings');
 const data = await res.json();
 if (data.filings) {
 setFilings(data.filings);
 }
 setLastUpdate(new Date());
 } catch (err) {
 console.error("Failed to fetch corporate filings", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchFilings();
 const interval = setInterval(() => { if (!document.hidden) fetchFilings(); }, 120000); // 2 minutes
 return () => clearInterval(interval);
 }, []);

 const filteredFilings = filings.filter(f => 
 f.title.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header Panel */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Building2 size={16} className="text-primary"/>
 <div className="flex flex-col">
 <span className="text-[12px] font-bold tracking-widest text-primary uppercase">SEC EDGAR Intercept</span>
 <span className="text-[8px] text-white/40 tracking-widest uppercase">Form 4 (Insider) / Form 8-K (Material)</span>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
 <div className="relative">
 <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40"/>
 <input 
 type="text"
 placeholder="SEARCH CIK / ENTITY..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="bg-black/40 border border-white/10 text-white text-[9px] uppercase font-mono tracking-widest pl-6 pr-2 py-1 w-48 focus:outline-none focus:border-primary/50 transition-colors pointer-events-auto"
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
 {loading && filings.length === 0 && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
 <RefreshCcw size={24} className="text-primary animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-primary uppercase animate-pulse">
 Interfacing with SEC EDGAR...
 </span>
 </div>
 )}

 {filteredFilings.map((filing, i) => {
 const isInsider = filing.type === 'FORM_4';
 const formatTime = (isoString) => {
 try {
 return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
 } catch(e) {
 return isoString;
 }
 };

 return (
 <div 
 key={`${filing.id}-${i}`} 
 className={`p-3 border relative group transition-colors pointer-events-auto ${
 isInsider 
 ? 'bg-green-900/10 border-green-500/20 hover:border-green-500/50' 
 : 'bg-amber-900/10 border-amber-500/20 hover:border-amber-500/50'
 }`}
 >
 {/* Highlight bar */}
 <div className={`absolute left-0 top-0 bottom-0 w-1 ${isInsider ? 'bg-green-500/50' : 'bg-amber-500/50'}`} />

 <div className="flex items-start justify-between gap-4 pl-2">
 <div className="flex gap-3">
 <div className={`p-2 mt-0.5 shrink-0 ${isInsider ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
 {isInsider ? (
 <TrendingUp size={14} className="text-green-500"/>
 ) : (
 <AlertTriangle size={14} className="text-amber-500"/>
 )}
 </div>
 
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <span className={`text-[10px] font-bold tracking-widest uppercase ${isInsider ? 'text-green-400' : 'text-amber-400'}`}>
 {isInsider ? 'INSIDER ACTIVITY (FORM 4)' : 'MATERIAL EVENT (FORM 8-K)'}
 </span>
 <span className="text-[8px] text-white/30 font-mono bg-white/5 px-1 ">
 {formatTime(filing.updated)}
 </span>
 </div>
 
 <span className="text-[11px] text-white/90 leading-tight">
 {filing.title}
 </span>
 </div>
 </div>

 <a 
 href={filing.link} 
 target="_blank"
 rel="noopener noreferrer"
 className="shrink-0 p-1.5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center group/link"
 title="View Original Filing"
 >
 <ExternalLink size={12} className="group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform"/>
 </a>
 </div>
 </div>
 );
 })}
 
 {!loading && filteredFilings.length === 0 && (
 <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
 <Building2 size={32} className="opacity-20"/>
 <span className="text-[10px] tracking-widest uppercase">No matching filings found in recent intercept.</span>
 </div>
 )}
 </div>
 </div>
 );
};

export default CorporateIntel;
