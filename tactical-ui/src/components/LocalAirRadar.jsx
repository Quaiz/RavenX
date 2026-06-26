import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Radar, Plane, Crosshair, AlertTriangle } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import useStore from '../store';

// Calculate distance between two coordinates in km
const getDistanceKM = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate bearing between two coordinates in degrees (0 = North)
const getBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const l1 = lat1 * Math.PI / 180;
  const l2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(l2);
  const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
};

const RANGE_STEPS = [
  { label: '50 KM', max: 50, mode: 'LOCAL' },
  { label: '100 KM', max: 100, mode: 'LOCAL' },
  { label: '250 KM', max: 250, mode: 'LOCAL' },
  { label: '400 KM', max: 400, mode: 'LOCAL' },
  { label: '1,000 KM', max: 1000, mode: 'GLOBAL' },
  { label: '5,000 KM', max: 5000, mode: 'GLOBAL' },
  { label: '10,000 KM', max: 10000, mode: 'GLOBAL' }
];

const LocalAirRadar = () => {
  const [userLoc, setUserLoc] = useState(null);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const [rangeStep, setRangeStep] = useState(1); // Default to 100km

  const radarAngleRef = useRef(0);
  const beamRef = useRef(null);
  const planesRef = useRef({});

  const globalFlights = useStore(s => s.feeds.aircraft);
  const fetchGlobalFlights = useStore(s => s.fetchAircraft);

  const currentRange = RANGE_STEPS[rangeStep];
  const rangeMode = currentRange.mode;
  const RADAR_MAX_DIST_KM = currentRange.max;

  // DOM Optimization: Bypass React state for 60fps animations
  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();
    
    const animate = (time) => {
      const dt = time - lastTime;
      lastTime = time;
      
      radarAngleRef.current = (radarAngleRef.current + (dt / 1000) * 90) % 360;
      const angle = radarAngleRef.current;
      
      if (beamRef.current) {
        beamRef.current.style.background = `conic-gradient(from ${angle - 90}deg, transparent 0deg, rgba(34, 197, 94, 0.05) 0deg, rgba(34, 197, 94, 0.4) 90deg, transparent 90.1deg)`;
        beamRef.current.style.boxShadow = `inset 0 0 20px rgba(34,197,94,0.2)`;
      }

      Object.values(planesRef.current).forEach(el => {
         if (!el) return;
         const bearing = parseFloat(el.dataset.bearing);
         const isSelected = el.dataset.selected === 'true';
         
         if (isSelected) {
            el.style.opacity = 1;
            el.style.boxShadow = '0 0 10px #fff';
            return;
         }

         let diff = angle - bearing;
         if (diff < 0) diff += 360;
         const isFresh = diff >= 0 && diff < 180;
         const opacity = isFresh ? Math.max(0.2, 1 - (diff/180)) : 0.2;
         el.style.opacity = opacity;
         
         el.style.boxShadow = isFresh ? `0 0 10px #4ade80` : 'none';
      });

      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [rangeMode]);

  const fetchLocalFlights = async (lat, lon) => {
    if (!lat || !lon) return;
    setIsScanning(true);
    try {
      const radiusNm = Math.max(10, Math.min(RADAR_MAX_DIST_KM, 460) / 1.852);
      const res = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${Math.round(radiusNm)}?cb=${Date.now()}`);
      const data = await res.json();
      
      if (data && data.ac) {
        const parsedFlights = data.ac.map(f => {
          const dist = getDistanceKM(lat, lon, f.lat, f.lon);
          const bearing = getBearing(lat, lon, f.lat, f.lon);
          return {
            id: f.flight ? f.flight.trim() : f.hex,
            hex: f.hex,
            lat: f.lat,
            lon: f.lon,
            alt: f.alt_baro === 'ground' ? 0 : (f.alt_baro || 0),
            speed: f.gs || 0,
            heading: f.track || 0,
            dist: dist,
            bearing: bearing,
            squawk: f.squawk || 'NONE',
            vert_rate: f.baro_rate || 0,
            origin: f.r || 'UNKNOWN',
            type: f.t || 'UNK',
            category: f.category || 'N/A'
          };
        }).filter(f => f.dist <= RADAR_MAX_DIST_KM); 
        
        setFlights(parsedFlights);
        if (parsedFlights.length > 0 && Math.random() > 0.5) {
            audio.playTyping();
        }
      }
    } catch (err) {
      console.error('Radar scan failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const requestGPS = () => {
    setError(null);
    if ("geolocation" in navigator && window.isSecureContext) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLoc({ lat: latitude, lon: longitude });
          if (rangeMode === 'LOCAL') fetchLocalFlights(latitude, longitude);
        },
        (err) => {
          fetchLocationByIP();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Not secure context (HTTP) or geolocation unsupported, fallback to IP
      fetchLocationByIP();
    }
  };

  const fetchLocationByIP = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
         setUserLoc({ lat: data.latitude, lon: data.longitude });
         if (rangeMode === 'LOCAL') fetchLocalFlights(data.latitude, data.longitude);
      } else {
         setError("Failed to acquire location via IP fallback.");
      }
    } catch(err) {
      setError("LOCATION BLOCKED: HTTP Environment restricts GPS, and IP fallback failed.");
    }
  };

  useEffect(() => {
    requestGPS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeMode]);

  // Unified 2s polling interval
  useEffect(() => {
    if (!userLoc) return;
    
    // Initial fetch
    fetchGlobalFlights(userLoc.lat, userLoc.lon).finally(() => setIsScanning(false));
    if (rangeMode === 'LOCAL') fetchLocalFlights(userLoc.lat, userLoc.lon);

    const interval = setInterval(() => {
      fetchGlobalFlights(userLoc.lat, userLoc.lon);
      if (rangeMode === 'LOCAL') fetchLocalFlights(userLoc.lat, userLoc.lon);
    }, 2000);
    return () => clearInterval(interval);
  }, [userLoc, rangeMode, RADAR_MAX_DIST_KM, fetchGlobalFlights]);

  // Compute final display flights
  const displayFlights = useMemo(() => {
    if (!userLoc) return [];
    
    // Parse global flights
    const parsedGlobal = globalFlights.map(f => {
      const dist = getDistanceKM(userLoc.lat, userLoc.lon, f.lat, f.lon);
      const bearing = getBearing(userLoc.lat, userLoc.lon, f.lat, f.lon);
      return {
        id: f.callsign || f.id,
        hex: f.id || 'UNK',
        lat: f.lat,
        lon: f.lon,
        alt: f.alt || 0,
        speed: (f.vel || 0) * 1.94384, // m/s to knots
        heading: f.heading || 0,
        dist: dist,
        bearing: bearing,
        squawk: f.squawk || 'NONE',
        vert_rate: f.vert_rate || 0,
        origin: f.origin || 'UNKNOWN',
        type: 'OPENSKY',
        category: 'GLOBAL'
      };
    });

    let allFlights = parsedGlobal;

    if (rangeMode === 'LOCAL') {
      const flightMap = new Map();
      flights.forEach(f => flightMap.set(f.hex, f)); 
      parsedGlobal.forEach(f => flightMap.set(f.hex, f)); // FR24 takes precedence over ADSB.lol
      allFlights = Array.from(flightMap.values());
    }
    
    return allFlights.filter(f => f.dist <= RADAR_MAX_DIST_KM);
  }, [rangeMode, flights, globalFlights, userLoc, RADAR_MAX_DIST_KM]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4 bg-black/40">
        <AlertTriangle size={32} className="text-red-500 animate-pulse" />
        <div className="text-[12px] font-bold text-red-500 tracking-widest uppercase">GPS SIGNAL LOST</div>
        <div className="text-[10px] text-white/50">{error}</div>
        <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
          <div className="flex gap-2">
            <input type="number" id="manual-lat" placeholder="LAT (e.g. 21.0285)" className="w-1/2 bg-black/50 border border-cyan-500/30 text-[10px] text-cyan-400 p-2 outline-none text-center" defaultValue="21.0285" />
            <input type="number" id="manual-lon" placeholder="LON (e.g. 105.8542)" className="w-1/2 bg-black/50 border border-cyan-500/30 text-[10px] text-cyan-400 p-2 outline-none text-center" defaultValue="105.8542" />
          </div>
          <button 
              onClick={() => {
                  audio.playClick();
                  const lat = parseFloat(document.getElementById('manual-lat').value);
                  const lon = parseFloat(document.getElementById('manual-lon').value);
                  if (!isNaN(lat) && !isNaN(lon)) {
                      setError(null);
                      setUserLoc({ lat, lon });
                      if (rangeMode === 'LOCAL') fetchLocalFlights(lat, lon);
                  }
              }}
              className="px-4 py-2 border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-widest uppercase hover:bg-cyan-500/20 transition-colors"
          >
              OVERRIDE: INITIATE MANUAL LOCK
          </button>
          <button 
              onClick={() => {
                  audio.playClick();
                  requestGPS();
              }}
              className="px-4 py-2 border border-red-500/50 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/20 transition-colors"
          >
              RETRY AUTO-GPS LOCK
          </button>
        </div>
        <div className="text-[9px] text-red-400/50 mt-2 max-w-xs">If AUTO fails, enter coordinates manually and press OVERRIDE.</div>
      </div>
    );
  }

  if (!userLoc) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4 bg-black/40">
        <Crosshair size={32} className="text-cyan-500 animate-pulse" />
        <div className="text-[12px] font-bold text-cyan-400 tracking-widest uppercase">ACQUIRING GPS LOCK...</div>
        <div className="text-[9px] text-cyan-500/50">Waiting for satellite telemetry</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-military text-white bg-[#030508]">
      {/* Header */}
      <div className="p-3 border-b border-cyan-500/20 bg-cyan-950/20 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <Radar size={16} className="text-green-500" style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }} />
          <div>
            <div className="text-[12px] font-bold tracking-widest text-green-500 uppercase">TACTICAL AIR RADAR</div>
            <div className="text-[8px] text-white/40 tracking-widest uppercase flex items-center gap-2">
              <span>LAT: {userLoc.lat.toFixed(4)}</span>
              <span>LON: {userLoc.lon.toFixed(4)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 border border-green-500/20 px-2 py-1">
                <span className="text-[8px] text-green-500 font-bold tracking-widest">RANGE:</span>
                <input 
                    type="range" 
                    min="0" 
                    max={RANGE_STEPS.length - 1} 
                    step="1"
                    value={rangeStep}
                    onChange={(e) => {
                        setRangeStep(parseInt(e.target.value));
                        setSelectedFlight(null);
                        audio.playClick();
                    }}
                    className="w-20 sm:w-24 h-1 bg-green-900/50 appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-green-500 cursor-pointer"
                />
                <span className={`text-[8px] font-bold w-12 text-right tracking-widest uppercase ${rangeMode==='GLOBAL' ? 'text-cyan-400' : 'text-green-400'}`}>{currentRange.label}</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30">
            <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-green-800'}`}/>
            <span className="text-[8px] font-bold tracking-widest text-green-400 uppercase">{isScanning ? 'SCANNING' : 'ONLINE'}</span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-y-auto sm:overflow-hidden">
        {/* Radar Screen */}
        <div className="flex-1 relative flex items-center justify-center bg-black/80 overflow-hidden border-b sm:border-b-0 sm:border-r border-cyan-500/20 p-4 min-h-[350px] sm:min-h-0 shrink-0">
          {/* Radar background circles */}
          <div className="relative w-[280px] h-[280px] sm:w-full sm:h-auto sm:aspect-square sm:max-w-[400px] sm:max-h-[400px] rounded-full border border-green-500/30 bg-green-950/10 shadow-[0_0_50px_rgba(34,197,94,0.1)] shrink-0">
            
            {/* Range Rings - 25%, 50%, 75% max range */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] rounded-full border border-green-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full border border-green-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full border border-green-500/20" />
            
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-500/20 -translate-x-1/2" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-green-500/20 -translate-y-1/2" />

            {/* Sweeping Beam (Controlled by Ref instead of State) */}
            <div 
              ref={beamRef}
              className="absolute inset-0 rounded-full"
            />
            
            {/* User Center Point */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#fff]" />

            {/* Targets (Aircraft) */}
            {displayFlights.map((f, i) => {
              const radiusPercent = (f.dist / RADAR_MAX_DIST_KM) * 50; 
              // HTML math: 0 deg is Right (3 o'clock). So we subtract 90.
              const angleRad = (f.bearing - 90) * Math.PI / 180;
              
              const xPos = 50 + radiusPercent * Math.cos(angleRad);
              const yPos = 50 + radiusPercent * Math.sin(angleRad);
              
              // Direct DOM nodes mapped via ref to eliminate React render lag
              return (
                <div
                  key={f.hex}
                  ref={el => { if (el) planesRef.current[f.hex] = el; else delete planesRef.current[f.hex]; }}
                  data-bearing={f.bearing}
                  data-mode={rangeMode}
                  data-selected={selectedFlight?.hex === f.hex}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-[2000ms] ease-linear group`}
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: selectedFlight?.hex === f.hex ? 50 : 10
                  }}
                  onClick={() => setSelectedFlight(f)}
                >
                    {/* The actual plane dot */}
                    <div className={`w-2 h-2 rounded-full transition-all ${selectedFlight?.hex === f.hex ? 'bg-white shadow-[0_0_10px_#fff] scale-150' : 'bg-green-400'}`} />
                    
                    {/* Hover label */}
                    <div className="absolute top-6 left-6 bg-black/80 border border-green-500/30 p-1 px-2 hidden group-hover:block z-[60] pointer-events-none whitespace-nowrap">
                        <div className="text-[9px] font-bold text-green-400">{f.id}</div>
                        <div className="text-[8px] text-white/50">{Math.round(f.dist)}km</div>
                    </div>
                </div>
              );
            })}
          </div>
          
          <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
             <div className="text-[8px] text-green-500/30 font-mono">RADAR RANGE: {Math.round(RADAR_MAX_DIST_KM).toLocaleString()}km</div>
             <div className="text-[8px] text-green-500/30 font-mono">TARGETS DETECTED: {displayFlights.length}</div>
          </div>
        </div>

        {/* Info Panel */}
        <div className={`w-full sm:w-64 bg-[#05080d]/95 sm:bg-cyan-950/10 backdrop-blur-md p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar border-t sm:border-t-0 sm:border-l border-cyan-500/20 ${selectedFlight ? 'absolute sm:relative bottom-0 left-0 right-0 z-50 h-auto max-h-[60%] sm:h-auto sm:max-h-full sm:flex shadow-[0_-10px_30px_rgba(0,0,0,0.8)] sm:shadow-none' : 'hidden sm:flex'}`}>
           <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
             <div className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">TELEMETRY LOCK</div>
             {selectedFlight && (
                <button onClick={() => setSelectedFlight(null)} className="sm:hidden text-[10px] text-cyan-500 hover:text-white uppercase tracking-widest font-bold">CLOSE</button>
             )}
           </div>
           
           {selectedFlight ? (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[18px] font-bold text-white tracking-wider">{selectedFlight.id}</div>
                  <div className="text-[9px] text-white/50 font-mono mt-1">HEX: {selectedFlight.hex.toUpperCase()}</div>
                </div>
                <Plane size={24} className={rangeMode === 'GLOBAL' ? 'text-cyan-400' : 'text-green-400'} style={{ transform: `rotate(${selectedFlight.heading}deg)` }}/>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-black/40 p-2 border border-cyan-500/20">
                  <div className="text-[8px] text-white/40 mb-1">ALTITUDE</div>
                  <div className="text-[12px] font-mono text-cyan-400">{selectedFlight.alt === 0 ? 'GND' : `${Math.round(selectedFlight.alt).toLocaleString()} ft`}</div>
                </div>
                <div className="bg-black/40 p-2 border border-cyan-500/20">
                  <div className="text-[8px] text-white/40 mb-1">SPEED</div>
                  <div className="text-[12px] font-mono text-cyan-400">{Math.round(selectedFlight.speed)} kts</div>
                </div>
                <div className="bg-black/40 p-2 border border-cyan-500/20">
                  <div className="text-[8px] text-white/40 mb-1">DISTANCE</div>
                  <div className="text-[12px] font-mono text-orange-400">{selectedFlight.dist.toFixed(1)} km</div>
                </div>
                <div className="bg-black/40 p-2 border border-cyan-500/20">
                  <div className="text-[8px] text-white/40 mb-1">BEARING</div>
                  <div className="text-[12px] font-mono text-white">{Math.round(selectedFlight.bearing)}°</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                 <div className="bg-black/40 p-2 border border-cyan-500/20">
                  <div className="text-[8px] text-white/40 mb-1">SQUAWK</div>
                  <div className="text-[12px] font-mono text-red-400">{selectedFlight.squawk || 'NONE'}</div>
                </div>
                <div className="bg-black/40 p-2 border border-cyan-500/20">
                  <div className="text-[8px] text-white/40 mb-1">V-RATE</div>
                  <div className="text-[12px] font-mono text-white">{selectedFlight.vert_rate || 0} fpm</div>
                </div>
              </div>
              
              {(() => {
                const isEmergency = ['7500', '7600', '7700'].includes(selectedFlight.squawk);
                const oppHeading = (selectedFlight.heading + 180) % 360;
                let angleDiff = Math.abs((((oppHeading - selectedFlight.bearing) % 360) + 360) % 360);
                angleDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
                const isApproaching = angleDiff < 45;
                
                let tColor = 'text-green-500';
                let tBg = 'bg-green-500';
                let tReason = 'TRACKING';
                let tWidth = 'w-1/4';
                
                if (isEmergency) {
                   tColor = 'text-red-500'; tBg = 'bg-red-500'; tReason = 'EMERGENCY SQUAWK'; tWidth = 'w-full animate-pulse';
                } else if (isApproaching && selectedFlight.dist < 50) {
                   tColor = 'text-orange-500'; tBg = 'bg-orange-500'; tReason = 'INBOUND PROXIMITY'; tWidth = 'w-3/4';
                } else if (isApproaching && selectedFlight.dist < 200) {
                   tColor = 'text-yellow-500'; tBg = 'bg-yellow-500'; tReason = 'APPROACHING VECTOR'; tWidth = 'w-1/2';
                }
                
                return (
                  <div className="mt-2 pt-2 border-t border-cyan-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[8px] text-white/40 uppercase tracking-widest">Threat Assessment</div>
                      <div className={`text-[8px] font-bold uppercase tracking-widest ${tColor}`}>{tReason}</div>
                    </div>
                    <div className="w-full bg-black/50 h-1.5 border border-cyan-500/20 rounded overflow-hidden mt-1">
                       <div className={`h-full ${tWidth} ${tBg} transition-all duration-1000`} />
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-2 pt-2 border-t border-cyan-500/20">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[8px] text-white/40 uppercase tracking-widest">Live Coordinates</div>
                  <div className="text-[8px] font-mono text-cyan-400">GPS LOCK</div>
                </div>
                <div className="text-[10px] font-mono text-white">
                  {Math.abs(selectedFlight.lat).toFixed(4)}° {selectedFlight.lat >= 0 ? 'N' : 'S'} / {Math.abs(selectedFlight.lon).toFixed(4)}° {selectedFlight.lon >= 0 ? 'E' : 'W'}
                </div>
              </div>


            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 opacity-50 py-8">
              <Crosshair size={24} className="text-cyan-500" />
              <div className="text-[9px] uppercase tracking-widest text-cyan-400">NO TARGET SELECTED</div>
              <div className="text-[8px] text-white/40 mt-2">Click a radar blip to acquire telemetry</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalAirRadar;
