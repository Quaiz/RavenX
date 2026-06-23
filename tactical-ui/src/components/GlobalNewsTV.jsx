import React, { useState, useEffect, useRef } from 'react';
import { Signal, Radio, Globe, Tv, RefreshCcw, Search } from 'lucide-react';

const COUNTRIES = [
 { id: 'usa', name: 'USA', query: 'NBC News Live Fox News' },
 { id: 'uk', name: 'UNITED KINGDOM', query: 'Sky News Live' },
 { id: 'canada', name: 'CANADA', query: 'CBC News Live' },
 { id: 'germany', name: 'GERMANY', query: 'DW News Live' },
 { id: 'france', name: 'FRANCE', query: 'France 24 Live' },
 { id: 'qatar', name: 'QATAR (AL JAZEERA)', query: 'Al Jazeera Live' },
 { id: 'turkey', name: 'TURKEY (TRT)', query: 'TRT World Live' },
 { id: 'israel', name: 'ISRAEL', query: 'i24 News Live' },
 { id: 'china', name: 'CHINA (CGTN)', query: 'CGTN Live' },
 { id: 'india', name: 'INDIA', query: 'India Today Live WION' },
 { id: 'singapore', name: 'SINGAPORE (CNA)', query: 'CNA Live' },
 { id: 'vietnam', name: 'VIETNAM', query: 'VTC Now truc tiep' },
 { id: 'korea', name: 'SOUTH KOREA', query: 'Arirang TV Live' },
 { id: 'pakistan', name: 'PAKISTAN', query: 'Geo News Live' },
 { id: 'philippines', name: 'PHILIPPINES', query: 'GMA News Live' },
 { id: 'indonesia', name: 'INDONESIA', query: 'Kompas TV Live' },
 { id: 'australia', name: 'AUSTRALIA', query: 'ABC News Australia Live' },
 { id: 'africa', name: 'PAN-AFRICA', query: 'AfricaNews Live' },
 { id: 'south_africa', name: 'SOUTH AFRICA', query: 'SABC News Live' },
 { id: 'markets', name: 'GLOBAL MARKETS', query: 'Bloomberg TV Live' },
];

// Custom wrapper to catch YouTube errors natively
const NativeYouTubePlayer = ({ videoId, onError }) => {
 const containerRef = useRef(null);
 const onErrorRef = useRef(onError);

 // Keep callback ref updated without triggering re-initialization
 useEffect(() => {
 onErrorRef.current = onError;
 }, [onError]);

 useEffect(() => {
 let player;
 let timeoutId;

 const initPlayer = () => {
 if (!containerRef.current) return;
 
 // Clear container and create a fresh mount point
 containerRef.current.innerHTML = '';
 const div = document.createElement('div');
 containerRef.current.appendChild(div);

 player = new window.YT.Player(div, {
 videoId: videoId,
 width: '100%',
 height: '100%',
 playerVars: {
 autoplay: 1,
 mute: 1,
 modestbranding: 1,
 controls: 1,
 playsinline: 1
 },
 events: {
 onReady: (e) => {
 e.target.playVideo();
 },
 onError: (e) => {
 console.warn("YouTube Player Error:", e.data);
 if (onErrorRef.current) {
 onErrorRef.current();
 onErrorRef.current = null; // Prevent rapid fire from same video
 }
 }
 }
 });
 };

 if (!window.YT) {
 const tag = document.createElement('script');
 tag.src = 'https://www.youtube.com/iframe_api';
 document.body.appendChild(tag);
 window.onYouTubeIframeAPIReady = initPlayer;
 } else if (window.YT && window.YT.Player) {
 timeoutId = setTimeout(initPlayer, 100);
 }

 return () => {
 clearTimeout(timeoutId);
 if (player && player.destroy) {
 try {
 player.destroy();
 } catch(e) {}
 }
 };
 }, [videoId]); // ONLY re-run when videoId changes!

 return <div ref={containerRef} className="w-full h-full pointer-events-auto bg-black"/>;
};

