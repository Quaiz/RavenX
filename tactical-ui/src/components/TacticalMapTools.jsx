import React, { useState, useEffect } from 'react';
import { useMap, useMapEvents, Polyline, Tooltip, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Target, Activity, Clock, Navigation, ShieldAlert } from 'lucide-react';
import useStore from '../store';
import * as mgrs from 'mgrs';

// Helper to format MGRS
const getMGRS = (lat, lng) => {
  try {
    let normalizedLng = ((lng + 180) % 360);
    if (normalizedLng < 0) normalizedLng += 360;
    normalizedLng -= 180;
    const clampedLat = Math.max(-80, Math.min(84, lat));
    const raw = mgrs.forward([normalizedLng, clampedLat], 5);
    const match = raw.match(/^(\d{1,2}[A-Z])([A-Z]{2})(\d+)/);
    if (match) {
      const gzd = match[1];
      const sq = match[2];
      const num = match[3];
      const half = num.length / 2;
      const easting = num.substring(0, half);
      const northing = num.substring(half);
      return `${gzd} ${sq} ${easting} ${northing}`;
    }
    return raw;
  } catch (err) {
    return 'OUT OF GRID';
  }
};

// 1. Cursor Telemetry
export function CursorTelemetry() {
  const [pos, setPos] = useState({ lat: 0, lng: 0 });
  const map = useMapEvents({
    mousemove(e) {
      setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  // Hide on mobile screens
  if (window.innerWidth < 768) return null;

  return (
    <div className="absolute top-12 right-4 z-[2000] pointer-events-none flex flex-col gap-1 font-mono text-[9px] tracking-widest text-primary/80 bg-black/60 px-3 py-2 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,184,0,0.15)]">
      <div>LAT: {pos.lat.toFixed(6)}°</div>
      <div>LNG: {pos.lng.toFixed(6)}°</div>
      <div>MGRS: {getMGRS(pos.lat, pos.lng)}</div>
      <div>ELEV: {Math.floor(Math.random() * 50 + 10)}M (EST)</div>
    </div>
  );
}

// 2. Hex Grid Overlay (Visual Only)
export function HexGridOverlay() {
 return (
 <div className="absolute inset-0 z-[400] pointer-events-none opacity-20 mix-blend-overlay"style={{
 backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='69.282' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z' fill='none' stroke='%2322c55e' stroke-width='1' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
 backgroundSize: '40px 69.282px'
 }} />
 );
}

// 3. Tactical Rangefinder
export function TacticalRangefinder({ active }) {
 const [points, setPoints] = useState([]);
 const map = useMapEvents({
 mousedown(e) {
 if (!active) return;
  const isMobileOrTouch = window.innerWidth < 768 || (e.originalEvent && (
    e.originalEvent.pointerType === 'touch' ||
    (window.TouchEvent && e.originalEvent instanceof TouchEvent) ||
    (e.originalEvent.touches && e.originalEvent.touches.length > 0)
  ));
  const isTrigger = isMobileOrTouch || (e.originalEvent && e.originalEvent.button === 1);
  if (isTrigger) { // Middle mouse button (or tap on mobile)
  if (e.originalEvent.button === 1) e.originalEvent.preventDefault(); // Stop browser auto-scroll
 if (points.length >= 2) {
 setPoints([e.latlng]); // Reset to new starting point
 } else {
 setPoints([...points, e.latlng]);
 }
 }
 }
 });

 useEffect(() => {
 if (active) {
 map.getContainer().style.cursor = 'crosshair';
 } else {
 map.getContainer().style.cursor = '';
 setPoints([]);
 }
 }, [active, map]);

 const calculateDistance = (p1, p2) => {
 return (map.distance(p1, p2) / 1000).toFixed(2); // km
 };

 const calculateBearing = (p1, p2) => {
 const lat1 = p1.lat * Math.PI / 180;
 const lat2 = p2.lat * Math.PI / 180;
 const dlng = (p2.lng - p1.lng) * Math.PI / 180;
 const y = Math.sin(dlng) * Math.cos(lat2);
 const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlng);
 const brng = Math.atan2(y, x) * 180 / Math.PI;
 return ((brng + 360) % 360).toFixed(1);
 };

 return (
 <>
 {active && points.length > 0 && (
 <Marker position={points[0]} icon={L.divIcon({ className: 'bg-red-500 w-2 h-2 rounded-full border border-black shadow-[0_0_8px_#ef4444]', iconSize: [8,8] })} />
 )}
 
 {active && points.length === 2 && (
 <>
 <Marker position={points[1]} icon={L.divIcon({ className: 'bg-red-500 w-2 h-2 rounded-full border border-black shadow-[0_0_8px_#ef4444]', iconSize: [8,8] })} />
 <Polyline positions={points} color="#ef4444"weight={2} dashArray="5, 5">
 <Tooltip permanent direction="top"className="bg-black/80 border border-red-500/50 text-red-400 font-mono text-[9px] tracking-widest">
 DIST: {calculateDistance(points[0], points[1])}KM<br/>
 BRNG: {calculateBearing(points[0], points[1])}°
 </Tooltip>
 </Polyline>
 </>
 )}
 </>
 );
}

// 3.5 Tactical Geofence
export function TacticalGeofence({ active, onToggle }) {
 const [center, setCenter] = useState(null);
 const [radiusPoints, setRadiusPoints] = useState(null);
 const addGeofence = useStore(s => s.addGeofence);
 const geofences = useStore(state => state.geofences || []);

 const map = useMapEvents({
 mousedown(e) {
 if (!active) return;
  const isMobileOrTouch = window.innerWidth < 768 || (e.originalEvent && (
    e.originalEvent.pointerType === 'touch' ||
    (window.TouchEvent && e.originalEvent instanceof TouchEvent) ||
    (e.originalEvent.touches && e.originalEvent.touches.length > 0)
  ));
  const isTrigger = isMobileOrTouch || (e.originalEvent && e.originalEvent.button === 1);
  if (isTrigger) { // Middle click (or tap on mobile)
           if (e.originalEvent.button === 1) e.originalEvent.preventDefault();
 if (!center) {
 setCenter(e.latlng);
 } else {
 // Confirm radius
 const radiusKM = (map.distance(center, e.latlng) / 1000).toFixed(2);
 addGeofence({
 lat: center.lat,
 lng: center.lng,
 radius: parseFloat(radiusKM),
 name: `GEOFENCE-${Math.floor(Math.random() * 900) + 100}`
 });
 setCenter(null);
 setRadiusPoints(null);
 onToggle(false); // Turn off tool
 }
 }
 },
 mousemove(e) {
 if (!active || !center) return;
 setRadiusPoints(e.latlng);
 }
 });

 useEffect(() => {
 if (active) {
 map.getContainer().style.cursor = 'crosshair';
 } else {
 map.getContainer().style.cursor = '';
 setCenter(null);
 setRadiusPoints(null);
 }
 }, [active, map]);

 return (
 <>
 {/* Active Drawing */}
 {active && center && radiusPoints && (
 <>
 <Circle center={center} radius={map.distance(center, radiusPoints)} pathOptions={{ color: '#ef4444', weight: 1, dashArray: '4 4', fillOpacity: 0.1 }} />
 <Polyline positions={[center, radiusPoints]} color="#ef4444"weight={1}>
 <Tooltip permanent direction="top"className="bg-black/80 border border-red-500/50 text-red-400 font-mono text-[9px] tracking-widest">
 RADIUS: {(map.distance(center, radiusPoints) / 1000).toFixed(2)}KM<br/>
 CLICK TO SET PERIMETER
 </Tooltip>
 </Polyline>
 </>
 )}

 {/* Render existing geofences */}
 {(geofences || []).map(gf => (
 <Circle key={gf.id} center={[gf.lat, gf.lng]} radius={gf.radius * 1000} pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.05, className: 'geofence-pulse' }}>
 <Tooltip permanent direction="bottom"className="bg-transparent border-none shadow-none text-red-500 font-bold font-mono text-[9px] tracking-widest mt-2">
 [ {gf.name} ]<br/>
 ACTIVE PERIMETER
 </Tooltip>
 <Marker position={[gf.lat, gf.lng]} icon={L.divIcon({
 className: 'custom-geofence-center',
 html: `<div style="display:flex; justify-content:center; align-items:center; width:20px; height:20px; cursor:pointer;" title="Click to remove"onclick="window.dispatchEvent(new CustomEvent('remove-geofence', {detail: '${gf.id}'}))"><div style="width:6px; height:6px; background:#ef4444; border-radius:50%; box-shadow:0 0 10px #ef4444;"></div></div>`,
 iconSize: [20,20],
 iconAnchor: [10,10]
 })} />
 </Circle>
 ))}

 <style dangerouslySetInnerHTML={{__html: `
 @keyframes geofenceSpin {
 100% { stroke-dashoffset: -200; }
 }
 .geofence-pulse {
 stroke-dasharray: 10 15;
 animation: geofenceSpin 10s linear infinite;
 }
 `}} />
 </>
 );
}

