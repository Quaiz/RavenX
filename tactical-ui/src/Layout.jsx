import React, { useState, useEffect, useCallback, useRef } from 'react';
import useStore, { MODULE_CATEGORIES } from './store';
import { audio } from './utils/audioEngine';
import { Shield, Radar, Moon, Globe, Database, Settings, Radio, Activity, Clock, BarChart3, Video, Grid, X, Minus, Square, Map, User, Bot, Bell, AlertTriangle, Info, Tv, ChevronRight, Network, LineChart, Volume2, VolumeX, LogOut, Terminal } from 'lucide-react';
import { Rnd } from 'react-rnd';
import GothamGlobe from './components/GothamGlobe';
import { AtmosphericIntelModule } from './components/DataFeedModules';
import CountryIntel from './components/CountryIntel';
import ModuleRegistry from './components/ModuleRegistry';
import WorldClock from './components/WorldClock';
import CryptoTracker from './components/CryptoTracker';
import ForexLive from './components/ForexLive';
import LiveWebcams from './components/LiveWebcams';
import NuclearStatus from './components/NuclearStatus';
import InternetCensorship from './components/InternetCensorship';
import FlightTracking from './components/FlightTracking';
import LocalAirRadar from './components/LocalAirRadar';
import AIAnalyst from './components/AIAnalyst';
import OSINTFeed from './components/OSINTFeed';
import CorporateIntel from './components/CorporateIntel';
import HumanitarianIntel from './components/HumanitarianIntel';
import MonetaryPolicy from './components/MonetaryPolicy';
import SearchTrends from './components/SearchTrends';
import MacroFeeds from './components/MacroFeeds';
import PredictionMarkets from './components/PredictionMarkets';
import SpaceWeather from './components/SpaceWeather';
import WeatherAlerts from './components/WeatherAlerts';
import SeismicMonitor from './components/SeismicMonitor';
import VesselTracking from './components/VesselTracking';
import ThermalAnomalies from './components/ThermalAnomalies';
import DiseaseOutbreaks from './components/DiseaseOutbreaks';
import GPSInterference from './components/GPSInterference';
import MaritimeIntel from './components/MaritimeIntel';
import PowerGridStatus from './components/PowerGridStatus';
import AirQuality from './components/AirQuality';
import MilitaryRegistry from './components/MilitaryRegistry';
import MilitaryHardware from './components/MilitaryHardware';
import GlobalNewsTV from './components/GlobalNewsTV';
import ProfileModal from './components/ProfileModal';
import LinkAnalysis from './components/LinkAnalysis';
import ScrambleText from './components/ScrambleText';
import WantedCriminals from './components/WantedCriminals';
import CommandPalette from './components/CommandPalette';
import { saveLayout } from './auth';

const HEX_DUMP = Array.from({length: 15000}).map(() => Math.random().toString(16).substr(2, 8).toUpperCase() + " ").join('');

// ═══ CUSTOM RAVEN LOGO ═══
const RavenLogo = ({ size = 24, className = "" }) => (
 <div 
 className={`bg-current ${className}`}
 style={{
 width: size,
 height: size,
 WebkitMaskImage: 'url(/raven_favicon.png)',
 WebkitMaskSize: 'contain',
 WebkitMaskRepeat: 'no-repeat',
 WebkitMaskPosition: 'center',
 maskImage: 'url(/raven_favicon.png)',
 maskSize: 'contain',
 maskRepeat: 'no-repeat',
 maskPosition: 'center',
 }}
 />
);

