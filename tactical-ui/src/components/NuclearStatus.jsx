import React, { useState, useEffect, useRef } from 'react';
import { 
 PieChart, Pie, Cell, 
 BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList,
 AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Loader2, Activity, ShieldAlert, Radio } from 'lucide-react';

const COLORS = {
 operational: '#06b6d4', // Cyan
 construction: '#f59e0b', // Amber
 decommissioned: '#4b5563' // Gray
};

const CustomTooltip = ({ active, payload }) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-[#0c0f14]/90 border border-white/10 p-2 backdrop-blur-md">
 <p className="text-[10px] text-white/70 font-mono tracking-widest uppercase">{payload[0].name || payload[0].payload.date}</p>
 <p className="text-[12px] font-bold text-primary font-mono mt-1">
 {payload[0].value.toLocaleString()} {payload[0].payload.capacity ? 'MWe' : ''}
 </p>
 </div>
 );
 }
 return null;
};

const CustomBarLabel = (props) => {
 const { x, y, width, height, value } = props;
 return (
 <text 
 x={x + width + 5} 
 y={y + height / 2 + 1} 
 fill="#06b6d4"
 fontSize={9}
 fontFamily="monospace"
 alignmentBaseline="middle"
 style={{ textShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
 >
 {value.toLocaleString()}
 </text>
 );
};

const RadiationSensor = () => {
 const [radiation, setRadiation] = useState('0.14');
 const [radBlink, setRadBlink] = useState(false);

 useEffect(() => {
  const fetchRadiation = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/radiation');
      const data = await res.json();
      if (data.nSv_h) {
          setRadiation(data.nSv_h.toFixed(2));
          setRadBlink(true);
          setTimeout(() => setRadBlink(false), 200);
      }
    } catch(err) {}
  };
  fetchRadiation();
  const radInterval = setInterval(fetchRadiation, 60000);
  return () => clearInterval(radInterval);
  }, []);

 return (
 <div className="flex items-center gap-3 border border-white/10 bg-black/50 px-3 py-1 ">
 <Activity size={12} className={`${radBlink ? 'text-red-500 scale-125' : 'text-primary'} transition-all duration-100`} />
 <div className="flex flex-col">
 <span className="text-[6px] text-white/40 tracking-widest leading-none">RADIATION LEVEL</span>
 <span className={`text-[11px] font-bold tracking-wider leading-none mt-1 transition-colors duration-100 ${radBlink ? 'text-red-500' : 'text-white'}`}>
 {radiation} <span className="text-[8px] text-white/40 font-normal">nSv/h</span>
 </span>
 </div>
 </div>
 );
};