// Global listener for removing geofence from DOM click
if (typeof window !== 'undefined' && !window._geofenceListenerAdded) {
 window.addEventListener('remove-geofence', (e) => {
 useStore.getState().removeGeofence(e.detail);
 });
 window._geofenceListenerAdded = true;
}

// 4. Time Machine Slider
export function TimeMachineSlider() {
 const [offset, setOffset] = useState(0); // 0 is LIVE, negative is hours in past

 useEffect(() => {
 // Apply grayscale to the map container to simulate past data
 const mapEl = document.querySelector('.leaflet-container');
 if (mapEl) {
 if (offset < 0) {
 mapEl.style.filter = `grayscale(${Math.min(Math.abs(offset) * 2, 80)}%) sepia(20%) hue-rotate(-15deg)`;
 } else {
 mapEl.style.filter = 'none';
 }
 }
 }, [offset]);

 const displayTime = new Date(Date.now() + offset * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19) + ' Z';

 return (
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2000] flex flex-col items-center w-[90%] md:w-[600px] bg-black/80 backdrop-blur-md border border-white/10 p-4 shadow-2xl">
 <div className="flex items-center justify-between w-full mb-3">
 <div className="flex items-center gap-2">
 <Clock size={12} className={offset === 0 ? 'text-primary' : 'text-red-400'} />
 <span className={`text-[10px] font-bold tracking-widest uppercase ${offset === 0 ? 'text-primary' : 'text-red-400'}`}>
 {offset === 0 ? 'LIVE TELEMETRY' : 'HISTORICAL PLAYBACK'}
 </span>
 </div>
 <div className="font-mono text-[11px] font-bold text-white tracking-widest">{displayTime}</div>
 </div>
 
 <div className="relative w-full flex items-center">
 <input 
 type="range"
 min="-48"
 max="0"
 value={offset} 
 onChange={(e) => setOffset(parseInt(e.target.value))}
 className="w-full h-1 bg-white/20 appearance-none cursor-pointer outline-none slider-thumb-primary"
 style={{
 background: `linear-gradient(to right, rgba(255,184,0,0.5) ${((offset + 48) / 48) * 100}%, rgba(255,255,255,0.1) ${((offset + 48) / 48) * 100}%)`
 }}
 />
 </div>
 <div className="flex justify-between w-full mt-2 text-[7px] text-white/30 font-bold tracking-widest uppercase">
 <span>-48 HOURS</span>
 <span>-24 HOURS</span>
 <span>LIVE</span>
 </div>
 <style dangerouslySetInnerHTML={{__html: `
 input[type=range].slider-thumb-primary::-webkit-slider-thumb {
 appearance: none;
 width: 12px;
 height: 12px;
 background: #ffb800;
 border-radius: 50%;
 cursor: pointer;
 box-shadow: 0 0 10px rgba(255,184,0,0.5);
 }
 `}} />
 </div>
 );
}

