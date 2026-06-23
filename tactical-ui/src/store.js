import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audio } from './utils/audioEngine';

export const MODULE_CATEGORIES = {
 CORE: [
 { id: 'MAP_MODULE', name: 'MAP', desc: 'Interactive world map with layer overlays', status: 'ACTIVE' },
 ],

 // ── Intel & OSINT ────────────────────────────────────────────────────────────
 INTELLIGENCE: [
 { id: 'AI_ANALYST', name: 'AI INTEL ANALYST', desc: 'AI intelligence analyst with access to all dashboard data', status: 'ACTIVE' },
 { id: 'GLOBAL_NEWS', name: 'GLOBAL NEWS TV', desc: 'Real-time live news feeds from global broadcasters', status: 'ACTIVE' },
 { id: 'COUNTRY_INTEL', name: 'COUNTRY INTEL', desc: 'Strategic assessment: Stability, Economy, Security', status: 'ACTIVE' },
 { id: 'PREDICTION_MARKETS', name: 'PREDICTION ODDS', desc: 'Polymarket geopolitical event forecasting', status: 'ACTIVE' },
 { id: 'OSINT_FEED', name: 'OSINT / GDELT FEED', desc: 'Real-time OSINT alerts and GDELT global conflict events', status: 'ACTIVE' },
 { id: 'CENSORSHIP', name: 'INTERNET CENSORSHIP', desc: 'OONI: Website blocks, shutdowns, and surveillance', status: 'ACTIVE' },
 { id: 'HUMANITARIAN', name: 'HUMANITARIAN INTEL', desc: 'GDACS disaster alerts, UNHCR refugee and NGO crisis data', status: 'ACTIVE' },
 { id: 'LIVE_WEBCAMS', name: 'LIVE WEBCAMS', desc: 'Global live street camera streams', status: 'ACTIVE' },
 { id: 'LINK_ANALYSIS', name: 'ENTITY GRAPH', desc: 'Palantir-style node/link network analysis', status: 'ACTIVE' },
 { id: 'DISEASE_OUTBREAKS', name: 'DISEASE OUTBREAKS', desc: 'WHO global epidemic alerts and updates', status: 'ACTIVE' },
 { id: 'WANTED_CRIMINALS', name: 'WANTED CRIMINALS', desc: 'INTERPOL Red Notices global registry', status: 'ACTIVE' },
 ],

 // ── Markets & Finance ────────────────────────────────────────────────────────
 // STOCKS + COMMODITIES + HEATMAPS + MARKET_CHARTING → MARKET_TERMINAL
 // SEC_FILINGS + INSIDER_TRADING + BANKRUPTCY → CORPORATE_INTEL
 // OPEC + SUPPLY_CHAIN + DEBT_CLOCK + COT_REPORTS → MACRO_FEEDS
 // CENTRAL_BANKS + ECONOMIC_CALENDAR → MONETARY_POLICY
 MARKETS: [
 { id: 'FOREX', name: 'FOREX LIVE', desc: 'Global currency pairs and volatility indices', status: 'ACTIVE' },
 { id: 'CRYPTO', name: 'CRYPTO TRACKER', desc: 'Digital asset flows and whale movement monitoring', status: 'ACTIVE' },
 { id: 'MARKET_TERMINAL', name: 'MARKET TERMINAL', desc: 'Multi-asset charts, equities, commodities, and sector heatmaps', status: 'ACTIVE' },
 { id: 'CORPORATE_INTEL', name: 'CORPORATE INTEL', desc: 'SEC filings, insider trading, and corporate default alerts', status: 'ACTIVE' },
 { id: 'MACRO_FEEDS', name: 'MACRO FEEDS', desc: 'OPEC, supply chain, global debt clock, and COT reports', status: 'ACTIVE' },
 { id: 'MONETARY_POLICY', name: 'MONETARY POLICY', desc: 'Global interest rates and macroeconomic event calendar', status: 'ACTIVE' },
 { id: 'GOOGLE_TRENDS', name: 'SEARCH TRENDS', desc: 'Public attention and interest tracking via Google', status: 'ACTIVE' },
 ],

 // ── Strategic Infrastructure ─────────────────────────────────────────────────
 // CHOKEPOINTS + PORT_CONGESTION + PIPELINES + UNDERSEA_CABLES → MARITIME_INTEL
 STRATEGIC: [
 { id: 'NUCLEAR_FACILITIES', name: 'NUCLEAR STATUS', desc: 'Monitoring 370+ global nuclear facilities', status: 'ACTIVE' },
 { id: 'MARITIME_INTEL', name: 'MARITIME INTEL', desc: 'Chokepoints, port congestion, pipelines, and undersea cables', status: 'ACTIVE' },
 { id: 'GPS_JAMMING', name: 'GPS INTERFERENCE', desc: 'Jamming and spoofing zones monitoring', status: 'ACTIVE' },
 { id: 'POWER_GRIDS', name: 'POWER GRID STATUS', desc: 'Real-time national grid load and outage tracking', status: 'ACTIVE' },
 { id: 'MILITARY_BASES', name: 'MILITARY REGISTRY', desc: 'Database of global strategic military installations', status: 'ACTIVE' },
 { id: 'MILITARY_HARDWARE', name: 'MILITARY HARDWARE', desc: 'Tactical analysis of global weapon systems and vehicles', status: 'ACTIVE' },
 ],

 // ── Environmental & Tracking ─────────────────────────────────────────────────
 // EARTHQUAKES + VOLCANOES → SEISMIC
 // SPACE_WEATHER + SOLAR_STORMS → SPACE_WEATHER
 ENVIRONMENTAL: [
 { id: 'NASA_FIRES', name: 'NASA FIRMS FIRES', desc: 'Real-time global fire detection and hotspots', status: 'ACTIVE' },
 { id: 'SEISMIC', name: 'SEISMIC MONITOR', desc: 'USGS live earthquakes and global volcanic activity', status: 'ACTIVE' },
 { id: 'WEATHER_ALERTS', name: 'WEATHER ALERTS', desc: 'NOAA global severe weather warnings', status: 'ACTIVE' },
 { id: 'SPACE_WEATHER', name: 'SPACE WEATHER', desc: 'NOAA geomagnetic index, solar flares, and radiation storms', status: 'ACTIVE' },
 { id: 'AIS_VESSELS', name: 'VESSEL TRACKING', desc: 'Real-time maritime AIS ship movements', status: 'ACTIVE' },
 { id: 'LOCAL_AIR_RADAR', name: 'TACTICAL AIR RADAR', desc: 'Live local airspace scanner', status: 'ACTIVE' },
    { id: 'ADSB_AIRCRAFT', name: 'FLIGHT TRACKING', desc: 'Real-time ADSB aircraft movement monitoring', status: 'ACTIVE' },
 { id: 'WORLD_CLOCK', name: 'WORLD CLOCK', desc: 'Multi-timezone chronometers and selectors', status: 'ACTIVE' },
 { id: 'AIR_QUALITY', name: 'AIR QUALITY (AQI)', desc: 'Real-time global air quality and pollutants', status: 'ACTIVE' },
 ],
};

