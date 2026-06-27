import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CircleMarker, Marker, Tooltip, GeoJSON, TileLayer, Polyline, useMap, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
window.L = L;
import 'leaflet-terminator/leaflet-terminator.js';
import * as satellite from 'satellite.js';
import useStore from '../store';
import {
 MILITARY_BASES, GPS_INTERFERENCE, DISPLACEMENT_EVENTS, LIVE_VESSELS,
 INTERNET_OUTAGES, HAM_REPEATERS, MESHTASTIC_NODES, OIL_PIPELINES,
 US_BORDER_WAIT_TIMES, VOLCANOES, MARITIME_CHOKES, GLOBAL_PORTS,
 SHIPPING_LANES, STATIC_OSINT, GLOBAL_CITIES,
 NUCLEAR_FACILITIES, UNDERSEA_CABLES
} from '../tactical_data';

// ─── Custom Icons ─────────────────────────────────────────────────────────────

const mkDot = (color, size = 10) => new L.DivIcon({
 className: '',
 html: `<div style="width:${size}px;height:${size}px;background:${color};border:1px solid ${color}80;border-radius:50%;box-shadow:0 0 6px ${color}90;"></div>`,
 iconSize: [size, size], iconAnchor: [size / 2, size / 2],
});

const mkTriangle = (color, size = 14) => new L.DivIcon({
 className: '',
 html: `<div style="width:0;height:0;border-left:${size/2}px solid transparent;border-right:${size/2}px solid transparent;border-bottom:${size}px solid ${color};filter:drop-shadow(0 0 4px ${color});"></div>`,
 iconSize: [size, size], iconAnchor: [size / 2, size],
});

const mkPulse = (color, size = 40) => new L.DivIcon({
 className: '',
 html: `<div style="width:${size}px;height:${size}px;border-radius:50%;border:1px solid ${color};background:radial-gradient(circle, ${color}20 0%, transparent 70%);animation:pulse 2s infinite;"></div>
 <style>@keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }</style>`,
 iconSize: [size, size], iconAnchor: [size / 2, size / 2],
});

const mkShip = (color) => new L.DivIcon({
 className: '',
 html: `<div style="color:${color};font-size:12px;transform:rotate(-45deg);filter:drop-shadow(0 0 4px ${color});">⛯</div>`,
 iconSize: [12, 12], iconAnchor: [6, 6],
});

// Specific Icons
const chokeIcon = (risk) => mkDot(risk === 'HIGH' ? '#ef4444' : risk === 'MEDIUM' ? '#ffb800' : '#22c55e', 8);
const portIcon = () => mkDot('#38bdf8', 6);
const nuclearIcon = () => mkDot('#22d3ee', 6);
const baseIcon = () => mkTriangle('#a855f7', 8);
const CHOKE_ICON_HIGH = mkDot('#ef4444', 8);
const CHOKE_ICON_MED = mkDot('#ffb800', 8);
const CHOKE_ICON_LOW = mkDot('#22c55e', 8);
const PORT_ICON = mkDot('#38bdf8', 6);
const NUCLEAR_ICON = mkDot('#22d3ee', 6);
const BASE_ICON = mkTriangle('#a855f7', 8);
const VOLCANO_ICON_ERUPTING = mkTriangle('#ef4444', 10);
const VOLCANO_ICON_NORMAL = mkTriangle('#f97316', 10);
const GPS_ICON = mkPulse('#ef4444', 40);
const OSINT_ICON_HIGH = mkDot('#ef4444', 6);
const OSINT_ICON_MED = mkDot('#ffb800', 6);
const OSINT_ICON_LOW = mkDot('#22c55e', 6);
const OUTAGE_ICON = mkDot('#ef4444', 6);
const NODE_ICON = mkDot('#22c55e', 6);
const BORDER_ICON = mkDot('#eab308', 6);
const ISS_ICON = new L.DivIcon({
 className: 'iss-marker',
 html: `<div style="color:#a855f7;font-size:20px;filter:drop-shadow(0 0 8px #a855f7);">🛸</div>`,
 iconSize: [20, 20], iconAnchor: [10, 10]
});
const SAT_ICON = new L.DivIcon({
 className: 'satellite-marker-icon',
 html: `<div style="color:#38bdf8;font-size:14px;line-height:1;filter:drop-shadow(0 0 4px #38bdf8);">🛰</div>`,
 iconSize: [14, 14], iconAnchor: [7, 7]
});

