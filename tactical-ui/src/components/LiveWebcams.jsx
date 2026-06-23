import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { MonitorPlay, Settings2, Loader2, Signal, Target } from 'lucide-react';

const REGIONS_DB = {
  "Asia": {
    "Japan": ["Tokyo","Osaka","Kyoto","Sapporo","Fuji"],
    "South Korea": ["Seoul","Busan","Jeju"],
    "Vietnam": ["Hanoi","Ho Chi Minh City","Da Nang"],
    "China": ["Beijing","Shanghai","Hong Kong","Macau"],
    "India": ["Mumbai","New Delhi","Bangalore","Goa"],
    "Thailand": ["Bangkok","Phuket","Pattaya"]
  },
  "Europe": {
    "UK": ["London","Edinburgh","Manchester","Liverpool"],
    "France": ["Paris","Lyon","Marseille","Nice"],
    "Germany": ["Berlin","Munich","Hamburg","Frankfurt"],
    "Italy": ["Rome","Milan","Venice","Florence"],
    "Spain": ["Madrid","Barcelona","Ibiza"],
    "Netherlands": ["Amsterdam","Rotterdam","The Hague"]
  },
  "Americas": {
    "USA": ["New York","Los Angeles","Chicago","Miami","Las Vegas","Seattle","Washington DC"],
    "Canada": ["Toronto","Vancouver","Montreal","Banff"],
    "Mexico": ["Mexico City","Cancun","Tulum"],
    "Brazil": ["Rio de Janeiro","Sao Paulo","Salvador"]
  },
  "Africa": {
    "South Africa": ["Cape Town","Johannesburg","Durban"],
    "Egypt": ["Cairo","Alexandria"],
    "Kenya": ["Nairobi","Mombasa"]
  },
  "Oceania": {
    "Australia": ["Sydney","Melbourne","Brisbane","Gold Coast","Perth"],
    "New Zealand": ["Auckland","Wellington","Queenstown"]
  }
};