const NuclearStatus = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 
 const logContainerRef = useRef(null);

 useEffect(() => {
 let isMounted = true;
 const fetchData = async () => {
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/nuclear');
 if (!res.ok) throw new Error('Failed to fetch nuclear intel');
 const json = await res.json();
 
 if (isMounted) {
 setData(json);
 setLoading(false);
 }
 } catch (err) {
 if (isMounted) {
 setError(err.message);
 setLoading(false);
 }
 }
 };
 fetchData();

 // Auto-refresh every 5 minutes
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 300000);
 return () => {
 isMounted = false;
 clearInterval(interval);
 };
 }, []);

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] font-mono">
 <Loader2 size={32} className="text-primary mb-4 animate-spin"/>
 <div className="text-[10px] font-bold text-primary tracking-[0.3em]">ESTABLISHING SECURE CONNECTION...</div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] font-mono">
 <ShieldAlert size={32} className="text-red-500 mb-4 animate-pulse"/>
 <div className="text-[10px] font-bold text-red-500 tracking-[0.3em]">CONNECTION INTERCEPTED OR FAILED</div>
 <div className="text-[8px] text-white/50 tracking-widest mt-2">{error.toUpperCase()}</div>
 </div>
 );
 }

 // Format data for Recharts
 const pieData = [
 { name: 'OPERATIONAL', value: data.status.operational, color: COLORS.operational },
 { name: 'CONSTRUCTION', value: data.status.construction, color: COLORS.construction },
 { name: 'DECOMMISSIONED', value: data.status.decommissioned, color: COLORS.decommissioned },
 ];

 return (
 <div className="w-full h-full bg-[#0d1117] font-mono text-white p-4 flex flex-col gap-4 overflow-hidden">
 
 {/* HEADER */}
 <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
 <div className="flex items-center gap-3">
 <Radio size={16} className="text-cyan-400 animate-pulse"/>
 <span className="text-[12px] font-bold tracking-[0.3em] text-cyan-400">GLOBAL NUCLEAR GRID</span>
 </div>
 
 {/* Radiation Sensor Ping */}
 <RadiationSensor />
 </div>

 {/* BENTO GRID */}
 <div className="flex flex-col md:grid md:grid-cols-12 md:grid-rows-2 gap-4 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-4 md:pb-0 custom-scrollbar">
 
 {/* AREA 1: GLOBAL REACTOR GRID (Donut & Bar) */}
 <div className="md:col-span-7 md:row-span-1 border border-white/10 bg-[#12161c]/50 p-4 flex flex-col sm:flex-row gap-4 relative overflow-hidden min-h-[300px] md:min-h-0 shrink-0">
 <div className="absolute top-2 left-2 text-[8px] font-bold text-white/30 tracking-widest">AREA 1 // REACTOR GRID</div>
 
 {/* Donut Chart */}
 <div className="w-full max-w-[160px] mx-auto sm:max-w-none sm:w-1/3 aspect-square relative shrink-0 mt-4 sm:mt-0">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieData}
 innerRadius="60%"
 outerRadius="80%"
 paddingAngle={5}
 dataKey="value"
 stroke="none"
 isAnimationActive={false}
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <RechartsTooltip content={<CustomTooltip />} />
 </PieChart>
 </ResponsiveContainer>
 
 {/* Center Label */}
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="text-xl font-bold text-white tracking-widest">{data.status.total}</span>
 <span className="text-[7px] text-white/40 tracking-widest mt-1">REACTORS</span>
 </div>
 </div>

 {/* Bar Chart (Top 5) */}
 <div className="flex-1 h-[150px] sm:h-full pt-4 min-w-0">
 <div className="text-[9px] text-primary/70 tracking-widest mb-2 border-b border-white/5 pb-1 uppercase truncate">TOP 5 CAPACITY (MWe)</div>
 <ResponsiveContainer width="100%" height="90%">
 <BarChart data={data.top_5} layout="vertical"margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
 <XAxis type="number"hide domain={[0, 'dataMax + 10000']} />
 <YAxis 
 dataKey="country"
 type="category"
 axisLine={false} 
 tickLine={false} 
 tick={{ fill: '#8b949e', fontSize: 8, fontFamily: 'monospace' }} 
 width={60}
 interval={0}
 tickFormatter={(val) => val === 'United States' ? 'USA' : val === 'United Kingdom' ? 'UK' : val === 'South Korea' ? 'KOREA' : val}
 />
 <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
 <Bar dataKey="capacity"fill="#06b6d4"barSize={4} radius={[0, 4, 4, 0]} isAnimationActive={false} label={<CustomBarLabel />}>
 {data.top_5.map((entry, index) => (
 <Cell key={`cell-${index}`} fill="#06b6d4"/>
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* AREA 2: URANIUM RESOURCE TRACKING */}
 <div className="md:col-span-5 md:row-span-1 border border-white/10 bg-[#12161c]/50 p-4 relative overflow-hidden min-h-[200px] md:min-h-0 shrink-0">
 <div className="absolute top-2 left-2 text-[8px] font-bold text-white/30 tracking-widest">AREA 2 // U3O8 TRACKER</div>
 <div className="absolute top-2 right-2 text-[9px] font-bold text-amber-500 tracking-widest bg-amber-500/10 px-2 py-0.5 ">URA</div>
 
 <div className="w-full h-full pt-6">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data.uranium_history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorUranium"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%" stopColor="#f59e0b"stopOpacity={0.5}/>
 <stop offset="95%" stopColor="#f59e0b"stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3"stroke="#ffffff10"vertical={false} />
 <XAxis dataKey="date"hide />
 <YAxis domain={['auto', 'auto']} tick={{ fill: '#8b949e', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
 <RechartsTooltip content={<CustomTooltip />} />
 <Area type="monotone"dataKey="price"stroke="#f59e0b"strokeWidth={2} fillOpacity={1} fill="url(#colorUranium)" isAnimationActive={false} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* AREA 3: REAL-TIME INTEL FEED */}
 <div className="md:col-span-12 md:row-span-1 border border-white/10 bg-[#0c0f14] p-4 relative overflow-hidden flex flex-col min-h-[200px] md:min-h-0 shrink-0">
 <div className="absolute top-2 left-2 text-[8px] font-bold text-white/30 tracking-widest">AREA 3 // SIGINT TERMINAL</div>
 <div className="absolute top-2 right-2 flex gap-1">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75"/>
 </div>
 
 <div className="mt-4 flex-1 overflow-y-auto no-scrollbar"ref={logContainerRef}>
 <div className="space-y-2 pb-4">
 {data.intel_feed.map((feed, i) => (
 <div key={i} className="text-[10px] flex gap-3 group">
 <span className="text-white/30 shrink-0">[{feed.time}]</span>
 <span className="text-cyan-400 shrink-0">INFO:</span>
 <a href={feed.link} target="_blank"rel="noopener noreferrer"className="text-white/80 hover:text-white truncate transition-colors">
 {feed.title.toUpperCase()}
 </a>
 </div>
 ))}
 </div>
 </div>
 
 {/* Terminal Gradient overlay for smooth fade out at bottom */}
 <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0c0f14] to-transparent pointer-events-none"/>
 </div>

 </div>
 </div>
 );
};

export default React.memo(NuclearStatus);