const GlobalNewsTV = () => {
 const [activeCountry, setActiveCountry] = useState(() => {
 const saved = sessionStorage.getItem('gnn_country');
 if (saved) {
 const found = COUNTRIES.find(c => c.id === saved);
 if (found) return found;
 }
 return COUNTRIES[0];
 });
 const [videoIds, setVideoIds] = useState([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [skipCounter, setSkipCounter] = useState(0);
 const [isSearching, setIsSearching] = useState(true);
 const [isSwitching, setIsSwitching] = useState(false);
 const [errorCount, setErrorCount] = useState(0);
 const [allCountries, setAllCountries] = useState(COUNTRIES);
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
 fetch('https://restcountries.com/v3.1/all')
 .then(res => res.json())
 .then(data => {
 const fetched = data.map(d => ({
 id: d.cca3?.toLowerCase() || d.name.common,
 name: d.name.common.toUpperCase(),
 query: `${d.name.common} Live News`
 }));
 
 const mergedMap = new Map();
 fetched.forEach(c => mergedMap.set(c.id, c));
 COUNTRIES.forEach(c => mergedMap.set(c.id, c)); // Overwrite with custom
 
 const mergedArray = Array.from(mergedMap.values()).sort((a,b) => a.name.localeCompare(b.name));
 setAllCountries(mergedArray);
 })
 .catch(err => console.error("Failed to load countries", err));
 }, []);

 const fetchStreams = async (country) => {
 setIsSearching(true);
 setVideoIds([]);
 setCurrentIndex(0);
 setErrorCount(0);
 try {
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tv/search?query=${encodeURIComponent(country.query)}`);
 const data = await res.json();
 let ids = data.videoIds || [];
 
 // Always append multiple known 24/7 global news streams as ultimate fallbacks
 let fallbacks = ['bNwOPMAOQG0', '9Auq9mYxFEE', 'X3jLNeaLsmA']; // Al Jazeera, Sky, DW
 
 // Inject country-specific fallbacks at the BEGINNING if the backend completely failed
 if (country.id === 'vietnam') {
 fallbacks = ['ZzWBpGwKoaI', 'V9b2Xh8vLdI', ...fallbacks]; // VTC Now
 } else if (country.id === 'usa') {
 fallbacks = ['XWq5kBlakcQ', 'F-lNeJvI5bI', ...fallbacks];
 }
 
 // Ensure we have at least these fallbacks
 fallbacks.forEach(f => {
 if (!ids.includes(f)) ids.push(f);
 });
 
 // If the backend failed entirely, ensure we start with the country fallback
 setVideoIds(ids);
 } catch (err) {
 console.error("Error fetching streams", err);
 
 let fallbacks = ['bNwOPMAOQG0', '9Auq9mYxFEE', 'X3jLNeaLsmA'];
 if (country.id === 'vietnam') {
 fallbacks = ['ZzWBpGwKoaI', 'V9b2Xh8vLdI', ...fallbacks];
 } else if (country.id === 'usa') {
 fallbacks = ['XWq5kBlakcQ', 'F-lNeJvI5bI', ...fallbacks];
 }
 
 setVideoIds(fallbacks);
 }
 setIsSearching(false);
 };

 useEffect(() => {
 fetchStreams(activeCountry);
 }, [activeCountry]);

 const handleCountrySelect = (c) => {
 if (activeCountry.id === c.id) return;
 setActiveCountry(c);
 sessionStorage.setItem('gnn_country', c.id);
 };

 const handleManualSkip = () => {
 if (videoIds.length > 0) {
 setErrorCount(0); // Reset error count on manual skip
 setIsSwitching(true);
 setCurrentIndex(prev => (prev + 1) % videoIds.length);
 setSkipCounter(c => c + 1);
 setTimeout(() => setIsSwitching(false), 800); // Show switching UI for 800ms
 }
 };

 const handleVideoError = () => {
 setErrorCount(prev => {
 const newCount = prev + 1;
 if (newCount > videoIds.length * 2) {
 // If we've looped through multiple times and all failed, force error screen
 setCurrentIndex(videoIds.length);
 return newCount;
 }
 setCurrentIndex(curr => (curr + 1) % videoIds.length);
 setSkipCounter(c => c + 1);
 return newCount;
 });
 };

 const currentVideoId = videoIds[currentIndex];
 const filteredCountries = allCountries.filter(c => c.name.includes(searchQuery.toUpperCase()));

 return (
 <div className="h-full flex flex-col md:flex-row text-white font-military bg-black/40">
 {/* Sidebar - Country List (Bottom on mobile, Left on Desktop) */}
 <div className="w-full md:w-56 border-t md:border-t-0 md:border-r border-white/10 flex flex-col shrink-0 bg-black/60 h-1/2 md:h-full order-2 md:order-1">
 <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-white/[0.02] shrink-0">
 <Globe size={14} className="text-primary"/>
 <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Global Feeds</span>
 </div>
 
 {/* Search Bar */}
 <div className="p-2 border-b border-white/10 shrink-0">
 <div className="relative flex items-center">
 <Search size={12} className="absolute left-2 text-white/40"/>
 <input 
 type="text"
 placeholder="SEARCH NATION..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-black/40 border border-white/10 text-white text-[10px] uppercase font-mono tracking-widest px-7 py-1.5 focus:outline-none focus:border-primary/50 transition-colors"
 />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
 {filteredCountries.map(c => (
 <button
 key={c.id}
 onClick={() => handleCountrySelect(c)}
 className={`w-full text-left px-2 py-2 flex flex-col gap-1 border transition-colors ${
 activeCountry.id === c.id 
 ? 'border-primary/50 bg-primary/10' 
 : 'border-transparent hover:bg-white/5 hover:border-white/10'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className={`text-[9px] font-bold tracking-widest uppercase ${activeCountry.id === c.id ? 'text-primary' : 'text-white/80'}`}>
 {c.name}
 </span>
 {activeCountry.id === c.id && <Radio size={10} className="text-primary animate-pulse shrink-0"/>}
 </div>
 </button>
 ))}
 </div>
 </div>

 {/* Main Video Area (Top on mobile, Right on Desktop) */}
 <div className="flex-1 relative flex flex-col bg-black order-1 md:order-2 min-h-[50%] md:min-h-0">
 {/* Top Info Bar */}
 <div className="h-8 border-b border-white/10 flex items-center justify-between px-4 bg-black/80 z-10 shrink-0 absolute top-0 left-0 right-0 pointer-events-none">
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
 <span className="text-[9px] font-bold tracking-widest text-white/90">LIVE FEED : {activeCountry.name}</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[8px] font-mono text-primary/70">
 {currentVideoId ? `VID:${String(currentVideoId).substring(0,8)}` : 'SCANNING...'}
 </span>
 <button 
 onClick={handleManualSkip}
 className="flex items-center gap-1 text-[8px] text-white/50 hover:text-white px-2 py-0.5 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto"
 title="Force switch to next available stream"
 >
 <RefreshCcw size={10} />
 NEXT STREAM
 </button>
 </div>
 </div>

 {/* Video Player */}
 <div className="flex-1 relative overflow-hidden mt-8">
 {(isSearching || isSwitching) ? (
 <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
 <div className="absolute inset-0 opacity-10"style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
 <div className="flex flex-col items-center gap-3 z-10">
 <Signal size={24} className="text-white/30 animate-ping"/>
 <span className="text-[10px] text-white/50 tracking-[0.3em] uppercase font-mono">
 {isSwitching ? 'ACQUIRING NEW SATELLITE LINK...' : 'Intercepting Satellite Signals...'}
 </span>
 </div>
 </div>
 ) : videoIds.length === 0 || currentIndex >= videoIds.length ? (
 <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
 <div className="flex flex-col items-center gap-3 z-10 text-center">
 <Tv size={24} className="text-red-500/50"/>
 <span className="text-[10px] text-red-500/80 tracking-[0.3em] uppercase font-mono">NO ACTIVE STREAMS FOUND</span>
 <span className="text-[8px] text-white/40 tracking-widest max-w-[250px]">
 All intercepted feeds are offline or geoblocked in your sector.
 </span>
 </div>
 </div>
 ) : (
 <>
 {errorCount > 0 && (
 <div className="absolute top-2 right-2 z-50 pointer-events-none px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-500 text-[8px] font-bold tracking-widest animate-pulse">
 AUTO-SWITCHED ({errorCount} BLOCKED)
 </div>
 )}
 <NativeYouTubePlayer 
 key={skipCounter}
 videoId={currentVideoId} 
 onError={handleVideoError} 
 />
 </>
 )}
 </div>
 </div>
 </div>
 );
};

export default GlobalNewsTV;
