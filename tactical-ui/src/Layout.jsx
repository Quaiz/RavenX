import React, { useState, useEffect, useCallback, useRef } from 'react';
import useStore, { MODULE_CATEGORIES } from './store';
import { audio } from './utils/audioEngine';
import { Shield, Radar, Moon, Globe, Database, Settings, Radio, Activity, Clock, BarChart3, Video, Grid, X, Minus, Square, Plus, Mic, Layers, Navigation, ShieldAlert, Crosshair, Map, User, Bot, Bell, AlertTriangle, Info, Tv, ChevronRight, ChevronsRight, Network, LineChart, Volume2, VolumeX, LogOut, Terminal } from 'lucide-react';
import { Rnd } from 'react-rnd';
import TopographicCanvas from './components/TopographicCanvas';
import Watcher02CommsHUD from './components/Watcher02CommsHUD';
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
import HumintIntel from './components/HumintIntel';
import { WindowErrorBoundary } from './components/ErrorBoundary';
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

const ModuleContainer = React.memo(React.forwardRef(({ id, title, icon: Icon, children, onClose, isClosing = false, ...props }, ref) => {
  const uiScale = useStore(state => state.uiScale);
  const shouldZoom = !MODULES_NO_ZOOM.includes(id);
  const dbCode = `IW-${String(id || 'MOD').replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase()}-A`;
  const idxCode = `AVF-${String((id || '').length * 19 + 11).padStart(3, '0')}`;

  return (
    <div
      ref={ref}
      {...props}
      className={`flex flex-col w-full h-full overflow-hidden relative bg-[#060d08]/95 border border-[#4bd865]/45 shadow-[0_18px_44px_rgba(0,0,0,0.92)] ${
        isClosing ? 'macos-window-exit' : 'macos-window-enter'
      } ${props.className || ''}`}
      style={{ contain: 'layout style', ...(props.style || {}) }}
    >
      {/* Watcher Program IWV Header (Synced with WATCHER-02 Emerald Green) */}
      <div
        className="window-header h-7 border-b border-black flex items-center justify-between cursor-move select-none shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, rgba(42,96,48,0.9) 0%, rgba(24,56,29,0.92) 48%, rgba(10,20,12,0.96) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(57,231,95,0.22)',
        }}
      >
        {/* Left: Red [X] Close Square + Unboxed Module Icon & Title */}
        <div className="flex items-center h-full min-w-0 flex-1 relative z-10">
          <button
            type="button"
            title="Close Module"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              audio.playClick?.();
              onClose?.(id);
            }}
            className="no-drag w-7 h-full bg-[#261111] hover:bg-[#e05252] text-[#ff6b6b] hover:text-[#090c09] border-r border-black/80 font-mono text-[11px] font-bold leading-none flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            X
          </button>

          {/* Clean unboxed Icon + Module Name */}
          <div className="flex items-center gap-2 px-2.5 min-w-0 flex-1">
            {Icon && <Icon size={13} className="text-[#39e75f] shrink-0 drop-shadow-[0_0_5px_rgba(57,231,95,0.5)]" />}
            <span className="text-[11px] font-bold text-[#eef6ee] tracking-[0.14em] uppercase truncate">
              {title}
            </span>
            <span className="hidden sm:inline text-[9px] font-mono text-[#4de068]/50 tracking-wider truncate ml-auto pr-2">
              {`.../sys/${String(id || 'module').toLowerCase()}.raw`}
            </span>
          </div>
        </div>

        {/* Far-right Watcher Program [ON] Status Box + signature bright green end-cap bar */}
        <div className="flex items-center h-full shrink-0 relative z-10">
          <div className="h-5 px-2 bg-[#071109] border border-[#39e75f]/40 text-[#39e75f] font-mono text-[8px] font-bold tracking-widest leading-none flex items-center justify-center">
            ON
          </div>
          <div className="w-1.5 h-full bg-[#39e75f] ml-1.5 border-l border-black/80" />
        </div>
      </div>

      {/* Inner viewport border + Content */}
      <div className="no-drag flex-1 overflow-y-auto overflow-x-hidden relative bg-[#050b07]/90 custom-scrollbar pointer-events-auto flex flex-col border-b border-[#4bd865]/25">
        <div
          className="flex-1 flex flex-col"
          style={shouldZoom ? { zoom: uiScale, minHeight: '100%', height: '100%' } : { minHeight: '100%', height: '100%' }}
        >
          {children}
        </div>
      </div>

      {/* Watcher Program Database / Index Footer Bar */}
      <div className="h-5 bg-[#071109] px-2.5 flex items-center justify-between text-[9px] font-mono select-none shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[#4de068]/65">Database</span>
          <span className="text-[#eef6ee]/90 font-semibold">{dbCode}</span>
          <span className="text-[#39e75f]/40 mx-0.5">•</span>
          <span className="text-[#4de068]/65">Index</span>
          <span className="text-[#eef6ee]/90 font-semibold">{idxCode}</span>
          <span className="text-[#39e75f]/65 uppercase tracking-widest ml-1.5 text-[8px]">ACTIVE</span>
        </div>
        <span className="text-[8px] text-[#39e75f]/60 tracking-widest uppercase shrink-0">
          IWV // LIVE
        </span>
      </div>
    </div>
  );
}));