const LiveWebcams = () => {
  const continents = Object.keys(REGIONS_DB);
  const [activeContinent, setActiveContinent] = useState(() => {
    return sessionStorage.getItem('cam_continent') || continents[0];
  });
  
  const countries = Object.keys(REGIONS_DB[activeContinent] || {});
  const [activeCountry, setActiveCountry] = useState(() => {
    const saved = sessionStorage.getItem('cam_country');
    return (saved && countries.includes(saved)) ? saved : (countries[0] || null);
  });

  const cities = activeCountry ? (REGIONS_DB[activeContinent]?.[activeCountry] || []) : [];
  const [activeCity, setActiveCity] = useState(() => {
    const saved = sessionStorage.getItem('cam_city');
    return (saved && cities.includes(saved)) ? saved : (cities[0] || null);
  });

  const [activeStream, setActiveStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleContinentClick = (c) => {
    setActiveContinent(c);
    sessionStorage.setItem('cam_continent', c);
    
    const newCountries = Object.keys(REGIONS_DB[c] || {});
    const newCountry = newCountries[0] || null;
    setActiveCountry(newCountry);
    if (newCountry) sessionStorage.setItem('cam_country', newCountry);
    else sessionStorage.removeItem('cam_country');

    const newCities = newCountry ? (REGIONS_DB[c]?.[newCountry] || []) : [];
    const newCity = newCities[0] || null;
    setActiveCity(newCity);
    if (newCity) sessionStorage.setItem('cam_city', newCity);
    else sessionStorage.removeItem('cam_city');
  };

  const handleCountryClick = (c) => {
    setActiveCountry(c);
    sessionStorage.setItem('cam_country', c);
    
    const newCities = REGIONS_DB[activeContinent]?.[c] || [];
    const newCity = newCities[0] || null;
    setActiveCity(newCity);
    if (newCity) sessionStorage.setItem('cam_city', newCity);
    else sessionStorage.removeItem('cam_city');
  };

  const handleCityClick = (c) => {
    setActiveCity(c);
    sessionStorage.setItem('cam_city', c);
  };

  // Fetch YouTube Live stream from Backend when city changes
  useEffect(() => {
    let isMounted = true;
    if (!activeCity) return;

    const fetchStream = async () => {
      setLoading(true);
      setError(null);
      setActiveStream(null);
      setIsPlaying(false);

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/webcam/search?city=${encodeURIComponent(activeCity)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to intercept stream');
        }

        if (isMounted && data.videoId) {
          setActiveStream(data);
        } else if (isMounted) {
          throw new Error('NO CAMERAS FOUND');
        }
      } catch (err) {
        if (isMounted) setError(err.message.toUpperCase());
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStream();
    return () => { isMounted = false; };
  }, [activeCity]);

  return (
    <div className="w-full h-full bg-[#111111] flex flex-col font-mono text-white/80 overflow-hidden relative">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400"/>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">LIVE WEBCAMS</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* ROW 1: CONTINENTS */}
        <div className="flex flex-wrap gap-2">
          {continents.map(c => (
            <button
              key={c}
              onClick={() => handleContinentClick(c)}
              className={`px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase border transition-colors ${
                activeContinent === c
                  ? 'border-teal-400 text-teal-400 bg-teal-400/5'
                  : 'border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ROW 2: COUNTRIES */}
        {countries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {countries.map(c => (
              <button
                key={c}
                onClick={() => handleCountryClick(c)}
                className={`px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase border transition-colors ${
                  activeCountry === c
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* ROW 3: CITIES */}
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cities.map(c => (
              <button
                key={c}
                onClick={() => handleCityClick(c)}
                className={`px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase border transition-colors ${
                  activeCity === c
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                    : 'border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* STREAMS COUNT & VIDEO SECTION */}
        <div className="flex flex-col flex-1 min-h-[250px] border-t border-white/10 pt-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] text-white/40 tracking-widest font-mono">
              // ACTIVE FEED: {activeCity?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
              <div className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isPlaying ? 'animate-pulse' : 'opacity-50'}`} />
              <span className="text-[9px] font-bold tracking-widest uppercase">REC</span>
            </div>
          </div>

          <div className="relative w-full h-[350px] bg-black border border-white/5 overflow-hidden group">
            {/* TACTICAL HUD OVERLAYS */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <div className="text-[8px] text-white/50 tracking-widest font-mono bg-black/40 px-2 py-1 backdrop-blur-sm border border-white/10">
                {error ? 'NO SIGNAL' : loading ? 'SEARCHING YOUTUBE...' : isPlaying ? '1080P // HLS DECODED' : 'BUFFERING...'}
              </div>
            </div>

            {/* ERROR / LOADING STATE */}
            {loading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <Loader2 size={32} className="text-teal-400 mb-2 animate-spin"/>
                <div className="text-[10px] font-bold text-teal-400 tracking-[0.3em] uppercase">INTERCEPTING SATELLITE...</div>
                <div className="text-[8px] text-white/40 tracking-widest mt-1">EXTRACTING M3U8 FROM YOUTUBE API</div>
              </div>
            )}

            {error && !loading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                <Settings2 size={32} className="text-red-500 mb-2 animate-spin-slow"/>
                <div className="text-sm font-bold text-red-500 tracking-[0.3em] uppercase">{error}</div>
                <div className="text-[10px] text-white/40 tracking-widest mt-1">TARGET OFFLINE OR NO PUBLIC FEEDS AVAILABLE.</div>
              </div>
            )}

            {/* RAW YOUTUBE IFRAME */}
            {activeStream && !loading && !error && (
              <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
                <iframe
                  src={`https://www.youtube.com/embed/${activeStream.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1`}
                  className="w-full h-full border-none pointer-events-none"
                  allow="autoplay; encrypted-media"
                  title="Live CCTV"
                  onLoad={() => setIsPlaying(true)}
                />
              </div>
            )}
          </div>

          {/* BOTTOM TICKER / STATUS */}
          {activeStream && !loading && !error && (
            <div className="mt-4 pt-2 border-t border-white/5 flex flex-col gap-1">
              <div className="text-[9px] text-white/30 tracking-[0.2em] uppercase truncate flex items-center gap-2">
                <Signal size={10} className="text-teal-400 animate-pulse"/>
                {activeStream.title}
              </div>
              <div className="text-[7px] text-teal-400/50 tracking-widest uppercase">
                ID: {activeStream.videoId} // HLS PLAYLIST DECODED
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LiveWebcams;
