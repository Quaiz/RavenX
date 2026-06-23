import React, { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '../store';
import {
 Plane, AlertTriangle, Radio, TrendingDown, Globe2, Clock,
 RefreshCw, Filter, Search, ChevronUp, ChevronDown, Wifi, WifiOff, Target
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtAlt = (m) => {
 if (!m || m === 0) return 'GND';
 const ft = Math.round(m / 0.3048);
 return `${(ft / 1000).toFixed(1)}k ft`;
};

const fmtSpd = (ms) => {
 if (!ms) return '—';
 return `${Math.round(ms * 1.94384)} kts`;
};

const fmtHeading = (h) => {
 if (h === null || h === undefined) return '—';
 const dirs = ['N','NE','E','SE','S','SW','W','NW'];
 return dirs[Math.round(h / 45) % 8] + ` ${Math.round(h)}°`;
};

const altColor = (alt) => {
 if (!alt || alt < 100) return '#6b7280'; // Ground / very low → gray
 const ft = alt / 0.3048;
 if (ft < 10000) return '#ef4444'; // Low → red
 if (ft < 25000) return '#f97316'; // Mid → orange
 if (ft < 35000) return '#eab308'; // High → yellow
 return '#22c55e'; // Cruise → green
};

const isSquawkAlert = (squawk) => {
 if (!squawk) return null;
 const s = String(squawk);
 if (s === '7700') return { label: 'EMERGENCY', color: '#ef4444' };
 if (s === '7600') return { label: 'RADIO FAIL', color: '#f97316' };
 if (s === '7500') return { label: 'HIJACK', color: '#dc2626' };
 return null;
};

const REFRESH_SEC = 60;

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = '#ffb800', icon: Icon }) => (
 <div className="flex flex-col gap-0.5 bg-black/30 border border-white/5 px-3 py-2 min-w-0">
 <div className="flex items-center gap-1.5">
 {Icon && <Icon size={9} style={{ color }} />}
 <span className="text-[7px] font-bold tracking-widest text-white/30 uppercase">{label}</span>
 </div>
 <span className="text-[15px] font-bold font-mono leading-tight"style={{ color }}>{value}</span>
 {sub && <span className="text-[7px] text-white/20 tracking-widest">{sub}</span>}
 </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const FlightTracking = () => {
 const aircraft = useStore(s => s.feeds.aircraft);
 const fetchAircraft = useStore(s => s.fetchAircraft);
 const activeOperationId = useStore(s => s.activeOperationId);
 const addNodeToOperation = useStore(s => s.addNodeToOperation);
 const addNotification = useStore(s => s.addNotification);

 const [loading, setLoading] = useState(true);
 const [online, setOnline] = useState(true);
 const [search, setSearch] = useState('');
 const [sortKey, setSortKey] = useState('alt');
 const [sortDir, setSortDir] = useState('desc');
 const [filterMode, setFilterMode] = useState('ALL'); // ALL | ALERT | HIGH
 const [selected, setSelected] = useState(null);
 const [countdown, setCountdown] = useState(REFRESH_SEC);
 const timerRef = useRef(null);
 const cdRef = useRef(null);

 const doFetch = useCallback(async () => {
 try {
 await fetchAircraft();
 setOnline(true);
 } catch {
 setOnline(false);
 } finally {
 setLoading(false);
 setCountdown(REFRESH_SEC);
 }
 }, [fetchAircraft]);

 useEffect(() => {
 doFetch();
 timerRef.current = setInterval(() => { if (!document.hidden) doFetch(); }, REFRESH_SEC * 1000);
 cdRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
 return () => {
 clearInterval(timerRef.current);
 clearInterval(cdRef.current);
 };
 }, [doFetch]);

 // Stats
 const total = aircraft.length;
 const alerts = aircraft.filter(a => isSquawkAlert(a.squawk));
 const highAlt = aircraft.filter(a => a.alt && a.alt / 0.3048 > 35000).length;
 const avgSpd = aircraft.length
 ? Math.round((aircraft.reduce((s, a) => s + (a.vel || 0), 0) / aircraft.length) * 1.94384)
 : 0;

 // Filtering + sorting
 let filtered = [...aircraft];
 if (search) {
 const q = search.toLowerCase();
 filtered = filtered.filter(a =>
 (a.callsign || '').toLowerCase().includes(q) ||
 (a.id || '').toLowerCase().includes(q)
 );
 }
 if (filterMode === 'ALERT') filtered = filtered.filter(a => isSquawkAlert(a.squawk));
 if (filterMode === 'HIGH') filtered = filtered.filter(a => a.alt && a.alt / 0.3048 > 35000);

 filtered.sort((a, b) => {
 let va = a[sortKey] ?? 0;
 let vb = b[sortKey] ?? 0;
 if (sortKey === 'callsign') { va = a.callsign || ''; vb = b.callsign || ''; }
 return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
 });

 const toggleSort = (key) => {
 if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
 else { setSortKey(key); setSortDir('desc'); }
 };

 const SortIcon = ({ k }) => {
 if (sortKey !== k) return null;
 return sortDir === 'asc'
 ? <ChevronUp size={8} className="inline-block ml-0.5 text-primary"/>
 : <ChevronDown size={8} className="inline-block ml-0.5 text-primary"/>;
 };

 if (loading) return (
 <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] font-mono">
 <Plane size={32} className="text-primary mb-4 animate-pulse"/>
 <div className="text-[10px] font-bold text-primary tracking-[0.3em]">CONNECTING TO ADS-B FEED...</div>
 <div className="text-[8px] text-white/30 mt-2 tracking-widest">SOURCE: ADSB.LOL / COMMUNITY</div>
 </div>
 );

 return (
 <div className="w-full h-full bg-[#0d1117] font-mono text-white flex flex-col overflow-hidden select-none">

 {/* ─── STATUS HEADER ─── */}
 <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <Plane size={13} className="text-primary"/>
 <span className="text-[11px] font-bold tracking-[0.25em] text-white/80">GLOBAL AIR PICTURE</span>
 <div className={`flex items-center gap-1 ml-1 px-1.5 py-0.5 border text-[6px] font-bold tracking-widest ${online ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-red-500/30 bg-red-500/5 text-red-400'}`}>
 {online ? <Wifi size={7} /> : <WifiOff size={7} />}
 {online ? 'LIVE' : 'OFFLINE'}
 </div>
 </div>
 <div className="flex items-center gap-3">
 {alerts.length > 0 && (
 <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/30 animate-pulse">
 <AlertTriangle size={9} className="text-red-400"/>
 <span className="text-[8px] font-bold text-red-400">{alerts.length} SQUAWK ALERT</span>
 </div>
 )}
 <div className="flex items-center gap-1 text-[7px] text-white/25">
 <Clock size={8} />
 <span className="font-mono">{String(countdown).padStart(2, '0')}s</span>
 </div>
 <button onClick={doFetch} className="p-1 hover:bg-white/5 transition-colors text-white/20 hover:text-primary">
 <RefreshCw size={11} />
 </button>
 </div>
 </div>

 {/* ─── STATS ROW ─── */}
 <div className="shrink-0 px-4 py-2.5 grid grid-cols-4 gap-2 border-b border-white/5">
 <StatCard label="Airborne"value={total.toLocaleString()} sub="globally tracked"icon={Globe2} color="#ffb800"/>
 <StatCard label="Cruise FL350+" value={highAlt.toLocaleString()} sub="> 35,000 ft"icon={TrendingDown} color="#22c55e"/>
 <StatCard label="Avg Speed"value={avgSpd > 0 ? `${avgSpd}` : '—'} sub="knots avg"icon={Radio} color="#38bdf8"/>
 <StatCard label="Alerts"value={alerts.length || '0'} sub="active squawks"icon={AlertTriangle} color={alerts.length ? '#ef4444' : '#6b7280'} />
 </div>

 {/* ─── ALERT BANNER ─── */}
 {alerts.length > 0 && (
 <div className="shrink-0 mx-4 my-2 border border-red-500/40 bg-red-500/5 px-3 py-2 space-y-1">
 {alerts.slice(0, 3).map((a, i) => {
 const alert = isSquawkAlert(a.squawk);
 return (
 <div key={i} className="flex items-center gap-3 text-[9px]">
 <div className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"style={{ background: alert.color }} />
 <span className="font-bold"style={{ color: alert.color }}>{alert.label}</span>
 <span className="text-white/60">{a.callsign || a.id}</span>
 <span className="text-white/30 ml-auto">SQK {a.squawk}</span>
 </div>
 );
 })}
 {alerts.length > 3 && (
 <div className="text-[7px] text-red-400/60 tracking-widest">+{alerts.length - 3} MORE ALERTS</div>
 )}
 </div>
 )}

 {/* ─── FILTER + SEARCH ─── */}
 <div className="shrink-0 px-4 py-2 flex items-center gap-2 border-b border-white/5">
 <div className="relative flex-1">
 <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20"/>
 <input
 type="text"
 placeholder="Search callsign or ICAO..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full bg-black/40 border border-white/5 pl-6 pr-3 py-1.5 text-[9px] text-white placeholder:text-white/15 focus:outline-none focus:border-primary/30 font-mono"
 />
 </div>
 <div className="flex gap-1">
 {['ALL', 'ALERT', 'HIGH'].map(m => (
 <button key={m} onClick={() => setFilterMode(m)}
 className={`px-2 py-1 text-[6px] font-bold tracking-widest border transition-all ${filterMode === m ? 'bg-primary/15 border-primary/40 text-primary' : 'border-white/5 text-white/25 hover:text-white/50 hover:border-white/10'}`}>
 {m}
 </button>
 ))}
 </div>
 <div className="flex items-center gap-1 text-[7px] text-white/20">
 <Filter size={8} />
 <span>{filtered.length}</span>
 </div>
 </div>

 {/* ─── TABLE HEADER ─── */}
 <div className="shrink-0 px-4 py-1.5 grid grid-cols-12 gap-1 border-b border-white/5 bg-white/[0.02]">
 {[
 { label: 'CALLSIGN', key: 'callsign', cols: 'col-span-3' },
 { label: 'ALT', key: 'alt', cols: 'col-span-2 text-right' },
 { label: 'SPD', key: 'vel', cols: 'col-span-2 text-right' },
 { label: 'HDG', key: 'heading', cols: 'col-span-2 text-right' },
 { label: 'SQUAWK', key: null, cols: 'col-span-3 text-right' },
 ].map(col => (
 <button key={col.label}
 onClick={() => col.key && toggleSort(col.key)}
 className={`${col.cols} text-[7px] font-bold tracking-widest uppercase text-white/25 hover:text-white/50 transition-colors text-left`}>
 {col.label}<SortIcon k={col.key} />
 </button>
 ))}
 </div>

 {/* ─── FLIGHT LIST ─── */}
 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {filtered.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
 <Plane size={24} className="opacity-20"/>
 <div className="text-[9px] tracking-widest uppercase">No aircraft matching filter</div>
 </div>
 ) : (
 <div className="divide-y divide-white/[0.03]">
 {filtered.map((ac, i) => {
 const alert = isSquawkAlert(ac.squawk);
 const color = alert ? alert.color : altColor(ac.alt);
 const isSelected = selected === ac.id;

 return (
 <div key={ac.id || i}
 onClick={() => setSelected(isSelected ? null : ac.id)}
 className={`px-4 py-2 grid grid-cols-12 gap-1 items-center cursor-pointer transition-all group ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-white/[0.02] border-l-2 border-transparent'} ${alert ? 'bg-red-500/5' : ''}`}>

 {/* Callsign */}
 <div className="col-span-3 flex items-center gap-2 min-w-0">
 <svg width="10"height="10"viewBox="0 0 24 24"fill={color}
 style={{ transform: `rotate(${ac.heading || 0}deg)`, flexShrink: 0 }}>
 <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
 </svg>
 <div className="min-w-0">
 <div className="text-[9px] font-bold truncate"style={{ color }}>
 {ac.callsign || ac.id || '—'}
 </div>
 <div className="text-[6px] text-white/20 font-mono">{(ac.id || '').toUpperCase()}</div>
 </div>
 </div>

 {/* Altitude */}
 <div className="col-span-2 text-right">
 <span className="text-[9px] font-mono"style={{ color }}>
 {fmtAlt(ac.alt)}
 </span>
 </div>

 {/* Speed */}
 <div className="col-span-2 text-right">
 <span className="text-[9px] font-mono text-white/50">{fmtSpd(ac.vel)}</span>
 </div>

 {/* Heading */}
 <div className="col-span-2 text-right">
 <span className="text-[9px] font-mono text-white/40">{fmtHeading(ac.heading)}</span>
 </div>

 {/* Squawk */}
 <div className="col-span-3 text-right">
 {alert ? (
 <span className="text-[7px] font-bold px-1.5 py-0.5 border animate-pulse"
 style={{ color: alert.color, borderColor: alert.color + '50', background: alert.color + '15' }}>
 {alert.label}
 </span>
 ) : ac.squawk ? (
 <span className="text-[7px] font-mono text-white/20">{ac.squawk}</span>
 ) : (
 <span className="text-[7px] text-white/10">—</span>
 )}
 </div>

 {/* Expanded detail row */}
 {isSelected && (
 <div className="col-span-12 mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
 <div className="grid grid-cols-3 gap-3">
 {[
 { label: 'ICAO HEX', val: (ac.id || '').toUpperCase() },
 { label: 'ALTITUDE', val: ac.alt ? `${Math.round(ac.alt).toLocaleString()} m` : 'GND' },
 { label: 'GND SPEED', val: ac.vel ? `${Math.round(ac.vel * 3.6)} km/h` : '—' },
 { label: 'HEADING', val: ac.heading !== null ? `${Math.round(ac.heading)}°` : '—' },
 { label: 'VERT RATE', val: ac.vert_rate ? `${ac.vert_rate > 0 ? '↑' : '↓'} ${Math.abs(Math.round(ac.vert_rate))} ft/min` : '—' },
 { label: 'SQUAWK', val: ac.squawk || '—' },
 ].map(d => (
 <div key={d.label}>
 <div className="text-[6px] text-white/20 tracking-widest">{d.label}</div>
 <div className="text-[9px] text-white/70 font-mono mt-0.5">{d.val}</div>
 </div>
 ))}
 </div>
 <div className="flex justify-end mt-1">
 <button 
 onClick={(e) => {
 e.stopPropagation();
 if (!activeOperationId) return addNotification('SELECT AN ACTIVE OPERATION IN LINK ANALYSIS FIRST', 'WARNING');
 addNodeToOperation(activeOperationId, {
 id: `FLIGHT-${ac.id}`,
 name: `${ac.callsign || ac.id} [${ac.squawk || 'NO SQUAWK'}]`,
 type: 'VESSEL',
 desc: `Alt: ${ac.alt}m. Spd: ${ac.vel}m/s.`
 });
 addNotification(`AIRCRAFT ${ac.callsign || ac.id} ADDED TO OPERATION`, 'SUCCESS');
 }}
 className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 transition-colors cursor-pointer text-[8px] font-bold tracking-widest uppercase"
 >
 <Target size={10} /> ADD TO OP
 </button>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* ─── FOOTER ─── */}
 <div className="shrink-0 px-4 py-1.5 border-t border-white/5 bg-black/30 flex items-center justify-between">
 <div className="flex items-center gap-3 text-[7px] text-white/20">
 <span>SRC: ADSB.LOL</span>
 <span className="text-white/10">|</span>
 <div className="flex items-center gap-1.5">
 {[
 { c: '#6b7280', l: 'GND' },
 { c: '#ef4444', l: '<10k' },
 { c: '#f97316', l: '10-25k' },
 { c: '#eab308', l: '25-35k' },
 { c: '#22c55e', l: '>35k' },
 ].map(({ c, l }) => (
 <span key={l} className="flex items-center gap-0.5">
 <span className="w-1.5 h-1.5 rounded-full inline-block"style={{ background: c }} />
 <span>{l}</span>
 </span>
 ))}
 </div>
 </div>
 <div className="text-[6px] text-white/15 tracking-widest">
 AUTO-REFRESH {REFRESH_SEC}s · SHOWING {filtered.length}/{total}
 </div>
 </div>
 </div>
 );
};

export default React.memo(FlightTracking);