// ═══ SLIM LIVE NEWS TICKER ═══
const TICKER_REGIONS = ['World', 'USA', 'Europe', 'Asia', 'Middle East', 'Africa'];
const NewsTicker = ({ minimizedModules, restoreModule, getModuleIcon }) => {
 const [headlines, setHeadlines] = useState([]);
 const regionIdx = useRef(0);

 const fetchHeadlines = useCallback(async () => {
 try {
 const region = TICKER_REGIONS[regionIdx.current % TICKER_REGIONS.length];
 regionIdx.current++;
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/news?country=${encodeURIComponent(region)}&limit=10`);
 if (!res.ok) return;
 const data = await res.json();
 const newItems = (data.articles || []).map(a => `${a.source}: ${a.title}`);
 setHeadlines(prev => {
 const merged = [...newItems, ...prev];
 const unique = [...new Set(merged)];
 return unique.slice(0, 40); // keep 40 max
 });
 } catch { }
 }, []);

 useEffect(() => {
 fetchHeadlines();
 const iv = setInterval(fetchHeadlines, 120000); // every 2 min
 return () => clearInterval(iv);
 }, [fetchHeadlines]);

 const tickerText = headlines.length > 0
 ? headlines.join(' ◆ ')
 : 'INITIALIZING GLOBAL INTELLIGENCE FEED...';

 return (
 <div className="h-6 border-t border-white/5 bg-[#05080d] flex items-center px-2 shrink-0 overflow-hidden">
 {/* Minimized module tabs */}
 {minimizedModules.length > 0 && (
 <div className="flex items-center gap-1 pr-2 mr-2 border-r border-white/10 shrink-0">
 {minimizedModules.map(id => {
 const IconComp = getModuleIcon(id);
 return (
 <button key={id} onClick={() => restoreModule(id)}
 className="p-0.5 hover:bg-white/5 transition-colors"title={id}>
 <IconComp size={10} className="text-primary/50 hover:text-primary"/>
 </button>
 );
 })}
 </div>
 )}
 <div className="flex items-center gap-1.5 shrink-0 mr-2 box-glow bg-red-500/10 px-2 py-0.5 ">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
 <span className="text-[7px] font-bold text-red-500 tracking-widest text-glow">LIVE FEED</span>
 </div>
 <div className="flex-1 overflow-hidden">
 <div className="whitespace-nowrap text-[9px] text-white/60 font-mono tracking-widest text-glow"
 style={{ animation: `tickerScroll ${Math.max(headlines.length * 8, 60)}s linear infinite`, display: 'inline-block' }}>
 {tickerText + ' ◆ ' + tickerText}
 </div>
 </div>
 </div>
 );
};

// ═══ MODULE CONTAINER FOR GRID ═══
const MODULES_NO_ZOOM = ['MAP_MODULE', 'LINK_ANALYSIS', 'GLOBAL_NEWS', 'LIVE_WEBCAMS', 'AIS_VESSELS'];

const ModuleContainer = React.forwardRef(({ id, title, icon: Icon, children, onClose, onMinimize, onMaximize, ...props }, ref) => {
 const uiScale = useStore(state => state.uiScale);
 const shouldZoom = !MODULES_NO_ZOOM.includes(id);
 
 return (
 <div ref={ref} {...props} className={`flex flex-col w-full h-full tactical-glass overflow-hidden relative shadow-2xl ${props.className || ''}`}>
 {/* HUD Corner Brackets */}
 {['top-[-2px] left-[-2px] border-t-4 border-l-4', 'top-[-2px] right-[-2px] border-t-4 border-r-4',
 'bottom-[-2px] left-[-2px] border-b-4 border-l-4', 'bottom-[-2px] right-[-2px] border-b-4 border-r-4'].map((cls, i) => (
 <div key={i} className={`absolute w-4 h-4 ${cls} border-primary/80 box-glow pointer-events-none`} style={{ zIndex: 10 }} />
 ))}
 
 {/* Header (Drag Handle) */}
 <div className="window-header h-10 border-b border-primary/40 flex items-center justify-between px-3 cursor-move select-none shrink-0"
 style={{ background: 'linear-gradient(90deg, rgba(var(--color-primary), 0.15) 0%, rgba(0,0,0,0.5) 100%)', boxShadow: '0 2px 10px rgba(var(--color-primary), 0.1)' }}>
 <div className="flex items-center gap-1.5 mr-3">
 <button
 onMouseDown={(e) => e.stopPropagation()}
 onClick={(e) => { e.stopPropagation(); onClose(id); }}
 className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all flex items-center justify-center group/close"
 />
 <button
 onMouseDown={(e) => e.stopPropagation()}
 onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
 className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all flex items-center justify-center group/min"
 />
 <button
 onMouseDown={(e) => e.stopPropagation()}
 onClick={(e) => { e.stopPropagation(); onMaximize(id); }}
 className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all flex items-center justify-center group/max"
 />
 </div>
 <div className="flex items-center gap-2 flex-1 min-w-0">
 {Icon && <Icon size={12} className="text-primary shrink-0 drop-shadow-[0_0_5px_rgba(var(--color-primary),0.8)]" />}
 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] truncate text-glow">{title}</span>
 </div>
 </div>
 {/* Content */}
 <div className="no-drag flex-1 overflow-y-auto overflow-x-hidden relative bg-black/20 custom-scrollbar pointer-events-auto flex flex-col">
 <div className="flex-1 flex flex-col"style={shouldZoom ? { zoom: uiScale, minHeight: '100%', height: '100%' } : { minHeight: '100%', height: '100%' }}>
 {children}
 </div>
 </div>
 </div>
 );
});

// ═══ ABSOLUTE FREE-FLOATING WINDOW ═══
const Window = ({ id, title, icon, state = {}, isMaximized, onDrag, onResize, onFocus, onClose, onMinimize, onMaximize, children, isMobile, layoutScale = 1 }) => {
 if (isMobile) {
 return (
 <div className="absolute inset-0 z-50 flex flex-col pointer-events-auto bg-[#05070a]" style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
 <ModuleContainer
 id={id}
 title={title}
 icon={icon}
 onClose={onClose}
 onMinimize={() => {}} // Disabled on mobile
 onMaximize={() => {}} // Disabled on mobile
 >
 {children}
 </ModuleContainer>
 </div>
 );
 }

 return (
 <Rnd
 scale={layoutScale}
 size={{ width: state.w, height: state.h }}
 position={{ x: state.x, y: state.y }}
 bounds="parent"
 onDragStop={(e, d) => onDrag(id, { x: d.x, y: Math.max(0, d.y) })}
 onResizeStop={(e, direction, ref, delta, position) => {
 onResize(id, {
 w: parseInt(ref.style.width, 10) || state.w,
 h: parseInt(ref.style.height, 10) || state.h,
 x: position.x,
 y: position.y
 });
 }}
 onMouseDownCapture={onFocus}
 disableDragging={isMaximized}
 enableResizing={!isMaximized}
 minWidth={300}
 minHeight={200}
 dragHandleClassName="window-header"
 cancel=".no-drag"
 style={{ zIndex: state.z, position: 'absolute' }}
 className="pointer-events-auto flex flex-col"
 >
 <ModuleContainer
 id={id}
 title={title}
 icon={icon}
 onClose={onClose}
 onMinimize={onMinimize}
 onMaximize={onMaximize}
 >
 {children}
 </ModuleContainer>
 </Rnd>
 );
};

// ═══ MARKET TERMINAL COMPONENT ═══
const MarketTerminal = () => {
  const [marketData, setMarketData] = useState([]);
  
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/market-terminal');
        const data = await res.json();
        if (data.markets) {
            setMarketData(data.markets);
        }
      } catch (err) {}
    };
    fetchMarkets();
    const iv = setInterval(fetchMarkets, 60000);
    return () => clearInterval(iv);
  }, []);

  const getLabel = (sym) => {
      const map = {
          'BTC-USD': 'BTC/USD', 'ETH-USD': 'ETH/USD', 'GC=F': 'XAU/USD', 'CL=F': 'WTI_OIL',
          'EURUSD=X': 'EUR/USD', 'GBPUSD=X': 'GBP/USD', 'JPY=X': 'USD/JPY',
          '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ', '^TNX': 'US 10YR'
      };
      return map[sym] || sym;
  };
  const getColor = (sym) => {
      const map = {
          'BTC-USD': 'text-primary', 'ETH-USD': 'text-purple-400', 'GC=F': 'text-amber-500', 'CL=F': 'text-blue-400',
          'EURUSD=X': 'text-white', 'GBPUSD=X': 'text-white', 'JPY=X': 'text-red-400',
          '^GSPC': 'text-green-400', '^IXIC': 'text-green-400', '^TNX': 'text-gray-400'
      };
      return map[sym] || 'text-white';
  };

  if (marketData.length === 0) return <div className="p-4 text-[10px] text-white/50 animate-pulse font-mono tracking-widest uppercase">Syncing Live Tickers...</div>;

  return (
    <div className="p-4 md:p-6 space-y-3 md:space-y-4 overflow-y-auto h-full custom-scrollbar">
      {marketData.map(m => {
        const isUp = m.changePercent > 0;
        return (
        <div key={m.symbol} className="flex justify-between items-end border-b border-white/5 pb-2">
          <div className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">{getLabel(m.symbol)}</div>
          <div className="text-right">
            <div className={`text-[12px] md:text-sm font-bold font-mono ${getColor(m.symbol)}`}>
              {m.symbol === '^TNX' ? m.price.toFixed(3) + '%' : m.price > 1000 ? m.price.toLocaleString(undefined, {minimumFractionDigits: 2}) : m.price.toFixed(4)}
            </div>
            <div className={`text-[7px] md:text-[8px] font-mono tracking-wider ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{m.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      )})}
    </div>
  );
};