export const WORKSPACE_MODULES = {
 1: ['MAP_MODULE', 'WORLD_CLOCK', 'LOCAL_AIR_RADAR', 'ADSB_AIRCRAFT', 'AIS_VESSELS', 'WEATHER_ALERTS', 'SEISMIC', 'NASA_FIRES', 'SPACE_WEATHER', 'AIR_QUALITY', 'GPS_JAMMING', 'POWER_GRIDS', 'LIVE_WEBCAMS'],
 2: ['LINK_ANALYSIS', 'AI_ANALYST', 'OSINT_FEED', 'GLOBAL_NEWS', 'PREDICTION_MARKETS', 'WANTED_CRIMINALS', 'COUNTRY_INTEL', 'CENSORSHIP', 'GOOGLE_TRENDS', 'HUMANITARIAN', 'DISEASE_OUTBREAKS'],
 3: ['MARKET_TERMINAL', 'CRYPTO', 'FOREX', 'MACRO_FEEDS', 'MONETARY_POLICY', 'CORPORATE_INTEL', 'MILITARY_BASES', 'NUCLEAR_FACILITIES', 'MARITIME_INTEL', 'MILITARY_HARDWARE']
};

const NASA_MAP_KEY = '1f440c3df960c3e17b93319d22893e7f';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const FALLBACK_PROXY = 'https://corsproxy.io/?';

