import React, { useState, useEffect, useRef } from 'react';
import { Video, RefreshCw, Radio, Globe, MapPin, Camera, ChevronRight } from 'lucide-react';
import useTacticalStore from '../store';

const COUNTRY_CITIES = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas', 'San Francisco', 'Washington DC'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Birmingham', 'Liverpool'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang', 'Phu Quoc'],
  'Japan': ['Tokyo', 'Shibuya', 'Shinjuku', 'Osaka', 'Kyoto', 'Sapporo', 'Fukuoka'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Jeju', 'Daegu'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Nice', 'Cannes'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'],
  'Italy': ['Rome', 'Venice', 'Milan', 'Florence', 'Naples'],
  'Spain': ['Madrid', 'Barcelona', 'Ibiza', 'Mallorca', 'Seville'],
  'Russia': ['Moscow', 'Saint Petersburg', 'Sochi', 'Vladivostok'],
  'China': ['Shanghai', 'Beijing', 'Hong Kong', 'Shenzhen', 'Chongqing'],
  'Thailand': ['Bangkok', 'Phuket', 'Pattaya', 'Koh Samui', 'Chiang Mai'],
  'Singapore': ['Singapore', 'Marina Bay'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Niagara Falls'],
  'Brazil': ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Florianopolis'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi'],
  'Taiwan': ['Taipei', 'Kaohsiung', 'Taichung', 'Jiufen'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague'],
  'Switzerland': ['Zurich', 'Geneva', 'Zermatt', 'Interlaken'],
  'Turkey': ['Istanbul', 'Ankara', 'Antalya', 'Izmir'],
  'Greece': ['Athens', 'Santorini', 'Mykonos'],
  'Ukraine': ['Kyiv', 'Lviv', 'Odessa'],
  'Israel': ['Jerusalem', 'Tel Aviv', 'Haifa'],
  'Egypt': ['Cairo', 'Alexandria', 'Hurghada'],
  'India': ['Mumbai', 'New Delhi', 'Bengaluru'],
  'Philippines': ['Manila', 'Cebu', 'Boracay'],
  'Indonesia': ['Jakarta', 'Bali', 'Yogyakarta'],
  'Malaysia': ['Kuala Lumpur', 'Penang'],
  'Mexico': ['Mexico City', 'Cancun', 'Cabo San Lucas'],
  'Argentina': ['Buenos Aires', 'Ushuaia'],
};

const ALL_COUNTRIES = Object.keys(COUNTRY_CITIES);

export default function LiveWebcams() {
  const { activeCountry, setActiveCountry } = useTacticalStore();
  const selectedNation = activeCountry && COUNTRY_CITIES[activeCountry] ? activeCountry : 'Japan';

  const [cities, setCities] = useState(COUNTRY_CITIES['Japan']);
  const [activeCity, setActiveCity] = useState('Tokyo');
  const [cameras, setCameras] = useState([]);
  const [cameraIdx, setCameraIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Client-side cache keyed by "Country::City" for instant 0ms city switching
  const camCacheRef = useRef({});
  const abortRef = useRef(null);

  // Sync country -> city list
  useEffect(() => {
    const cityList = COUNTRY_CITIES[selectedNation] || [selectedNation];
    setCities(cityList);
    setActiveCity(cityList[0]);
    setCameraIdx(0);
  }, [selectedNation]);

  const fetchWebcam = async (city, country, forceRefresh = false) => {
    if (!city) return;
    const cacheKey = `${country}::${city}`;

    if (!forceRefresh && camCacheRef.current[cacheKey]?.length > 0) {
      setCameras(camCacheRef.current[cacheKey]);
      setCameraIdx(0);
      setLoading(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/webcam/search?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country || '')}${
          forceRefresh ? '&refresh=1' : ''
        }`,
        { signal: controller.signal }
      );
      if (res.ok) {
        const data = await res.json();
        const camList =
          Array.isArray(data.cameras) && data.cameras.length > 0
            ? data.cameras
            : data.videoId
            ? [{ videoId: data.videoId, title: data.title || `${city} Live Cam` }]
            : [];
        if (camList.length > 0) {
          camCacheRef.current[cacheKey] = camList;
        }
        setCameras(camList);
        setCameraIdx(0);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('[LiveWebcams] Failed to fetch webcam:', e);
      }
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  // Fetch active city and prefetch sibling cities in the selected country
  useEffect(() => {
    if (!activeCity) return;
    fetchWebcam(activeCity, selectedNation, false);

    const timer = setTimeout(() => {
      cities.slice(0, 5).forEach((city) => {
        if (city === activeCity) return;
        const key = `${selectedNation}::${city}`;
        if (camCacheRef.current[key]) return;
        fetch(
          `/api/webcam/search?city=${encodeURIComponent(city)}&country=${encodeURIComponent(
            selectedNation
          )}`
        )
          .then((r) => r.json())
          .then((data) => {
            const camList =
              Array.isArray(data.cameras) && data.cameras.length > 0
                ? data.cameras
                : data.videoId
                ? [{ videoId: data.videoId, title: data.title || `${city} Live Cam` }]
                : [];
            if (camList.length > 0) {
              camCacheRef.current[key] = camList;
            }
          })
          .catch(() => {});
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCity, selectedNation]);

  const currentCam = cameras[cameraIdx] || null;

  return (
    <div className="w-full h-full flex flex-col bg-[#060d08] font-mono select-none overflow-hidden text-[#d8f8e1]">
      {/* Sub-header with Country Selector, Camera Switcher & Refresh */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#09150d] border-b border-[#39e75f]/25 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Video className="w-3.5 h-3.5 text-[#39e75f] shrink-0" />
          <span className="text-[10px] font-bold tracking-widest text-[#39e75f] uppercase shrink-0">
            OPTICAL SURVEILLANCE //
          </span>
          <select
            value={selectedNation}
            onChange={(e) => setActiveCountry(e.target.value)}
            className="bg-[#050c07] border border-[#39e75f]/40 text-[#d8f8e1] text-[10px] font-bold tracking-wider px-2 py-0.5 uppercase focus:outline-none focus:border-[#39e75f] cursor-pointer"
          >
            {ALL_COUNTRIES.map((country) => (
              <option key={country} value={country} className="bg-[#060d08] text-[#d8f8e1]">
                {country.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {cameras.length > 1 && (
            <button
              onClick={() => setCameraIdx((prev) => (prev + 1) % cameras.length)}
              className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-[#39e75f]/40 bg-[#39e75f]/15 text-[#39e75f] hover:bg-[#39e75f]/25 transition-colors"
              title="Switch to next live camera in this city"
            >
              <Camera className="w-3 h-3" /> CAM {cameraIdx + 1}/{cameras.length}
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            onClick={() => fetchWebcam(activeCity, selectedNation, true)}
            className="p-1 text-[#39e75f] hover:bg-[#39e75f]/20 border border-[#39e75f]/30 bg-[#0b1910] transition-colors"
            title="Force Rescan Optical Feed"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* City Selector Bar */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#07110b] border-b border-[#39e75f]/20 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[9px] text-[#39e75f]/60 uppercase tracking-widest mr-1 shrink-0 flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5 text-[#39e75f]" /> SECTOR:
        </span>
        {cities.map((city) => {
          const isActive = activeCity === city;
          return (
            <button
              key={city}
              onClick={() => {
                setActiveCity(city);
                setCameraIdx(0);
              }}
              className={`px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#39e75f] text-[#041007] border-[#39e75f] shadow-[0_0_8px_rgba(57,231,95,0.4)]'
                  : 'bg-[#0b1910] text-[#8bc99a] border-[#39e75f]/25 hover:border-[#39e75f]/60 hover:text-[#d8f8e1]'
              }`}
            >
              {city}
            </button>
          );
        })}
      </div>

      {/* Video Viewport */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-[#39e75f]">
            <div className="w-7 h-7 border-2 border-[#39e75f] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] tracking-widest uppercase animate-pulse">
              CONNECTING TO {activeCity.toUpperCase()} CCTV GRID...
            </span>
          </div>
        ) : currentCam?.videoId ? (
          <div className="w-full h-full relative">
            <iframe
              key={currentCam.videoId}
              src={`https://www.youtube.com/embed/${currentCam.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
              title={currentCam.title || activeCity}
              className="w-full h-full object-cover border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Top-left HUD Overlay */}
            <div className="absolute top-2 left-2 bg-[#050c07]/85 backdrop-blur-sm border border-[#39e75f]/40 px-2.5 py-1 flex items-center gap-2 pointer-events-none z-10">
              <Radio className="w-3 h-3 text-[#39e75f] animate-pulse" />
              <span className="text-[9px] font-bold text-[#39e75f] tracking-wider uppercase">
                LIVE // {selectedNation.toUpperCase()} — {activeCity.toUpperCase()}
              </span>
              {currentCam.title && (
                <span className="text-[9px] text-[#d8f8e1]/70 truncate max-w-[180px] hidden sm:inline">
                  ({currentCam.title})
                </span>
              )}
            </div>

            {/* Camera presets pills at top-right if multiple cameras exist */}
            {cameras.length > 1 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                {cameras.map((cam, idx) => (
                  <button
                    key={cam.videoId}
                    onClick={() => setCameraIdx(idx)}
                    className={`px-1.5 py-0.5 text-[8px] font-bold tracking-wider border backdrop-blur-sm transition-all ${
                      idx === cameraIdx
                        ? 'bg-[#39e75f] text-[#041007] border-[#39e75f]'
                        : 'bg-[#050c07]/80 text-[#39e75f] border-[#39e75f]/40 hover:bg-[#39e75f]/20'
                    }`}
                  >
                    CAM {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-[#39e75f]/60 text-[10px] tracking-widest uppercase flex flex-col items-center gap-2">
            <Globe className="w-7 h-7 opacity-40" />
            <span>NO PUBLIC OPTICAL FEED IN {activeCity.toUpperCase()}</span>
            <button
              onClick={() => fetchWebcam(activeCity, selectedNation, true)}
              className="mt-1 px-2.5 py-1 bg-[#39e75f]/20 border border-[#39e75f]/50 text-[#39e75f] text-[9px] font-bold tracking-wider uppercase hover:bg-[#39e75f]/30"
            >
              RESCAN SECTOR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
