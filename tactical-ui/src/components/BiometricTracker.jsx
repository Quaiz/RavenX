import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Target, Heart, Thermometer, Radio, Crosshair, HelpCircle, Map } from 'lucide-react';
import useStore from '../store';

const NATIONALITY_COORDS = {
  'RU': { lat: 61.524, lng: 105.318, label: 'MOSCOW OPS AREA' },
  'US': { lat: 37.090, lng: -95.712, label: 'NORTH AMERICAN AREA' },
  'CN': { lat: 35.861, lng: 104.195, label: 'BEIJING INTEL GRID' },
  'IR': { lat: 32.427, lng: 53.688, label: 'MIDDLE EAST sector A' },
  'KP': { lat: 40.339, lng: 127.510, label: 'EAST ASIA sector K' },
  'VN': { lat: 14.058, lng: 108.277, label: 'SOUTH EAST ASIA S1' },
  'IN': { lat: 20.593, lng: 78.962, label: 'SOUTH ASIA GRID' },
  'PK': { lat: 30.375, lng: 69.345, label: 'KARA-SECTOR' },
  'SY': { lat: 34.802, lng: 38.996, label: 'LEVANT OPERATIONAL ZONE' },
  'IQ': { lat: 33.223, lng: 43.679, label: 'MESOPOTAMIA GRID' },
  'AF': { lat: 33.939, lng: 67.710, label: 'HINDU KUSH ZONE' },
  'UA': { lat: 48.379, lng: 31.165, label: 'EAST EUROPE SECTOR' },
  'IL': { lat: 31.046, lng: 34.851, label: 'LEVANT GRID' },
  'YE': { lat: 15.552, lng: 48.516, label: 'GULF SECTOR' },
  'MX': { lat: 23.634, lng: -102.552, label: 'CENTRAL AMERICA S4' }
};

