import React, { useState } from 'react';
import { Ship, Crosshair, Anchor, ShieldAlert, Waves, MapPin, RefreshCcw } from 'lucide-react';

const CHOKEPOINTS = [
 { id: 'red_sea', name: 'Red Sea / Bab el-Mandeb', lat: 13.6, lon: 42.8, zoom: 7, color: 'text-red-400' },
 { id: 'hormuz', name: 'Strait of Hormuz', lat: 26.5, lon: 56.2, zoom: 8, color: 'text-orange-400' },
 { id: 'south_china', name: 'South China Sea', lat: 14.0, lon: 114.0, zoom: 6, color: 'text-yellow-400' },
 { id: 'taiwan', name: 'Taiwan Strait', lat: 24.2, lon: 119.5, zoom: 7, color: 'text-cyan-400' },
 { id: 'panama', name: 'Panama Canal', lat: 9.1, lon: -79.7, zoom: 9, color: 'text-blue-400' },
 { id: 'suez', name: 'Suez Canal', lat: 30.5, lon: 32.3, zoom: 9, color: 'text-purple-400' },
];

const VesselTracking = () => {
 const [activePoint, setActivePoint] = useState(CHOKEPOINTS[0]);
 const [key, setKey] = useState(0); // Used to force iframe reload if needed

 const handleJump = (point) => {
 setActivePoint(point);
 // Vesselfinder iframe handles panning natively without reloading if src changes,
 // but React might re-render it anyway.
 };

 const iframeSrc = `https://www.vesselfinder.com/aismap?zoom=${activePoint.zoom}&lat=${activePoint.lat}&lon=${activePoint.lon}&width=100%25&height=100%25&names=false&mmsi=0&track=true&fleet=false&fleet_name=false&fleet_hide_old_positions=false&clicktoact=false&id=0&color=1&maptype=3`;

 return (
 <div className="h-full flex flex-col font-military text-white bg-black/40">
 {/* Header */}
 <div className="p-3 border-b border-white/10 bg-black/60 shrink-0 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Ship size={16} className="text-cyan-400"style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
 <div>
 <div className="text-[12px] font-bold tracking-widest text-cyan-400 uppercase">MARITIME INTELLIGENCE</div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase">Global AIS feed · Live Traffic</div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-cyan-500 font-mono flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"/>
 LIVE LINK
 </span>
 </div>
 </div>

 {/* Control Panel */}
 <div className="p-2 border-b border-white/10 bg-black/40">
 <div className="flex items-center gap-2 mb-2 px-1">
 <Crosshair size={12} className="text-white/50"/>
 <span className="text-[9px] font-bold tracking-widest uppercase text-white/50">Strategic Chokepoint Navigator</span>
 </div>
 <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
 {CHOKEPOINTS.map(pt => (
 <button
 key={pt.id}
 onClick={() => handleJump(pt)}
 className={`p-1.5 text-[8px] font-bold tracking-widest uppercase border transition-all ${
 activePoint.id === pt.id
 ? `bg-white/10 border-cyan-500 ${pt.color}`
 : 'bg-black/40 border-white/10 text-white/40 hover:bg-white/5 hover:text-white/70'
 }`}
 >
 {pt.name}
 </button>
 ))}
 </div>
 </div>

 {/* Live Map Frame */}
 <div className="flex-1 relative bg-black/90 p-1">
 {/* Decorative corner markers */}
 <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none z-10"/>
 <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none z-10"/>
 <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 pointer-events-none z-10"/>
 <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 pointer-events-none z-10"/>
 
 {/* OSD Overlay Info */}
 <div className="absolute bottom-3 left-3 bg-black/80 border border-cyan-500/30 p-2 pointer-events-none z-10 flex flex-col gap-1 backdrop-blur-sm">
 <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase">TARGET LOCK: {activePoint.name}</span>
 <span className="text-[8px] text-white/50 font-mono">LAT: {activePoint.lat.toFixed(4)} | LON: {activePoint.lon.toFixed(4)}</span>
 </div>

 <iframe
 key={key}
 title="VesselFinder Live Map"
 width="100%"
 height="100%"
 frameBorder="0"
 src={iframeSrc}
 className="w-full h-full grayscale-[50%] contrast-125 hue-rotate-180 invert"// CSS trick to make the map look more"radar-like"and tactical if the base map isn't dark enough
 style={{ 
 filter: 'grayscale(50%) contrast(120%) brightness(80%) sepia(20%) hue-rotate(180deg) invert(95%)' // Highly tactical night-vision/radar look
 }}
 />
 </div>
 </div>
 );
};

export default VesselTracking;