// ═══ GRIDLINE-STYLE SPLASH SCREEN ═══
const SplashScreen = ({ onOpenRegistry }) => (
 <div className="absolute inset-0 flex flex-col items-center justify-center select-none overflow-hidden bg-[#030407]" onContextMenu={(e) => { e.preventDefault(); onOpenRegistry(); }}>
 {/* Clean Minimalist Background */}
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.08)_0%,transparent_60%)] pointer-events-none"/>

 {/* Subtle Grid Lines */}
 <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
 style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

 {/* Logo / Shield */}
 <div className="relative mb-6 z-10">
 <div className="w-16 h-16 border border-primary/40 flex items-center justify-center bg-black/40 relative box-glow backdrop-blur-md transition-all hover:scale-105 cursor-pointer"onClick={onOpenRegistry}>
 <RavenLogo size={28} className="text-primary text-glow"/>
 <div className="absolute inset-0 border-t-2 border-primary pointer-events-none"/>
 </div>
 </div>

 {/* Version text */}
 <div className="text-[36px] leading-none font-stencil text-white tracking-[0.2em] uppercase mb-3 text-glow z-10 relative cursor-default">
 RAVEN-X
 </div>
 </div>
);

// ═══ TOP BAR CLOCK ═══
const TopBarClock = () => {
 const [time, setTime] = useState(new Date());
 useEffect(() => {
 const timer = setInterval(() => setTime(new Date()), 1000);
 return () => clearInterval(timer);
 }, []);
 return (
 <span className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest flex items-center font-mono tabular-nums whitespace-nowrap min-w-[55px] sm:min-w-[70px] justify-end shrink-0">
 {time.toLocaleTimeString('en-GB', { hour12: false })} <span className="hidden sm:inline ml-1">UTC</span>
 </span>
 );
};

