import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import useStore from '../store';
import { audio } from '../utils/audioEngine';
import { 
  User, Shield, Compass, Cpu, Battery, Activity, 
  MapPin, Focus, Globe, Wifi, RefreshCw, Terminal 
} from 'lucide-react';

function MiniMapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function HumintIntel() {
  const operatorCoords = useStore(s => s.operatorCoords);
  const operatorSafehouses = useStore(s => s.operatorSafehouses);
  const setOperatorCoords = useStore(s => s.setOperatorCoords);
  const setMapTarget = useStore(s => s.setMapTarget);

  const [activeTab, setActiveTab] = useState('operator'); // 'operator' | 'safehouses'
  const [selectedSafehouse, setSelectedSafehouse] = useState(null);
  
  // Browser & Geolocation Telemetry
  const [battery, setBattery] = useState({ level: null, charging: false });
  const [connection, setConnection] = useState({ online: navigator.onLine, type: 'N/A' });
  const [geolocationStatus, setGeolocationStatus] = useState('PENDING');

  // Backend /api/logs Telemetry
  const [backendStats, setBackendStats] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(true);

  // Sync Geolocation
  const requestGeolocation = () => {
    setGeolocationStatus('REQUESTING');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOperatorCoords(pos.coords.latitude, pos.coords.longitude);
          setGeolocationStatus('RESOLVED');
          audio.playNotification();
        },
        (err) => {
          console.warn("Geolocation denied/failed. Using defaults.", err);
          setGeolocationStatus('DENIED');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGeolocationStatus('UNSUPPORTED');
    }
  };

  useEffect(() => {
    requestGeolocation();

    // Battery API
    if (navigator.getBattery) {
      navigator.getBattery().then(bat => {
        const update = () => {
          setBattery({
            level: Math.round(bat.level * 100),
            charging: bat.charging
          });
        };
        update();
        bat.addEventListener('levelchange', update);
        bat.addEventListener('chargingchange', update);
      });
    }

    // Network connection
    const handleOnline = () => setConnection(c => ({ ...c, online: true }));
    const handleOffline = () => setConnection(c => ({ ...c, online: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.connection) {
      setConnection(c => ({ ...c, type: navigator.connection.effectiveType || 'N/A' }));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Backend Stats
  const fetchBackendStats = async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/logs`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBackendStats(data);
      }
    } catch (err) {
      console.error("Failed to load backend stats", err);
    } finally {
      setLoadingBackend(false);
    }
  };

  useEffect(() => {
    fetchBackendStats();
    const interval = setInterval(fetchBackendStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Selection & Map Controls
  const handleFocusOnMainMap = (lat, lon, label) => {
    audio.playClick();
    setMapTarget({ lat, lng: lon, zoom: 15 });
  };

  const activeCenter = activeTab === 'operator' 
    ? [operatorCoords.lat, operatorCoords.lon]
    : (selectedSafehouse ? [selectedSafehouse.lat, selectedSafehouse.lon] : [operatorCoords.lat, operatorCoords.lon]);

  const selectTab = (tab) => {
    audio.playClick();
    setActiveTab(tab);
    if (tab === 'safehouses' && operatorSafehouses.length > 0 && !selectedSafehouse) {
      setSelectedSafehouse(operatorSafehouses[0]);
    }
  };

  const selectSafehouse = (sfh) => {
    audio.playClick();
    setSelectedSafehouse(sfh);
  };

  return (
    <div className="w-full h-full bg-[#07090e]/95 text-white font-mono flex flex-col overflow-hidden text-[11px]">
      
      {/* Top Banner Status */}
      <div className="px-4 py-2 bg-[#0c1017] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Globe size={13} className="text-primary animate-pulse" />
          <span className="font-bold tracking-[0.2em] text-white">OPERATOR COMMAND & TELEMETRY</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/50">
          <div className="flex items-center gap-1.5 border border-white/10 px-2 py-0.5 bg-black/40">
            <Wifi size={11} className={connection.online ? "text-green-400" : "text-red-500"} />
            <span>NET: {connection.online ? `${connection.type.toUpperCase()}` : 'OFFLINE'}</span>
          </div>
          {battery.level !== null && (
            <div className="flex items-center gap-1.5 border border-white/10 px-2 py-0.5 bg-black/40">
              <Battery size={11} className={battery.charging ? "text-green-400 animate-pulse" : "text-primary"} />
              <span>PWR: {battery.level}% {battery.charging ? '(CHG)' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Body Split */}
      <div className="flex-1 flex min-h-0">
        
        {/* Left Side: Telemetry Directories */}
        <div className="w-[45%] border-r border-white/5 flex flex-col min-h-0 bg-[#090c12]/40">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-white/5 text-center shrink-0">
            <button
              onClick={() => selectTab('operator')}
              className={`py-2 text-[9px] font-bold tracking-widest border-r border-white/5 uppercase transition-all ${
                activeTab === 'operator' 
                  ? 'bg-primary/15 text-primary border-b-2 border-b-primary' 
                  : 'text-white/40 hover:text-white/80 bg-black/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User size={10} />
                OPERATOR INFO
              </div>
            </button>
            <button
              onClick={() => selectTab('safehouses')}
              className={`py-2 text-[9px] font-bold tracking-widest uppercase transition-all ${
                activeTab === 'safehouses' 
                  ? 'bg-primary/15 text-primary border-b-2 border-b-primary' 
                  : 'text-white/40 hover:text-white/80 bg-black/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield size={10} />
                SAFEHOUSE NET
              </div>
            </button>
          </div>

          {/* Directory Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeTab === 'operator' && (
              <div className="space-y-4">
                
                {/* Geolocation Telemetry */}
                <div className="border border-white/10 bg-[#0d121c]/40 p-3 space-y-2 relative">
                  <div className="text-[9px] font-bold text-primary/70 tracking-widest mb-1">// POSITION TELEMETRY</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-white/40 block">LATITUDE</span>
                      <span className="font-bold text-white tracking-wider">{operatorCoords.lat.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">LONGITUDE</span>
                      <span className="font-bold text-white tracking-wider">{operatorCoords.lon.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-[8px] text-white/30 font-bold uppercase">
                      GEOLOC STATUS: <span className={geolocationStatus === 'RESOLVED' ? "text-green-400" : "text-amber-500 animate-pulse"}>{geolocationStatus}</span>
                    </span>
                    <button 
                      onClick={requestGeolocation}
                      className="flex items-center gap-1 text-[8px] font-bold bg-white/5 hover:bg-white/15 px-2 py-1 border border-white/10 transition-colors uppercase tracking-widest"
                    >
                      <RefreshCw size={9} />
                      RE-SCAN
                    </button>
                  </div>
                </div>

                {/* System Diagnostics */}
                <div className="border border-white/10 bg-[#0d121c]/40 p-3 space-y-2">
                  <div className="text-[9px] font-bold text-primary/70 tracking-widest mb-1">// HOST SYSTEM DIAGNOSTICS</div>
                  
                  {loadingBackend ? (
                    <div className="text-white/30 text-[9px] py-2 flex items-center gap-2">
                      <RefreshCw size={10} className="animate-spin" />
                      AWAITING HOST HANDSHAKE...
                    </div>
                  ) : backendStats ? (
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-white/40">HOST OS:</span>
                        <span className="text-white font-bold">{backendStats.os}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">PY RUNTIME:</span>
                        <span className="text-white font-bold">{backendStats.python_version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">CORE UPTIME:</span>
                        <span className="text-primary font-bold">{backendStats.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">ACTIVE THREADS:</span>
                        <span className="text-white font-bold">{backendStats.active_threads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">RAM CONSUMED:</span>
                        <span className="text-white font-bold">{backendStats.memory_usage_mb} MB</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400 text-[9px] py-1 border border-red-900/30 bg-red-900/5 px-2">
                      ERROR: OFFLINE BACKEND DIALOUT
                    </div>
                  )}
                </div>

                {/* Security Protocol */}
                <div className="border border-white/10 bg-[#0d121c]/40 p-3 space-y-1">
                  <div className="text-[9px] font-bold text-primary/70 tracking-widest mb-1">// TRANSMISSION SECURITY</div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/40">SECURE SHELL:</span>
                    <span className="text-green-400 font-bold">AES-GCM-256</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/40">SIGNATURES:</span>
                    <span className="text-green-400 font-bold">RSA-PSS-4096</span>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'safehouses' && (
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-primary/70 tracking-[0.15em] mb-2 uppercase">// DEPLOYED SAFEHOUSES ({operatorSafehouses.length})</div>
                {operatorSafehouses.map(sfh => {
                  const isSelected = selectedSafehouse?.id === sfh.id;
                  return (
                    <button
                      key={sfh.id}
                      onClick={() => selectSafehouse(sfh)}
                      className={`w-full text-left p-3 border transition-all flex flex-col gap-1 relative ${
                        isSelected 
                          ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(255,184,0,0.15)]' 
                          : 'bg-black/30 border-white/5 hover:border-white/15'
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-2 bottom-2 w-[2.5px] bg-primary rounded-full shadow-[0_0_4px_#ffb800]" />}
                      <div className="flex justify-between items-center">
                        <span className={`font-bold tracking-wider ${isSelected ? 'text-primary' : 'text-white/80'}`}>{sfh.codename}</span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 font-bold">{sfh.status}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-white/40">
                        <span>{sfh.location}</span>
                        <span>CAPACITY: {sfh.capacity}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Satellite Feed & Controls */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#05070a]">
          
          {/* Section Header */}
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Compass size={11} className="text-white/40" />
              <span className="text-[9px] font-bold tracking-widest text-white/60 uppercase">
                {activeTab === 'operator' ? 'LIVE SATELLITE HUD // OPERATOR' : `LIVE SATELLITE HUD // ${selectedSafehouse?.codename}`}
              </span>
            </div>
            <button
              onClick={() => handleFocusOnMainMap(activeCenter[0], activeCenter[1], activeTab === 'operator' ? 'OPERATOR' : selectedSafehouse?.codename)}
              className="flex items-center gap-1.5 text-[8px] font-bold text-primary bg-primary/15 border border-primary/40 px-2.5 py-1 hover:bg-primary/30 transition-colors uppercase tracking-widest"
            >
              <Focus size={10} />
              FOCUS MAIN MAP
            </button>
          </div>

          {/* Mini Satellite Map Viewport */}
          <div className="flex-1 min-h-0 relative border-b border-white/5">
            <MapContainer
              center={activeCenter}
              zoom={16}
              zoomControl={false}
              attributionControl={false}
              scrollWheelZoom={false}
              dragging={false}
              style={{ width: '100%', height: '100%', background: '#05070a' }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
              <MiniMapController center={activeCenter} />
            </MapContainer>

            {/* CRT Screen Filter and Crosshair HUD */}
            <div className="absolute inset-0 pointer-events-none z-[1000] border-2 border-primary/20 flex items-center justify-center">
              {/* Scanlines effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-40" />
              
              {/* Crosshair Overlay */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute w-8 h-[1px] bg-primary/70" />
                <div className="absolute h-8 w-[1px] bg-primary/70" />
                <div className="w-12 h-12 border border-dashed border-primary/50 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute -top-3 text-[7px] text-primary/80 font-bold tracking-widest font-mono">LOCK</div>
              </div>

              {/* Coordinates readouts in corners */}
              <div className="absolute top-2 left-2 text-[8px] text-primary/70 bg-black/70 px-1 font-bold">CAM // SAT-RECON-7</div>
              <div className="absolute top-2 right-2 text-[8px] text-primary/70 bg-black/70 px-1 font-bold">ZOOM // 16x</div>
              <div className="absolute bottom-2 left-2 text-[8px] text-primary/70 bg-black/70 px-1 font-bold">COORDS: {activeCenter[0].toFixed(5)}, {activeCenter[1].toFixed(5)}</div>
              <div className="absolute bottom-2 right-2 text-[8px] text-primary/70 bg-black/70 px-1 font-bold">STATUS: STREAMING</div>
            </div>
          </div>

          {/* Details & Logs Bottom Grid */}
          <div className="h-[35%] overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#07090d]">
            {activeTab === 'operator' ? (
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-white/50 tracking-widest uppercase flex items-center gap-1.5">
                  <Terminal size={12} className="text-primary" />
                  Operator Console Log
                </div>
                <div className="border border-white/5 bg-black/30 p-3 text-[10px] space-y-1 font-mono text-white/70">
                  <p className="text-primary/60">[00:00:01] SECURE TERMINAL LAUNCHED // OPERATOR CONNECTED</p>
                  <p className="text-white/40">[00:00:05] GEOLOC SOLVED AT LAT: {operatorCoords.lat.toFixed(4)} | LON: {operatorCoords.lon.toFixed(4)}</p>
                  <p className="text-white/40">[00:00:10] ESTABLISHING HEARTBEAT DIALOUT TO LOCAL BACKEND...</p>
                  {backendStats && <p className="text-green-400/80">[00:00:12] HOST SYSTEM STABILITY CHECK: NOMINAL | MEMORY RSS: {backendStats.memory_usage_mb}MB</p>}
                </div>
              </div>
            ) : selectedSafehouse ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase">// SECURE POINT METADATA</span>
                  <span className="text-[9px] text-primary/80 font-bold">ID: {selectedSafehouse.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-white/30 text-[9px] block">SECURITY RATING</span>
                      <span className="text-white font-bold">LEVEL {selectedSafehouse.rating} CLASSIFIED</span>
                    </div>
                    <div>
                      <span className="text-white/30 text-[9px] block">CURRENT CAPACITY</span>
                      <span className="text-white font-bold">{selectedSafehouse.capacity} DEPLOYED</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-white/30 text-[9px] block mb-1">FACILITY FEATURES</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedSafehouse.features.map((feat, i) => (
                        <span key={i} className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/80">
                          {feat.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
}