// 5. PiP Mini Map (Visual overlay for aesthetic)
export function PiPMiniMap() {
 if (window.innerWidth < 1024) return null; // Hide on smaller screens
 
 return (
 <div className="absolute bottom-6 right-6 z-[2000] w-64 h-48 bg-black/90 border border-white/20 shadow-2xl flex flex-col overflow-hidden group">
 <div className="h-6 bg-white/5 border-b border-white/10 flex items-center px-2 gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
 <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-white/60">TARGET LOCK // UAV CAM</span>
 </div>
 <div className="flex-1 relative bg-[#0f172a] overflow-hidden">
 {/* Simulate satellite view with CSS filter and grid */}
 <div className="absolute inset-0 bg-[url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/456/800')] bg-cover bg-center opacity-40 mix-blend-screen scale-150 group-hover:scale-100 transition-transform duration-[10s]" />
 
 <div className="absolute inset-0 border-[0.5px] border-white/5"style={{ background: 'linear-gradient(rgba(0,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.03) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
 
 {/* Crosshair */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-red-500/50 rounded-full flex items-center justify-center">
 <div className="w-1 h-1 bg-red-500 rounded-full"/>
 <div className="absolute top-[-10px] w-px h-6 bg-red-500/50"/>
 <div className="absolute bottom-[-10px] w-px h-6 bg-red-500/50"/>
 <div className="absolute left-[-10px] w-6 h-px bg-red-500/50"/>
 <div className="absolute right-[-10px] w-6 h-px bg-red-500/50"/>
 </div>
 
 {/* Telemetry data */}
 <div className="absolute bottom-2 left-2 flex flex-col gap-0.5 text-[6px] font-mono text-white/50">
 <span>ALT: 12,500FT</span>
 <span>SPD: 0.85M</span>
 <span>FLIR: ACTIVE</span>
 </div>
 </div>
 </div>
 );
}

