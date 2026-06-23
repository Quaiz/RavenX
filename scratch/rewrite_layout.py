import os

LAYOUT_CODE = """import React, { useState, useEffect, useRef } from 'react';
import { Shield, Map as MapIcon, Layers, Settings, Activity, Clock, Globe, TriangleAlert, Cpu, Radio, Network, Fingerprint, CloudLightning, LineChart, FileText, Anchor, Camera, X, Menu, Terminal, Search, ChevronRight } from 'lucide-react';
import useStore from './store';
import GothamGlobe from './components/GothamGlobe';
import ModuleRegistry from './components/ModuleRegistry';
import LinkAnalysis from './components/LinkAnalysis';
import ProfileModal from './components/ProfileModal';
import CommandPalette from './components/CommandPalette';

// Intel Inspector Modules
import CountryIntel from './components/CountryIntel';
import LocalAirRadar from './components/LocalAirRadar';
import NuclearStatus from './components/NuclearStatus';
import WantedCriminals from './components/WantedCriminals';
import DiseaseOutbreaks from './components/DiseaseOutbreaks';
import MilitaryRegistry from './components/MilitaryRegistry';
import MilitaryHardware from './components/MilitaryHardware';

// OSINT & Data Feed Modules
import MarketTerminal from './components/CryptoTracker';
import GlobalNewsTV from './components/GlobalNewsTV';
import SpaceWeather from './components/SpaceWeather';
import WeatherAlerts from './components/WeatherAlerts';
import MacroFeeds from './components/MacroFeeds';
import MonetaryPolicy from './components/MonetaryPolicy';
import PredictionMarkets from './components/PredictionMarkets';
import SearchTrends from './components/SearchTrends';
import LiveWebcams from './components/LiveWebcams';
import WorldClock from './components/WorldClock';
import ForexLive from './components/ForexLive';
import CorporateIntel from './components/CorporateIntel';
import MaritimeIntel from './components/MaritimeIntel';
import VesselTracking from './components/VesselTracking';
import ThermalAnomalies from './components/ThermalAnomalies';
import SeismicMonitor from './components/SeismicMonitor';
import AirQuality from './components/AirQuality';
import InternetCensorship from './components/InternetCensorship';
import HumanitarianIntel from './components/HumanitarianIntel';
import GPSInterference from './components/GPSInterference';
import PowerGridStatus from './components/PowerGridStatus';
import OSINTFeed from './components/OSINTFeed';

// ==========================================
// CONSTANTS
// ==========================================

const MAP_CENTRIC_MODULES = [
    'MAP', 'COUNTRY_INTEL', 'LOCAL_AIR_RADAR', 'NUCLEAR_FACILITIES', 
    'MILITARY_BASES', 'MILITARY_HARDWARE', 'SATELLITE_TRACKING', 'FLIGHT_TRACKING'
];

const MODULE_COMPONENTS = {
    'COUNTRY_INTEL': CountryIntel,
    'LOCAL_AIR_RADAR': LocalAirRadar,
    'NUCLEAR_FACILITIES': NuclearStatus,
    'WANTED_CRIMINALS': WantedCriminals,
    'DISEASE_OUTBREAKS': DiseaseOutbreaks,
    'MILITARY_BASES': MilitaryRegistry,
    'MILITARY_HARDWARE': MilitaryHardware,
    'OSINT_FEED': OSINTFeed,
    'MARKET_TERMINAL': MarketTerminal,
    'GLOBAL_NEWS': GlobalNewsTV,
    'SPACE_WEATHER': SpaceWeather,
    'WEATHER_ALERTS': WeatherAlerts,
    'NASA_FIRES': ThermalAnomalies,
    'SEISMIC': SeismicMonitor,
    'AIR_QUALITY': AirQuality,
    'CENSORSHIP': InternetCensorship,
    'HUMANITARIAN': HumanitarianIntel,
    'GPS_JAMMING': GPSInterference,
    'POWER_GRIDS': PowerGridStatus,
    'MACRO_FEEDS': MacroFeeds,
    'MONETARY_POLICY': MonetaryPolicy,
    'PREDICTION_MARKETS': PredictionMarkets,
    'GOOGLE_TRENDS': SearchTrends,
    'LIVE_WEBCAMS': LiveWebcams,
    'WORLD_CLOCK': WorldClock,
    'CRYPTO': MarketTerminal,
    'FOREX': ForexLive,
    'CORPORATE_INTEL': CorporateIntel,
    'MARITIME_INTEL': MaritimeIntel,
    'AIS_VESSELS': VesselTracking
};

const MODULE_TITLES = {
    'COUNTRY_INTEL': 'GEOPOLITICAL DOSSIER',
    'LOCAL_AIR_RADAR': 'AEROSPACE RADAR',
    'NUCLEAR_FACILITIES': 'NUCLEAR MONITOR',
    'WANTED_CRIMINALS': 'INTERPOL REGISTRY',
    'DISEASE_OUTBREAKS': 'BIO-HAZARD TRACKER',
    'MILITARY_BASES': 'MILITARY BASES',
    'MILITARY_HARDWARE': 'WEAPONS REGISTRY',
    'OSINT_FEED': 'OSINT INTERCEPT',
    'MARKET_TERMINAL': 'MARKET TERMINAL',
    'GLOBAL_NEWS': 'LIVE NEWS FEEDS',
    'SPACE_WEATHER': 'SPACE WEATHER',
    'WEATHER_ALERTS': 'CLIMATE ALERTS',
    'NASA_FIRES': 'THERMAL ANOMALIES',
    'SEISMIC': 'SEISMIC ACTIVITY',
    'AIR_QUALITY': 'AIR QUALITY',
    'CENSORSHIP': 'INTERNET CENSORSHIP',
    'HUMANITARIAN': 'HUMANITARIAN CRISIS',
    'GPS_JAMMING': 'GPS INTERFERENCE',
    'POWER_GRIDS': 'POWER GRID STATUS',
    'MACRO_FEEDS': 'MACROECONOMIC DATA',
    'MONETARY_POLICY': 'CENTRAL BANKS',
    'PREDICTION_MARKETS': 'PREDICTION MARKETS',
    'GOOGLE_TRENDS': 'SEARCH TRENDS',
    'LIVE_WEBCAMS': 'TRAFFIC WEBCAMS',
    'WORLD_CLOCK': 'WORLD CLOCK',
    'CRYPTO': 'CRYPTO MARKETS',
    'FOREX': 'FOREX MARKETS',
    'CORPORATE_INTEL': 'CORPORATE INTEL',
    'MARITIME_INTEL': 'MARITIME SECURITY',
    'AIS_VESSELS': 'AIS VESSEL TRACKING'
};

const CATEGORIES = [
    { id: 'INTEL', icon: Globe, label: 'INTEL' },
    { id: 'THREATS', icon: TriangleAlert, label: 'THREATS' },
    { id: 'OSINT', icon: Radio, label: 'OSINT' },
    { id: 'ENVIRONMENT', icon: CloudLightning, label: 'ENV' },
    { id: 'LINK_ANALYSIS', icon: Network, label: 'LINK' }
];

// ==========================================
// SPLASH SCREEN (BOOT SEQUENCE)
// ==========================================
const HEX_DUMP = Array.from({length: 8000}).map(() => Math.random().toString(16).substr(2, 8).toUpperCase() + " ").join('');

const SplashScreen = ({ onReady }) => {
    const [step, setStep] = useState(0);
    
    useEffect(() => {
        const sequence = [
            setTimeout(() => setStep(1), 500),
            setTimeout(() => setStep(2), 1200),
            setTimeout(() => setStep(3), 1800),
            setTimeout(() => setStep(4), 2200),
            setTimeout(() => onReady(), 2600),
        ];
        return () => sequence.forEach(clearTimeout);
    }, [onReady]);

    return (
        <div className="absolute inset-0 bg-[#020202] text-red-500 font-mono z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 overflow-hidden select-none pointer-events-none break-words text-[10px] leading-tight">
                {HEX_DUMP}
            </div>
            
            <div className="relative z-10 w-full max-w-2xl p-8 bg-black/80 border border-red-900/50 shadow-[0_0_50px_rgba(255,0,0,0.1)] backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-red-900/20 border border-red-500/50 flex items-center justify-center">
                        <TriangleAlert size={32} className="text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-[0.3em] uppercase text-red-500">RAVEN-X</h1>
                        <div className="text-sm tracking-widest text-red-500/60 mt-1">TACTICAL INTELLIGENCE PROTOCOL v8.2</div>
                    </div>
                </div>

                <div className="space-y-4 text-sm tracking-wider">
                    <div className={`transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-red-500/50">[OK]</span> ESTABLISHING SECURE SATELLITE UPLINK...
                    </div>
                    <div className={`transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-red-500/50">[OK]</span> DECRYPTING GLOBAL OSINT DATABASES...
                    </div>
                    <div className={`transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-red-500/50">[OK]</span> INITIALIZING GEOSPATIAL ENGINE...
                    </div>
                    <div className={`transition-opacity duration-300 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-green-500/80">[SYSTEM READY]</span> HANDSHAKE COMPLETE. STANDBY...
                    </div>
                </div>
                
                <div className="mt-8 h-1 w-full bg-red-950 overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-[2600ms] ease-out" style={{ width: step >= 4 ? '100%' : '0%' }} />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN LAYOUT
// ==========================================

const Layout = ({ user, onLogout }) => {
    const activeApp = useStore(state => state.activeApp) || 'MAP';
    const setActiveApp = useStore(state => state.setActiveApp);
    const sidebarCategory = useStore(state => state.sidebarCategory);
    const setSidebarCategory = useStore(state => state.setSidebarCategory);
    const isModuleExplorerOpen = useStore(state => state.isModuleExplorerOpen);
    const toggleModuleExplorer = useStore(state => state.toggleModuleExplorer);
    const toggleModule = useStore(state => state.toggleModule);
    const notifications = useStore(state => state.notifications) || [];
    
    const [bootReady, setBootReady] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    const ActiveComponent = MODULE_COMPONENTS[activeApp];
    const isMapCentric = MAP_CENTRIC_MODULES.includes(activeApp);

    if (!bootReady) {
        return <SplashScreen onReady={() => setBootReady(true)} />;
    }

    return (
        <div className="w-screen h-screen bg-[#05070a] text-white flex flex-col overflow-hidden select-none font-sans">
            <CommandPalette />

            {/* TOP COMMAND BAR */}
            <div className="h-10 shrink-0 bg-[#030407] border-b border-primary/20 flex items-center justify-between px-4 z-40 relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TriangleAlert size={14} className="text-primary" />
                        <span className="font-bold tracking-[0.2em] text-xs text-primary uppercase">RAVEN-X</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-green-950/30 border border-green-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-bold tracking-widest text-green-500">OPERATIONAL</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Active App Badge */}
                    <div className="hidden md:flex px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold tracking-widest uppercase">
                        {MODULE_TITLES[activeApp] || activeApp}
                    </div>
                    <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer">
                        <Shield size={12} className="text-primary" />
                        <span className="text-[10px] tracking-widest uppercase">{user?.username || 'AGENT'}</span>
                    </button>
                </div>
            </div>

            {/* WORKSPACE AREA */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* 1. ACTIVITY BAR (Extreme Left) */}
                <div className="w-16 shrink-0 bg-[#030407] border-r border-primary/10 flex flex-col items-center py-4 gap-6 z-30">
                    <button 
                        onClick={() => setActiveApp('MAP')}
                        className={`p-3 transition-colors ${activeApp === 'MAP' ? 'text-primary bg-primary/10 border-l-2 border-primary' : 'text-white/40 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}
                        title="Global Map"
                    >
                        <MapIcon size={20} strokeWidth={1.5} />
                    </button>
                    
                    <div className="w-8 h-px bg-white/10 my-2" />

                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isActiveCat = sidebarCategory === cat.id;
                        
                        return (
                            <button 
                                key={cat.id}
                                onClick={() => {
                                    if (cat.id === 'LINK_ANALYSIS') {
                                        setActiveApp('LINK_ANALYSIS');
                                    } else {
                                        setSidebarCategory(cat.id);
                                    }
                                }}
                                className={`p-3 relative transition-colors ${isActiveCat && isModuleExplorerOpen ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                                title={cat.label}
                            >
                                <Icon size={20} strokeWidth={1.5} />
                                {isActiveCat && isModuleExplorerOpen && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* 2. MODULE EXPLORER (Left Panel) */}
                <div className={`shrink-0 bg-[#05070a] border-r border-primary/20 transition-all duration-300 z-20 flex flex-col ${isModuleExplorerOpen ? 'w-[280px]' : 'w-0 overflow-hidden'}`}>
                    <div className="p-4 border-b border-primary/10 shrink-0 flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                            {sidebarCategory} MODULES
                        </span>
                        <button onClick={toggleModuleExplorer} className="text-white/50 hover:text-white">
                            <Menu size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <ModuleRegistry 
                            embedded={true} 
                            categoryFilter={sidebarCategory} 
                            onSelectModule={(id) => {
                                toggleModule(id);
                                if (window.innerWidth < 768) toggleModuleExplorer(); // auto close on mobile
                            }} 
                        />
                    </div>
                </div>

                {/* 3. MAIN CONTENT AREA */}
                <div className="flex-1 flex relative overflow-hidden bg-black">
                    
                    {/* LINK ANALYSIS FULL SCREEN */}
                    {activeApp === 'LINK_ANALYSIS' && (
                        <div className="absolute inset-0 z-10 bg-black">
                            <LinkAnalysis />
                        </div>
                    )}
                    
                    {/* MAP BACKGROUND (Always render if Map-Centric to avoid re-mounting DeckGL) */}
                    {(isMapCentric || activeApp === 'MAP') && activeApp !== 'LINK_ANALYSIS' && (
                        <div className="absolute inset-0 z-0 bg-black">
                            <GothamGlobe />
                        </div>
                    )}

                    {/* OVERLAY PANEL (For Map-Centric Modules) */}
                    {isMapCentric && activeApp !== 'MAP' && ActiveComponent && (
                        <div className="absolute top-0 left-0 bottom-0 w-[420px] max-w-full z-10 bg-[#05070a]/95 border-r border-primary/30 shadow-[10px_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col animate-slide-in-left">
                            <div className="shrink-0 p-3 bg-primary/10 border-b border-primary/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target size={14} className="text-primary" />
                                    <span className="text-[11px] font-bold tracking-widest text-primary uppercase">{MODULE_TITLES[activeApp] || activeApp}</span>
                                </div>
                                <button onClick={() => setActiveApp('MAP')} className="text-primary hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                <ActiveComponent />
                            </div>
                        </div>
                    )}

                    {/* FULL SCREEN STANDALONE MODULES (E.g. Criminals, Air Quality) */}
                    {!isMapCentric && activeApp !== 'LINK_ANALYSIS' && ActiveComponent && (
                        <div className="absolute inset-0 z-10 bg-[#05070a] flex flex-col">
                            <div className="shrink-0 p-3 bg-[#030407] border-b border-primary/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-primary" />
                                    <span className="text-[11px] font-bold tracking-widest text-primary uppercase">{MODULE_TITLES[activeApp] || activeApp}</span>
                                </div>
                                <button onClick={() => setActiveApp('MAP')} className="text-primary/50 hover:text-white transition-colors flex items-center gap-1 text-[9px] tracking-widest">
                                    CLOSE <X size={12} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                <ActiveComponent />
                            </div>
                        </div>
                    )}

                </div>
            </div>
            
            {/* TOAST NOTIFICATIONS */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
                {notifications.filter(n => n.isToast).map(noti => (
                    <div key={noti.id} className="tactical-glass p-3 border-l-2 pointer-events-auto shadow-2xl animate-slide-up"
                         style={{ borderLeftColor: noti.type === 'SUCCESS' ? '#00f2ff' : noti.type === 'ERROR' ? '#ff3333' : '#ffb800' }}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-bold tracking-widest"
                                  style={{ color: noti.type === 'SUCCESS' ? '#00f2ff' : noti.type === 'ERROR' ? '#ff3333' : '#ffb800' }}>
                                SYSTEM_MESSAGE
                            </span>
                            <span className="text-[8px] text-white/40">{new Date(noti.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-[10px] text-white/80 leading-relaxed font-mono">{noti.message}</div>
                    </div>
                ))}
            </div>

            {/* Profile Modal */}
            {isProfileOpen && user && (
                <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} onLogout={onLogout} />
            )}
            
        </div>
    );
};

// Missing lucide icon import fallback
const Target = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

export default Layout;
"""

with open(r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\Layout.jsx", "w", encoding="utf-8") as f:
    f.write(LAYOUT_CODE)

print("Layout.jsx successfully rewritten!")
