import React, { useState } from 'react';
import { CloudRain, Search, Activity, Wind, Droplets } from 'lucide-react';
import useStore from '../store';
import GPSInterference from './GPSInterference';

export const AtmosphericIntelModule = () => {
 const { weatherData, searchLocation } = useStore();
 const [query, setQuery] = useState('');

 const handleSearch = (e) => {
 if (e.key === 'Enter' && query.trim()) {
 searchLocation(query);
 setQuery('');
 }
 };
 
 return (
 <div className="p-4 space-y-5">
 {/* Search Sector Bar */}
 <div className={`relative group ${weatherData.syncing ? 'opacity-50 pointer-events-none' : ''}`}>
 <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${weatherData.syncing ? 'text-primary animate-pulse' : 'text-primary/40 group-focus-within:text-primary'}`} />
 <input 
 type="text"
 placeholder={weatherData.syncing ?"SYNCING SECTOR..." :"SEARCH SECTOR..."} 
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 onKeyDown={handleSearch}
 className="w-full bg-black/40 border border-white/10 py-2 pl-9 pr-3 text-[9px] font-bold tracking-widest text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10 uppercase"
 />
 </div>

 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 border border-primary/20 ">
 <CloudRain size={20} className={`text-primary ${weatherData.syncing ? 'animate-bounce' : ''}`} />
 </div>
 <div>
 <div className="text-sm font-bold text-white tracking-[0.2em] uppercase">{weatherData.city}</div>
 <div className="text-[9px] text-white/40 font-bold tracking-widest mt-0.5">{weatherData.condition}</div>
 </div>
 </div>
 <div className="text-right">
 <div className={`text-2xl font-bold tabular-nums leading-none ${weatherData.aqi > 150 ? 'text-red-500' : 'text-primary'}`}>
 {weatherData.aqi}
 </div>
 <div className="text-[7px] font-bold uppercase tracking-[0.3em] mt-1 text-white/20">AQI_IDX</div>
 </div>
 </div>

 <div className="flex items-center justify-between gap-4">
 <div className="flex items-baseline gap-2">
 <span className="text-5xl font-bold text-primary tabular-nums tracking-tighter">
 {weatherData.temp}
 </span>
 <span className="text-xl text-primary/40 font-bold">°C</span>
 </div>
 
 <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"/>

 <div className="text-right bg-white/[0.03] px-3 py-1.5 border border-white/5 ">
 <div className="text-[7px] text-white/30 uppercase tracking-[0.3em] font-bold mb-0.5">Feels Like</div>
 <div className="text-sm font-bold text-primary">{weatherData.feels_like}°C</div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
 <div className="bg-[#05070a] p-3">
 <div className="text-[7px] text-white/30 uppercase tracking-[0.2em] mb-1">Wind Speed</div>
 <div className="text-sm font-bold text-white tabular-nums">{weatherData.wind} <span className="text-[9px] text-white/20 font-normal ml-1">KM/H</span></div>
 </div>
 <div className="bg-[#05070a] p-3">
 <div className="text-[7px] text-white/30 uppercase tracking-[0.2em] mb-1">Humidity</div>
 <div className="text-sm font-bold text-white tabular-nums">{weatherData.humidity} <span className="text-[9px] text-white/20 font-normal ml-1">%</span></div>
 </div>
 </div>

 {/* 3-Day Forecast Strip */}
 <div className="space-y-2">
 <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">// 72H_PROJECTION</div>
 <div className="grid grid-cols-3 gap-2">
 {weatherData.forecast?.map((f, i) => (
 <div key={i} className="bg-white/[0.02] border border-white/5 p-2 flex flex-col items-center">
 <span className="text-[8px] text-white/40 font-bold mb-1">{f.day}</span>
 <span className="text-[11px] font-bold text-primary">{f.temp}°</span>
 <span className="text-[6px] text-white/20 uppercase mt-1">{f.cond}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};
