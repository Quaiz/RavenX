import React, { useState, useEffect } from 'react';
import { Target, RefreshCcw, TrendingUp, HelpCircle, Flame } from 'lucide-react';

const PredictionMarkets = () => {
 const [markets, setMarkets] = useState([]);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchMarkets = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/polymarket');
 const data = await res.json();
 if (data.markets) {
 setMarkets(data.markets);
 }
 setLastUpdate(new Date());
 } catch (err) {
 console.error("Failed to fetch polymarket", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchMarkets();
 const interval = setInterval(() => { if (!document.hidden) fetchMarkets(); }, 120000); // 2 minutes
 return () => clearInterval(interval);
 }, []);

 const formatVolume = (vol) => {
 if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
 if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
 return `$${vol}`;
 };

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header Panel */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Target size={16} className="text-orange-400"/>
 <div className="flex flex-col">
 <span className="text-[12px] font-bold tracking-widest text-orange-400 uppercase">PREDICTION ODDS</span>
 <span className="text-[8px] text-white/40 tracking-widest uppercase">Polymarket Macro & Geopolitical Forecasting</span>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-white/60 font-mono">
 SYNCED: {lastUpdate.toLocaleTimeString()}
 </span>
 </div>
 </div>

 {/* Feed Area */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 relative">
 {loading && markets.length === 0 && (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
 <RefreshCcw size={24} className="text-orange-400 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase animate-pulse">
 Aggregating Smart Money...
 </span>
 </div>
 )}

 {markets.map((market, i) => {
 let odds1 = parseFloat(market.odds?.[0]) || 0;
 let odds2 = parseFloat(market.odds?.[1]) || 0;
 
 // Fallback if missing
 if (odds1 === 0 && odds2 === 0) return null;

 const pct1 = Math.round(odds1 * 100);
 const pct2 = Math.round(odds2 * 100);

 const isHot = market.volume > 10000000; // > $10M

 return (
 <div key={i} className={`p-3 border relative group transition-colors pointer-events-auto flex flex-col gap-2 ${
 isHot ? 'bg-orange-900/10 border-orange-500/50 hover:border-orange-500' : 'bg-white/5 border-white/10 hover:border-white/30'
 }`}>
 {isHot && (
 <div className="absolute top-0 right-0 p-1 bg-orange-500/20 text-orange-400 border-b border-l border-orange-500/30 flex items-center gap-1">
 <Flame size={10} className="animate-pulse"/>
 <span className="text-[7px] font-bold">HOT</span>
 </div>
 )}

 <div className="flex items-start gap-2 pr-10">
 <HelpCircle size={14} className={`shrink-0 mt-0.5 ${isHot ? 'text-orange-400' : 'text-white/50'}`} />
 <span className="text-[11px] font-bold text-white/90 leading-tight">
 {market.question}
 </span>
 </div>

 <div className="flex items-center gap-4 mt-1">
 {/* Volume Badge */}
 <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/50 border border-white/10 ">
 <TrendingUp size={10} className="text-green-400"/>
 <span className="text-[9px] font-mono font-bold text-green-400">
 VOL: {formatVolume(market.volume)}
 </span>
 </div>

 {/* Odds Bar */}
 <div className="flex-1 flex flex-col gap-1">
 <div className="flex justify-between text-[9px] font-mono font-bold">
 <span className="text-cyan-400">YES {pct1}%</span>
 <span className="text-pink-400">{pct2}% NO</span>
 </div>
 <div className="h-1.5 w-full bg-black/60 border border-white/10 flex overflow-hidden ">
 <div 
 className="h-full bg-cyan-500 transition-all duration-1000 relative"
 style={{ width: `${pct1}%` }}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"/>
 </div>
 <div 
 className="h-full bg-pink-500 transition-all duration-1000 relative"
 style={{ width: `${pct2}%` }}
 >
 <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/30"/>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
};

export default PredictionMarkets;
