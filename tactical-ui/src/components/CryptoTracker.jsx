import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Wifi, WifiOff, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COINS = [
 { symbol: 'BTCUSDT', name: 'Bitcoin', short: 'BTC' },
 { symbol: 'ETHUSDT', name: 'Ethereum', short: 'ETH' },
 { symbol: 'BNBUSDT', name: 'BNB', short: 'BNB' },
 { symbol: 'SOLUSDT', name: 'Solana', short: 'SOL' },
 { symbol: 'XRPUSDT', name: 'XRP', short: 'XRP' },
 { symbol: 'ADAUSDT', name: 'Cardano', short: 'ADA' },
 { symbol: 'DOGEUSDT', name: 'Dogecoin', short: 'DOGE' },
 { symbol: 'DOTUSDT', name: 'Polkadot', short: 'DOT' },
 { symbol: 'AVAXUSDT', name: 'Avalanche', short: 'AVAX' },
 { symbol: 'LINKUSDT', name: 'Chainlink', short: 'LINK' },
 { symbol: 'MATICUSDT', name: 'Polygon', short: 'MATIC' },
 { symbol: 'SHIBUSDT', name: 'Shiba Inu', short: 'SHIB' },
 { symbol: 'LTCUSDT', name: 'Litecoin', short: 'LTC' },
 { symbol: 'TRXUSDT', name: 'TRON', short: 'TRX' },
 { symbol: 'ATOMUSDT', name: 'Cosmos', short: 'ATOM' },
 { symbol: 'UNIUSDT', name: 'Uniswap', short: 'UNI' },
 { symbol: 'NEARUSDT', name: 'NEAR', short: 'NEAR' },
 { symbol: 'APTUSDT', name: 'Aptos', short: 'APT' },
 { symbol: 'FILUSDT', name: 'Filecoin', short: 'FIL' },
 { symbol: 'AAVEUSDT', name: 'Aave', short: 'AAVE' },
 { symbol: 'OPUSDT', name: 'Optimism', short: 'OP' },
 { symbol: 'ARBUSDT', name: 'Arbitrum', short: 'ARB' },
 { symbol: 'SUIUSDT', name: 'Sui', short: 'SUI' },
 { symbol: 'PEPEUSDT', name: 'Pepe', short: 'PEPE' },
];

const INTERVALS = [
 { key: '1h', label: '1H', interval: '1m', limit: 60 },
 { key: '24h', label: '24H', interval: '15m', limit: 96 },
 { key: '7d', label: '7D', interval: '1h', limit: 168 },
 { key: '30d', label: '30D', interval: '4h', limit: 180 },
];

const fmtP = (p) => { const n=parseFloat(p); if(isNaN(n))return'---'; if(n>=1000)return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); if(n>=1)return n.toFixed(4); if(n>=0.01)return n.toFixed(6); return n.toFixed(8); };
const fmtV = (v) => { const n=parseFloat(v); if(isNaN(n))return'---'; if(n>=1e9)return(n/1e9).toFixed(2)+'B'; if(n>=1e6)return(n/1e6).toFixed(2)+'M'; if(n>=1e3)return(n/1e3).toFixed(1)+'K'; return n.toFixed(0); };