const BiometricTracker = () => {
  const { selectedTarget, isTrackingActive, setTrackingActive, setMapTarget, addNotification } = useStore();
  const [scanProgress, setScanProgress] = useState(0);
  const [matchPercent, setMatchPercent] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [temp, setTemp] = useState(36.6);
  const [isScanning, setIsScanning] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const canvasRef = useRef(null);

  // Generate facial landmarks simulating biometric scan points
  useEffect(() => {
    const points = [];
    for (let i = 0; i < 18; i++) {
      points.push({
        x: 20 + Math.random() * 60, // percentage
        y: 20 + Math.random() * 60,
        active: Math.random() > 0.3
      });
    }
    setLandmarks(points);
  }, [selectedTarget]);

  // Handle Scanning Progress when target selected
  useEffect(() => {
    if (!selectedTarget) {
      setScanProgress(0);
      setMatchPercent(0);
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setMatchPercent(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setMatchPercent((85 + Math.random() * 14.9).toFixed(2));
          addNotification(`ABIS COMPLETED SCANNING FOR ${selectedTarget.name}`, 'SUCCESS');
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [selectedTarget]);

  // Simulating heart rate & temp fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedTarget) {
        setHeartRate(prev => Math.floor(75 + Math.sin(Date.now() / 1000) * 10 + Math.random() * 4));
        setTemp(prev => (36.5 + Math.sin(Date.now() / 2000) * 0.4 + Math.random() * 0.1).toFixed(1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedTarget]);

  // Center Map on target's operational zone
  const locateOnMap = () => {
    if (!selectedTarget) return;
    const nationalityCode = selectedTarget.nationality;
    const coords = NATIONALITY_COORDS[nationalityCode] || { lat: 0, lng: 0, label: 'GLOBAL SECTOR' };

    if (coords.lat !== 0) {
      setMapTarget({ lat: coords.lat, lng: coords.lng, zoom: 5 });
      addNotification(`GEOINT CAMERA ORIENTED TO: ${coords.label}`, 'INFO');
    } else {
      addNotification(`COULD NOT RETRIEVE GEO-COORDINATES FOR ${selectedTarget.nationality}`, 'WARNING');
    }
  };

  // Determine threat severity based on classification
  const getThreatClass = () => {
    if (!selectedTarget) return { label: 'UNKNOWN', color: 'text-white/30', border: 'border-white/20' };
    const name = selectedTarget.name;
    const isHigh = name.includes('TERROR') || name.includes('KILL') || name.includes('MURDER') || selectedTarget.source === 'FBI_WANTED';
    if (isHigh) return { label: 'HIGH VALUE TARGET (HVT)', color: 'text-red-500 font-bold', border: 'border-red-500/50 bg-red-950/20' };
    return { label: 'PERSON OF INTEREST (POI)', color: 'text-amber-500', border: 'border-amber-500/40 bg-amber-950/10' };
  };

  const threat = getThreatClass();

  return (
    <div className="h-full flex flex-col bg-[#050907] border border-green-900/30 text-green-500 font-mono text-[10px]">
      {/* HUD Header */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b border-green-900/50 bg-green-950/10">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-green-500 animate-pulse" />
          <div>
            <div className="text-[11px] font-bold text-green-400 tracking-[0.2em] uppercase">// ABIS FACIAL ENGINE</div>
            <div className="text-[8px] text-green-600/70 tracking-widest font-bold">AUTOMATED BIOMETRIC INTERFACE</div>
          </div>
        </div>
        {selectedTarget && (
          <span className="px-2 py-0.5 bg-green-950/60 border border-green-500/50 text-green-400 text-[8px] font-bold tracking-widest animate-pulse uppercase">
            {isScanning ? `ANALYZING... ${scanProgress}%` : 'LOCK CONFIRMED'}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left pane: Biometric scan display */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-green-900/20 relative bg-black/40">
          {/* Neon Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.8)_50%)] bg-[length:100%_6px] mix-blend-overlay z-0"></div>

          {selectedTarget ? (
            <div className="w-full max-w-[200px] aspect-[4/5] border border-green-500/40 relative bg-black overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              {/* Mugshot image */}
              <img
                src={selectedTarget.thumb}
                alt="abis target"
                className="w-full h-full object-cover grayscale opacity-60 contrast-125"
                referrerPolicy="no-referrer"
              />

              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="absolute left-0 w-full h-[2px] bg-green-500 shadow-[0_0_10px_#22c55e] animate-[scan_2s_infinite_linear] z-20"
                     style={{
                       animation: 'scan 2s infinite linear',
                       top: `${scanProgress}%`
                     }}
                />
              )}

              {/* Bounding Box on Target Face */}
              <div className="absolute top-[20%] left-[20%] w-[60%] h-[55%] border-2 border-dashed border-green-500/70 pointer-events-none z-10">
                {/* Crosshairs inside bounding box */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-green-500/20"></div>
                <div className="absolute left-1/2 top-0 w-px h-full bg-green-500/20"></div>
                
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-green-500"></div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-green-500"></div>
              </div>

              {/* Biometric node overlay dots */}
              {!isScanning && landmarks.map((pt, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full ${pt.active ? 'bg-green-400 shadow-[0_0_4px_#4ade80]' : 'bg-green-900'} transition-all`}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                />
              ))}

              {/* Scanning status banner */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/85 border border-green-900/60 p-1 text-center font-mono text-[7px] text-green-400 tracking-wider">
                {isScanning ? `MAPPING BIOMETRICS: ${scanProgress}%` : `IDENTITY MATCHED: ${matchPercent}%`}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 text-green-700 p-4 text-center">
              <Crosshair size={36} className="animate-spin-slow" />
              <div className="text-[9px] uppercase tracking-[0.2em]">ABIS OFFLINE · NO ACTIVE LOCK</div>
            </div>
          )}
        </div>

        {/* Right pane: Biometric stats */}
        <div className="w-full md:w-[240px] p-4 flex flex-col justify-between space-y-4">
          {selectedTarget ? (
            <>
              <div className="space-y-3">
                {/* Core Profile */}
                <div className="p-2.5 border border-green-900/30 bg-green-950/5">
                  <div className="text-[7px] text-green-600/70 font-bold uppercase tracking-wider">TARGET NAME</div>
                  <div className="text-[11px] font-bold text-green-200 mt-0.5 truncate uppercase">{selectedTarget.name}</div>
                </div>

                {/* Threat Designation */}
                <div className={`p-2.5 border text-center uppercase tracking-wider text-[8px] ${threat.border}`}>
                  <div className="text-[6px] text-green-600/60">THREAT CLASSIFICATION</div>
                  <div className={`text-[9px] mt-1 ${threat.color}`}>{threat.label}</div>
                </div>

                {/* Biometric Telemetries */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Heart Rate */}
                  <div className="p-2 border border-green-900/20 bg-black/40 flex items-center gap-2">
                    <Heart size={14} className="text-green-500 animate-pulse" />
                    <div>
                      <div className="text-[6px] text-green-600">HEART RATE</div>
                      <div className="text-[10px] font-bold text-green-200">{isScanning ? '--' : `${heartRate} BPM`}</div>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="p-2 border border-green-900/20 bg-black/40 flex items-center gap-2">
                    <Thermometer size={14} className="text-green-500" />
                    <div>
                      <div className="text-[6px] text-green-600">BODY TEMP</div>
                      <div className="text-[10px] font-bold text-green-200">{isScanning ? '--' : `${temp}°C`}</div>
                    </div>
                  </div>
                </div>

                {/* Grid Position */}
                <div className="p-2.5 border border-green-900/20 bg-black/40">
                  <div className="text-[7px] text-green-600 font-bold uppercase">NATIONALITY / REGISTRATION GZD</div>
                  <div className="text-[9px] text-green-300 mt-1 uppercase tracking-widest font-mono">
                    {selectedTarget.nationality} AREA
                  </div>
                </div>
              </div>

              {/* Action: map lock */}
              <button
                onClick={locateOnMap}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-950/20 border border-green-500/30 hover:bg-green-500/10 text-green-400 hover:text-green-300 font-bold tracking-widest text-[8px] transition-all disabled:opacity-40 uppercase"
              >
                <Map size={11} /> TRACK GEOINT LAYER
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-green-700/40 text-center font-bold tracking-widest py-8">
              SELECT TARGET IN TARGET REGISTRY TO INITIATE SCAN
            </div>
          )}
        </div>
      </div>

      {/* Style for scanning animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};

export default BiometricTracker;
