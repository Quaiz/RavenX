import React, { useState, useEffect, useRef } from 'react';
import { Shield, Eye, ShieldAlert, Heart, Battery, Compass, Camera } from 'lucide-react';
import useStore from '../store';

const PersonnelStatus = () => {
  const { c2Operators, setOperatorStatus, setMapTarget, addNotification } = useStore();
  const [activeOpId, setActiveOpId] = useState('price');
  
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  const activeOp = c2Operators.find(op => op.id === activeOpId) || c2Operators[0];

  // Render simulated tactical helmet cam on Canvas
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const drawBodycam = () => {
      frameRef.current += 1;
      
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw green NVG night vision background
      ctx.fillStyle = '#021004';
      ctx.fillRect(0, 0, w, h);

      // 2. Draw static noise overlay
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const noiseDensity = 0.12; // noise level
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < noiseDensity) {
          const v = Math.random() * 80;
          data[i] = v;     // R
          data[i+1] = v + 80; // G (heavily green)
          data[i+2] = v;   // B
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // 3. Draw outline target boxes simulating computer vision detection
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      
      // Draw simulated outline vector lines (buildings or objects)
      ctx.beginPath();
      // Moving simulated lines
      const offset = (frameRef.current % 120) / 120 * w;
      ctx.moveTo(w / 4, h / 2 + Math.sin(frameRef.current / 15) * 10);
      ctx.lineTo(w / 2, h / 3 + Math.cos(frameRef.current / 15) * 10);
      ctx.lineTo(3 * w / 4, h / 2);
      ctx.strokeStyle = '#22c55e33';
      ctx.stroke();

      // 4. Draw horizontal scanning bars (CRT roll)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
      const scanY = (frameRef.current * 1.5) % h;
      ctx.fillRect(0, scanY, w, 15);
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.03)';
      const scanY2 = ((frameRef.current * 1.5) + h/2) % h;
      ctx.fillRect(0, scanY2, 20, h);

      // 5. Draw reticles
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.arc(w/2, h/2, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Reticle center dot
      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.fillRect(w/2 - 1, h/2 - 1, 2, 2);

      // 6. Draw telemetry texts
      ctx.fillStyle = '#22c55e';
      ctx.font = '7px monospace';
      
      // Top left: Operator details
      ctx.fillText(`OP: ${activeOp.callsign}`, 8, 12);
      ctx.fillText(`STATUS: ${activeOp.status}`, 8, 20);
      ctx.fillText(`BAT: ${(100 - (frameRef.current / 200) % 30).toFixed(0)}%`, 8, 28);
      
      // Top right: Video details
      ctx.fillText("REC ●", w - 40, 12);
      ctx.fillText(`ALT: ${activeOp.alt + Math.floor(Math.sin(frameRef.current / 10) * 3)}M`, w - 50, 20);
      ctx.fillText(`COMP: ${((frameRef.current / 5) % 360).toFixed(0)}°N`, w - 50, 28);

      // Bottom left: Coordinates
      ctx.fillText(`LAT: ${activeOp.lat.toFixed(4)}°`, 8, h - 16);
      ctx.fillText(`LNG: ${activeOp.lng.toFixed(4)}°`, 8, h - 8);

      // Bottom right: Fps / Time
      ctx.fillText("FPS: 15.0", w - 45, h - 16);
      ctx.fillText("THERMAL_ON", w - 50, h - 8);

      // Slow frame rate to simulate tactical sat feed (15fps)
      setTimeout(() => {
        animId = requestAnimationFrame(drawBodycam);
      }, 66);
    };

    drawBodycam();

    return () => cancelAnimationFrame(animId);
  }, [activeOpId, activeOp]);

  // Center Map on Operator position
  const focusOperator = (op) => {
    setActiveOpId(op.id);
    setMapTarget({ lat: op.lat, lng: op.lng, zoom: 7 });
    addNotification(`CENTERED GEOSPATIAL EYE ON ${op.callsign}`, 'INFO');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500 bg-green-950/30 border-green-800/40';
      case 'KIA': return 'text-red-500 bg-red-950/30 border-red-800/40';
      default: return 'text-white/30 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050c05] border border-green-900/30 text-green-500 font-mono text-[10px]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b border-green-900/50 bg-green-950/10">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-green-500" />
          <div>
            <div className="text-[11px] font-bold text-green-400 tracking-[0.2em] uppercase">// BLUE FORCE STATUS BOARD</div>
            <div className="text-[8px] text-green-600/70 tracking-widest font-bold">ATAK PERSONNEL NETWORK MONITOR</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Left pane: Operator Cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {c2Operators.map(op => {
            const isSelected = activeOpId === op.id;
            return (
              <div
                key={op.id}
                onClick={() => focusOperator(op)}
                className={`p-2.5 border cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-green-950/30 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.15)]' 
                    : 'bg-black/60 border-green-900/20 hover:border-green-500/40 hover:bg-green-950/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-green-200 uppercase tracking-wider">{op.callsign}</span>
                    <span className={`px-1.5 py-0.2 border text-[6px] font-bold tracking-widest ${getStatusColor(op.status)}`}>
                      {op.status}
                    </span>
                  </div>
                  <div className="text-[7px] text-green-600 uppercase mt-0.5">{op.name} · {op.group}</div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="text-[8px] font-bold text-green-400">
                    <div>{op.lat.toFixed(3)}N</div>
                    <div>{op.lng.toFixed(3)}E</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = op.status === 'ACTIVE' ? 'KIA' : 'ACTIVE';
                      setOperatorStatus(op.id, next);
                      addNotification(`OPERATOR ${op.callsign} STATE UPDATED TO: ${next}`, next === 'KIA' ? 'WARNING' : 'SUCCESS');
                    }}
                    className={`p-1 border text-[7px] font-bold ${
                      op.status === 'ACTIVE' 
                        ? 'border-red-900/50 hover:bg-red-500/20 text-red-500' 
                        : 'border-green-900/50 hover:bg-green-500/20 text-green-500'
                    }`}
                    title="Toggle Combat Status"
                  >
                    {op.status === 'ACTIVE' ? 'SET KIA' : 'SET ACTIVE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right pane: Helmet bodycam live feed simulator */}
        <div className="w-full xl:w-[260px] p-3 border-t xl:border-t-0 xl:border-l border-green-900/30 flex flex-col justify-between bg-black/40">
          <div>
            <div className="flex items-center gap-1.5 text-green-700/80 text-[7px] font-bold tracking-widest uppercase mb-2">
              <Camera size={11} /> HELMET FEED // {activeOp.callsign}
            </div>

            {/* Canvas */}
            <div className="w-full aspect-[4/3] border border-green-900/40 relative overflow-hidden bg-black p-0.5">
              <canvas
                ref={canvasRef}
                width={240}
                height={180}
                className="w-full h-full object-contain grayscale brightness-125"
              />
            </div>
          </div>

          <div className="p-2 border border-green-900/20 bg-green-950/5 mt-3 space-y-1.5">
            <div className="text-[7px] text-green-600 font-bold uppercase">MISSION ASSIGNMENT DATA</div>
            <div className="text-[8px] text-green-200 leading-normal uppercase">
              SECTOR SECURITY LEVEL IS GREEN. ENGAGED IN COORDINATED GEOINT MAP SEARCH OVERWATCH FOR RECONNAISSANCE.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelStatus;
