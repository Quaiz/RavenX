import React, { useState, useEffect } from 'react';
import { Sun, Zap, Radio, RefreshCcw, AlertTriangle, Waves, Wind } from 'lucide-react';

const KP_THRESHOLDS = [
 { min: 8, label: 'EXTREME (G5)', color: '#7f1d1d', bg: 'bg-red-950/60', border: 'border-red-500' },
 { min: 7, label: 'SEVERE (G4)', color: '#b91c1c', bg: 'bg-red-900/40', border: 'border-red-500' },
 { min: 6, label: 'STRONG (G3)', color: '#dc2626', bg: 'bg-red-900/20', border: 'border-red-400' },
 { min: 5, label: 'MODERATE (G2)',color: '#f97316', bg: 'bg-orange-900/20', border: 'border-orange-400' },
 { min: 4, label: 'MINOR (G1)', color: '#fbbf24', bg: 'bg-yellow-900/20', border: 'border-yellow-400' },
 { min: 2, label: 'UNSETTLED', color: '#a3e635', bg: 'bg-lime-900/10', border: 'border-lime-500/40' },
 { min: 0, label: 'QUIET', color: '#4ade80', bg: 'bg-green-900/10', border: 'border-green-500/30' },
];

const FLARE_META = {
 X: { color: '#ef4444', glow: '#ef444480', label: 'EXTREME', desc: '≥ 1×10⁻⁴ W/m²' },
 M: { color: '#f97316', glow: '#f9731680', label: 'HIGH', desc: '1×10⁻⁵ to 10⁻⁴' },
 C: { color: '#facc15', glow: '#facc1580', label: 'MODERATE',desc: '1×10⁻⁶ to 10⁻⁵' },
 B: { color: '#4ade80', glow: '#4ade8080', label: 'LOW', desc: '< 1×10⁻⁶ W/m²' },
};

function getKpMeta(kp) {
 return KP_THRESHOLDS.find(t => kp >= t.min) || KP_THRESHOLDS[KP_THRESHOLDS.length - 1];
}

// Mini SVG Line Chart for Kp history
const KpChart = ({ history }) => {
 if (!history || history.length < 2) return null;
 const W = 100, H = 32;
 const vals = history.map(h => Number(h.value) || 0);
 const max = 9;
 const pts = vals.map((v, i) => {
 const x = (i / (vals.length - 1)) * W;
 const y = H - (v / max) * H;
 return `${x},${y}`;
 }).join(' ');

 // Fill polygon
 const fill = `0,${H} ${pts} ${W},${H}`;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full"style={{ height: 32 }} preserveAspectRatio="none">
 {/* Storm threshold lines */}
 {[5, 7].map(threshold => {
 const y = H - (threshold / max) * H;
 return (
 <line key={threshold} x1="0"y1={y} x2={W} y2={y}
 stroke={threshold === 7 ? '#ef4444' : '#f97316'}
 strokeWidth="0.5"strokeDasharray="2,2"opacity="0.5"/>
 );
 })}
 <polygon points={fill} fill="rgba(250,204,21,0.08)" />
 <polyline points={pts} fill="none"stroke="#facc15"strokeWidth="1.2"strokeLinejoin="round"/>
 {/* Latest dot */}
 {vals.length > 0 && (() => {
 const lx = W;
 const ly = H - (vals[vals.length - 1] / max) * H;
 return <circle cx={lx} cy={ly} r="2"fill="#facc15"/>;
 })()}
 </svg>
 );
};