const aircraftIcon = (heading) => new L.DivIcon({
 className: 'custom-aircraft-icon',
 html: `<div style="transform: rotate(${heading}deg); color: #ffb800;"><svg width="14"height="14"viewBox="0 0 24 24"fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
 iconSize: [14, 14],
 iconAnchor: [7, 7]
});

// ─── Satellite Origin Helper ────────────────────────────────────────────────────
const getSatelliteOrigin = (name) => {
 const n = (name || '').toUpperCase();
 if (n.includes('STARLINK') || n.includes('USA') || n.includes('NAVSTAR') || n.includes('GOES') || n.includes('NOAA') || n.includes('IRIDIUM')) return 'USA';
 if (n.includes('COSMOS') || n.includes('METEOR') || n.includes('GLONASS') || n.includes('RESURS')) return 'RUSSIA';
 if (n.includes('BEIDOU') || n.includes('FENGYUN') || n.includes('YAOGAN') || n.includes('GAOFEN') || n.includes('TIAN')) return 'CHINA';
 if (n.includes('GALILEO') || n.includes('METEOSAT') || n.includes('COPERNICUS') || n.includes('SENTINEL')) return 'EU';
 if (n.includes('QZS') || n.includes('HIMAWARI') || n.includes('ALOS')) return 'JAPAN';
 if (n.includes('IRNSS') || n.includes('GSAT') || n.includes('CARTOSAT')) return 'INDIA';
 if (n.includes('ISS') || n.includes('ZARYA')) return 'INTERNATIONAL';
 return 'UNKNOWN / CLASSIFIED';
};

// ─── Tooltip helper ───────────────────────────────────────────────────────────

const TacticalPopup = ({ lines, accentColor = '#22c55e' }) => {
 const title = lines[0] || 'UNKNOWN';
 const fields = lines.slice(1).map(l => {
 if (!l) return null;
 const parts = l.split(':');
 if (parts.length > 1) {
 return { label: parts[0].trim().substring(0, 10), value: parts.slice(1).join(':').trim() };
 }
 return { label: 'INFO', value: l };
 }).filter(Boolean);

 return (
 <div className="w-[280px] bg-[#05070a]/95 border border-white/10 shadow-2xl overflow-hidden flex flex-col font-mono text-[10px] pointer-events-auto">
 <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between"style={{ borderLeft: `3px solid ${accentColor}` }}>
 <span className="font-bold tracking-wider text-white/90 truncate">{title}</span>
 </div>
 <div className="p-3 flex flex-col gap-2">
 {fields.map((f, i) => (
 <div key={i} className="flex gap-4">
 <span className="text-white/40 uppercase w-[75px] shrink-0 tracking-wider">{f.label}</span>
 <span className="text-white/80"style={{ color: f.color || 'rgba(255,255,255,0.8)' }}>
 {f.value}
 </span>
 </div>
 ))}
 </div>
 </div>
 );
};

function SingleSatellite({ sat }) {
 const markerRef = useRef(null);
 const map = useMap();
 const isZooming = useRef(false);

 useEffect(() => {
 const handleZoomStart = () => { isZooming.current = true; };
 const handleZoomEnd = () => { isZooming.current = false; };
 map.on('zoomstart', handleZoomStart);
 map.on('zoomend', handleZoomEnd);
 return () => {
 map.off('zoomstart', handleZoomStart);
 map.off('zoomend', handleZoomEnd);
 };
 }, [map]);

 useEffect(() => {
 const iv = setInterval(() => {
 if (!markerRef.current || isZooming.current) return;
 try {
 const now = new Date();
 const positionAndVelocity = satellite.propagate(sat.satrec, now);
 const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(now));
 const lat = satellite.degreesLat(positionGd.latitude);
 const lon = satellite.degreesLong(positionGd.longitude);
 if (!isNaN(lat) && !isNaN(lon)) {
 markerRef.current.setLatLng([lat, lon]);
 }
 } catch (e) {}
 }, 16); // 60 FPS JS update, buttery smooth
 return () => clearInterval(iv);
 }, [sat]);

 return (
 <Marker ref={markerRef} position={[sat.lat, sat.lon]} icon={SAT_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[
 sat.name,
 `ORIGIN: ${getSatelliteOrigin(sat.name)}`,
 `NORAD ID: ${sat.satrec.satnum || 'UNKNOWN'}`,
 `ALT: ${Math.round(sat.alt)} km`,
 `VEL: ${Math.round(sat.vel)} km/h`,
 `LAT/LON: ${sat.lat.toFixed(3)}°, ${sat.lon.toFixed(3)}°`
 ]} accentColor={'#38bdf8'} />
 </Popup>
 </Marker>
 );
}

function SatelliteLayer() {
 const [satellites, setSatellites] = useState([]);

 useEffect(() => {
 let isMounted = true;
 const loadTle = async () => {
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/proxy/satellites');
 const data = await res.json();
 const text = data.tle || '';
 const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
 
 const now = new Date();
 const validSats = [];
 
 for (let i = 0; i < lines.length; i += 3) {
 if (lines[i] && lines[i+1] && lines[i+2]) {
 try {
 const satrec = satellite.twoline2satrec(lines[i+1], lines[i+2]);
 const positionAndVelocity = satellite.propagate(satrec, now);
 const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(now));
 const lat = satellite.degreesLat(positionGd.latitude);
 const lon = satellite.degreesLong(positionGd.longitude);
 
 if (!isNaN(lat) && !isNaN(lon)) {
 validSats.push({
 name: lines[i],
 satrec,
 lat,
 lon,
 alt: positionGd.height,
 vel: Math.sqrt(
 Math.pow(positionAndVelocity.velocity.x, 2) + 
 Math.pow(positionAndVelocity.velocity.y, 2) + 
 Math.pow(positionAndVelocity.velocity.z, 2)
 ) * 3600
 });
 }
 } catch (e) {}
 }
 }
 
 if (isMounted) {
 setSatellites(validSats.slice(0, 100)); // Show 100 real satellites to reduce clutter
 }
 } catch (e) {
 console.warn('Failed to fetch SatNOGS TLEs', e);
 }
 };

 loadTle();
 return () => { isMounted = false; };
 }, []);

 if (satellites.length === 0) return null;

 return (
 <>
 {satellites.map((sat, i) => (
 <SingleSatellite key={`sat-${i}-${sat.name}`} sat={sat} />
 ))}
 </>
 );
}

const DumbAircraft = React.memo(({ ac, registerMarker }) => {
 const staticIcon = useMemo(() => aircraftIcon(ac.heading), []);
 return (
 <Marker 
  ref={(el) => registerMarker(ac.id, el)} 
  position={[ac.lat, ac.lon]} 
  icon={staticIcon}
 >
  <Popup className="tactical-popup" closeButton={false}>
  <TacticalPopup lines={[
   ac.callsign || ac.id || 'UNKNOWN FLIGHT',
   `ORIGIN: ${ac.origin || 'UNKNOWN'}`,
   `ICAO: ${ac.id ? ac.id.toUpperCase() : 'N/A'}`,
   `SQUAWK: ${ac.squawk || 'NONE'}`,
   `VEL: ${Math.round((ac.vel || 0) * 3.6)} km/h`,
   `HDG: ${Math.round(ac.heading || 0)}°`,
   `ALT: ${Math.round(ac.alt || 0)} m`,
   `LAT/LON: ${ac.lat.toFixed(3)}°, ${ac.lon.toFixed(3)}°`
  ]} accentColor={'#ffb800'} />
  </Popup>
 </Marker>
 );
});

function CentralizedAircraftLayer({ aircraft }) {
// ... existing CentralizedAircraftLayer code is unmodified, wait, I need to NOT replace it but insert after it. Let's use EndLine exactly where CentralizedAircraftLayer ends.
 const map = useMap();
 const markersRef = useRef(new Map());
 const animStates = useRef(new Map());
 const isZooming = useRef(false);

 useEffect(() => {
 const handleZoomStart = () => { isZooming.current = true; };
 const handleZoomEnd = () => { isZooming.current = false; };
 map.on('zoomstart', handleZoomStart);
 map.on('zoomend', handleZoomEnd);
 return () => {
  map.off('zoomstart', handleZoomStart);
  map.off('zoomend', handleZoomEnd);
 };
 }, [map]);

 useEffect(() => {
 const now = Date.now();
 aircraft.forEach(ac => {
  const state = animStates.current.get(ac.id);
  if (state) {
  const marker = markersRef.current.get(ac.id);
  const currentLat = marker ? marker.getLatLng().lat : state.targetLat;
  const currentLon = marker ? marker.getLatLng().lng : state.targetLon;
  
  let dur = now - state.lastUpdate;
  if (dur < 2000) dur = 10000;
  if (dur > 65000) dur = 60000;
  
  animStates.current.set(ac.id, {
   startLat: currentLat,
   startLon: currentLon,
   targetLat: ac.lat,
   targetLon: ac.lon,
   startTime: now,
   duration: dur,
   lastUpdate: now
  });

  if (marker) {
   const el = marker.getElement();
   if (el) {
   const div = el.querySelector('div');
   if (div) div.style.transform = `rotate(${ac.heading || 0}deg)`;
   }
  }
  } else {
  animStates.current.set(ac.id, {
   startLat: ac.lat,
   startLon: ac.lon,
   targetLat: ac.lat,
   targetLon: ac.lon,
   startTime: now,
   duration: 10000,
   lastUpdate: now
  });
  }
 });
 }, [aircraft]);

 useEffect(() => {
 let frameId;
 const animate = () => {
  if (!isZooming.current) {
  const now = Date.now();
  markersRef.current.forEach((marker, id) => {
   const state = animStates.current.get(id);
   if (state) {
   const elapsed = now - state.startTime;
   let progress = elapsed / state.duration;
   if (progress > 1) progress = 1;
   
   const newLat = state.startLat + (state.targetLat - state.startLat) * progress;
   const newLon = state.startLon + (state.targetLon - state.startLon) * progress;
   
   try { marker.setLatLng([newLat, newLon]); } catch (e) {}
   }
  });
  }
  frameId = requestAnimationFrame(animate);
 };
 frameId = requestAnimationFrame(animate);
 return () => cancelAnimationFrame(frameId);
 }, []);

 useEffect(() => {
 const validIds = new Set(aircraft.map(a => a.id));
 for (const id of markersRef.current.keys()) {
  if (!validIds.has(id)) {
  markersRef.current.delete(id);
  animStates.current.delete(id);
  }
 }
 }
 }, [aircraft]);

 const registerMarker = (id, el) => {
 if (el) markersRef.current.set(id, el);
 };

 return (
 <>
  {aircraft.map(ac => (
  <DumbAircraft key={ac.id} ac={ac} registerMarker={registerMarker} />
  ))}
 </>
 );
}

function PredictiveTrackingLayer() {
 const map = useMap();
 const predictiveTracking = useStore(state => state.predictiveTracking);
 const addPoint = useStore(state => state.addPredictivePoint);
 const setResults = useStore(state => state.setPredictiveResults);

 useMapEvents({
  click: (e) => {
  if (predictiveTracking.active && predictiveTracking.points.length < 2) {
   addPoint(e.latlng.lat, e.latlng.lng);
  }
  }
 });

 useEffect(() => {
  if (predictiveTracking.status === 'CALCULATING' && predictiveTracking.points.length === 2) {
  const p1 = predictiveTracking.points[0];
  const p2 = predictiveTracking.points[1];
  
  const fetchRoutes = async () => {
   try {
   // A to B route
   const r1 = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1.lon},${p1.lat};${p2.lon},${p2.lat}?overview=full&geometries=geojson`);
   const d1 = await r1.json();
   const routeGeo = d1.routes && d1.routes[0] ? d1.routes[0].geometry : null;

   // Project Point C
   const dLat = p2.lat - p1.lat;
   const dLon = p2.lon - p1.lon;
   // Project roughly 5x the distance forward
   const p3 = { lat: p2.lat + (dLat * 5), lon: p2.lon + (dLon * 5) };

   // B to C route (Predicted)
   const r2 = await fetch(`https://router.project-osrm.org/route/v1/driving/${p2.lon},${p2.lat};${p3.lon},${p3.lat}?overview=full&geometries=geojson`);
   const d2 = await r2.json();
   const predGeo = d2.routes && d2.routes[0] ? d2.routes[0].geometry : null;
   
   const actualP3 = (d2.waypoints && d2.waypoints[1]) 
    ? { lon: d2.waypoints[1].location[0], lat: d2.waypoints[1].location[1] } 
    : p3;

   setResults(routeGeo, predGeo, actualP3);
   } catch (e) {
   console.error("OSRM Error", e);
   setResults(null, null, null);
   }
  };
  fetchRoutes();
  }
 }, [predictiveTracking.status, predictiveTracking.points, setResults]);

 if (!predictiveTracking.active) return null;

 return (
  <>
  {predictiveTracking.points[0] && (
   <Marker position={[predictiveTracking.points[0].lat, predictiveTracking.points[0].lon]} icon={mkDot('#ef4444', 12)}>
    <Tooltip direction="top" permanent className="tactical-tooltip-red">POINT A (PAST)</Tooltip>
   </Marker>
  )}
  {predictiveTracking.points[1] && (
   <Marker position={[predictiveTracking.points[1].lat, predictiveTracking.points[1].lon]} icon={GPS_ICON}>
    <Tooltip direction="top" permanent className="tactical-tooltip-red">POINT B (CURRENT)</Tooltip>
   </Marker>
  )}
  {predictiveTracking.projectedPoint && (
   <Marker position={[predictiveTracking.projectedPoint.lat, predictiveTracking.projectedPoint.lon]} icon={mkPulse('#f97316', 50)}>
    <Tooltip direction="bottom" permanent className="tactical-tooltip-orange">PREDICTED DEST</Tooltip>
   </Marker>
  )}
  
  {predictiveTracking.routeGeoJson && (
   <GeoJSON data={predictiveTracking.routeGeoJson} style={{ color: '#ef4444', weight: 4, opacity: 0.8 }} />
  )}
  {predictiveTracking.predictedGeoJson && (
   <GeoJSON data={predictiveTracking.predictedGeoJson} style={{ color: '#f97316', weight: 4, dashArray: '10, 15', className: 'flowing-dash' }} />
  )}
  </>
 );
}