// ═══ ABSOLUTE FREE-FLOATING WINDOW (60FPS HARDWARE ACCELERATED) ═══
const Window = React.memo(({ id, title, icon, state = {}, isMaximized, isClosing = false, onDrag, onResize, onFocus, onClose, onMinimize, onMaximize, children, isMobile, layoutScale = 1 }) => {
 const handleFocus = useCallback(() => {
 onFocus?.(id);
 }, [onFocus, id]);

 const handleClose = useCallback(() => {
 onClose?.(id);
 }, [onClose, id]);

 const handleMinimize = useCallback(() => {
 onMinimize?.(id);
 }, [onMinimize, id]);

 const handleMaximize = useCallback(() => {
 onMaximize?.(id);
 }, [onMaximize, id]);

 const handleDragStop = useCallback((e, d) => {
 onDrag?.(id, { x: d.x, y: Math.max(0, d.y) });
 }, [onDrag, id]);

 const handleResizeStop = useCallback((e, direction, ref, delta, position) => {
 onResize?.(id, {
 w: parseInt(ref.style.width, 10) || state.w,
 h: parseInt(ref.style.height, 10) || state.h,
 x: position.x,
 y: position.y
 });
 }, [onResize, id, state.w, state.h]);

 if (isMobile) {
 return (
 <div className="absolute inset-0 z-50 flex flex-col pointer-events-auto bg-[#05070a]" style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
 <ModuleContainer
 id={id}
 title={title}
 icon={icon}
 onClose={handleClose}
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
 onDragStop={handleDragStop}
 onResizeStop={handleResizeStop}
 onMouseDownCapture={handleFocus}
 disableDragging={isMaximized}
 enableResizing={!isMaximized}
 minWidth={300}
 minHeight={200}
 dragHandleClassName="window-header"
 cancel=".no-drag"
 style={{ zIndex: state.z, position: 'absolute', willChange: 'transform' }}
 className="pointer-events-auto flex flex-col"
 >
 <ModuleContainer
 id={id}
 title={title}
 icon={icon}
 isClosing={isClosing}
 onClose={handleClose}
 onMinimize={handleMinimize}
 onMaximize={handleMaximize}
 >
 {children}
 </ModuleContainer>
 </Rnd>
 );
});

// ═══ MARKET TERMINAL COMPONENT ═══
const MarketTerminal = () => {
  const storeMarkets = useStore(state => state.feeds.markets);
  const [marketData, setMarketData] = useState(() => Array.isArray(storeMarkets) && storeMarkets.length > 0 ? storeMarkets : []);
  
  useEffect(() => {
    if (Array.isArray(storeMarkets) && storeMarkets.length > 0) {
      setMarketData(storeMarkets);
    }
  }, [storeMarkets]);

  // Initial fetch fallback if hub not yet populated
  useEffect(() => {
    if (marketData.length > 0) return;
    const fetchMarkets = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/market-terminal');
        const data = await res.json();
        if (data.markets) setMarketData(data.markets);
      } catch (err) {}
    };
    fetchMarkets();
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
        if (!m || typeof m !== 'object') return null;
        const priceNum = Number(m.price || 0);
        const changeNum = Number(m.changePercent || 0);
        const isUp = changeNum > 0;
        const formattedPrice = m.symbol === '^TNX' 
          ? priceNum.toFixed(3) + '%' 
          : priceNum > 1000 
            ? priceNum.toLocaleString(undefined, {minimumFractionDigits: 2}) 
            : priceNum.toFixed(4);

        return (
        <div key={m.symbol || Math.random()} className="flex justify-between items-end border-b border-white/5 pb-2">
          <div className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">{getLabel(m.symbol)}</div>
          <div className="text-right">
            <div className={`text-[12px] md:text-sm font-bold font-mono ${getColor(m.symbol)}`}>
              {formattedPrice}
            </div>
            <div className={`text-[7px] md:text-[8px] font-mono tracking-wider ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{changeNum.toFixed(2)}%
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

// ═══ MODULE HELPER FUNCTIONS & MEMOIZED CONTENT RENDERER ═══
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
    case 'HUMINT': return User;
    default: return Activity;
  }
};

const getModuleTitle = (id, activeCountry) => {
  const allModules = Object.values(MODULE_CATEGORIES).flat();
  const moduleInfo = allModules.find(m => m.id === id);
  if (moduleInfo) return `// ${moduleInfo.name}`;
  switch (id) {
    case 'MAP_MODULE': return '// MAP';
    case 'ATMOSPHERIC_INTEL': return '// Atmospheric Intel';
    case 'COUNTRY_INTEL': return `// Country Intel: ${activeCountry || ''}`;
    case 'LIVE_WEBCAMS': return '// Live Webcams';
    case 'MARKET_TELEMETRY': return '// Market Telemetry';
    case 'WORLD_CLOCK': return '// THEATER CHRONO';
    case 'CORPORATE_INTEL': return '// Corporate Intel';
    case 'HUMANITARIAN': return '// Humanitarian Intel';
    case 'MACRO_FEEDS': return '// Macro Feeds';
    case 'PREDICTION_MARKETS': return '// Prediction Odds';
    case 'MONETARY_POLICY': return '// Monetary Policy';
    case 'GOOGLE_TRENDS': return '// Search Trends';
    case 'HUMINT': return '// DENIABLE ASSETS & SAFENET';
    default: return `// ${id}`;
  }
};

const ModuleContent = React.memo(({ id, activeCountry }) => {
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
    case 'WORLD_CLOCK': return <WorldClock />;
    case 'CRYPTO': return <CryptoTracker />;
    case 'FOREX': return <ForexLive />;
    case 'ADSB_AIRCRAFT': return <FlightTracking />;
    case 'LOCAL_AIR_RADAR': return <LocalAirRadar />;
    case 'OSINT_FEED': return <OSINTFeed />;
    case 'MARITIME_INTEL': return <MaritimeIntel />;
    case 'POWER_GRIDS': return <PowerGridStatus />;
    case 'GPS_JAMMING': return <GPSInterference />;
    case 'MILITARY_BASES': return <MilitaryRegistry />;
    case 'MILITARY_HARDWARE': return <MilitaryHardware />;
    case 'DISEASE_OUTBREAKS': return <DiseaseOutbreaks />;
    case 'AI_ANALYST': return <AIAnalyst />;
    case 'GLOBAL_NEWS': return <GlobalNewsTV />;
    case 'LINK_ANALYSIS': return <LinkAnalysis />;
    case 'GLOBAL_TARGETS':
    case 'WANTED_CRIMINALS': return <WantedCriminals />;
    case 'HUMINT': return <HumintIntel />;
    default: {
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
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <div className="text-[6px] text-primary/40 font-mono mt-4 uppercase tracking-[0.3em]">RAVEN_DEEP_SYNC_ACTIVE</div>
        </div>
      );
    }
  }
});

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
 const mapOverlayOpen = useStore(state => state.mapOverlayOpen);
 const toggleMapOverlayOpen = useStore(state => state.toggleMapOverlayOpen);
 const activeOverlayCount = useStore(state => state.mapConfig.activeOverlays.length);
 const rangefinderActive = useStore(state => state.rangefinderActive);
 const toggleRangefinder = useStore(state => state.toggleRangefinder);
 const geofenceActive = useStore(state => state.geofenceActive);
 const toggleGeofence = useStore(state => state.toggleGeofence);
 const predictiveTrackingActive = useStore(state => state.predictiveTracking.active);
 const togglePredictiveTracking = useStore(state => state.togglePredictiveTracking);

 const [isRegistryOpen, setIsRegistryOpen] = useState(false);
 const [isWatcherOpen, setIsWatcherOpen] = useState(false);
 const [isWatcherSpeaking, setIsWatcherSpeaking] = useState(false);
 const [isProfileOpen, setIsProfileOpen] = useState(false);

 useEffect(() => {
   return audio.subscribeVoice((st) => {
     setIsWatcherSpeaking(Boolean(st.isSpeaking));
   });
 }, []);
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

  // ═══ MASTER TELEMETRY HUB HEARTBEAT (Single Coordinated Pulse Every 15s) ═══
  useEffect(() => {
    const syncHub = useStore.getState().syncTelemetryHub;
    syncHub(); // Initial instant pulse
    const interval = setInterval(() => {
      if (!document.hidden) {
        syncHub();
      }
    }, 15000);
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

 const handleUsernameChange = (newName) => {
 setCurrentUser(prev => ({ ...prev, username: newName }));
 onUsernameChange?.(newName);
 };

 const handleLogout = () => {
 setIsProfileOpen(false);
 onLogout?.();
 };

 // Visible floating modules = active minus minimized, excluding permanent Map & dedicated WATCHER-02 HUD
 const visibleModules = activeModules.filter(
   id => !minimizedModules.includes(id) && id !== 'MAP_MODULE' && id !== 'AI_ANALYST'
 );

 // Track closing modules for 215ms so macOS window-close animation plays smoothly before unmount
 const [closingModules, setClosingModules] = useState([]);
 const prevVisibleRef = useRef(visibleModules);

 useEffect(() => {
   const prev = prevVisibleRef.current;
   const removed = prev.filter(id => !visibleModules.includes(id));
   prevVisibleRef.current = visibleModules;
   if (removed.length > 0) {
     setClosingModules(curr => [...new Set([...curr, ...removed])]);
     const t = setTimeout(() => {
       setClosingModules(curr => curr.filter(id => !removed.includes(id)));
     }, 215);
     return () => clearTimeout(t);
   }
 }, [visibleModules]);

 const renderedModules = [
   ...visibleModules,
   ...closingModules.filter(id => !visibleModules.includes(id)),
 ];

 const maxModuleBottomPx = renderedModules.length > 0 
 ? Math.max(...renderedModules.map(id => (windowStates[id]?.y || 0) + (windowStates[id]?.h || 0) + 150))
 : 0;
 const wrapperHeight = maxModuleBottomPx * layoutScale;

 return (
 <div className="w-screen bg-[#0c0e0d] text-[#e8eae6] font-military overflow-hidden flex flex-col relative" style={{ height: '100dvh' }}>

 {/* ═══ MAIN FULL-SCREEN STAGE (Left Vertical Bar + 100% Map Canvas + Floating Modules) ═══ */}
 <div className="flex-1 flex relative bg-[#0c0e0d] overflow-hidden">

 {/* ═══ LEFT VERTICAL COMMAND BAR (WATCHER-02 Emerald Green Stack) ═══ */}
 <div
   className="w-12 border-r border-[#4bd865]/30 bg-[#060d08]/95 z-[10000] flex flex-col items-center justify-between py-2.5 px-1 shrink-0 select-none"
   style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
 >
   {/* Top Stack: Static Brand Emblem + Modules Registry + 4 Map Tools (Layers, Rangefinder, Geofence, Fusion) */}
   <div className="flex flex-col items-center gap-1.5 w-full">
     {/* Static RavenX Core Emblem (Not a button) */}
     <div
       title="RAVEN-X // WATCHER PROGRAM"
       className="w-9 h-9 border border-[#39e75f]/35 bg-[#0a170d] flex items-center justify-center relative select-none"
     >
       <RavenLogo size={18} className="text-[#39e75f]" />
       <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#39e75f] border border-[#060d08]" />
     </div>

     <div className="w-6 h-px bg-[#39e75f]/20 my-0.5" />

     {/* 1. Toggle Tactical Modules Button */}
     <button
       type="button"
       onClick={() => {
         audio.playClick();
         setIsRegistryOpen((prev) => {
           const next = !prev;
           if (next) useStore.getState().setMapOverlayOpen(false);
           return next;
         });
       }}
       title="Toggle Tactical Modules"
       className={`w-9 h-9 border flex items-center justify-center relative transition-colors cursor-pointer ${
         isRegistryOpen || visibleModules.length > 0
           ? 'bg-[#17361d] border-[#39e75f] text-[#eef6ee] shadow-[0_0_12px_rgba(57,231,95,0.25)]'
           : 'bg-[#09140b] border-[#39e75f]/30 text-[#4de068] hover:border-[#39e75f] hover:text-[#eef6ee]'
       }`}
     >
       <Grid size={15} />
       {visibleModules.length > 0 && (
         <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-[#39e75f] text-[#060d08] font-mono text-[8px] font-bold flex items-center justify-center">
           {visibleModules.length}
         </span>
       )}
     </button>

     <div className="w-6 h-px bg-[#39e75f]/20 my-0.5" />

     {/* 2. Map Overlays / Layers Button */}
     <button
       type="button"
       onClick={() => {
         if (!mapOverlayOpen) setIsRegistryOpen(false);
         toggleMapOverlayOpen();
       }}
       title="Map Layers & Overlays"
       className={`w-9 h-8 border flex items-center justify-center relative transition-colors cursor-pointer ${
         mapOverlayOpen || activeOverlayCount > 0
           ? 'bg-[#17361d] border-[#39e75f] text-[#eef6ee] shadow-[0_0_10px_rgba(57,231,95,0.22)]'
           : 'bg-[#09140b] border-[#39e75f]/30 text-[#4de068] hover:border-[#39e75f] hover:text-[#eef6ee]'
       }`}
     >
       <Layers size={14} />
       {activeOverlayCount > 0 && (
         <span className="absolute -top-1 -right-1 min-w-[13px] h-[13px] px-0.5 bg-[#39e75f] text-[#060d08] font-mono text-[7px] font-bold flex items-center justify-center">
           {activeOverlayCount}
         </span>
       )}
     </button>

     {/* 3. Tactical Rangefinder Button */}
     <button
       type="button"
       onClick={toggleRangefinder}
       title="Tactical Rangefinder (Middle Click Map)"
       className={`w-9 h-8 border flex items-center justify-center transition-colors cursor-pointer ${
         rangefinderActive
           ? 'bg-[#361616] border-[#ef5350] text-[#ff7b7b] shadow-[0_0_10px_rgba(239,83,80,0.35)]'
           : 'bg-[#09140b] border-[#39e75f]/30 text-[#4de068] hover:border-[#39e75f] hover:text-[#eef6ee]'
       }`}
     >
       <Navigation size={13} />
     </button>

     {/* 4. Draw Geofence Perimeter Button */}
     <button
       type="button"
       onClick={toggleGeofence}
       title="Draw Geofence Perimeter"
       className={`w-9 h-8 border flex items-center justify-center transition-colors cursor-pointer ${
         geofenceActive
           ? 'bg-[#361616] border-[#ef5350] text-[#ff7b7b] shadow-[0_0_10px_rgba(239,83,80,0.35)]'
           : 'bg-[#09140b] border-[#39e75f]/30 text-[#4de068] hover:border-[#39e75f] hover:text-[#eef6ee]'
       }`}
     >
       <ShieldAlert size={13} />
     </button>

     {/* 5. Data Fusion Predictive Tracking Button */}
     <button
       type="button"
       onClick={togglePredictiveTracking}
       title="Data Fusion Predictive Tracking"
       className={`w-9 h-8 border flex items-center justify-center transition-colors cursor-pointer ${
         predictiveTrackingActive
           ? 'bg-[#382210] border-[#f97316] text-[#fdba74] shadow-[0_0_10px_rgba(249,115,22,0.35)]'
           : 'bg-[#09140b] border-[#39e75f]/30 text-[#4de068] hover:border-[#39e75f] hover:text-[#eef6ee]'
       }`}
     >
       <Crosshair size={13} />
     </button>
   </div>

   {/* Bottom Stack: WATCHER-02, Command Palette, Notifications, Master Audio, Operator Profile */}
   <div className="flex flex-col items-center gap-1.5 w-full">
     {/* WATCHER-02 Handler Toggle Button (Grouped with bottom controls, no blinking dot) */}
     <button
       type="button"
       onClick={() => {
         audio.playClick();
         setIsWatcherOpen((prev) => !prev);
       }}
       title="Toggle WATCHER-02 Tactical Handler"
       className={`w-9 h-8 border flex items-center justify-center relative transition-all cursor-pointer ${
         isWatcherOpen
           ? 'bg-[#17361d] border-[#39e75f] text-[#eef6ee] shadow-[0_0_12px_rgba(57,231,95,0.25)]'
           : 'bg-[#09140b] border-[#39e75f]/30 text-[#39e75f] hover:border-[#39e75f] hover:text-[#eef6ee]'
       }`}
     >
       <Mic size={13} className={isWatcherOpen ? 'text-[#eef6ee]' : 'text-[#39e75f]'} />
     </button>

     {/* Tactical Command Link (Ctrl+K) */}
     <button
       type="button"
       onClick={() => { audio.playClick(); useStore.getState().setCommandPaletteOpen(true); }}
       className="w-9 h-8 bg-[#09140b] border border-[#39e75f]/30 hover:border-[#39e75f] text-[#39e75f] flex items-center justify-center transition-colors cursor-pointer"
       title="Tactical Command Link (Ctrl+K)"
     >
       <Terminal size={13} />
     </button>

     {/* System Logs / Notifications Bell */}
     <button
       type="button"
       onClick={() => { audio.playClick(); setIsNotiOpen(!isNotiOpen); }}
       className="relative w-9 h-8 bg-[#09140b] border border-[#39e75f]/30 hover:border-[#39e75f] text-[#a3cca7] hover:text-[#eef6ee] flex items-center justify-center transition-colors cursor-pointer"
       title="System Logs & Alerts"
     >
       <Bell size={13} />
       {(notifications || []).length > 0 && (
         <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#d94638] rounded-full" />
       )}
     </button>

     {/* Master Audio Mute / Unmute */}
     <button
       type="button"
       onClick={() => { useStore.getState().toggleSound(); }}
       className="w-9 h-8 bg-[#09140b] border border-[#39e75f]/30 hover:border-[#39e75f] text-[#a3cca7] hover:text-[#eef6ee] flex items-center justify-center transition-colors cursor-pointer"
       title="Toggle Master Audio"
     >
       {useStore.getState().isSoundEnabled ? <Volume2 size={13} className="text-[#39e75f]" /> : <VolumeX size={13} className="text-[#ef5350]" />}
     </button>

     {/* Operator Profile */}
     {currentUser && (
       <button
         type="button"
         onClick={() => { audio.playClick(); setIsProfileOpen(true); }}
         title={`Operator: ${currentUser.username || 'OPERATOR'}`}
         className="w-9 h-9 bg-[#0e2012] border border-[#39e75f]/45 hover:border-[#39e75f] text-[#39e75f] flex items-center justify-center transition-colors cursor-pointer"
       >
         <User size={13} />
       </button>
     )}
   </div>
 </div>

 {/* ═══ MAIN MAP STAGE (100% Full-Screen Primary Map + Floating Modules + WATCHER-02 Comms HUD) ═══ */}
 <div className="flex-1 relative bg-[#0c0e0d] overflow-hidden">
   {/* 1. Permanent Full-Screen Tactical Map Canvas */}
   <div className="absolute inset-0 z-0">
     <WindowErrorBoundary moduleId="MAP_MODULE">
       <GothamGlobe />
     </WindowErrorBoundary>
   </div>

   {/* 2. WATCHER-02 Comms HUD (Shown when toggled ON from Left Vertical Bar) */}
   {!showGreeting && (
     <Watcher02CommsHUD
       isOpen={isWatcherOpen}
       onClose={() => setIsWatcherOpen(false)}
       isRegistryOpen={isRegistryOpen}
       onOpenComms={() => setIsRegistryOpen(false)}
     />
   )}

   {/* 3. Optional Floating Modules Layer (Pointer-Events-None container so Map stays interactive) */}
   {isMobile ? (
     mobileActiveTab && mobileActiveTab !== 'MAP_MODULE' && visibleModules.includes(mobileActiveTab) && (
       <Window
         key={mobileActiveTab}
         id={mobileActiveTab}
         title={getModuleTitle(mobileActiveTab, activeCountry)}
         icon={getModuleIcon(mobileActiveTab)}
         onClose={toggleModule}
         isMobile={true}
         layoutScale={1}
       >
         <WindowErrorBoundary moduleId={mobileActiveTab}>
           <ModuleContent id={mobileActiveTab} activeCountry={mobileActiveTab === 'COUNTRY_INTEL' ? activeCountry : null} />
         </WindowErrorBoundary>
       </Window>
     )
   ) : (
     renderedModules.length > 0 && (
       <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden custom-scrollbar pointer-events-none">
         <div style={{ minHeight: '100%', height: wrapperHeight > 0 ? `${wrapperHeight}px` : '100%', overflow: 'hidden' }}>
           <div
             className="relative"
             style={{
               transform: `scale(${layoutScale})`,
               transformOrigin: 'top left',
               width: `${100 / layoutScale}%`,
               minHeight: `${100 / layoutScale}%`,
             }}
           >
             <div className="absolute top-0 left-0 right-0 h-[10000px] pointer-events-none">
               {renderedModules.map((id) => {
                 const isMaximized = preMaxStates[id] !== undefined;
                 const isClosing = !visibleModules.includes(id);
                 const pad = 20 / layoutScale;
                 const maxW = `calc(100% - ${pad * 2}px)`;
                 const maxH = (window.innerHeight - 60) / layoutScale;
                 const defaultState = windowStates[id] || { x: 460, y: 80, w: 460, h: 360, z: 10 };

                 return (
                   <Window
                     key={id}
                     id={id}
                     title={getModuleTitle(id, activeCountry)}
                     icon={getModuleIcon(id)}
                     state={isMaximized ? { ...defaultState, w: maxW, h: maxH, x: pad, y: pad } : defaultState}
                     isMaximized={isMaximized}
                     isClosing={isClosing}
                     onDrag={setWindowPos}
                     onResize={setWindowPos}
                     onFocus={bringToFront}
                     onClose={toggleModule}
                     onMinimize={minimizeModule}
                     onMaximize={toggleMaximize}
                     layoutScale={layoutScale}
                   >
                     <WindowErrorBoundary moduleId={id}>
                       <ModuleContent id={id} activeCountry={id === 'COUNTRY_INTEL' ? activeCountry : null} />
                     </WindowErrorBoundary>
                   </Window>
                 );
               })}
             </div>
           </div>
         </div>
       </div>
     )
   )}
 </div>
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

 {/* Module Registry Docked Panel (Sits directly above WATCHER-02 Active Speaker) */}
 <ModuleRegistry
   isOpen={isRegistryOpen}
   onClose={() => setIsRegistryOpen(false)}
   isWatcherOpen={isWatcherOpen}
 />

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

 {/* Greeting overlay / Open-Stage Topographic Command Deploy (Synced with IntroScreen) */}
 {showGreeting && currentUser && (
 <div
 className="fixed inset-0 z-[99995] overflow-hidden select-none font-military text-[#e8eae6]"
 style={{ background: '#070a08' }}
 >
 {/* Animated Topographic / Contour Flow-Field */}
 <TopographicCanvas speed={0.14} />

 {/* Directional vignette keeping left column crisp while contours shine on the right */}
 <div
 className="absolute inset-0 pointer-events-none"
 style={{
 background:
 'linear-gradient(90deg, rgba(7,10,8,0.88) 0%, rgba(7,10,8,0.52) 42%, rgba(7,10,8,0.18) 100%)',
 }}
 />

 {/* Top minimal status strip */}
 <div className="relative z-10 h-12 px-6 md:px-10 border-b border-white/10 bg-[#0b0e0c]/75 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <span className="text-[12px] font-stencil tracking-[0.28em] text-[#e8eae6]">RAVEN-X</span>
 <span className="mw4-badge px-1.5 py-0.5 text-[8px] leading-none">OPS</span>
 <span className="hidden sm:inline text-[9px] font-mono tracking-[0.22em] text-white/35 uppercase">
 OPERATOR STAGING // WORKSPACE READY
 </span>
 </div>
 <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.2em] uppercase">
 <span className="flex items-center gap-1.5 text-[#c6d67a]">
 <span className={`w-1.5 h-1.5 rounded-full ${bootReady ? 'bg-[#7fa872]' : 'bg-[#e0c243]'}`} />
 {bootReady ? 'SYSTEMS READY' : 'INITIALIZING'}
 </span>
 </div>
 </div>

 {/* Open-Stage Left Command Column */}
 <div className="relative z-10 h-[calc(100%-3rem)] max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col justify-center">
 <div className="w-full max-w-[440px]">
 {/* Operator Emblem Card */}
 <div className="flex items-center gap-3.5 mb-8 pb-5 border-b border-white/10">
 <div className="relative w-12 h-12 rounded-full border border-[#c6d67a]/45 bg-[#131814] flex items-center justify-center shrink-0">
 <RavenLogo size={22} className="text-[#d8ea96]" />
 <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7fa872] border-2 border-[#0b0e0c]" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-[14px] font-bold text-[#e8eae6] tracking-wider uppercase truncate">
 {currentUser?.username || 'OPERATOR'}
 </span>
 <span className="px-2 py-0.5 bg-[#171e18] border border-[#c6d67a]/30 text-[9px] font-mono text-[#c6d67a] tracking-widest uppercase shrink-0">
 VERIFIED
 </span>
 </div>
 <div className="text-[9px] font-mono text-white/40 tracking-[0.22em] uppercase mt-1 truncate">
 WATCHER PROGRAM // CLEARANCE: EYES ONLY
 </div>
 </div>
 </div>

 {/* Signature Hero Deploy Button (Exact Match to IntroScreen) */}
 <button
 onClick={bootReady ? () => { audio.playInitialize(); audio.playVoiceClip('comms_online', { cooldownMs: 5000 }); onEnterDashboard(); } : undefined}
 onMouseEnter={() => { setBootHovered(true); if (bootReady) audio.playHover(); }}
 onMouseLeave={() => setBootHovered(false)}
 disabled={!bootReady}
 className={`w-full text-left px-5 py-4 mb-6 flex items-center justify-between group ${
 bootReady
 ? 'mw4-hero-btn cursor-pointer'
 : 'bg-white/[0.03] border border-white/10 text-white/30 cursor-not-allowed'
 }`}
 >
 <div className="flex items-center gap-3">
 <ChevronsRight
 size={26}
 className={`shrink-0 transition-transform duration-150 ${
 bootReady ? 'text-[#e4f4a4] group-hover:translate-x-1' : 'text-white/20'
 }`}
 />
 <div>
 <div className="text-[20px] md:text-[24px] font-bold tracking-[0.16em] uppercase leading-none">
 {bootReady ? (
 <ScrambleText text="DEPLOY WORKSPACE" trigger={bootHovered} duration={240} />
 ) : (
 <span>INITIALIZING</span>
 )}
 </div>
 <div className="text-[9px] font-mono tracking-[0.24em] uppercase mt-1.5 opacity-70">
 {bootReady ? 'LAUNCH GLOBAL OPERATIONS GRID' : 'VERIFYING OPERATOR CLEARANCE'}
 </div>
 </div>
 </div>
 {bootReady && (
 <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#e8eae6] text-[#111413] font-bold shrink-0">
 READY
 </span>
 )}
 </button>

 {/* Clean Operational Checklist Rows */}
 <div className="space-y-1.5 font-mono text-[11px] uppercase tracking-wider">
 {[
 { num: '01', label: 'COMMAND KERNEL', ready: bootStep >= 1, status: 'ONLINE' },
 { num: '02', label: 'SECURE CHANNEL', ready: bootStep >= 2, status: 'VERIFIED' },
 { num: '03', label: 'SATELLITE UPLINK', ready: bootStep >= 3, status: 'LINKED' },
 { num: '04', label: 'GLOBAL TELEMETRY', ready: bootStep >= 4, status: 'SYNCED' },
 { num: '05', label: 'WATCHER-02 COMMS', ready: bootStep >= 5, status: bootReady ? 'ACTIVE' : 'AUTH' },
 ].map((item) => (
 <div
 key={item.num}
 className={`flex items-center justify-between px-3.5 py-2.5 mw4-row transition-opacity duration-150 ${
 item.ready ? 'opacity-100' : 'opacity-25'
 }`}
 >
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-bold opacity-55">{item.num}</span>
 <span className="text-[11px] font-bold tracking-[0.16em]">{item.label}</span>
 </div>
 <span
 className={`text-[8px] px-1.5 py-0.5 tracking-widest font-bold ${
 item.ready
 ? 'bg-[#7fa872]/15 text-[#c6d67a] border border-[#7fa872]/30'
 : 'text-white/25'
 }`}
 >
 {item.ready ? item.status : 'WAIT'}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Bottom-Right Classification Stamp */}
 <div className="absolute bottom-5 right-6 md:right-10 z-10 text-right font-mono text-[9px] tracking-[0.22em] uppercase pointer-events-none">
 <div className="text-white/30">RAVEN-X // GLOBAL OPERATIONS</div>
 <div className="text-[#f07167]/65 mt-0.5">18 U.S.C. § 1030 // NOFORN</div>
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