const SpaceWeather = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [lastUpdate, setLastUpdate] = useState(new Date());

 const fetchData = async () => {
 setLoading(true);
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/space-weather');
 const json = await res.json();
 if (json && !json.error) {
 setData(json);
 setLastUpdate(new Date());
 }
 } catch (err) {
 console.error("Failed to fetch space weather:", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 300000);
 return () => clearInterval(interval);
 }, []);

 const kpVal = Number(data?.kp?.current ?? 0);
 const kpMeta = getKpMeta(kpVal);
 const flareClass = data?.xray?.class ?? 'B';
 const flareMeta = FLARE_META[flareClass] ?? FLARE_META.B;

 // Compute Overall Threat Level
 let threatLvl = { text: 'NORMAL', bg: 'bg-green-500/20', border: 'border-green-500/50', color: 'text-green-400' };
 if (kpVal >= 7 || flareClass === 'X') {
 threatLvl = { text: 'CRITICAL', bg: 'bg-red-500/20', border: 'border-red-500/50', color: 'text-red-500', pulse: true };
 } else if (kpVal >= 5 || flareClass === 'M') {
 threatLvl = { text: 'ELEVATED', bg: 'bg-orange-500/20', border: 'border-orange-500/50', color: 'text-orange-400' };
 } else if (kpVal >= 4 || flareClass === 'C') {
 threatLvl = { text: 'WATCH', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', color: 'text-yellow-400' };
 }

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Sun size={16} className="text-yellow-400"style={{ filter: 'drop-shadow(0 0 6px #facc15)' }} />
 <div>
 <div className="text-[12px] font-bold tracking-widest text-yellow-400 uppercase">SPACE WEATHER</div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase">NOAA SWPC · NASA DONKI · Solar Monitoring</div>
 </div>
 </div>
 <span className="text-[9px] text-white/60 font-mono">SYNCED: {lastUpdate.toLocaleTimeString()}</span>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {loading && !data ? (
 <div className="flex flex-col items-center justify-center h-full">
 <RefreshCcw size={24} className="text-yellow-400 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-yellow-400 uppercase animate-pulse">
 Scanning Solar Wind...
 </span>
 </div>
 ) : (
 <div className="p-3 space-y-3">
 
 {/* ── THREAT LEVEL BANNER ── */}
 <div className={`p-2 border ${threatLvl.border} ${threatLvl.bg} flex items-center justify-between`}>
 <div className="flex items-center gap-2">
 {threatLvl.pulse && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>}
 <span className="text-[9px] font-bold tracking-widest uppercase text-white/70">GLOBAL THREAT LEVEL</span>
 </div>
 <span className={`text-[11px] font-bold tracking-widest ${threatLvl.color}`}>{threatLvl.text}</span>
 </div>

 {/* ── KP INDEX ── */}
 <div className={`p-3 border ${kpMeta.border} ${kpMeta.bg} relative overflow-hidden`}>
 {/* Pulsing glow if storm */}
 {kpVal >= 5 && (
 <div className="absolute inset-0 animate-pulse opacity-10 pointer-events-none"
 style={{ background: kpMeta.color }} />
 )}
 <div className="flex items-center justify-between mb-2">
 <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">Kp-Index · Geomagnetic Activity</span>
 <span className="text-[8px] font-mono text-white/30">{data?.kp?.time?.slice(0, 16).replace('T', ' ')}</span>
 </div>

 <div className="flex items-end gap-3 mb-3">
 <span className="text-[48px] font-bold font-mono leading-none tabular-nums"
 style={{ color: kpMeta.color, textShadow: `0 0 30px ${kpMeta.color}60` }}>
 {kpVal.toFixed(1)}
 </span>
 <div className="flex flex-col pb-1">
 <span className="text-[11px] font-bold"style={{ color: kpMeta.color }}>{kpMeta.label}</span>
 <span className="text-[8px] text-white/40">Scale: 0 (quiet) → 9 (extreme)</span>
 </div>
 </div>

 {/* Segmented bar */}
 <div className="flex gap-0.5 mb-1">
 {Array.from({ length: 9 }, (_, i) => {
 const segVal = i + 1;
 const active = kpVal >= segVal;
 const segMeta = getKpMeta(segVal);
 return (
 <div key={i} className="flex-1 h-3 transition-all duration-500 relative"
 style={{
 background: active ? segMeta.color : 'rgba(255,255,255,0.05)',
 boxShadow: active ? `0 0 5px ${segMeta.color}80` : 'none'
 }}
 >
 <span className="absolute inset-0 flex items-center justify-center text-[5px] font-bold"
 style={{ color: active ? '#000' : 'rgba(255,255,255,0.15)' }}>{segVal}</span>
 </div>
 );
 })}
 </div>
 <div className="flex justify-between text-[7px] text-white/20 mb-3">
 <span>QUIET</span><span>G1</span><span>G2</span><span>G3</span><span>G4</span><span>G5</span>
 </div>

 {/* 24h History Chart */}
 {data?.kp?.history?.length > 0 && (
 <div>
 <div className="text-[8px] text-white/30 uppercase tracking-widest mb-1">24h Kp History</div>
 <KpChart history={data.kp.history} />
 <div className="flex justify-between text-[7px] text-white/20 mt-0.5">
 <span>-24h</span>
 <span className="text-orange-500/50">G2 threshold</span>
 <span>now</span>
 </div>
 </div>
 )}
 </div>

 {/* ── SOLAR FLARE + AURORA ── 2 cols */}
 <div className="grid grid-cols-2 gap-3">
 {/* Solar Flare */}
 <div className="p-3 border border-white/10 bg-black/60 flex flex-col gap-1">
 <div className="flex items-center justify-between">
 <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase">Solar Flare</span>
 <Zap size={11} style={{ color: flareMeta.color }} />
 </div>
 <div className="flex items-end gap-2 mt-1">
 <span className="text-[40px] font-bold font-mono leading-none"
 style={{ color: flareMeta.color, textShadow: `0 0 20px ${flareMeta.glow}` }}>
 {flareClass}
 </span>
 <span className="text-[9px] font-bold pb-1"style={{ color: flareMeta.color }}>
 {flareMeta.label}
 </span>
 </div>
 <div className="text-[8px] text-white/30">{flareMeta.desc}</div>
 <div className="text-[8px] text-white/30 font-mono">
 {data?.xray?.flux ? `${data.xray.flux.toExponential(2)} W/m²` : 'N/A'}
 </div>
 {/* Flare classes */}
 <div className="flex gap-1 mt-2">
 {['B','C','M','X'].map(cls => (
 <div key={cls} className={`flex-1 h-5 flex items-center justify-center text-[8px] font-bold transition-all`}
 style={{
 background: cls === flareClass ? FLARE_META[cls].color + '30' : 'rgba(255,255,255,0.03)',
 color: cls === flareClass ? FLARE_META[cls].color : 'rgba(255,255,255,0.2)',
 border: `1px solid ${cls === flareClass ? FLARE_META[cls].color + '50' : 'transparent'}`
 }}>
 {cls}
 </div>
 ))}
 </div>
 </div>

 {/* Aurora */}
 <div className="p-3 border border-purple-500/30 bg-purple-900/10 flex flex-col gap-1">
 <div className="flex items-center justify-between">
 <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase">Aurora</span>
 <Waves size={11} className="text-purple-400"/>
 </div>
 <div className="text-[28px] font-bold font-mono leading-none text-purple-300 mt-1"
 style={{ textShadow: '0 0 15px #c084fc60' }}>
 {data?.aurora?.min_lat ?? '—'}°N
 </div>
 <div className="text-[8px] text-purple-300/60">Min visible latitude</div>
 <div className="text-[8px] text-white/60 leading-tight mt-1">
 {data?.aurora?.label ?? '—'}
 </div>
 <div className="mt-auto pt-2 border-t border-white/5 text-[7px] text-white/20">
 Based on Kp={kpVal.toFixed(1)}
 </div>
 </div>

 {/* Solar Wind */}
 <div className="col-span-2 p-3 border border-white/10 bg-black/40 flex flex-col gap-1">
 <div className="flex items-center gap-2 mb-1">
 <Wind size={11} className="text-blue-400"/>
 <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase">Solar Wind Stream</span>
 <span className="ml-auto text-[7px] text-white/30 font-mono">1M RESOLUTION</span>
 </div>
 <div className="flex gap-4">
 <div className="flex-1">
 <div className="text-[18px] font-bold font-mono text-blue-300">
 {Math.round(data?.wind?.speed ?? 0)} <span className="text-[9px] text-white/40 font-sans">km/s</span>
 </div>
 <div className="text-[8px] text-white/40">Speed (Norm: ~400)</div>
 </div>
 <div className="flex-1">
 <div className="text-[18px] font-bold font-mono text-indigo-300">
 {(data?.wind?.density ?? 0).toFixed(1)} <span className="text-[9px] text-white/40 font-sans">p/cm³</span>
 </div>
 <div className="text-[8px] text-white/40">Density (Norm: 1-10)</div>
 </div>
 </div>
 {/* Wind visual indicator bar */}
 <div className="w-full h-1 bg-white/5 mt-1 rounded-full overflow-hidden flex">
 <div className="h-full bg-blue-500/50"style={{ width: `${Math.min(((data?.wind?.speed ?? 0) / 1000) * 100, 100)}%` }} />
 </div>
 </div>
 </div>

 {/* ── NOAA ALERTS ── */}
 {data?.alerts?.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-2">
 <AlertTriangle size={12} className="text-orange-400"/>
 <span className="text-[9px] font-bold tracking-widest text-orange-400 uppercase">NOAA SWPC Alerts</span>
 <span className="ml-auto text-[8px] text-white/20">{data.alerts.length} active</span>
 </div>
 <div className="space-y-1.5">
 {data.alerts.map((alert, i) => {
 const isCritical = alert.severity === 'CRITICAL';
 const isWarning = alert.severity === 'WARNING';
 return (
 <div key={i} className={`p-2 border relative ${
 isCritical ? 'bg-red-900/20 border-red-500/40' :
 isWarning ? 'bg-yellow-900/10 border-yellow-500/30' :
 'bg-white/5 border-white/10'
 }`}>
 <div className={`absolute left-0 top-0 bottom-0 w-1 ${
 isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-primary/40'
 }`} />
 <div className="pl-2">
 <div className="flex justify-between items-center mb-0.5">
 <span className={`text-[9px] font-bold tracking-widest ${
 isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white/40'
 }`}>{alert.code}</span>
 <span className="text-[8px] text-white/20 font-mono">
 {alert.time?.slice(0,10)}
 </span>
 </div>
 <div className="text-[10px] text-white/80 leading-tight">{alert.title}</div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* ── CME EVENTS ── */}
 {data?.cme?.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-1">
 <Radio size={12} className="text-cyan-400"/>
 <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase">Coronal Mass Ejections (7d)</span>
 <span className="ml-auto text-[8px] text-white/20">{data.cme.length} events</span>
 </div>
 {/* Legend */}
 <div className="text-[8px] text-white/30 mb-2 pl-1 border-l border-white/10">
 CME = plasma eruption from the Sun's corona. If Earth-directed, it causes geomagnetic storms within 1–3 days.
 </div>
 <div className="space-y-2">
 {data.cme.map((c, i) => (
 <div key={i} className={`p-2.5 border relative ${c.earth_directed ? 'border-red-500/50 bg-red-900/10' : 'border-cyan-500/20 bg-cyan-900/10'}`}>
 {/* Earth-directed badge */}
 {c.earth_directed && (
 <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-red-500/20 border-b border-l border-red-500/40 flex items-center gap-1">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
 <span className="text-[7px] font-bold text-red-400 tracking-widest">EARTH-DIRECTED</span>
 </div>
 )}

 <div className="text-[9px] font-mono font-bold mb-1"style={{ color: c.earth_directed ? '#f87171' : '#67e8f9' }}>
 {c.time?.replace('T', ' ') ?? '—'}
 </div>

 {/* Speed + Angle badges */}
 <div className="flex gap-2 mb-1.5">
 {c.speed != null && (
 <span className="px-1.5 py-0.5 bg-black/40 border border-white/10 text-[8px] font-mono text-white/60">
 ⚡ {Math.round(c.speed)} km/s
 </span>
 )}
 {c.half_angle != null && (
 <span className="px-1.5 py-0.5 bg-black/40 border border-white/10 text-[8px] font-mono text-white/60">
 ∠ {c.half_angle}°
 </span>
 )}
 </div>

 <div className="text-[9px] text-white/60 leading-tight mb-2">{c.note || '—'}</div>

 {/* Link to NASA DONKI */}
 <a href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/search/" target="_blank"rel="noopener noreferrer"
 className="inline-flex items-center gap-1 text-[8px] text-cyan-400/60 hover:text-cyan-300 transition-colors border-b border-dashed border-cyan-500/20">
 View on NASA DONKI →
 </a>
 </div>
 ))}
 </div>
 </div>
 )}

 </div>
 )}
 </div>
 </div>
 );
};

export default SpaceWeather;
