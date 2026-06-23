import React, { useState, useEffect } from 'react';
import { Wind, Skull, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

const CITIES = [
 { name: 'BEIJING, CN', cc: 'cn', lat: 39.9, lon: 116.4 },
 { name: 'NEW DELHI, IN', cc: 'in', lat: 28.6, lon: 77.2 },
 { name: 'NEW YORK, US', cc: 'us', lat: 40.7, lon: -74.0 },
 { name: 'LONDON, GB', cc: 'gb', lat: 51.5, lon: -0.1 },
 { name: 'TOKYO, JP', cc: 'jp', lat: 35.6, lon: 139.6 },
 { name: 'MOSCOW, RU', cc: 'ru', lat: 55.7, lon: 37.6 },
 { name: 'SEOUL, KR', cc: 'kr', lat: 37.5, lon: 126.9 },
 { name: 'SINGAPORE, SG', cc: 'sg', lat: 1.3, lon: 103.8 },
 { name: 'MANILA, PH', cc: 'ph', lat: 14.5, lon: 121.0 },
 { name: 'SAO PAULO, BR', cc: 'br', lat: -23.5, lon: -46.6 },
 { name: 'SYDNEY, AU', cc: 'au', lat: -33.8, lon: 151.2 },
 { name: 'PARIS, FR', cc: 'fr', lat: 48.8, lon: 2.3 },
 { name: 'ROME, IT', cc: 'it', lat: 41.9, lon: 12.5 },
 { name: 'HANOI, VN', cc: 'vn', lat: 21.0, lon: 105.8 },
 { name: 'TEHRAN, IR', cc: 'ir', lat: 35.7, lon: 51.4 },
 { name: 'CAIRO, EG', cc: 'eg', lat: 30.0, lon: 31.2 },
 { name: 'KYIV, UA', cc: 'ua', lat: 50.4, lon: 30.5 },
 { name: 'BERLIN, DE', cc: 'de', lat: 52.5, lon: 13.4 }
];

const AirQuality = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [visibleCount, setVisibleCount] = useState(30);

 const fetchData = async () => {
 if (document.hidden) return; // Tactical sleep
 setLoading(true);
 try {
 const lats = CITIES.map(c => c.lat).join(',');
 const lons = CITIES.map(c => c.lon).join(',');
 const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide`);
 const json = await res.json();
 
 let processed = [];
 if (Array.isArray(json)) {
 processed = json.map((loc, idx) => ({
 country: CITIES[idx].name,
 cc: CITIES[idx].cc,
 aqi: loc.current.us_aqi,
 pm2_5: loc.current.pm2_5,
 pm10: loc.current.pm10,
 co: loc.current.carbon_monoxide,
 no2: loc.current.nitrogen_dioxide
 }));
 } else if (json.current) {
 processed = [{
 country: CITIES[0].name,
 cc: CITIES[0].cc,
 aqi: json.current.us_aqi,
 pm2_5: json.current.pm2_5,
 pm10: json.current.pm10,
 co: json.current.carbon_monoxide,
 no2: json.current.nitrogen_dioxide
 }];
 }
 
 processed.sort((a, b) => b.aqi - a.aqi);
 setData({ count: processed.length, data: processed });
 } catch (err) {
 console.error("AQI fetch error:", err);
 }
 setLoading(false);
 };

 useEffect(() => {
 fetchData();
 const interval = setInterval(() => { if (!document.hidden) fetchData(); }, 600000); // 10 mins
 return () => clearInterval(interval);
 }, []);

 const getAQILevel = (aqi) => {
 if (aqi > 300) return { label: 'HAZARDOUS', color: 'text-purple-500', bg: 'bg-purple-500/20', border: 'border-purple-500/50', icon: Skull, pulse: true };
 if (aqi > 200) return { label: 'VERY UNHEALTHY', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: AlertTriangle, pulse: true };
 if (aqi > 150) return { label: 'UNHEALTHY', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50', icon: AlertTriangle, pulse: false };
 if (aqi > 100) return { label: 'MODERATE', color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', icon: Wind, pulse: false };
 return { label: 'NOMINAL', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2, pulse: false };
 };

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-3">
 <Wind size={18} className="text-purple-500"/>
 <div>
 <div className="text-[12px] font-bold tracking-widest text-purple-500 uppercase">GLOBAL AIR QUALITY (AQI)</div>
 <div className="text-[8px] text-white/40 uppercase">REAL-TIME ATMOSPHERIC POLLUTANTS & HAZMAT TRACKER</div>
 </div>
 </div>
 {data && (
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-white/50 font-mono hidden sm:block">MONITORING {data.count} NATIONS</span>
 <button onClick={fetchData} className="p-1 hover:bg-white/10 ">
 <Activity size={14} className={`text-purple-500 ${loading ? 'animate-spin' : ''}`} />
 </button>
 </div>
 )}
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative">
 {loading && !data ? (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
 <Activity size={32} className="text-purple-500 animate-spin mb-4"/>
 <span className="text-[10px] font-bold tracking-widest text-purple-500 uppercase animate-pulse">
 Aggregating Global AQI Telemetry...
 </span>
 </div>
 ) : data && data.data ? (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
 {data.data.slice(0, visibleCount).map((loc, idx) => {
 const meta = getAQILevel(loc.aqi);
 const Icon = meta.icon;
 return (
 <div key={loc.cc} className={`p-3 border ${meta.border} ${meta.bg} relative overflow-hidden group`}>
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-2">
 <img 
 src={`https://flagcdn.com/w20/${loc.cc.toLowerCase()}.png`} 
 alt={loc.cc} 
 className="w-4 h-3 opacity-80"
 />
 <span className="text-[12px] font-bold uppercase tracking-widest truncate max-w-[150px]">
 {loc.country}
 </span>
 </div>
 <div className="flex flex-col items-end">
 <span className="text-[8px] text-white/40 font-mono mb-0.5">US AQI</span>
 <span className={`text-[18px] font-bold font-mono leading-none ${meta.color}`}>
 {loc.aqi}
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between mb-3">
 <div className={`flex items-center gap-1.5 px-2 py-0.5 border ${meta.border} bg-black/40`}>
 <Icon size={10} className={meta.color} />
 <span className={`text-[8px] font-bold tracking-widest uppercase ${meta.color}`}>
 {meta.label}
 </span>
 </div>
 </div>

 {/* Chemical Breakdown */}
 <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
 <div className="flex justify-between items-end bg-black/20 p-1.5 border border-white/5">
 <span className="text-[8px] text-white/40 uppercase">PM2.5</span>
 <span className={`text-[10px] font-mono ${loc.pm2_5 > 50 ? 'text-red-400' : 'text-white/70'}`}>
 {loc.pm2_5} <span className="text-[7px]">µg</span>
 </span>
 </div>
 <div className="flex justify-between items-end bg-black/20 p-1.5 border border-white/5">
 <span className="text-[8px] text-white/40 uppercase">PM10</span>
 <span className={`text-[10px] font-mono ${loc.pm10 > 100 ? 'text-orange-400' : 'text-white/70'}`}>
 {loc.pm10} <span className="text-[7px]">µg</span>
 </span>
 </div>
 <div className="flex justify-between items-end bg-black/20 p-1.5 border border-white/5">
 <span className="text-[8px] text-white/40 uppercase">CO</span>
 <span className={`text-[10px] font-mono ${loc.co > 1000 ? 'text-purple-400' : 'text-white/70'}`}>
 {loc.co} <span className="text-[7px]">µg</span>
 </span>
 </div>
 <div className="flex justify-between items-end bg-black/20 p-1.5 border border-white/5">
 <span className="text-[8px] text-white/40 uppercase">NO2</span>
 <span className={`text-[10px] font-mono ${loc.no2 > 100 ? 'text-red-400' : 'text-white/70'}`}>
 {loc.no2} <span className="text-[7px]">µg</span>
 </span>
 </div>
 </div>

 {meta.pulse && (
 <div className="absolute top-0 left-0 w-full h-full border-2 border-red-500/20 animate-pulse pointer-events-none"/>
 )}
 </div>
 );
 })}
 </div>
 {visibleCount < data.data.length && (
 <button 
 onClick={() => setVisibleCount(prev => Math.min(prev + 30, data.data.length))}
 className="w-full mt-4 p-2 border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-widest uppercase transition-colors"
 >
 Load More Nodes ({data.data.length - visibleCount} remaining)
 </button>
 )}
 </>
 ) : null}
 </div>
 </div>
 );
};

export default AirQuality;
