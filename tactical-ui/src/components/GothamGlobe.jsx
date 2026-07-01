import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker, Marker, Tooltip, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import useStore from '../store';
import { Layers, Search, ChevronUp, ChevronDown, Map as MapIcon, X, Navigation, ShieldAlert, Crosshair } from 'lucide-react';
import OverlayLayers from './OverlayLayers';
import { CursorTelemetry, HexGridOverlay, TacticalRangefinder, TacticalGeofence } from './TacticalMapTools';

// Custom icons
const aircraftIcon = (heading) => new L.DivIcon({
 className: 'custom-aircraft-icon',
 html: `<div style="transform: rotate(${heading}deg); color: #ffb800;"><svg width="14"height="14"viewBox="0 0 24 24"fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
 iconSize: [14, 14],
 iconAnchor: [7, 7]
});

const eventIcon = (severity) => new L.DivIcon({
 className: '',
 html: `<div style="
 width: 0; height: 0;
 border-left: 7px solid transparent;
 border-right: 7px solid transparent;
 border-top: 13px solid ${severity === 'HIGH' ? '#ef4444' : severity === 'MEDIUM' ? '#f97316' : '#ffb800'
 };
 filter: drop-shadow(0 0 4px ${severity === 'HIGH' ? '#ef444480' : severity === 'MEDIUM' ? '#f9731680' : '#ffb80080'
 });
 "></div>`,
 iconSize: [14, 13],
 iconAnchor: [7, 13],
});

function MapController() {
  const map = useMap();
  const mapTarget = useStore(s => s.mapTarget);
  useEffect(() => {
    if (mapTarget && mapTarget.lat !== undefined && mapTarget.lng !== undefined) {
      map.flyTo([mapTarget.lat, mapTarget.lng], mapTarget.zoom || 14, { duration: 2.5 });
    }
  }, [mapTarget, map]);

  useEffect(() => {
    const preventMiddleScroll = (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };
    const container = map.getContainer();
    container.addEventListener('mousedown', preventMiddleScroll);
    return () => {
      container.removeEventListener('mousedown', preventMiddleScroll);
    };
  }, [map]);

  return null;
}

// ═══ Invalidate size when container resizes ═══
function MapResizeObserver() {
 const map = useMap();
 const containerRef = useRef(map.getContainer());

 useEffect(() => {
 const invalidate = () => map.invalidateSize({ animate: false });
 const observer = new ResizeObserver(() => {
 invalidate();
 // Fire again after short delays to catch late layout reflows
 setTimeout(invalidate, 50);
 setTimeout(invalidate, 200);
 setTimeout(invalidate, 500);
 });
 observer.observe(containerRef.current);
 // Also invalidate after initial mount with staggered timing
 setTimeout(invalidate, 100);
 setTimeout(invalidate, 300);
 setTimeout(invalidate, 600);
 setTimeout(invalidate, 1000);

 // Listen for window resize too
 window.addEventListener('resize', invalidate);
 return () => {
 observer.disconnect();
 window.removeEventListener('resize', invalidate);
 };
 }, [map]);

 return null;
}

function MapStatus() {
 return null;
}