// ─── Terminator Layer (DAY/NIGHT) ──────────────────────────────────────────────
function TerminatorLayer() {
 const map = useMap();
 useEffect(() => {
 if (typeof window === 'undefined' || !window.terminator) return;
 try {
 const t = window.terminator();
 t.setStyle({
 fillColor: '#000000',
 fillOpacity: 0.5,
 interactive: false,
 color: '#ffffff',
 weight: 1,
 opacity: 0.2
 });
 t.addTo(map);
 const interval = setInterval(() => t.setTime(), 60000);
 return () => {
 clearInterval(interval);
 t.remove();
 };
 } catch (e) {
 console.error('Terminator initialization error', e);
 }
 }, [map]);
 return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

 function OverlayLayers() {
 const active = useStore(state => state.mapConfig.activeOverlays);
 const gdelt = useStore(state => state.feeds.gdelt);
 const aircraft = useStore(state => state.feeds.aircraft);
 const fires = useStore(state => state.feeds.fires);
 const fetchGdelt = useStore(s => s.fetchGdelt);
 const fetchAircraft = useStore(s => s.fetchAircraft);
 const fetchFires = useStore(s => s.fetchFires);

 const map = useMapEvents({
  zoomend: (e) => {
   const z = e.target.getZoom();
   const container = e.target.getContainer();
   if (z < 6) container.classList.add('low-zoom');
   else container.classList.remove('low-zoom');
  }
 });

 useEffect(() => {
  if (map) {
   const z = map.getZoom();
   const container = map.getContainer();
   if (z < 6) container.classList.add('low-zoom');
   else container.classList.remove('low-zoom');
  }
 }, [map]);

 const [earthquakes, setEarthquakes] = useState([]);
 const [iss, setIss] = useState(null);
 const [radarTs, setRadarTs] = useState(null);
 
 const [satellites, setSatellites] = useState([]);
 const [floods, setFloods] = useState([]);
 const [dustData, setDustData] = useState([]);
 const [heatColdData, setHeatColdData] = useState([]);
 const satIntervalRef = useRef(null);
 const satTlesRef = useRef([]);

 // ── EARTHQUAKES: USGS GeoJSON (mag 2.5+, past day) ──────────────────────────
 useEffect(() => {
 if (!active.includes('EARTHQUAKES')) return;
 const load = async () => {
 try {
 const r = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
 const d = await r.json();
 setEarthquakes(d.features || []);
 } catch {}
 };
 load();
 const iv = setInterval(() => { if (!document.hidden) load(); }, 120_000);
 return () => clearInterval(iv);
 }, [active.includes('EARTHQUAKES')]);

 // ── ISS TRACKER: wheretheiss.at (5s refresh) ─────────────────────────────────
 useEffect(() => {
 if (!active.includes('ISS_TRACKER')) return;
 const load = async () => {
 try {
 const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
 setIss(await r.json());
 } catch {}
 };
 load();
 const iv = setInterval(() => { if (!document.hidden) load(); }, 60000);
 return () => clearInterval(iv);
 }, [active.includes('ISS_TRACKER')]);

 // ── GDELT OSINT EVENTS ───────────────────────────────────────────────────────
 useEffect(() => {
 if (!active.includes('OSINT_EVENTS')) return;
 fetchGdelt();
 const iv = setInterval(() => { if (!document.hidden) fetchGdelt(); }, 300_000); // refresh every 5 min
 return () => clearInterval(iv);
 }, [active.includes('OSINT_EVENTS')]);

 // ── ADSB AIRCRAFT ────────────────────────────────────────────────────────────
 useEffect(() => {
 if (!active.includes('ADSB_AIRCRAFT')) return;
 fetchAircraft();
 const iv = setInterval(() => { if (!document.hidden) fetchAircraft(); }, 60000); // 60s
 return () => clearInterval(iv);
 }, [active.includes('ADSB_AIRCRAFT')]);

 // ── FIRMS FIRES ──────────────────────────────────────────────────────────────
 useEffect(() => {
 if (!active.includes('FIRMS_FIRES')) return;
 fetchFires();
 const iv = setInterval(() => { if (!document.hidden) fetchFires(); }, 600_000);
 return () => clearInterval(iv);
 }, [active.includes('FIRMS_FIRES')]);

 // ── WEATHER RADAR: Rainviewer (no auth required) ──────────────────────────────
 useEffect(() => {
 if (!active.includes('WEATHER_RADAR') && !active.includes('SEVERE_STORMS')) return;
 const load = async () => {
 try {
 const r = await fetch('https://api.rainviewer.com/public/weather-maps.json');
 const d = await r.json();
 const ts = d.radar?.past?.slice(-1)[0]?.time;
 if (ts) setRadarTs(ts);
 } catch {}
 };
 load();
 const iv = setInterval(() => { if (!document.hidden) load(); }, 300_000);
 return () => clearInterval(iv);
 }, [active.includes('WEATHER_RADAR'), active.includes('SEVERE_STORMS')]);



 // ── FLOODS: GDACS API ────────────────────────────────────────────────────────
 useEffect(() => {
 if (!active.includes('FLOODS')) return;
 fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtypes=FL')
 .then(r => r.json())
 .then(d => {
 if (d && d.features) setFloods(d.features);
 }).catch(() => {});
 }, [active.includes('FLOODS')]);

 // ── DUST_HAZE & HEAT_COLD: Open-Meteo API for GLOBAL_CITIES ──────────────────
 useEffect(() => {
 const needsDust = active.includes('DUST_HAZE');
 const needsHeatCold = active.includes('HEAT_COLD');
 if (!needsDust && !needsHeatCold) return;
 
 const lats = GLOBAL_CITIES.map(c => c.lat).join(',');
 const lons = GLOBAL_CITIES.map(c => c.lon).join(',');

 if (needsDust) {
 fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=pm10,us_aqi`)
 .then(r => r.json())
 .then(d => {
 if (Array.isArray(d)) {
 const mapped = d.map((res, i) => ({
 ...GLOBAL_CITIES[i],
 pm10: res.current?.pm10,
 aqi: res.current?.us_aqi
 })).filter(c => c.pm10 !== undefined);
 setDustData(mapped);
 }
 }).catch(() => {});
 }

 if (needsHeatCold) {
 fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature`)
 .then(r => r.json())
 .then(d => {
 if (Array.isArray(d)) {
 const mapped = d.map((res, i) => ({
 ...GLOBAL_CITIES[i],
 temp: res.current?.temperature_2m,
 feels: res.current?.apparent_temperature
 })).filter(c => c.temp !== undefined);
 setHeatColdData(mapped);
 }
 }).catch(() => {});
 }
 }, [active.includes('DUST_HAZE'), active.includes('HEAT_COLD')]);

 return (
 <>
 {/* ── WEATHER RADAR & STORMS TILES ── */}
 {(active.includes('WEATHER_RADAR') || active.includes('SEVERE_STORMS')) && radarTs && (
 <TileLayer
 key={`radar-${radarTs}`}
 url={`https://tilecache.rainviewer.com/v2/radar/${radarTs}/512/{z}/{x}/{y}/4/1_1.png`}
 opacity={active.includes('SEVERE_STORMS') ? 0.8 : 0.55}
 zIndex={500}
 />
 )}

 {/* ── DAY/NIGHT TERMINATOR ── */}
 {active.includes('DAY_NIGHT') && <TerminatorLayer />}

 {/* ── MILITARY BASES ── */}
 {active.includes('MILITARY_BASES') && MILITARY_BASES.map((b, i) => (
 <Marker key={i} position={[b.lat, b.lon]} icon={BASE_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[b.name.toUpperCase(), `TYPE: ${b.type}`, b.desc]} accentColor={'#a855f7'} />
 </Popup>
 </Marker>
 ))}

 {/* ── GPS INTERFERENCE ── */}
 {active.includes('GPS_INTERFERENCE') && GPS_INTERFERENCE.map((g, i) => (
 <Marker key={i} position={[g.lat, g.lon]} icon={GPS_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={['GPS ANOMALY DETECTED', `SEVERITY: ${g.severity}`, g.desc]} accentColor={'#ef4444'} />
 </Popup>
 </Marker>
 ))}

 {/* ── DISPLACEMENT EVENTS ── */}
 {active.includes('DISPLACEMENT') && DISPLACEMENT_EVENTS.map((d, i) => (
 <Marker key={i} position={[d.lat, d.lon]} icon={mkTriangle('#f97316', 16)}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={['MASS DISPLACEMENT', `IMPACT: ${d.people}`, d.desc]} accentColor={'#f97316'} />
 </Popup>
 </Marker>
 ))}

 {/* ── LIVE VESSELS ── */}
 {active.includes('LIVE_VESSELS') && LIVE_VESSELS.map((v, i) => (
 <Marker key={i} position={[v.lat, v.lon]} icon={mkShip(v.type === 'MILITARY' ? '#a855f7' : '#38bdf8')}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[v.name, `TYPE: ${v.type}`, `SPEED: ${v.speed} KTS`, `HDG: ${v.heading}°`]} accentColor={v.type === 'MILITARY' ? '#a855f7' : '#38bdf8'} />
 </Popup>
 </Marker>
 ))}

 {/* ── INTERNET OUTAGES ── */}
 {active.includes('INTERNET_OUTAGES') && INTERNET_OUTAGES.map((o, i) => (
 <Marker key={i} position={[o.lat, o.lon]} icon={OUTAGE_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={['NETWORK DISRUPTION', `STATUS: ${o.status}`, o.target]} accentColor={'#ef4444'} />
 </Popup>
 </Marker>
 ))}

 {/* ── HAM REPEATERS & MESHTASTIC ── */}
 {active.includes('HAM_REPEATERS') && HAM_REPEATERS.map((h, i) => (
 <Marker key={i} position={[h.lat, h.lon]} icon={NODE_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`HAM: ${h.callsign}`, `FREQ: ${h.freq} MHz`, h.desc]} accentColor={'#22c55e'} />
 </Popup>
 </Marker>
 ))}
 {active.includes('MESHTASTIC') && MESHTASTIC_NODES.map((m, i) => (
 <Marker key={i} position={[m.lat, m.lon]} icon={NODE_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`MESH: ${m.name}`, `BATTERY: ${m.battery}`, `SNR: ${m.snr} dB`]} accentColor={'#22c55e'} />
 </Popup>
 </Marker>
 ))}

 {/* ── SHIPPING LANES ── */}
 {active.includes('SHIPPING_LANES') && SHIPPING_LANES.map((l, i) => (
 <Polyline key={`sl-${i}`} positions={l.path} color="#3b82f6"weight={2} opacity={0.4} dashArray="5, 10">
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[l.name.toUpperCase(), 'COMMERCIAL SHIPPING ROUTE']} accentColor={'#3b82f6'} />
 </Popup>
 </Polyline>
 ))}

 {/* ── OIL PIPELINES ── */}
 {active.includes('OIL_GAS_PIPELINES') && OIL_PIPELINES.map((p, i) => (
 <Polyline key={i} positions={p.path} color={p.type === 'OIL' ? '#78716c' : '#0ea5e9'} weight={3} opacity={0.6}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[p.name.toUpperCase(), `TYPE: ${p.type}`, `STATUS: ${p.status}`]} accentColor={p.type === 'OIL' ? '#78716c' : '#0ea5e9'} />
 </Popup>
 </Polyline>
 ))}

 {/* ── OSINT EVENTS ── */}
 {active.includes('OSINT_EVENTS') && [...(gdelt || []), ...STATIC_OSINT].map((ev, i) => (
 <Marker key={`osint-${i}`} position={[ev.lat, ev.lon]} icon={ev.severity === 'HIGH' ? OSINT_ICON_HIGH : ev.severity === 'MEDIUM' ? OSINT_ICON_MED : OSINT_ICON_LOW}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`OSINT: ${ev.title.substring(0, 40)}`,
 `SOURCE: ${ev.source}`,
 `SEVERITY: ${ev.severity || 'UNKNOWN'}`,]} accentColor={ev.severity === 'HIGH' ? '#ef4444' : ev.severity === 'MEDIUM' ? '#ffb800' : '#22c55e'} />
 </Popup>
 </Marker>
 ))}

 {/* ── US BORDER WAIT TIMES ── */}
 {active.includes('US_BORDER') && US_BORDER_WAIT_TIMES.map((b, i) => (
 <Marker key={i} position={[b.lat, b.lon]} icon={BORDER_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`CBP: ${b.port.toUpperCase()}`, `TYPE: ${b.type}`, `WAIT: ${b.time}`]} accentColor={'#eab308'} />
 </Popup>
 </Marker>
 ))}

 {/* ── VOLCANOES ── */}
 {active.includes('VOLCANOES') && VOLCANOES.map((v, i) => (
 <Marker key={i} position={[v.lat, v.lon]} icon={v.status === 'ERUPTING' ? VOLCANO_ICON_ERUPTING : VOLCANO_ICON_NORMAL}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[v.name.toUpperCase(), `TYPE: ${v.type}`, `STATUS: ${v.status}`]} accentColor={v.status === 'ERUPTING' ? '#ef4444' : '#f97316'} />
 </Popup>
 </Marker>
 ))}

 {/* ── ADSB AIRCRAFT (Limited to top 800 for performance) ── */}
 {active.includes('ADSB_AIRCRAFT') && (
 <CentralizedAircraftLayer aircraft={aircraft.slice(0, 300)} />
 )}

 <PredictiveTrackingLayer />

 {/* ── FIRMS FIRES ── */}
 {active.includes('FIRMS_FIRES') && fires.map((f, i) => (
 <CircleMarker key={i} center={[f.lat, f.lon]} radius={2} pathOptions={{ color: '#ff4400', fillColor: '#ff4400', fillOpacity: 0.6, weight: 1 }}>
 <Tooltip className="tactical-tooltip">
 <div className="bg-black/80 p-1 text-[8px] text-red-500 font-mono">FIRE_ANOMALY // {f.confidence}</div>
 </Tooltip>
 </CircleMarker>
 ))}

 {/* ── EARTHQUAKES ── */}
 {active.includes('EARTHQUAKES') && earthquakes.map((eq, i) => {
 const [lon, lat, depth] = eq.geometry.coordinates;
 const mag = eq.properties.mag || 0;
 const color = mag >= 6 ? '#ef4444' : mag >= 4.5 ? '#f97316' : '#ffb800';
 return (
 <CircleMarker key={eq.id || i} center={[lat, lon]}
 radius={Math.max(3, mag * 3)}
 pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 1 }}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`M${mag.toFixed(1)} SEISMIC EVENT`,
 eq.properties.place,
 `DEPTH: ${Math.round(depth)} km`,]} accentColor={'#ef4444'} />
 </Popup>
 </CircleMarker>
 );
 })}

 {/* ── ISS TRACKER ── */}
 {active.includes('ISS_TRACKER') && iss && (
 <Marker position={[iss.latitude, iss.longitude]} icon={ISS_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={['ISS // LIVE POSITION',
 `ALT: ${Math.round(iss.altitude)} km`,
 `VEL: ${Math.round(iss.velocity)} km/h`,
 `${iss.latitude?.toFixed(3)}°, ${iss.longitude?.toFixed(3)}°`,]} accentColor={'#a855f7'} />
 </Popup>
 </Marker>
 )}

 {/* ── NUCLEAR FACILITIES ── */}
 {active.includes('NUCLEAR_FACILITIES') && NUCLEAR_FACILITIES.map((p, i) => {
 const lat = parseFloat(p.Latitude);
 const lon = parseFloat(p.Longitude);
 if (isNaN(lat) || isNaN(lon)) return null;
 return (
 <Marker key={i} position={[lat, lon]} icon={NUCLEAR_ICON}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[(p.Name || 'NUCLEAR PLANT').toUpperCase(),
 (p.Country || '').toUpperCase(),
 `STATUS: ${(p.Status || 'OPERATIONAL').toUpperCase()}`,
 p.Capacity ? `CAPACITY: ${p.Capacity} MWe` : null,
 ].filter(Boolean)} accentColor={'#22d3ee'} />
 </Popup>
 </Marker>
 );
 })}

 {/* ── UNDERSEA CABLES ── */}
 {active.includes('UNDERSEA_CABLES') && UNDERSEA_CABLES.map((c, i) => (
 <Polyline key={`cable-${i}`} positions={c.path} color="#f97316"weight={1.5} opacity={0.6}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[
 (c.name || 'UNKNOWN CABLE').toUpperCase(),
 'SUBMARINE FIBER CABLE'
 ]} accentColor={'#f97316'} />
 </Popup>
 </Polyline>
 ))}

 {/* ── MARITIME CHOKEPOINTS ── */}
 {active.includes('MARITIME_CHOKES') && MARITIME_CHOKES.map(cp => (
 <Marker key={cp.id} position={[cp.lat, cp.lon]} icon={cp.risk === 'HIGH' ? CHOKE_ICON_HIGH : cp.risk === 'MEDIUM' ? CHOKE_ICON_MED : CHOKE_ICON_LOW}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[cp.name,
 `TRAFFIC: ${cp.traffic}`,
 `RISK: ${cp.risk}`,]} accentColor={cp.risk === 'HIGH' ? '#ef4444' : cp.risk === 'MEDIUM' ? '#ffb800' : '#22c55e'} />
 </Popup>
 </Marker>
 ))}

 {/* ── GLOBAL PORTS ── */}
 {active.includes('GLOBAL_PORTS') && GLOBAL_PORTS.map(p => (
 <Marker key={p.name} position={[p.lat, p.lon]} icon={portIcon()}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`#${p.rank} ${p.name}`,
 `VOLUME: ${p.teu}`,]} accentColor={'#38bdf8'} />
 </Popup>
 </Marker>
 ))}

 {/* ── DAY / NIGHT TERMINATOR ── */}
 {active.includes('DAY_NIGHT') && <TerminatorLayer />}

 {/* ── SATELLITES ── */}
 {active.includes('SATELLITES') && <SatelliteLayer />}

 {/* ── FLOODS ── */}
 {active.includes('FLOODS') && floods.map((f, i) => {
 const [lon, lat] = f.geometry.coordinates;
 const name = f.properties.country || f.properties.name || 'UNKNOWN REGION';
 const severity = f.properties.alertlevel || 'Orange';
 const color = severity.toLowerCase() === 'red' ? '#ef4444' : severity.toLowerCase() === 'orange' ? '#f97316' : '#eab308';
 return (
 <CircleMarker key={`flood-${i}`} center={[lat, lon]} radius={15} pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 1 }}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`FLOOD WARNING`,
 name.toUpperCase(),
 `SEVERITY: ${severity.toUpperCase()}`]} accentColor={color} />
 </Popup>
 </CircleMarker>
 );
 })}

 {/* ── DUST & HAZE ── */}
 {active.includes('DUST_HAZE') && dustData.map((d, i) => {
 const isBad = d.aqi > 100;
 const color = isBad ? '#ef4444' : '#22c55e';
 return (
 <CircleMarker key={`dust-${i}`} center={[d.lat, d.lon]} radius={10} pathOptions={{ color, fillColor: color, fillOpacity: 0.3, weight: 1 }}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[`AIR QUALITY: ${d.name}`,
 `AQI: ${d.aqi}`,
 `PM10: ${d.pm10} µg/m³`,
 isBad ? 'WARNING: HAZARDOUS' : 'STATUS: MODERATE']} accentColor={color} />
 </Popup>
 </CircleMarker>
 );
 })}

 {/* ── HEAT & COLD ── */}
 {active.includes('HEAT_COLD') && heatColdData.map((d, i) => {
 const isHot = d.temp >= 30;
 const isCold = d.temp <= 10;
 const color = isHot ? '#ef4444' : isCold ? '#3b82f6' : '#22c55e';
 return (
 <CircleMarker key={`hc-${i}`} center={[d.lat, d.lon]} radius={12} pathOptions={{ color, fillColor: color, fillOpacity: 0.5, weight: 1 }}>
 <Popup className="tactical-popup"closeButton={false}>
 <TacticalPopup lines={[isHot ? 'EXTREME HEAT' : isCold ? 'EXTREME COLD' : 'NORMAL TEMP',
 d.name,
 `TEMP: ${d.temp}°C`,
 `FEELS LIKE: ${d.feels}°C`]} accentColor={color} />
 </Popup>
 </CircleMarker>
 );
 })}
 </>
 );
}

export default OverlayLayers;