// Helper for distance calculation (Geofence)
const getDistanceKM = (lat1, lon1, lat2, lon2) => {
 const R = 6371; // Earth's radius in km
 const dLat = (lat2 - lat1) * Math.PI / 180;
 const dLon = (lon2 - lon1) * Math.PI / 180;
 const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
 Math.sin(dLon/2) * Math.sin(dLon/2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
 return R * c;
};

const savedTheme = localStorage.getItem('raven_theme') || 'DEFAULT';
if (savedTheme !== 'DEFAULT') {
 document.body.className = `theme-${savedTheme.toLowerCase()}`;
}

const savedUiScale = parseFloat(localStorage.getItem('raven_ui_scale')) || 1.0;

const useStore = create(persist((set, get) => ({
 activeView: 'MAP',
 activePin: null,
 activeCountry: null,
 activeCountryCode: null,
 mapTarget: null, // { lat, lng, zoom }
 setMapTarget: (target) => set({ mapTarget: target }),
 
 isCommandPaletteOpen: false,
 setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
 
 isSoundEnabled: true,
 toggleSound: () => {
 const next = !get().isSoundEnabled;
 set({ isSoundEnabled: next });
 return next;
 },

 // ── Ops Color Modes ──
 theme: savedTheme,
 setTheme: (newTheme) => {
 document.body.className = newTheme === 'DEFAULT' ? '' : `theme-${newTheme.toLowerCase()}`;
 localStorage.setItem('raven_theme', newTheme);
 set({ theme: newTheme });
 },

 defconLevel: 5,
 setDefconLevel: (level) => {
 document.body.classList.remove('defcon-1', 'defcon-2', 'defcon-3');
 if (level === 1) document.body.classList.add('defcon-1');
 else if (level === 2) document.body.classList.add('defcon-2');
 else if (level === 3) document.body.classList.add('defcon-3');
 set({ defconLevel: level });
 },
 
 // ── UI Scaling ──
 uiScale: savedUiScale,
 setUiScale: (scale) => {
 localStorage.setItem('raven_ui_scale', scale.toString());
 set({ uiScale: scale });
 },
 
 // ── Notifications ──
 notificationsMuted: true,
 setNotificationsMuted: (muted) => set({ notificationsMuted: muted }),
 notifications: [],
 addNotification: (text, type = 'INFO') => set(state => {
 if (!state.notificationsMuted) { audio.playNotification(); }
 const id = Date.now() + Math.random();
 const noti = { id, text, type, time: new Date(), isToast: true };
 setTimeout(() => {
 get().dismissToast(id);
 }, 5000);
 return { notifications: [noti, ...state.notifications] };
 }),
 dismissToast: (id) => set(state => ({
 notifications: state.notifications.map(n => n.id === id ? { ...n, isToast: false } : n)
 })),
 clearNotifications: () => set({ notifications: [] }),

 // ── Tactical Geofences ──
 geofences: [],
 addGeofence: (zone) => set(state => ({ geofences: [...state.geofences, { ...zone, id: `GF-${Date.now()}` }] })),
 removeGeofence: (id) => set(state => ({ geofences: state.geofences.filter(gf => gf.id !== id) })),

 // ── Operations (Case Files) ──
 operations: [],
 activeOperationId: null,
 createOperation: (name) => set(state => {
 const newOp = { id: `OP-${Date.now()}`, name, nodes: [], links: [] };
 return { operations: [...state.operations, newOp], activeOperationId: newOp.id };
 }),
 setActiveOperation: (id) => set({ activeOperationId: id }),
 addNodeToOperation: (opId, node) => set(state => {
 const op = (state.operations || []).find(o => o.id === opId);
 if (!op || op.nodes.find(n => n.id === node.id)) return state; // Avoid duplicates
 return {
 operations: (state.operations || []).map(o => o.id === opId ? { ...o, nodes: [...o.nodes, node] } : o)
 };
 }),
 addLinkToOperation: (opId, link) => set(state => {
 const op = (state.operations || []).find(o => o.id === opId);
 if (!op) return state;
 // Prevent duplicate exact links
 const exists = op.links.find(l => 
 (l.source === link.source && l.target === link.target) || 
 (l.source === link.target && l.target === link.source)
 );
 if (exists) return state;
 return {
 operations: (state.operations || []).map(o => o.id === opId ? { ...o, links: [...o.links, link] } : o)
 };
 }),

 // ── Window Management System ──
 activeWorkspace: 1,
 workspaces: {
 1: { activeModules: ['MAP_MODULE'], minimizedModules: [], windowStates: { MAP_MODULE: { x: 100, y: 50, w: 900, h: 550, z: 10 } }, preMaxStates: {} },
 2: { activeModules: [], minimizedModules: [], windowStates: {}, preMaxStates: {} },
 3: { activeModules: [], minimizedModules: [], windowStates: {}, preMaxStates: {} },
 },

 switchWorkspace: (targetId) => set(state => {
 if (state.activeWorkspace === targetId) return state;

 // Save current workspace state
 const currentWorkspaces = { ...state.workspaces };
 currentWorkspaces[state.activeWorkspace] = {
 activeModules: state.activeModules,
 minimizedModules: state.minimizedModules,
 windowStates: state.windowStates,
 preMaxStates: state.preMaxStates,
 };

 // Load target workspace state
 const targetWorkspace = currentWorkspaces[targetId] || { activeModules: [], minimizedModules: [], windowStates: {}, preMaxStates: {} };

 return {
 activeWorkspace: targetId,
 workspaces: currentWorkspaces,
 activeModules: targetWorkspace.activeModules || [],
 minimizedModules: targetWorkspace.minimizedModules || [],
 windowStates: targetWorkspace.windowStates || {},
 preMaxStates: targetWorkspace.preMaxStates || {},
 };
 }),

 activeModules: ['MAP_MODULE'],
 minimizedModules: [],
 mobileActiveTab: 'MAP_MODULE', // Tracks the active tab on mobile devices
 preMaxStates: {}, // Stores {w, h, x, y} before maximizing
 windowStates: {
 MAP_MODULE: { x: 100, y: 50, w: 900, h: 550, z: 10 }
 },

 setWindowPos: (id, updates) => set((state) => {
 const safeUpdates = { ...updates };
 if (safeUpdates.y !== undefined) safeUpdates.y = Math.max(0, safeUpdates.y);
 return {
 windowStates: { 
 ...state.windowStates, 
 [id]: { 
 ...(state.windowStates[id] || { x: 100, y: 100, w: 400, h: 300, z: 10 }), 
 ...safeUpdates 
 } 
 }
 };
 }),

 bringToFront: (id) => set((state) => {
 const maxZ = Math.max(...Object.values(state.windowStates).map(w => w?.z || 0), 0);
 return {
 windowStates: { 
 ...state.windowStates, 
 [id]: { 
 ...(state.windowStates[id] || { x: 100, y: 100, w: 400, h: 300 }), 
 z: maxZ + 1 
 } 
 }
 };
 }),

 setMobileActiveTab: (id) => set({ mobileActiveTab: id }),

 // Restore a saved layout from the backend
 loadLayout: (layout) => {
 if (!layout) return;
 const { activeModules, windowStates, mapConfig: savedMapConfig, workspaces, activeWorkspace } = layout;
 
 // Sanitize window states to prevent stuck modules under navbar
 const sanitizeStates = (states) => {
 if (!states) return states;
 const safe = { ...states };
 Object.keys(safe).forEach(id => {
 if (safe[id]?.y < 0) safe[id].y = 0;
 });
 return safe;
 };

 set(state => {
 let finalActiveWorkspace = activeWorkspace || state.activeWorkspace;
 let finalWorkspaces = workspaces || state.workspaces;
 let finalActiveModules = activeModules || state.activeModules;
 let finalWindowStates = sanitizeStates(windowStates) || state.windowStates;

 // If legacy layout (no workspaces in backend), migrate it into workspace 1
 if (!workspaces) {
 finalWorkspaces = { ...state.workspaces };
 finalWorkspaces[1] = {
 activeModules: finalActiveModules,
 minimizedModules: [],
 windowStates: finalWindowStates,
 preMaxStates: {}
 };
 finalActiveWorkspace = 1;
 } else {
 // Sanitize all workspaces
 Object.keys(finalWorkspaces).forEach(wid => {
 finalWorkspaces[wid].windowStates = sanitizeStates(finalWorkspaces[wid].windowStates);
 });
 // Restore currently active modules from the saved finalActiveWorkspace
 const target = finalWorkspaces[finalActiveWorkspace] || {};
 finalActiveModules = target.activeModules || [];
 finalWindowStates = target.windowStates || {};
 }

 return {
 mapConfig: savedMapConfig
 ? {
 ...state.mapConfig,
 baseMap: savedMapConfig.baseMap || state.mapConfig.baseMap,
 activeOverlays: savedMapConfig.activeOverlays || state.mapConfig.activeOverlays,
 layerOpacity: savedMapConfig.layerOpacity ?? state.mapConfig.layerOpacity,
 }
 : state.mapConfig,
 activeWorkspace: finalActiveWorkspace,
 workspaces: finalWorkspaces,
 activeModules: finalActiveModules,
 windowStates: finalWindowStates
 };
 });
 },

 toggleModule: (id) => set(state => {
 const isActive = state.activeModules.includes(id);
 let nextOverlays = state.mapConfig.activeOverlays;
 
 if (id === 'FLIGHT_TRACKING') {
 if (isActive) nextOverlays = nextOverlays.filter(o => o !== 'ADSB_AIRCRAFT');
 else if (!nextOverlays.includes('ADSB_AIRCRAFT')) nextOverlays = [...nextOverlays, 'ADSB_AIRCRAFT'];
 }

 if (id === 'SATELLITE_TRACKING') {
 if (isActive) nextOverlays = nextOverlays.filter(o => o !== 'SATELLITES');
 else if (!nextOverlays.includes('SATELLITES')) nextOverlays = [...nextOverlays, 'SATELLITES'];
 }

 if (isActive) {
 return { 
 activeModules: state.activeModules.filter(m => m !== id),
 mapConfig: { ...state.mapConfig, activeOverlays: nextOverlays },
 mobileActiveTab: state.mobileActiveTab === id ? 'MAP_MODULE' : state.mobileActiveTab
 };
 } else {
 const nextActive = [...state.activeModules, id];
 const offset = (nextActive.length % 5) * 40;
 const newWindowStates = {
 ...state.windowStates,
 [id]: state.windowStates[id] || { x: 100 + offset, y: 100 + offset, w: 400, h: 300, z: 100 + nextActive.length }
 };
 return {
 activeModules: nextActive,
 windowStates: newWindowStates,
 mapConfig: { ...state.mapConfig, activeOverlays: nextOverlays },
 mobileActiveTab: id
 };
 }
 }),

 // Open-only: never closes.
 openModule: (id) => set(state => {
 const isActive = state.activeModules.includes(id);
 let nextOverlays = state.mapConfig.activeOverlays;

 if (id === 'FLIGHT_TRACKING' && !nextOverlays.includes('ADSB_AIRCRAFT')) {
 nextOverlays = [...nextOverlays, 'ADSB_AIRCRAFT'];
 }

 if (id === 'SATELLITE_TRACKING' && !nextOverlays.includes('SATELLITES')) {
 nextOverlays = [...nextOverlays, 'SATELLITES'];
 }

 if (isActive) {
 if (nextOverlays !== state.mapConfig.activeOverlays || state.mobileActiveTab !== id) {
 return { 
 mapConfig: { ...state.mapConfig, activeOverlays: nextOverlays },
 mobileActiveTab: id
 };
 }
 return {}; 
 }
 
 const nextActive = [...state.activeModules, id];
 const offset = (nextActive.length % 5) * 40;
 const newWindowStates = {
 ...state.windowStates,
 [id]: state.windowStates[id] || { x: 100 + offset, y: 100 + offset, w: 400, h: 300, z: 100 + nextActive.length }
 };
 return {
 activeModules: nextActive,
 windowStates: newWindowStates,
 mapConfig: { ...state.mapConfig, activeOverlays: nextOverlays }
 };
 }),

 minimizeModule: (id) => set((state) => {
 if (!state.minimizedModules.includes(id)) {
 return { minimizedModules: [...state.minimizedModules, id] };
 }
 return state;
 }),

 restoreModule: (id) => set((state) => ({
 minimizedModules: state.minimizedModules.filter(m => m !== id)
 })),

 // Maximize toggles width to 100vw and height to 90vh approx
 toggleMaximize: (id) => set((state) => {
 const current = state.windowStates[id];
 if (!current) return state;

 const isMaximized = state.preMaxStates[id] !== undefined;

 if (isMaximized) {
 // Restore
 const newPreMax = { ...state.preMaxStates };
 delete newPreMax[id];
 return { preMaxStates: newPreMax };
 } else {
 // Maximize
 const newPreMax = { ...state.preMaxStates, [id]: { ...current } };
 return { preMaxStates: newPreMax };
 }
 }),

 setActiveView: (view) => set({ activeView: view }),
 setActivePin: (pin) => set({ activePin: pin }),
 setActiveCountry: (country, code = null) => set({ 
 activeCountry: country, 
 activeCountryCode: code 
 }),
 
 mapConfig: {
 baseMap: 'RECON',
 activeOverlays: [],
 layerOpacity: 0.8,
 },

 baseMaps: [
 // DARK
 { id: 'BLACKOUT', name: 'BLACKOUT', category: 'DARK', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
 { id: 'STEALTH', name: 'STEALTH', category: 'DARK', url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png' },
 // LIGHT
 { id: 'GHOST', name: 'GHOST', category: 'LIGHT', url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png' },
 { id: 'BONE', name: 'BONE', category: 'LIGHT', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
 { id: 'GRANITE', name: 'GRANITE', category: 'LIGHT', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png' },
 // SATELLITE
 { id: 'RECON', name: 'RECON', category: 'SATELLITE', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
 // TERRAIN
 { id: 'CONTOUR', name: 'CONTOUR', category: 'TERRAIN', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
 { id: 'ATLAS', name: 'ATLAS', category: 'TERRAIN', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}' },
 { id: 'TOPO', name: 'TOPO', category: 'TERRAIN', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}' },
 // STYLISED
 { id: 'TRAVERSE', name: 'TRAVERSE', category: 'STYLISED', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' },
 { id: 'OVERLAND', name: 'OVERLAND', category: 'STYLISED', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}' },
 { id: 'MARITIME', name: 'MARITIME', category: 'STYLISED', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}' },
 { id: 'FIELDWORK', name: 'FIELDWORK', category: 'STYLISED', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}' },
 ],

 overlayLayers: [
 // CONFLICT
 { id: 'OSINT_EVENTS', name: 'OSINT EVENTS', category: 'CONFLICT' },
 { id: 'GPS_INTERFERENCE', name: 'GPS INTERFERENCE', category: 'CONFLICT' },
 // MILITARY
 { id: 'MILITARY_BASES', name: 'MILITARY BASES', category: 'MILITARY' },
 { id: 'DAY_NIGHT', name: 'DAY / NIGHT', category: 'MILITARY' },
 // ENVIRO
 { id: 'EARTHQUAKES', name: 'EARTHQUAKES', category: 'ENVIRO' },
 { id: 'FIRMS_FIRES', name: 'FIRMS ACTIVE FIRES', category: 'ENVIRO' },
 { id: 'VOLCANOES', name: 'VOLCANOES', category: 'ENVIRO' },
 // HUMANITARIAN
 { id: 'DISPLACEMENT', name: 'DISPLACEMENT EVENTS', category: 'HUMANITARIAN' },
 // MARITIME
 { id: 'GLOBAL_PORTS', name: 'GLOBAL PORTS', category: 'MARITIME' },
 { id: 'LIVE_VESSELS', name: 'LIVE VESSELS', category: 'MARITIME' },
 { id: 'MARITIME_CHOKES', name: 'MARITIME CHOKEPOINTS', category: 'MARITIME' },
 { id: 'SHIPPING_LANES', name: 'SHIPPING LANES', category: 'MARITIME' },
 // INFRA
 { id: 'HAM_REPEATERS', name: 'HAM REPEATERS', category: 'INFRA' },
 { id: 'INTERNET_OUTAGES', name: 'INTERNET OUTAGES', category: 'INFRA' },
 { id: 'MESHTASTIC', name: 'MESHTASTIC NODES', category: 'INFRA' },
 { id: 'NUCLEAR_FACILITIES', name: 'NUCLEAR FACILITIES', category: 'INFRA' },
 { id: 'OIL_GAS_PIPELINES', name: 'OIL & GAS PIPELINES', category: 'INFRA' },
 { id: 'UNDERSEA_CABLES', name: 'UNDERSEA CABLES', category: 'INFRA' },
 { id: 'US_BORDER', name: 'US BORDER WAIT TIMES', category: 'INFRA' },
 // SPACE & AIR
 { id: 'LOCAL_AIR_RADAR', name: 'TACTICAL AIR RADAR', desc: 'Live local airspace scanner', status: 'ACTIVE' },
    { id: 'ADSB_AIRCRAFT', name: 'ADSB AIRCRAFT', category: 'SPACE' },
 { id: 'ISS_TRACKER', name: 'ISS TRACKER', category: 'SPACE' },
 { id: 'SATELLITES', name: 'SATELLITES', category: 'SPACE' },
 // WEATHER
 { id: 'WEATHER_RADAR', name: 'WEATHER RADAR', category: 'WEATHER' },
 { id: 'DUST_HAZE', name: 'DUST & HAZE', category: 'WEATHER' },
 { id: 'FLOODS', name: 'FLOODS', category: 'WEATHER' },
 { id: 'HEAT_COLD', name: 'HEAT/COLD (NWS)', category: 'WEATHER' },
 { id: 'SEVERE_STORMS', name: 'SEVERE STORMS', category: 'WEATHER' },
 ],

 feeds: {
 aircraft: [],
 fires: [],
 gdelt: [],
 outbreaks: [],
 ewData: { zones: [], flights: [], total_impacted: 0 },
 militaryBases: [],
 countryNews: [],
 markets: { btc: 64210, gold: 2341, oil: 82.5, audusd: 0.65 },
 geoData: null,
 },

 setBaseMap: (id) => set(state => ({
 mapConfig: { ...state.mapConfig, baseMap: id }
 })),

 toggleOverlay: (id) => set(state => {
 const next = state.mapConfig.activeOverlays.includes(id)
 ? state.mapConfig.activeOverlays.filter(o => o !== id)
 : [...state.mapConfig.activeOverlays, id];
 return { mapConfig: { ...state.mapConfig, activeOverlays: next } };
 }),

 fetchAircraft: async (lat, lon) => { try { let url = import.meta.env.VITE_BACKEND_URL + '/api/proxy/aircraft'; if (lat && lon) url += `?lat=${lat}&lon=${lon}`; const res = await fetch(url); const data = await res.json(); const mapped = (data.states || []).filter(s => s[5] !== null && s[6] !== null).slice(0, 1500).map(s => ({
 id: s[0],
 callsign: (s[1] || 'UNK').trim(),
 origin: s[2] || 'UNKNOWN',
 lat: s[6],
 lon: s[5],
 alt: s[7],
 vel: s[9],
 heading: s[10],
 vert_rate: s[11] || 0,
 squawk: s[13] || null,
 }));
 set(state => ({ feeds: { ...state.feeds, aircraft: mapped } }));

 // Check Geofence breaches
 const { geofences, _notifiedBreaches, addNotification } = get();
 if ((geofences || []).length > 0) {
 const notified = _notifiedBreaches || new Set();
 mapped.forEach(ac => {
 (geofences || []).forEach(gf => {
 const dist = getDistanceKM(ac.lat, ac.lon, gf.lat, gf.lng);
 if (dist <= gf.radius) {
 const breachKey = `${ac.id}-${gf.id}`;
 if (!notified.has(breachKey)) {
 notified.add(breachKey);
 addNotification(`[PERIMETER BREACH] Aircraft ${ac.callsign} entered ${gf.name}`, 'CRITICAL');
 }
 }
 });
 });
 set({ _notifiedBreaches: notified });
 }

 } catch (err) {
 console.warn('[AIRCRAFT] Proxy failed:', err);
 }
 },

 fetchFires: async () => {
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/proxy/fires');
 const data = await res.json();
 const csv = data.csv || '';
 const lines = csv.split('\n').slice(1);
 const mapped = lines.map(line => {
 const parts = line.split(',');
 if (parts.length < 3) return null;
 return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]), intensity: parseFloat(parts[2]), confidence: parts[8] };
 }).filter(f => f !== null).slice(0, 200);
 set(state => ({ feeds: { ...state.feeds, fires: mapped } }));
 } catch (err) {
 console.warn('[FIRES] Proxy failed:', err);
 }
 },

 fetchGdelt: async () => {
 // Country centroid lookup (ISO2 → [lat, lon])
 const CC = {
 AF:[33.9,67.7],AL:[41.2,20.2],DZ:[28.0,1.7],AO:[-11.2,17.9],AR:[-38.4,-63.6],
 AM:[40.1,44.6],AU:[-25.3,133.8],AT:[47.5,14.6],AZ:[40.1,47.6],
 BD:[23.7,90.4],BY:[53.7,27.9],BE:[50.5,4.5],BJ:[9.3,2.3],BO:[-16.3,-63.6],
 BA:[43.9,17.7],BW:[-22.3,24.7],BR:[-14.2,-51.9],BG:[42.7,25.5],BF:[12.4,-1.6],
 BI:[-3.4,29.9],KH:[12.6,104.9],CM:[3.9,11.5],CA:[56.1,-106.3],CF:[6.6,20.9],
 TD:[15.5,18.7],CL:[-35.7,-71.5],CN:[35.9,104.2],CO:[4.6,-74.3],CD:[-4.0,21.8],
 CG:[-0.2,15.8],CR:[9.7,-83.8],HR:[45.1,15.2],CU:[21.5,-79.4],CY:[35.1,33.4],
 CZ:[49.8,15.5],DK:[56.3,9.5],DO:[18.7,-70.2],EC:[-1.8,-78.2],EG:[26.8,30.8],
 SV:[13.8,-88.9],ET:[9.1,40.5],FI:[61.9,25.7],FR:[46.2,2.2],GA:[-0.8,11.6],
 GE:[42.3,43.4],DE:[51.2,10.5],GH:[7.9,-1.0],GR:[39.1,22.0],GT:[15.8,-90.2],
 GN:[11.0,-10.9],HT:[18.9,-72.7],HN:[15.2,-86.2],HU:[47.2,19.5],IN:[20.6,79.0],
 ID:[-0.8,113.9],IR:[32.4,53.7],IQ:[33.2,43.7],IE:[53.4,-8.2],IL:[31.0,34.9],
 IT:[41.9,12.6],CI:[7.5,-5.5],JM:[18.1,-77.3],JP:[36.2,138.3],JO:[31.2,36.5],
 KZ:[48.0,68.0],KE:[-0.0,37.9],KP:[40.3,127.5],KR:[35.9,127.8],KW:[29.3,47.5],
 KG:[41.2,74.8],LA:[17.7,103.0],LB:[33.9,35.5],LY:[26.3,17.2],LT:[55.2,23.9],
 MK:[41.6,21.7],MG:[-18.8,46.9],MW:[-13.3,34.3],MY:[4.2,108.0],ML:[17.6,-2.0],
 MR:[21.0,-10.9],MX:[23.6,-102.6],MD:[47.4,28.4],MN:[46.9,103.8],MA:[31.8,-7.1],
 MZ:[-18.7,35.5],MM:[17.1,96.7],NA:[-22.0,17.1],NP:[28.4,84.1],NL:[52.1,5.3],
 NZ:[-40.9,174.9],NI:[12.9,-85.2],NE:[17.6,8.1],NG:[10.5,7.5],NO:[60.5,8.5],
 OM:[21.5,55.9],PK:[30.4,69.3],PS:[31.9,35.2],PA:[8.5,-80.8],PG:[-6.3,143.9],
 PY:[-23.4,-58.4],PE:[-9.2,-75.0],PH:[12.9,121.8],PL:[51.9,19.1],PT:[39.4,-8.2],
 QA:[25.4,51.2],RO:[45.9,25.0],RU:[61.5,105.3],RW:[-1.9,29.9],SA:[24.0,45.0],
 SN:[14.5,-14.5],RS:[44.0,21.0],SL:[8.5,-11.8],SO:[5.2,46.2],ZA:[-30.6,22.9],
 SS:[7.9,29.7],ES:[40.5,-3.7],LK:[7.9,80.8],SD:[12.9,30.2],SE:[60.1,18.6],
 SY:[34.8,38.1],TW:[23.7,121.0],TJ:[38.9,71.3],TZ:[-6.4,34.9],TH:[15.9,100.9],
 TL:[-8.9,125.7],TG:[8.6,0.8],TN:[33.9,9.5],TR:[38.9,35.2],TM:[38.9,59.6],
 UG:[1.4,32.3],UA:[48.4,31.2],AE:[24.0,54.0],GB:[55.4,-3.4],US:[37.1,-95.7],
 UY:[-32.5,-55.8],UZ:[41.4,64.6],VE:[6.4,-66.6],VN:[14.1,108.3],YE:[15.6,48.5],
 ZM:[-13.1,27.8],ZW:[-20.0,30.0],PS:[31.9,35.2],LY:[26.3,17.2],
 };
 const jitter = (n) => n + (Math.random() - 0.5) * 8;

 const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=conflict+protest+violence+attack+war+bombing&mode=ArtList&maxrecords=250&format=json&timespan=1d';

 let data = null;
 try {
 const r = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/gdelt');
 if (r.ok) data = await r.json();
 } catch (err) {
 console.warn('[GDELT] Backend failed:', err);
 }

 if (!data || !data.articles) {
 set(state => ({ feeds: { ...state.feeds, gdelt: [] } }));
 return;
 }

 const events = data.articles.map((art, i) => {
 const cc = (art.country || '').trim().toUpperCase();
 const centroid = CC[cc] || [0, 0]; // Default to [0,0] if unknown, so it still appears in the feed
 
 return {
 ...art,
 lat: centroid[0] !== 0 ? jitter(centroid[0]) : 0,
 lon: centroid[1] !== 0 ? jitter(centroid[1]) : 0,
 type: 'OSINT',
 severity: art.tag === 'HIGH' ? 'HIGH' : art.tag === 'MEDIUM' ? 'MEDIUM' : 'LOW',
 };
 });

 console.log(`[GDELT] Loaded ${events.length} real OSINT events`);
 set(state => ({ feeds: { ...state.feeds, gdelt: events } }));
 
 // Check Geofence breaches
 const { geofences, _notifiedBreaches, addNotification } = get();
 if (geofences.length > 0) {
 const notified = _notifiedBreaches || new Set();
 events.forEach(ev => {
 geofences.forEach(gf => {
 const dist = getDistanceKM(ev.lat, ev.lon, gf.lat, gf.lng);
 if (dist <= gf.radius) {
 const breachKey = `OSINT-${ev.url}-${gf.id}`;
 if (!notified.has(breachKey)) {
 notified.add(breachKey);
 addNotification(`[PERIMETER ALERT] OSINT event in ${gf.name}: ${ev.title}`, 'CRITICAL');
 }
 }
 });
 });
 set({ _notifiedBreaches: notified });
 }

 if (events.length > 0) {
 // Find new high-priority events that haven't been notified yet
 const storeState = get();
 if (!storeState._notifiedTitles) storeState._notifiedTitles = new Set();
 
 const newHighEvents = events.filter(e => e.tag === 'HIGH' && !storeState._notifiedTitles.has(e.title));
 
 // If we have new HIGH events, notify up to 2 of them
 if (newHighEvents.length > 0) {
 newHighEvents.slice(0, 2).forEach(e => {
 storeState._notifiedTitles.add(e.title);
 get().addNotification(`[${e.country.toUpperCase()}] ${e.title}`, 'CRITICAL');
 });
 } else {
 // If no high events, check for any new events
 const newEvents = events.filter(e => !storeState._notifiedTitles.has(e.title));
 if (newEvents.length > 0) {
 const e = newEvents[0];
 storeState._notifiedTitles.add(e.title);
 get().addNotification(`[${e.country.toUpperCase()}] ${e.title}`, e.tag === 'MEDIUM' ? 'WARNING' : 'INFO');
 } else {
 // If no new events at all, just let the user know the system is still active
 get().addNotification(`OSINT SWEEP COMPLETE: 0 new anomalies detected.`, 'INFO');
 }
 }
 }
 },

 fetchOutbreaks: async () => {
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/outbreaks');
 if (!res.ok) return;
 const data = await res.json();
 const alerts = data.alerts || [];
 
 set(state => ({ feeds: { ...state.feeds, outbreaks: alerts } }));
 
 if (alerts.length > 0) {
 const storeState = get();
 if (!storeState._notifiedBio) storeState._notifiedBio = new Set();
 
 const newBioAlerts = alerts.filter(a => (a.severity === 'PANDEMIC' || a.severity === 'EPIDEMIC') && !storeState._notifiedBio.has(a.title));
 
 if (newBioAlerts.length > 0) {
 newBioAlerts.slice(0, 2).forEach(a => {
 storeState._notifiedBio.add(a.title);
 get().addNotification(`[BIO-ALERT] ${a.country.toUpperCase()} - ${a.title}`, 'CRITICAL');
 });
 }
 }
 } catch (err) {
 console.warn('[OUTBREAKS] Fetch failed:', err);
 }
 },

 fetchEwData: async () => {
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/ew-jamming');
 if (!res.ok) return;
 const data = await res.json();
 
 set(state => ({ feeds: { ...state.feeds, ewData: data } }));
 
 if (data.zones && data.zones.length > 0) {
 const storeState = get();
 if (!storeState._notifiedEw) storeState._notifiedEw = new Set();
 
 const newCritical = data.zones.filter(z => z.severity === 'CRITICAL' && !storeState._notifiedEw.has(z.name));
 
 if (newCritical.length > 0) {
 newCritical.slice(0, 2).forEach(z => {
 storeState._notifiedEw.add(z.name);
 get().addNotification(`[EW ALERT] MASSIVE GPS JAMMING DETECTED: ${z.name.toUpperCase()} - ${z.impacted_count} AIRCRAFT BLIND`, 'CRITICAL');
 });
 }
 }
 } catch (err) {
 console.warn('[EW JAMMING] Fetch failed:', err);
 }
 },

 fetchMilitaryBases: async () => {
 try {
 const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/military-bases');
 if (!res.ok) return;
 const data = await res.json();
 
 set(state => ({ feeds: { ...state.feeds, militaryBases: data.bases || [] } }));
 } catch (err) {
 console.warn('[MILITARY BASES] Fetch failed:', err);
 }
 },

 fetchCountryNews: async (countryName) => {
 try {
 const safeName = (countryName || '').trim();
 if (!safeName) return;
 
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/news?country=${encodeURIComponent(safeName)}&limit=25`);
 if (!res.ok) throw new Error(`BACKEND_HTTP_${res.status}`);
 
 const data = await res.json();
 
 const mapped = (data.articles || []).map(art => ({
 id: art.id,
 tag: art.tag || 'LIVE_INTEL',
 time: art.publishedAt || 'RECENT',
 title: art.title,
 source: art.source,
 url: art.url,
 sourceUrl: art.sourceUrl || null,
 image: art.image || null,
 }));
 
 set(state => ({ feeds: { ...state.feeds, countryNews: mapped } }));
 } catch (err) {
 console.warn('Backend news fetch failed:', err);
 set(state => ({ feeds: { ...state.feeds, countryNews: [] } }));
 }
 },

 fetchGeoData: async () => {
 if (get().feeds.geoData) return;
 try {
 const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
 const data = await res.json();
 set(state => ({ feeds: { ...state.feeds, geoData: data } }));
 } catch (err) {}
 },

 fetchMarkets: async () => {
 set(state => ({
 feeds: { ...state.feeds, markets: { btc: 64000 + Math.random() * 500, gold: 2340 + Math.random() * 10, oil: 82.5 + Math.random() * 0.5, audusd: 0.6542 + Math.random() * 0.001 } }
 }));
 },

 weatherData: { city: 'Hanoi', temp: 28.5, feels_like: 30.5, wind: 12.4, humidity: 78, condition: 'PARTLY_CLOUDY', aqi: 156, syncing: false, forecast: [] },
 searchLocation: async (queryOrLoc) => {
 try {
 let first = null;
 if (typeof queryOrLoc === 'object' && queryOrLoc !== null && queryOrLoc.lat !== undefined) {
 first = { latitude: queryOrLoc.lat, longitude: queryOrLoc.lon, name: queryOrLoc.label };
 } else {
 const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryOrLoc)}&count=1&language=en&format=json`);
 const geoData = await geoResp.json();
 if (geoData.results && geoData.results.length > 0) first = geoData.results[0];
 }
 if (!first) return;
 const latitude = parseFloat(first.latitude ?? first.lat);
 const longitude = parseFloat(first.longitude ?? first.lon);
 const name = first.name || 'UNKNOWN';
 set({ weatherData: { ...get().weatherData, syncing: true, city: name.toUpperCase() }, activeCountry: name.toUpperCase() === 'CANBERRA' || name.toUpperCase() === 'SYDNEY' ? 'AUSTRALIA' : 'VIETNAM' });
 const [wResp, aqiResp] = await Promise.all([
 fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4`),
 fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`)
 ]);
 const wData = await wResp.json();
 const aqiData = await aqiResp.json();
 set({ weatherData: { syncing: false, city: name.toUpperCase(), temp: wData.current.temperature_2m, feels_like: wData.current.apparent_temperature, wind: wData.current.wind_speed_10m, humidity: wData.current.relative_humidity_2m, aqi: aqiData.current.us_aqi || 0, condition: wData.current.weather_code < 3 ? 'SUNNY' : 'CLOUDY', forecast: [] }, activePin: { label: name.toUpperCase(), lat: latitude, lon: longitude } });
 } catch (err) { set({ weatherData: { ...get().weatherData, syncing: false } }); }
 }
}), {
 name: 'raven-global-store',
 partialize: (state) => ({
 activeView: state.activeView,
 activeCountry: state.activeCountry,
 activeCountryCode: state.activeCountryCode,
 activeWorkspace: state.activeWorkspace,
 workspaces: state.workspaces,
 activeModules: state.activeModules,
 minimizedModules: state.minimizedModules,
 windowStates: state.windowStates,
 preMaxStates: state.preMaxStates,
 mobileActiveTab: state.mobileActiveTab,
 mapConfig: state.mapConfig,
 })
}));

export default useStore;