function TacticalLayers({ rangefinderActive, geofenceActive, predictiveTrackingActive }) {
 const map = useMap();
 const geoData = useStore(s => s.feeds.geoData);
 const activeCountry = useStore(s => s.activeCountry);
 const setActiveCountry = useStore(s => s.setActiveCountry);
 const openModule = useStore(s => s.openModule);
 const bringToFront = useStore(s => s.bringToFront);

 const geoJsonRef = React.useRef();
 const activeCountryRef = React.useRef(activeCountry);

 // Sync the ref whenever activeCountry changes
 useEffect(() => {
 activeCountryRef.current = activeCountry;
 }, [activeCountry]);

 const SELECTED_STYLE = {
 fillColor: '#22c55e',
 weight: 2,
 opacity: 1,
 color: '#22c55e',
 fillOpacity: 0.25,
 };

 const getLayerName = (layerOrFeature) => {
 const props = layerOrFeature.properties || layerOrFeature.feature?.properties;
 if (!props) return '';
 return (props.ADMIN || props.name || '').toUpperCase();
 };

 // When activeCountry changes, re-style all layers
 useEffect(() => {
 if (!geoJsonRef.current) return;
 geoJsonRef.current.eachLayer((layer) => {
 const name = getLayerName(layer);
 // Reset everyone first
 geoJsonRef.current.resetStyle(layer);
 // Then apply green to the selected one
 if (activeCountry && activeCountry === name) {
 layer.setStyle(SELECTED_STYLE);
 if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
 layer.bringToFront();
 }
 }
 });
 }, [activeCountry, geoData]);

 const onCountryClick = (e) => {
  if (rangefinderActive || geofenceActive || predictiveTrackingActive) return;
 const feature = e.target.feature;
 if (!feature || !feature.properties) return;

 const props = feature.properties;

 if (props.level && props.level !== 0 && props.level !== '0') return;

 const countryName = (props.ADMIN || props.name || '').toUpperCase();
 if (!countryName) return;

 const iso2 = (props.ISO_A2 || props.iso_a2 || props.ADMO_A2 || props['ISO3166-1-Alpha-2'] || '').toUpperCase();
 const iso3 = (props.ISO_A3 || props.iso_a3 || props.ADMO_A3 || props['ISO3166-1-Alpha-3'] || '').toUpperCase();

 const countryCode = (iso2 && iso2 !== '-99') ? iso2 : (iso3 && iso3 !== '-99' ? iso3 : null);

 // Immediately apply styles before state updates to prevent flicker
 if (geoJsonRef.current) {
 geoJsonRef.current.eachLayer((layer) => {
 const name = getLayerName(layer);
 if (name === countryName) {
 layer.setStyle(SELECTED_STYLE);
 if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
 layer.bringToFront();
 }
 } else {
 geoJsonRef.current.resetStyle(layer);
 }
 });
 }

 setActiveCountry(countryName, countryCode);

 // Ensure module is active (open-only, never close on re-click)
 openModule('COUNTRY_INTEL');

 // Always bring to front on new selection
 setTimeout(() => {
 bringToFront('COUNTRY_INTEL');
 }, 50);
 };

 const countryStyle = (feature) => {
 const admin = feature.properties.ADMIN || feature.properties.name;
 if (!admin) return { opacity: 0, fillOpacity: 0, weight: 0 };

 const name = admin.toUpperCase();
 const isSelected = activeCountry && activeCountry === name;

 return {
 fillColor: isSelected ? '#22c55e' : 'transparent',
 weight: isSelected ? 2 : 0.5,
 opacity: isSelected ? 1 : 0.08,
 color: isSelected ? '#22c55e' : '#6b7280',
 fillOpacity: isSelected ? 0.25 : 0,
 };
 };

 const onEachCountry = (feature, layer) => {
 layer.on({
 mouseover: (e) => {
 const l = e.target;
 const name = getLayerName(l);
 const currentSelected = activeCountryRef.current;

 if (!(currentSelected && currentSelected === name)) {
 l.setStyle({
 fillColor: '#6b7280',
 fillOpacity: 0.15,
 weight: 1.5,
 opacity: 0.6,
 color: '#9ca3af'
 });
 }

 if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
 l.bringToFront();
 }
 },
 mouseout: (e) => {
 const l = e.target;
 const name = getLayerName(l);
 const currentSelected = activeCountryRef.current;

 if (currentSelected && currentSelected === name) {
 // Re-apply selected style (resetStyle would wipe it)
 l.setStyle(SELECTED_STYLE);
 } else {
 if (geoJsonRef.current) {
 geoJsonRef.current.resetStyle(l);
 }
 }
 },
 click: onCountryClick
 });
 };

 return (
 <>
 {geoData && (
 <GeoJSON
 key={`geojson-interactive-${!rangefinderActive && !geofenceActive && !predictiveTrackingActive}`} interactive={!rangefinderActive && !geofenceActive && !predictiveTrackingActive} ref={geoJsonRef}
 data={geoData}
 style={countryStyle}
 onEachFeature={onEachCountry}
 />
 )}
 </>
 );
}

// ═══ OVERLAY CATEGORIES ═══
const OVERLAY_CATEGORIES = ['ALL', 'CONFLICT', 'MILITARY', 'ENVIRO', 'HUMANITARIAN', 'MARITIME', 'INFRA', 'SPACE', 'WEATHER'];