// Chart detail panel
const CoinChart = ({ symbol, name, short, onClose }) => {
 const [chartData, setChartData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [interval, setInterval_] = useState('24h');

 const fetchChart = useCallback(async (iv) => {
 setLoading(true);
 const cfg = INTERVALS.find(i => i.key === iv);
 try {
 const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${cfg.interval}&limit=${cfg.limit}`;
 const res = await fetch(url);
 const data = await res.json();
 const mapped = data.map(k => ({
 time: new Date(k[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
 price: parseFloat(k[4]), // close price
 high: parseFloat(k[2]),
 low: parseFloat(k[3]),
 vol: parseFloat(k[5]),
 }));
 setChartData(mapped);
 } catch (e) { console.warn('Klines fetch failed:', e); }
 setLoading(false);
 }, [symbol]);

 useEffect(() => { fetchChart(interval); }, [interval, fetchChart]);

 const priceChange = chartData.length > 1 ? chartData[chartData.length-1].price - chartData[0].price : 0;
 const pctChange = chartData.length > 1 ? ((priceChange / chartData[0].price) * 100) : 0;
 const isUp = priceChange >= 0;
 const color = isUp ? '#22c55e' : '#ef4444';

 return (
 <div className="border-b border-white/5 bg-black/40 px-3 py-3">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-bold text-white">{short}/USDT</span>
 <span className={`text-[8px] font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
 {isUp ? '+' : ''}{pctChange.toFixed(2)}%
 </span>
 </div>
 <div className="flex items-center gap-1">
 {INTERVALS.map(iv => (
 <button key={iv.key} onClick={() => setInterval_(iv.key)}
 className={`px-1.5 py-0.5 text-[6px] font-bold tracking-wider border ${
 interval === iv.key ? 'bg-primary/15 border-primary/40 text-primary' : 'border-white/5 text-white/25 hover:text-white/50'
 }`}>{iv.label}</button>
 ))}
 <button onClick={onClose} className="ml-1 p-0.5 hover:bg-white/5 ">
 <X size={8} className="text-white/30"/>
 </button>
 </div>
 </div>
 <div className="h-[100px] w-full"style={{ minHeight: '100px' }}>
 {loading ? (
 <div className="h-full flex items-center justify-center">
 <span className="text-[7px] text-white/20 animate-pulse tracking-widest">LOADING CHART...</span>
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id={`grad_${symbol}`} x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%" stopColor={color} stopOpacity={0.3} />
 <stop offset="95%" stopColor={color} stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="time"hide />
 <YAxis domain={['auto', 'auto']} hide />
 <Tooltip
 contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px', fontFamily: 'monospace' }}
 labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '7px' }}
 formatter={(val) => [`$${fmtP(val)}`, 'Price']}
 />
 <Area type="monotone"dataKey="price"stroke={color} strokeWidth={1.5} fill={`url(#grad_${symbol})`} dot={false} />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>
 );
};

const CryptoTracker = () => {
 const [data, setData] = useState({});
 const [search, setSearch] = useState('');
 const [wsOk, setWsOk] = useState(false);
 const [sortBy, setSortBy] = useState('rank');
 const [selected, setSelected] = useState(null);
 const wsRef = useRef(null);
 const flashRef = useRef({});
 const [, forceRender] = useState(0);

 useEffect(() => {
 (async () => {
 try {
 const syms = COINS.map(s=>s.symbol);
 const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(syms)}`);
 const arr = await r.json();
 const m = {};
 arr.forEach(t => { m[t.symbol] = { price:t.lastPrice, change:t.priceChangePercent, high:t.highPrice, low:t.lowPrice, volume:t.quoteVolume }; });
 setData(m);
 } catch(e) { console.warn('Binance REST fail:', e); }
 })();
 }, []);

 useEffect(() => {
 const streams = COINS.map(s=>`${s.symbol.toLowerCase()}@ticker`).join('/');
 const connect = () => {
 const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
 wsRef.current = ws;
 ws.onopen = () => setWsOk(true);
 ws.onclose = () => { setWsOk(false); setTimeout(connect, 5000); };
 ws.onerror = () => ws.close();
 
 let pendingUpdates = {};
 
 ws.onmessage = (e) => {
 try {
 const d = JSON.parse(e.data).data;
 if (!d?.s) return;
 pendingUpdates[d.s] = { price: d.c, change: d.P, high: d.h, low: d.l, volume: d.q };
 } catch {}
 };

 // Batch state updates every 1 second to prevent massive re-renders
 const interval = setInterval(() => {
 if (document.hidden) return;
 if (Object.keys(pendingUpdates).length === 0) return;
 setData(prev => {
 const next = { ...prev };
 let changed = false;
 for (const [s, newData] of Object.entries(pendingUpdates)) {
 const old = prev[s];
 if (old && old.price !== newData.price) {
 flashRef.current[s] = parseFloat(newData.price) > parseFloat(old.price) ? 'up' : 'down';
 setTimeout(() => { flashRef.current[s] = null; forceRender(n=>n+1); }, 600);
 }
 next[s] = newData;
 changed = true;
 }
 pendingUpdates = {};
 return changed ? next : prev;
 });
 }, 1000);

 wsRef.current._interval = interval;
 };
 connect();
 return () => { 
 if(wsRef.current) {
 clearInterval(wsRef.current._interval);
 wsRef.current.close(); 
 }
 };
 }, []);

 const coins = useMemo(() => {
 let list = COINS.map((s,i) => ({ ...s, rank:i+1, ...(data[s.symbol]||{}) }));
 if (search) { const q=search.toLowerCase(); list=list.filter(c=>c.name.toLowerCase().includes(q)||c.short.toLowerCase().includes(q)); }
 if (sortBy==='price') list.sort((a,b)=>(parseFloat(b.price)||0)-(parseFloat(a.price)||0));
 if (sortBy==='change') list.sort((a,b)=>(parseFloat(b.change)||0)-(parseFloat(a.change)||0));
 return list;
 }, [data, search, sortBy]);

 return (
 <div className="w-full h-full bg-[#080b10] flex flex-col font-mono text-white overflow-hidden">
 <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <div className={`w-1.5 h-1.5 rounded-full ${wsOk?'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]':'bg-red-500'} animate-pulse`} />
 <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">{wsOk?'LIVE STREAM':'CONNECTING...'}</span>
 </div>
 <span className="text-[7px] text-white/20 tracking-widest uppercase">BINANCE WSS</span>
 </div>

 <div className="px-3 py-2 border-b border-white/5 shrink-0">
 <div className="relative">
 <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/15"/>
 <input type="text"placeholder="Search assets..." value={search} onChange={e=>setSearch(e.target.value)}
 className="w-full bg-black/50 border border-white/5 py-1.5 pl-7 pr-3 text-[9px] text-white font-mono focus:outline-none focus:border-primary/30 placeholder:text-white/15"/>
 </div>
 </div>

 <div className="px-3 py-1.5 border-b border-white/5 flex gap-1 shrink-0">
 {['rank','price','change'].map(s=>(
 <button key={s} onClick={()=>setSortBy(s)} className={`px-2 py-0.5 text-[6px] font-bold tracking-widest border transition-all ${sortBy===s?'bg-primary/15 border-primary/40 text-primary':'bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50'}`}>
 {s==='change'?'24H %':s.toUpperCase()}
 </button>
 ))}
 <div className="flex-1"/>
 <span className="text-[6px] text-white/15 uppercase tracking-widest self-center">{coins.length} ASSETS</span>
 </div>

 <div className="px-3 py-1 border-b border-white/5 grid grid-cols-[24px_1fr_80px_55px_60px] gap-1 shrink-0">
 {['#','ASSET','PRICE','24H','VOL'].map(h=>(
 <span key={h} className={`text-[6px] text-white/20 tracking-widest ${h!=='#'&&h!=='ASSET'?'text-right':''}`}>{h}</span>
 ))}
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {coins.map(coin => {
 const ch = parseFloat(coin.change)||0;
 const up = ch >= 0;
 const fl = flashRef.current[coin.symbol];
 const isSelected = selected === coin.symbol;
 return (
 <React.Fragment key={coin.symbol}>
 <div onClick={() => setSelected(isSelected ? null : coin.symbol)}
 className={`px-3 py-1.5 grid grid-cols-[24px_1fr_80px_55px_60px] gap-1 items-center border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-all ${fl==='up'?'bg-green-500/8':fl==='down'?'bg-red-500/8':''} ${isSelected?'bg-white/[0.04] border-l-2 border-l-primary':''}`}>
 <span className="text-[8px] text-white/20 font-bold">{coin.rank}</span>
 <div className="flex items-center gap-1.5 min-w-0">
 <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[5px] font-bold shrink-0 ${up?'bg-green-500/10 text-green-400 border border-green-500/20':'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
 {coin.short.substring(0,2)}
 </div>
 <div className="min-w-0">
 <div className="text-[8px] font-bold text-white truncate">{coin.short}</div>
 <div className="text-[5px] text-white/20 truncate">{coin.name}</div>
 </div>
 </div>
 <span className={`text-[9px] font-bold tabular-nums text-right ${fl==='up'?'text-green-400':fl==='down'?'text-red-400':'text-white'}`}>${fmtP(coin.price)}</span>
 <div className="text-right flex items-center justify-end gap-0.5">
 {up?<TrendingUp size={7} className="text-green-500"/>:<TrendingDown size={7} className="text-red-500"/>}
 <span className={`text-[8px] font-bold tabular-nums ${up?'text-green-500':'text-red-500'}`}>{up?'+':''}{ch.toFixed(2)}%</span>
 </div>
 <span className="text-[7px] text-white/25 tabular-nums text-right">${fmtV(coin.volume)}</span>
 </div>
 {isSelected && <CoinChart symbol={coin.symbol} name={coin.name} short={coin.short} onClose={() => setSelected(null)} />}
 </React.Fragment>
 );
 })}
 </div>

 <div className="px-3 py-1.5 border-t border-white/5 bg-black/40 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-1.5">
 {wsOk?<Wifi size={8} className="text-green-500"/>:<WifiOff size={8} className="text-red-500"/>}
 <span className="text-[6px] text-white/20 uppercase tracking-widest">BINANCE_FEED</span>
 </div>
 <span className="text-[6px] text-primary/40 uppercase tracking-widest">RAVEN_CRYPTO</span>
 </div>
 </div>
 );
};

export default CryptoTracker;