const Layout = ({ user, showGreeting, onEnterDashboard, onLogout, onUsernameChange }) => {
 const activeWorkspace = useStore(state => state.activeWorkspace);
 const switchWorkspace = useStore(state => state.switchWorkspace);
 const activeView = useStore(state => state.activeView);
 const setActiveView = useStore(state => state.setActiveView);
 const activeCountry = useStore(state => state.activeCountry);
 const fetchMarkets = useStore(state => state.fetchMarkets);
 const activeModules = useStore(state => state.activeModules);
 const minimizedModules = useStore(state => state.minimizedModules);
 const windowStates = useStore(state => state.windowStates) || {};
 const preMaxStates = useStore(state => state.preMaxStates) || {};
 const notifications = useStore(state => state.notifications) || [];
 const uiScale = useStore(state => state.uiScale);
 const setUiScale = useStore(state => state.setUiScale);
 const toggleModule = useStore(state => state.toggleModule);
 const minimizeModule = useStore(state => state.minimizeModule);
 const restoreModule = useStore(state => state.restoreModule);
 const toggleMaximize = useStore(state => state.toggleMaximize);
 const dismissToast = useStore(state => state.dismissToast);
 const setWindowPos = useStore(state => state.setWindowPos);
 const bringToFront = useStore(state => state.bringToFront);
 const mobileActiveTab = useStore(state => state.mobileActiveTab);
 const setMobileActiveTab = useStore(state => state.setMobileActiveTab);

 const [isRegistryOpen, setIsRegistryOpen] = useState(false);
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const [isNotiOpen, setIsNotiOpen] = useState(false);
 const [isThemeOpen, setIsThemeOpen] = useState(false);
 const [bootHovered, setBootHovered] = useState(false);
 const [bootReady, setBootReady] = useState(false);
 const [bootStep, setBootStep] = useState(0);
 const [currentUser, setCurrentUser] = useState(user);
 const [windowWidth, setWindowWidth] = useState(window.innerWidth);
 const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
 const saveTimerRef = useRef(null);

 const layoutScale = isMobile ? 1 : Math.max(0.5, Math.min(2.5, windowWidth / 1920));

 useEffect(() => {
 const handleResize = () => {
 setWindowWidth(window.innerWidth);
 setIsMobile(window.innerWidth < 768);
 };
 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, []);

 useEffect(() => {
 fetchMarkets();
 const interval = setInterval(() => fetchMarkets(), 60000);
 return () => clearInterval(interval);
 }, []);

  // 24-hour Auto-Reload Mechanism (seamless layout restoration via localStorage)
  useEffect(() => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // 24 hours = 86400000 ms. 25 hours = 90000000 ms (forced limit)
      if (elapsed >= 90000000 || (elapsed >= 86400000 && document.hidden)) {
        window.location.reload();
      }
    }, 60000); // Check once a minute

    return () => clearInterval(checkInterval);
  }, []);

 useEffect(() => {
 if (showGreeting && currentUser) {
 setBootReady(false);
 setBootStep(0);
 
 const intervals = [
 setTimeout(() => { setBootStep(1); audio.playTyping(); }, 400),
 setTimeout(() => { setBootStep(2); audio.playTyping(); }, 800),
 setTimeout(() => { setBootStep(3); audio.playTyping(); }, 1200),
 setTimeout(() => { setBootStep(4); audio.playTyping(); }, 1600),
 setTimeout(() => { setBootStep(5); audio.playTyping(); }, 2000),
 ];
 
 const timer = setTimeout(() => {
 setBootReady(true);
 setBootStep(6);
 audio.playTyping();
 }, 4000);
 
 return () => {
 intervals.forEach(clearTimeout);
 clearTimeout(timer);
 };
 }
 }, [showGreeting, currentUser]);

 useEffect(() => {
 const handleKeyDown = (e) => {
 if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, []);

 // Auto-save layout to backend (debounced 3s)
 useEffect(() => {
 if (!user?.token) return;
 clearTimeout(saveTimerRef.current);
 saveTimerRef.current = setTimeout(() => {
 const state = useStore.getState();
 // Ensure the current workspace state is perfectly synced to the `workspaces` object before saving
 const workspacesToSave = { ...state.workspaces };
 workspacesToSave[state.activeWorkspace] = {
 activeModules: state.activeModules,
 minimizedModules: state.minimizedModules,
 windowStates: state.windowStates,
 preMaxStates: state.preMaxStates
 };

 saveLayout(user.token, { 
 activeModules: state.activeModules, 
 windowStates: state.windowStates, 
 mapConfig: state.mapConfig,
 workspaces: workspacesToSave,
 activeWorkspace: state.activeWorkspace
 });
 }, 3000);
 return () => clearTimeout(saveTimerRef.current);
 }, [activeModules, minimizedModules, windowStates]);

 const handleUsernameChange = (newName) => {
 setCurrentUser(prev => ({ ...prev, username: newName }));
 onUsernameChange?.(newName);
 };

 const handleLogout = () => {
 setIsProfileOpen(false);
 onLogout?.();
 };

 const renderModuleContent = (id) => {
 switch (id) {
 case 'MAP_MODULE': return <GothamGlobe />;
 case 'ATMOSPHERIC_INTEL': return <AtmosphericIntelModule />;
 case 'COUNTRY_INTEL': return <CountryIntel country={activeCountry} />;
 case 'LIVE_WEBCAMS': return <LiveWebcams />;
 case 'NUCLEAR_FACILITIES': return <NuclearStatus />;
 case 'CENSORSHIP': return <InternetCensorship />;
 case 'CORPORATE_INTEL': return <CorporateIntel />;
 case 'HUMANITARIAN': return <HumanitarianIntel />;
 case 'MACRO_FEEDS': return <MacroFeeds />;
 case 'PREDICTION_MARKETS': return <PredictionMarkets />;
 case 'SPACE_WEATHER': return <SpaceWeather />;
 case 'WEATHER_ALERTS': return <WeatherAlerts />;
 case 'NASA_FIRES': return <ThermalAnomalies />;
 case 'AIR_QUALITY': return <AirQuality />;
 case 'SEISMIC': return <SeismicMonitor />;
 case 'AIS_VESSELS': return <VesselTracking />;
 case 'MONETARY_POLICY': return <MonetaryPolicy />;
 case 'GOOGLE_TRENDS': return <SearchTrends />;
 case 'MARKET_TERMINAL': return <MarketTerminal />;
 case 'WORLD_CLOCK':
 return <WorldClock />;
 case 'CRYPTO':
 return <CryptoTracker />;
 case 'FOREX':
 return <ForexLive />;
 case 'ADSB_AIRCRAFT':
 return <FlightTracking />;
 case 'LOCAL_AIR_RADAR':
 return <LocalAirRadar />;
 case 'OSINT_FEED':
 return <OSINTFeed />;
 case 'MARITIME_INTEL':
 return <MaritimeIntel />;
 case 'POWER_GRIDS':
 return <PowerGridStatus />;
 case 'GPS_JAMMING':
 return <GPSInterference />;
 case 'MILITARY_BASES':
 return <MilitaryRegistry />;
 case 'MILITARY_HARDWARE':
 return <MilitaryHardware />;
 case 'DISEASE_OUTBREAKS':
 return <DiseaseOutbreaks />;
 case 'AI_ANALYST':
 return <AIAnalyst />;
 case 'GLOBAL_NEWS':
 return <GlobalNewsTV />;
 case 'LINK_ANALYSIS':
 return <LinkAnalysis />;
 case 'GLOBAL_TARGETS':
 return <WantedCriminals />;
 case 'WANTED_CRIMINALS':
 return <WantedCriminals />;
 default:
 const allModules = Object.values(MODULE_CATEGORIES).flat();
 const moduleInfo = allModules.find(m => m.id === id);
 return (
 <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
 <div className="w-12 h-12 border border-white/5 bg-white/[0.02] flex items-center justify-center relative">
 <Activity size={24} className="text-primary/20 animate-pulse"/>
 <div className="absolute inset-0 border-t border-primary/40 animate-[shimmer_2s_infinite]" />
 </div>
 <div className="space-y-1">
 <div className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">{moduleInfo?.name || id}</div>
 <div className="text-[8px] text-white/20 uppercase tracking-widest leading-relaxed max-w-[200px]">
 {moduleInfo?.desc || 'Data stream initializing...'}
 </div>
 </div>
 <div className="flex gap-2">
 <div className="w-1 h-1 bg-primary rounded-full animate-bounce"style={{ animationDelay: '0s' }} />
 <div className="w-1 h-1 bg-primary rounded-full animate-bounce"style={{ animationDelay: '0.2s' }} />
 <div className="w-1 h-1 bg-primary rounded-full animate-bounce"style={{ animationDelay: '0.4s' }} />
 </div>
 <div className="text-[6px] text-primary/40 font-mono mt-4 uppercase tracking-[0.3em]">RAVEN_DEEP_SYNC_ACTIVE</div>
 </div>
 );
 }
 };

 const getModuleTitle = (id) => {
 const allModules = Object.values(MODULE_CATEGORIES).flat();
 const moduleInfo = allModules.find(m => m.id === id);
 if (moduleInfo) return `// ${moduleInfo.name}`;
 switch (id) {
 case 'MAP_MODULE': return '// MAP';
 case 'ATMOSPHERIC_INTEL': return '// Atmospheric Intel';
 case 'COUNTRY_INTEL': return `// Country Intel: ${activeCountry}`;
 case 'LIVE_WEBCAMS': return '// Live Webcams';
 case 'MARKET_TELEMETRY': return '// Market Telemetry';
 case 'WORLD_CLOCK': return '// Strategic Chrono';
 case 'CORPORATE_INTEL': return '// Corporate Intel';
 case 'HUMANITARIAN': return '// Humanitarian Intel';
 case 'MACRO_FEEDS': return '// Macro Feeds';
 case 'PREDICTION_MARKETS': return '// Prediction Odds';
 case 'MONETARY_POLICY': return '// Monetary Policy';
 case 'GOOGLE_TRENDS': return '// Search Trends';
 default: return `// ${id}`;
 }
 };

 const getModuleIcon = (id) => {
 switch (id) {
 case 'MAP_MODULE': return Map;
 case 'ATMOSPHERIC_INTEL': return Activity;
 case 'COUNTRY_INTEL': return Globe;
 case 'LIVE_WEBCAMS': return Video;
 case 'MARKET_TERMINAL': return BarChart3;
 case 'WORLD_CLOCK': return Clock;
 case 'MARITIME_INTEL': return Radio;
 case 'SEISMIC': return Activity;
 case 'CORPORATE_INTEL': return Database;
 case 'MACRO_FEEDS': return BarChart3;
 case 'MONETARY_POLICY': return BarChart3;
 case 'GOOGLE_TRENDS': return Globe;
 case 'OSINT_FEED': return Radio;
 case 'DISEASE_OUTBREAKS': return Activity;
 case 'NUCLEAR_FACILITIES': return Shield;
 case 'GPS_JAMMING': return Radio;
 case 'MILITARY_BASES': return Shield;
 case 'POWER_GRIDS': return Activity;
 case 'AI_ANALYST': return Bot;
 case 'GLOBAL_NEWS': return Tv;
 case 'LINK_ANALYSIS': return Grid;
 default: return Activity;
 }
 };

 // Visible modules = active minus minimized
 const visibleModules = activeModules.filter(id => !minimizedModules.includes(id));
 const hasAnyModules = activeModules.length > 0;

 const maxModuleBottomPx = visibleModules.length > 0 
 ? Math.max(...visibleModules.map(id => (windowStates[id]?.y || 0) + (windowStates[id]?.h || 0) + 150))
 : 0;
 const wrapperHeight = maxModuleBottomPx * layoutScale;

 return (
 <div className="w-screen bg-background text-white font-military overflow-hidden flex flex-col relative"style={{ height: '100dvh' }}>
 <div className="crt-overlay"/>
 <div className="crt-vignette"/>

 {/* ═══ TOP NAVIGATION BAR ═══ */}
 <div className="border-b border-primary/20 shrink-0 flex items-center justify-between px-2 md:px-6 z-[10000] relative tactical-glass shadow-[0_5px_20px_rgba(0,0,0,0.5)]" style={{ minHeight: '3.5rem', paddingTop: 'env(safe-area-inset-top)' }}>
 <div className="flex items-center gap-2 md:gap-8 shrink-0">
 <div className="flex items-center gap-2 md:gap-3">
 <div className="w-8 h-8 border border-primary/50 flex items-center justify-center bg-black/40 box-glow shrink-0">
 <RavenLogo size={18} className="text-primary text-glow"/>
 </div>
 <div className="flex flex-col leading-none">
 <span className="text-[12px] md:text-[14px] font-stencil font-bold tracking-[0.2em] md:tracking-[0.4em] text-white/90 text-glow">RAVEN-X</span>
 <span className="text-[6px] md:text-[8px] text-primary/80 font-bold tracking-widest uppercase mt-1 drop-shadow-[0_0_5px_rgba(var(--color-primary),0.8)] hidden sm:block">// RavenSystem v8.2</span>
 </div>
 </div>
 <div className="h-6 w-px bg-primary/20 hidden sm:block"/>
 <div className="flex gap-2 md:gap-4 shrink-0 overflow-hidden">
 <div className="flex items-center gap-1 md:gap-2 box-glow bg-green-500/10 px-1 md:px-2 py-1 shrink-0 whitespace-nowrap">
 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"/>
 <span className="text-[7px] md:text-[9px] font-bold text-green-500 uppercase tracking-widest hidden sm:inline"style={{textShadow: '0 0 5px rgba(34,197,94,0.5)'}}>Operational</span>
 <span className="text-[7px] font-bold text-green-500 uppercase tracking-widest sm:hidden"style={{textShadow: '0 0 5px rgba(34,197,94,0.5)'}}>SYS OK</span>
 </div>
 <TopBarClock />
 </div>
 </div>

 {/* WORKSPACE SWITCHER (REDESIGNED TACTICAL HUD) */}
 <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:flex items-center h-8 bg-black/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
 {[
 { id: 1, label: 'TACTICAL', icon: Map },
 { id: 2, label: 'OSINT', icon: Network },
 { id: 3, label: 'MACRO', icon: LineChart }
 ].map((ws, index) => {
 const isActive = activeWorkspace === ws.id;
 return (
 <React.Fragment key={ws.id}>
 <button
 onClick={() => { audio.playClick(); switchWorkspace(ws.id); }}
 title={ws.label}
 className={`relative flex items-center justify-center w-12 h-full transition-all group overflow-hidden ${isActive ? 'bg-primary/10' : 'hover:bg-white/5'}`}
 >
 {/* Active Top Border Glow */}
 {isActive && (
 <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(var(--color-primary),1)]" />
 )}
 
 {/* Background scanning effect on hover */}
 {!isActive && (
 <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
 )}

 <ws.icon size={14} className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-[0_0_5px_rgba(var(--color-primary),0.8)]' : 'text-white/30 group-hover:text-white/80'}`} />
 
 {/* Subtly show the workspace number */}
 <span className={`absolute bottom-0.5 right-1 text-[6px] font-mono font-bold ${isActive ? 'text-primary/50' : 'text-white/10 group-hover:text-white/30'}`}>
 0{ws.id}
 </span>
 </button>
 {index < 2 && <div className="w-px h-4 bg-white/10"/>}
 </React.Fragment>
 );
 })}
 </div>

 <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar min-w-0 ml-auto pl-2"style={{ maskImage: 'linear-gradient(to right, transparent, black 10px, black)' }}>

 {/* Theme Switcher */}
 <div className="relative shrink-0 flex items-center">
 <button 
 onClick={() => setIsThemeOpen(!isThemeOpen)}
 className="flex items-center gap-1 border border-white/10 p-1 px-2 bg-black/40 hover:bg-white/10 transition-colors text-[9px] font-bold tracking-widest text-primary uppercase"
 >
 <Settings size={10} className="sm:hidden"/>
 <span className="hidden sm:inline">THEME</span>
 </button>
 

 </div>

 <button onClick={() => setIsRegistryOpen(true)} className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-primary text-black text-[9px] md:text-[10px] font-bold tracking-widest uppercase hover:bg-primary/80 transition-colors shadow-[0_0_10px_rgba(var(--color-primary),0.2)] lock-on-hover shrink-0">
 <Grid size={12} />
 <span className="hidden sm:inline">Module</span>
 </button>
 
 {/* UI Scaling Controls */}
 <div className="flex items-center border border-white/10 bg-black/40 mr-1 md:mr-3 shrink-0">
 <button 
 onClick={() => setUiScale(Math.max(0.6, uiScale - 0.1))}
 className="px-2 py-1 text-[9px] font-bold text-white/50 hover:text-primary hover:bg-white/10 transition-colors"
 title="Decrease Font Size"
 >A-</button>
 <div className="px-1 text-[8px] text-white/30 font-mono tracking-widest min-w-[32px] text-center">{Math.round(uiScale * 100)}%</div>
 <button 
 onClick={() => setUiScale(Math.min(1.5, uiScale + 0.1))}
 className="px-2 py-1 text-[9px] font-bold text-white/50 hover:text-primary hover:bg-white/10 transition-colors"
 title="Increase Font Size"
 >A+</button>
 </div>

 {/* Terminal Command Palette Button */}
 <button 
 onClick={() => { audio.playClick(); useStore.getState().setCommandPaletteOpen(true); }}
 className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-[22px] border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 shadow-[0_0_10px_rgba(var(--color-primary),0.2)] mr-1 md:mr-2"
 title="Command Palette (Ctrl+K)"
 >
 <Terminal size={12} className="text-primary"/>
 </button>

 {/* Notifications Bell */}
 <button 
 onClick={() => { audio.playClick(); setIsNotiOpen(!isNotiOpen); }}
 className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-[22px] border border-white/10 bg-black/40 hover:bg-white/10 transition-colors shrink-0"
 >
 <Bell size={12} className="text-white/80"/>
 {(notifications || []).length > 0 && (
 <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_#ef4444]" />
 )}
 </button>
 {/* Volume toggle */}
 <button
 onClick={() => { useStore.getState().toggleSound(); }}
 className="flex items-center justify-center w-6 h-6 md:w-8 md:h-[22px] border border-white/10 bg-black/40 hover:bg-white/10 transition-colors shrink-0 text-white/50 hover:text-white/80"
 >
 {useStore.getState().isSoundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
 </button>
 {/* User chip */}
 {currentUser && (
 <button
 onClick={() => { audio.playClick(); setIsProfileOpen(true); }}
 className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 border border-white/10 text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/50 hover:text-white/80 hover:border-white/20 transition-colors lock-on-hover shrink-0 max-w-[80px] md:max-w-[120px] truncate"
 >
 <User size={10} className="shrink-0"/>
 <span className="truncate">{currentUser.username ? currentUser.username.split(' ')[0] : 'OPERATOR'}</span>
 </button>
 )}
 </div>
 </div>

 {/* Global Dropdowns (Rendered outside overflow containers) */}
 {isThemeOpen && (
 <div className="fixed top-14 right-4 mt-2 p-1.5 bg-[#05080d]/95 border border-white/10 shadow-xl backdrop-blur-md flex flex-col gap-1 z-[100000] min-w-[70px] pointer-events-auto">
 {[
 { id: 'DEFAULT', color: '#ffb800', label: 'TAC' },
 { id: 'GHOST', color: '#00f2ff', label: 'GHO' },
 { id: 'COMBAT', color: '#ff3333', label: 'CBT' },
 { id: 'NVG', color: '#4ade80', label: 'NVG' }
 ].map(t => (
 <button
 key={t.id}
 onClick={() => {
 useStore.getState().setTheme(t.id);
 setIsThemeOpen(false);
 }}
 className={`w-full py-1.5 flex items-center justify-center text-[8px] font-bold transition-all border border-transparent ${useStore.getState().theme === t.id ? 'bg-white/10 border-white/20' : 'hover:bg-white/5'}`}
 style={{ color: t.color }}
 >
 {t.label}
 </button>
 ))}
 </div>
 )}

 {/* MAIN WORKSPACE — modules are clipped here, above ticker */}
 <div className="flex-1 relative bg-[#05070a] overflow-hidden">
 {/* Splash Screen when no modules active */}
 {!hasAnyModules && (
 <SplashScreen onOpenRegistry={() => setIsRegistryOpen(true)} />
 )}

 {/* ═══ SCROLLING FREE-FLOAT WORKSPACE ═══ */}
 {isMobile ? (
 mobileActiveTab && (mobileActiveTab === 'MAP_MODULE' || activeModules.includes(mobileActiveTab)) && (
 <Window
 key={mobileActiveTab}
 id={mobileActiveTab}
 title={getModuleTitle(mobileActiveTab)}
 icon={getModuleIcon(mobileActiveTab)}
 onClose={toggleModule}
 isMobile={true}
 layoutScale={1}
 >
 {renderModuleContent(mobileActiveTab)}
 </Window>
 )
 ) : (
 <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden custom-scrollbar pointer-events-auto">
 <div style={{ minHeight: '100%', height: wrapperHeight > 0 ? `${wrapperHeight}px` : '100%', overflow: 'hidden' }}>
 <div 
 className="relative"
 style={{ 
 transform: `scale(${layoutScale})`, 
 transformOrigin: 'top left',
 width: `${100 / layoutScale}%`,
 minHeight: `${100 / layoutScale}%`
 }}
 >
 {/* BOUNDING BOX PARENT: Limits top/left/right perfectly, allows downward dragging */}
 <div className="absolute top-0 left-0 right-0 h-[10000px]">
 {visibleModules.map(id => {
 const isMaximized = preMaxStates[id] !== undefined;
 const pad = 20 / layoutScale;
 const maxW = `calc(100% - ${pad * 2}px)`;
 const maxH = (window.innerHeight - 100) / layoutScale;
 const defaultState = windowStates[id] || { x: 100, y: 100, w: 400, h: 300, z: 10 };

 return (
 <Window
 key={id}
 id={id}
 title={getModuleTitle(id)}
 icon={getModuleIcon(id)}
 state={isMaximized ? { ...defaultState, w: maxW, h: maxH, x: pad, y: pad } : defaultState}
 isMaximized={isMaximized}
 onDrag={setWindowPos}
 onResize={setWindowPos}
 onFocus={() => bringToFront(id)}
 onClose={toggleModule}
 onMinimize={minimizeModule}
 onMaximize={toggleMaximize}
 layoutScale={layoutScale}
 >
 {renderModuleContent(id)}
 </Window>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* SLIM BOTTOM NEWS TICKER — always visible below modules ON DESKTOP */}
 {!isMobile && <NewsTicker minimizedModules={minimizedModules} restoreModule={restoreModule} getModuleIcon={getModuleIcon} />}

 {/* MOBILE BOTTOM TABS */}
 {isMobile && !showGreeting && (
 <div className="fixed bottom-0 left-0 w-full bg-[#0a0d11]/98 border-t border-white/10 z-[100000] flex items-center px-2 overflow-x-auto no-scrollbar shadow-[0_-5px_20px_rgba(0,0,0,0.8)] backdrop-blur-md"style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
 <button
 onClick={() => { audio.playClick(); setMobileActiveTab('MAP_MODULE'); }}
 className={`flex-shrink-0 min-w-[60px] h-10 flex flex-col items-center justify-center mx-1 relative transition-colors ${mobileActiveTab === 'MAP_MODULE' ? 'text-primary' : 'text-white/40 hover:text-white/80'}`}
 >
 <Map size={14} className="mb-1"/>
 <span className="text-[7px] font-bold uppercase tracking-widest">Map</span>
 {mobileActiveTab === 'MAP_MODULE' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" style={{ marginBottom: 'env(safe-area-inset-bottom)' }} />}
 </button>

 {activeModules.filter(id => id !== 'MAP_MODULE').map(id => {
 const IconComp = getModuleIcon(id);
 const title = getModuleTitle(id).replace('// ', '');
 const isActive = mobileActiveTab === id;
 return (
 <button
 key={id}
 onClick={() => { audio.playClick(); setMobileActiveTab(id); }}
 className={`flex-shrink-0 min-w-[70px] px-2 h-10 flex flex-col items-center justify-center mx-1 relative transition-colors ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/80'}`}
 >
 <IconComp size={14} className="mb-1"/>
 <span className="text-[7px] font-bold uppercase tracking-widest truncate w-full text-center">{title}</span>
 {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" style={{ marginBottom: 'env(safe-area-inset-bottom)' }} />}
 </button>
 )
 })}
 </div>
 )}

 {/* Module Registry Modal */}
 <ModuleRegistry isOpen={isRegistryOpen} onClose={() => setIsRegistryOpen(false)} />

 {/* Profile Modal */}
 {isProfileOpen && currentUser && (
 <ProfileModal
 user={currentUser}
 token={user?.token}
 onClose={() => setIsProfileOpen(false)}
 onLogout={handleLogout}
 onUsernameChange={handleUsernameChange}
 />
 )}

 <CommandPalette />

  {/* TOAST NOTIFICATIONS */}
 {!showGreeting && (
 <div className="fixed top-16 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
 {(notifications || []).filter(n => n.isToast).map(noti => (
 <div key={noti.id} className={`w-80 pointer-events-auto tactical-glass border-l-4 ${noti.type === 'CRITICAL' ? 'border-l-red-500' : noti.type === 'WARNING' ? 'border-l-yellow-500' : 'border-l-primary'} p-3 shadow-2xl bg-[#05080d]/90 backdrop-blur-md animate-in slide-in-from-right fade-in duration-300`}>
 <div className="flex justify-between items-start mb-1">
 <div className="flex items-center gap-2">
 {noti.type === 'CRITICAL' && <AlertTriangle size={12} className="text-red-500"/>}
 {noti.type === 'WARNING' && <AlertTriangle size={12} className="text-yellow-500"/>}
 {noti.type === 'INFO' && <Info size={12} className="text-primary"/>}
 <span className={`text-[10px] font-bold tracking-widest ${noti.type === 'CRITICAL' ? 'text-red-500' : noti.type === 'WARNING' ? 'text-yellow-500' : 'text-primary'}`}>{noti.type} ALERT</span>
 </div>
 <button onClick={() => dismissToast(noti.id)} className="text-white/40 hover:text-white">
 <X size={12} />
 </button>
 </div>
 <div className="text-[11px] text-white/90 font-mono leading-tight">{noti.text}</div>
 <div className="text-[8px] text-white/30 mt-2">{new Date(noti.time).toLocaleTimeString()}</div>
 </div>
 ))}
 </div>
 )}

 {/* NOTIFICATION LOG PANEL */}
 {isNotiOpen && (
 <div className="fixed top-14 right-0 bottom-6 w-80 bg-[#05080d]/95 backdrop-blur-md border-l border-white/10 z-[99990] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
 <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <Bell size={12} className="text-primary"/>
 <span className="text-[10px] font-bold text-primary tracking-widest uppercase">SYSTEM LOGS</span>
 </div>
 <button onClick={() => setIsNotiOpen(false)} className="text-white/50 hover:text-white"><X size={14}/></button>
 </div>
 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
 {!(notifications && notifications.length > 0) ? (
 <div className="text-[10px] text-white/30 uppercase tracking-widest text-center mt-10">No recent alerts</div>
 ) : (
 notifications.map(noti => (
 <div key={noti.id} className={`border border-white/5 p-3 bg-white/[0.02] ${noti.type === 'CRITICAL' ? 'border-l-2 border-l-red-500' : noti.type === 'WARNING' ? 'border-l-2 border-l-yellow-500' : 'border-l-2 border-l-primary'}`}>
 <div className="flex justify-between items-start mb-1">
 <span className={`text-[9px] font-bold tracking-widest ${noti.type === 'CRITICAL' ? 'text-red-500' : noti.type === 'WARNING' ? 'text-yellow-500' : 'text-primary'}`}>{noti.type}</span>
 <span className="text-[8px] text-white/40">{new Date(noti.time).toLocaleTimeString()}</span>
 </div>
 <div className="text-[10px] text-white/80 font-mono mt-1 leading-relaxed">{noti.text}</div>
 </div>
 ))
 )}
 </div>
 <div className="p-3 border-t border-white/10 shrink-0">
 <button onClick={() => useStore.getState().clearNotifications()} className="w-full py-1.5 border border-white/10 text-[9px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-colors">
 Clear Logs
 </button>
 </div>
 </div>
 )}

 {/* Greeting overlay / Boot Sequence */}
 {showGreeting && currentUser && (
 <div className="fixed inset-0 z-[99995] flex flex-col items-center justify-center font-military overflow-y-auto overflow-x-hidden py-8"
 style={{ background: 'rgba(5,7,10,0.85)', backdropFilter: 'blur(16px)' }}>
 
 {/* Hex Dump Background */}
 <div className="absolute top-0 left-0 w-full opacity-10 pointer-events-none font-mono text-[10px] md:text-[14px] text-primary whitespace-pre-wrap break-all leading-none select-none z-0"
 style={{ animation: 'hexScroll 30s linear infinite', height: '200%' }}>
 {HEX_DUMP}
 </div>

 {/* Scanlines */}
 <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{
 background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 4px)',
 }} />
 <div className="absolute inset-0 pointer-events-none opacity-20"style={{
 background: 'radial-gradient(circle at center, rgba(var(--color-primary), 0.2) 0%, transparent 70%)',
 }} />
 
 {/* Main Console */}
 <div className="relative flex flex-col items-start w-[800px] max-w-[95vw] h-auto p-6 md:p-8 border border-white/10 bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md shrink-0 my-auto">
 {/* HUD Corners */}
 <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"/>
 <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"/>
 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"/>
 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"/>

 <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 w-full border-b border-white/10 pb-4">
 <div className="w-12 h-12 md:w-16 md:h-16 border border-primary/50 flex items-center justify-center bg-primary/10 box-glow relative shrink-0">
 <RavenLogo size={24} className="text-primary animate-pulse md:w-[32px] md:h-[32px]"/>
 </div>
 <div>
 <div className="text-[28px] md:text-[40px] font-stencil tracking-[0.2em] uppercase text-white text-glow leading-none">RAVEN_OS</div>
 <div className="text-[10px] md:text-[12px] text-primary/80 tracking-widest uppercase font-mono mt-2">v9.2.4 // SECURE BOOT SEQUENCE</div>
 </div>
 </div>

 <div className="w-full mb-6 font-mono text-[11px] md:text-[13px] uppercase tracking-wider min-h-[180px] md:min-h-[220px]">
 <div className="space-y-3">
 {bootStep >= 1 && <div className="text-white/40 animate-in fade-in duration-100">&gt; INITIALIZING CORE KERNEL............. <span className="text-green-500">OK</span></div>}
 {bootStep >= 2 && <div className="text-white/40 animate-in fade-in duration-100">&gt; LOADING MIL-SPEC ENCRYPTION MODULES.. <span className="text-green-500">OK</span></div>}
 {bootStep >= 3 && <div className="text-white/40 animate-in fade-in duration-100">&gt; CONNECTING TO SATELLITE UPLINK....... <span className="text-yellow-500">ESTABLISHED</span></div>}
 {bootStep >= 4 && <div className="text-white/40 animate-in fade-in duration-100">&gt; SYNCING BLUE FORCE TRACKER........... <span className="text-green-500">OK</span></div>}
 {bootStep >= 5 && <div className="text-primary text-glow animate-in fade-in duration-100">&gt; AUTHENTICATING USER CREDENTIALS......</div>}
 {bootReady && (
 <>
 <div className="text-green-500 font-bold animate-in fade-in duration-100">&gt; IDENTITY VERIFIED: {currentUser?.username || 'OPERATOR'}</div>
 <div className="text-white animate-in fade-in duration-100"style={{ animationDelay: '200ms' }}>&gt; ACCESS LEVEL: <span className="text-red-500 font-bold bg-red-500/20 px-1">TOP SECRET // NOFORN</span></div>
 </>
 )}
 </div>
 </div>

 <button
 onClick={bootReady ? () => { audio.playInitialize(); onEnterDashboard(); } : undefined}
 onMouseEnter={() => { setBootHovered(true); if(bootReady) audio.playHover(); }}
 onMouseLeave={() => setBootHovered(false)}
 disabled={!bootReady}
 className={`w-full py-4 md:py-6 text-[14px] md:text-[16px] font-bold tracking-[0.4em] uppercase border transition-all group relative overflow-hidden ${bootReady ? 'border-primary text-primary hover:bg-primary hover:text-black cursor-pointer' : 'border-white/10 text-white/30 cursor-not-allowed'}`}
 style={{ boxShadow: bootReady ? '0 0 20px rgba(var(--color-primary),0.2)' : 'none' }}
 >
 <div className={`absolute inset-0 bg-primary/20 translate-y-full ${bootReady ? 'group-hover:translate-y-0' : ''} transition-transform duration-300`} />
 <span className="relative flex items-center justify-center gap-3">
 {bootReady ? (
 <>
 [ <ScrambleText text="INITIALIZE WORKSPACE"trigger={bootHovered} duration={300} /> ]
 <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform"/>
 </>
 ) : (
 <span>[ SECURE BOOT IN PROGRESS... ]</span>
 )}
 </span>
 </button>
 </div>
 </div>
 )}

 <style dangerouslySetInnerHTML={{
 __html: `
 @keyframes tickerScroll {
 0% { transform: translateX(0); }
 100% { transform: translateX(-50%); }
 }
 
 @keyframes hexScroll {
 0% { transform: translateY(0); }
 100% { transform: translateY(-50%); }
 }
 
 @keyframes moveUp {
 0% { transform: translateY(100%); }
 100% { transform: translateY(-50%); }
 }
 
 /* Remove previous react-resizable overrides as we use react-rnd now */

 `}} />
 </div>
 );
};

export default Layout;