const CATEGORY_COLORS = {
 DARK: { bg: 'bg-cyan-900/30', border: 'border-cyan-700/40', text: 'text-cyan-400', label: 'text-cyan-500/60' },
 LIGHT: { bg: 'bg-neutral-700/30', border: 'border-neutral-500/30', text: 'text-neutral-300', label: 'text-neutral-400/60' },
 SATELLITE: { bg: 'bg-emerald-900/30', border: 'border-emerald-600/40', text: 'text-emerald-400', label: 'text-emerald-500/60' },
 TERRAIN: { bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', text: 'text-yellow-500', label: 'text-yellow-600/60' },
 STYLISED: { bg: 'bg-stone-700/30', border: 'border-stone-500/30', text: 'text-stone-300', label: 'text-stone-400/60' },
};

// ═══ INTEGRATED OVERLAY PANEL (inside map) ═══
function OverlayPanel({ isOpen, onClose }) {
 const mapConfig = useStore(s => s.mapConfig);
 const baseMaps = useStore(s => s.baseMaps);
 const overlayLayers = useStore(s => s.overlayLayers);
 const setBaseMap = useStore(s => s.setBaseMap);
 const toggleOverlay = useStore(s => s.toggleOverlay);
 const [baseMapExpanded, setBaseMapExpanded] = useState(false);
 const [overlayCategory, setOverlayCategory] = useState('ALL');
 const [searchQuery, setSearchQuery] = useState('');

 const baseMapCategories = ['ALL', 'DARK', 'LIGHT', 'SATELLITE', 'TERRAIN', 'STYLISED'];
 const currentBaseMap = baseMaps.find(m => m.id === mapConfig.baseMap);

 const filteredOverlays = (overlayLayers || []).filter(l => {
 const matchCat = overlayCategory === 'ALL' || l.category === overlayCategory;
 const matchSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase());
 return matchCat && matchSearch;
 });

 const filteredBaseMaps = baseMaps.filter(m =>
 baseMapExpanded === true // only if category is not set we use ALL
 );

 const activeOverlayCount = mapConfig.activeOverlays.length;

 if (!isOpen) return null;

 return (
 <div className="absolute top-0 left-0 z-[2000] w-[260px] bg-[#0a0d11]/95 backdrop-blur-md border-r border-white/5 shadow-2xl flex flex-col h-full overflow-hidden">
 {/* Header */}
 <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-2">
 <Layers size={13} className="text-white/40"/>
 <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">// Overlays</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[8px] font-bold text-primary tracking-widest">{activeOverlayCount} ACTIVE</span>
 <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
 <X size={13} />
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto no-scrollbar">

 {/* ═══ BASE MAP ═══ */}
 <div className="border-b border-white/5">
 <button
 onClick={() => setBaseMapExpanded(prev => !prev)}
 className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
 >
 <div className="flex items-center gap-2">
 <MapIcon size={11} className="text-white/30"/>
 <span className="text-[8px] font-bold text-white/50 tracking-widest uppercase">// Base Map</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[8px] font-bold text-primary uppercase tracking-wider">{currentBaseMap?.name || 'RECON'}</span>
 {baseMapExpanded ? <ChevronUp size={11} className="text-white/30"/> : <ChevronDown size={11} className="text-white/30"/>}
 </div>
 </button>

 {baseMapExpanded && (
 <div className="px-3 pb-3 space-y-2">
 <div className="grid grid-cols-3 gap-1">
 {baseMaps.map(m => {
 const isActive = mapConfig.baseMap === m.id;
 const colors = CATEGORY_COLORS[m.category] || CATEGORY_COLORS.DARK;
 return (
 <button
 key={m.id}
 onClick={() => setBaseMap(m.id)}
 className={`flex flex-col p-2 border transition-all relative group ${isActive
 ? `${colors.bg} border-primary/60`
 : `bg-black/40 ${colors.border} hover:border-white/20`
 }`}
 >
 <span className={`text-[5px] font-bold uppercase tracking-widest mb-0.5 ${isActive ? colors.text : colors.label}`}>
 {m.category}
 </span>
 <span className={`text-[8px] font-bold tracking-wider uppercase ${isActive ? 'text-primary' : 'text-white/60 group-hover:text-white/80'}`}>
 {m.name}
 </span>
 {isActive && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_#ffb800]" />}
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>

 {/* ═══ SEARCH ═══ */}
 <div className="px-3 py-2.5 border-b border-white/5">
 <div className="relative">
 <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/15"/>
 <input
 type="text"
 placeholder="Search layers..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-black/50 border border-white/5 py-2 pl-8 pr-3 text-[9px] text-white font-mono focus:outline-none focus:border-primary/30 placeholder:text-white/15"
 />
 </div>
 </div>

 {/* ═══ CATEGORY TABS ═══ */}
 <div className="px-3 pt-2.5 pb-2">
 <div className="flex gap-1 flex-wrap">
 {OVERLAY_CATEGORIES.map(cat => (
 <button
 key={cat}
 onClick={() => setOverlayCategory(cat)}
 className={`px-1.5 py-0.5 text-[6px] font-bold tracking-widest transition-all border ${overlayCategory === cat
 ? 'bg-primary/15 border-primary/40 text-primary'
 : 'bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50 hover:border-white/10'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* ═══ OVERLAY GRID ═══ */}
 <div className="px-3 pb-4">
 <div className="grid grid-cols-2 gap-1">
 {filteredOverlays.map(l => {
 const isActive = mapConfig.activeOverlays.includes(l.id);
 return (
 <div
 key={l.id}
 onClick={() => toggleOverlay(l.id)}
 className={`p-2.5 border flex flex-col gap-1.5 transition-all cursor-pointer relative group ${isActive
 ? 'bg-primary/5 border-primary/30'
 : 'bg-black/30 border-white/5 hover:bg-white/[0.03] hover:border-white/10'
 }`}
 >
 {isActive && <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-primary rounded-full shadow-[0_0_4px_#ffb800]" />}
 <span className={`text-[7px] font-bold tracking-wider uppercase leading-tight ${isActive ? 'text-primary' : 'text-white/70 group-hover:text-white/90'}`}>
 {l.name}
 </span>
 <div className="flex items-center gap-2">
 <div className={`w-3 h-1.5 border transition-all ${isActive
 ? 'bg-primary border-primary shadow-[0_0_4px_rgba(255,184,0,0.3)]'
 : 'border-white/15 bg-transparent'
 }`} />
 <span className="text-[5px] text-white/20 font-bold uppercase tracking-wider">{l.category}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 );
}

const GothamGlobe = React.memo(() => {
 // ── Use GRANULAR selectors so GothamGlobe ONLY re-renders when baseMap
 // or layerOpacity actually change — not when overlays/aircraft/data update.
 const baseMapId = useStore(s => s.mapConfig.baseMap);
 const layerOpacity = useStore(s => s.mapConfig.layerOpacity);
 const activeOverlayCount = useStore(s => s.mapConfig.activeOverlays.length);
 const baseMaps = useStore(s => s.baseMaps);
 const fetchGeoData = useStore(s => s.fetchGeoData);

 const [overlayOpen, setOverlayOpen] = useState(false);
 const [rangefinderActive, setRangefinderActive] = useState(false);
 const [geofenceActive, setGeofenceActive] = useState(false);

 const predictiveTracking = useStore(s => s.predictiveTracking);
 const togglePredictiveTracking = useStore(s => s.togglePredictiveTracking);

 useEffect(() => {
 fetchGeoData();
 }, []);

 const HQ_POS = [21.0285, 105.8542];
 // Memoize so the reference is stable between renders
 const activeBaseMap = React.useMemo(
 () => baseMaps.find(m => m.id === baseMapId) || baseMaps[0],
 [baseMapId, baseMaps]
 );
 const worldBounds = React.useMemo(() => [[-85, -180], [85, 180]], []);

 return (
 <div className="relative w-full h-full bg-[#05070a] overflow-hidden">

 {/* ═══ MAP HEADER BAR (inside map module) ═══ */}
 <div className="absolute top-0 left-0 right-0 z-[1500] h-8 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center px-2 sm:px-3 gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar mask-edge-fade">
 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] shrink-0"/>
 <span className="text-[9px] font-bold text-white/60 tracking-[0.2em] uppercase shrink-0 hidden sm:inline">TACTICAL MAP</span>
 <div className="h-3 w-px bg-white/10 shrink-0 hidden sm:block"/>
 <button
 onClick={() => setOverlayOpen(prev => !prev)}
 className={`flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase transition-all shrink-0 ${overlayOpen
 ? 'bg-white/10 text-white border border-white/10'
 : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70 hover:bg-white/[0.06]'
 }`}
 >
 <Layers size={10} />
 LAYERS
 </button>
 {activeOverlayCount > 0 && (
 <span className="text-[7px] font-bold text-primary tracking-widest shrink-0">{activeOverlayCount} ACTIVE</span>
 )}

 <div className="h-3 w-px bg-white/10 ml-1 sm:ml-2 shrink-0"/>
 
 <button
 onClick={() => { setRangefinderActive(prev => !prev); setGeofenceActive(false); }}
 className={`flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase transition-all shrink-0 ${rangefinderActive
 ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
 : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70 hover:bg-white/[0.06]'
 }`}
 title="Tactical Rangefinder (Middle Click to use)"
 >
 <Navigation size={10} />
 RANGEFINDER {rangefinderActive ? 'ON' : ''}
 </button>

 <button
 onClick={() => { setGeofenceActive(prev => !prev); setRangefinderActive(false); if(predictiveTracking.active) togglePredictiveTracking(); }}
 className={`flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase transition-all shrink-0 ${geofenceActive
 ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
 : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70 hover:bg-white/[0.06]'
 }`}
 title="Draw Geofence Perimeter"
 >
 <ShieldAlert size={10} />
 GEOFENCE {geofenceActive ? 'DRAWING' : ''}
 </button>

 <button
 onClick={() => { togglePredictiveTracking(); setRangefinderActive(false); setGeofenceActive(false); }}
 className={`flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase transition-all shrink-0 ${predictiveTracking.active
 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
 : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70 hover:bg-white/[0.06]'
 }`}
 title="Target Predictive Tracking (Data Fusion)"
 >
 <Crosshair size={10} />
 FUSION {predictiveTracking.active ? 'ACTIVE' : ''}
 </button>
 </div>

 {/* ═══ OVERLAY PANEL (inside map) ═══ */}
 <div className="absolute top-8 left-0 bottom-0 z-[1400]">
 <OverlayPanel isOpen={overlayOpen} onClose={() => setOverlayOpen(false)} />
 </div>

 {/* ═══ LEAFLET MAP ═══ */}
 <MapContainer
 center={HQ_POS}
 zoom={3}
 minZoom={3}
 maxZoom={18}
 maxBounds={worldBounds}
 maxBoundsViscosity={1.0}
 bounceAtZoomLimits={true}
 style={{ width: '100%', height: '100%', background: '#05070a' }}
 zoomControl={false}
 attributionControl={false}
 worldCopyJump={true}
 preferCanvas={true}
 >
 <TileLayer
 key={activeBaseMap.id}
 url={activeBaseMap.url}
 noWrap={false}
 bounds={worldBounds}
 opacity={layerOpacity}
 />

 <TacticalLayers 
  rangefinderActive={rangefinderActive} 
  geofenceActive={geofenceActive} 
  predictiveTrackingActive={predictiveTracking.active} 
 />
 <OverlayLayers />
 <CursorTelemetry />
 <TacticalRangefinder active={rangefinderActive} />
 <TacticalGeofence active={geofenceActive} onToggle={setGeofenceActive} />
 <MapController />
 <MapResizeObserver />
 <MapStatus />
 </MapContainer>

 <HexGridOverlay />

 {predictiveTracking.active && (
 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2000] bg-black/85 border border-orange-500/40 px-6 py-4 flex flex-col items-center gap-3 backdrop-blur-lg shadow-[0_0_20px_rgba(249,115,22,0.2)]">
  <div className="flex items-center gap-2 mb-1">
  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
  <span className="text-[12px] font-bold text-orange-400 tracking-widest">DATA FUSION: PREDICTIVE TRACKING</span>
  </div>
  <span className="text-[10px] text-white/70 font-mono tracking-widest text-center">
  {predictiveTracking.points.length === 0 ? "MIDDLE CLICK MAP TO SET POINT A (PAST LOCATION)" :
   predictiveTracking.points.length === 1 ? "MIDDLE CLICK MAP TO SET POINT B (CURRENT LOCATION)" :
   predictiveTracking.status === 'CALCULATING' ? "CALCULATING OSRM ROUTE & PREDICTED TRAJECTORY..." :
   "TARGET TRAJECTORY SUCCESSFULLY PREDICTED"}
  </span>
  <button onClick={togglePredictiveTracking} className="mt-2 px-6 py-2 bg-red-500/20 text-red-400 font-bold tracking-widest text-[10px] border border-red-500/50 hover:bg-red-500/40 transition-colors">
  {predictiveTracking.status === 'DONE' ? 'CLEAR & EXIT' : 'CANCEL'}
  </button>
 </div>
 )}

 <style dangerouslySetInnerHTML={{
 __html: `
 .tactical-tooltip {
 background: transparent !important;
 border: none !important;
 box-shadow: none !important;
 padding: 0 !important;
 }
 @keyframes pulse {
 0% { transform: scale(1); opacity: 1; }
 50% { transform: scale(1.2); opacity: 0.7; }
 100% { transform: scale(1); opacity: 1; }
 }
 `}} />
 </div>
 );
});

export default GothamGlobe;
