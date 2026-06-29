import React from 'react';
import GlobalTargets from './GlobalTargets';
import BiometricTracker from './BiometricTracker';
import SecureComms from './SecureComms';
import PersonnelStatus from './PersonnelStatus';
import { Target, Shield, Radio, Users } from 'lucide-react';

const C2TacticalCenter = () => {
  return (
    <div className="h-full flex flex-col bg-[#050608] text-white font-mono p-1 gap-1">
      {/* C2 Command Title Overlay */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-white/90">// JOINT C2 TACTICAL HUB</span>
        </div>
        <div className="flex items-center gap-4 text-[7px] text-white/30 tracking-widest font-bold">
          <span>NET LINK: SECURED</span>
          <span>·</span>
          <span>AES-256 ACTIVE</span>
          <span>·</span>
          <span>MGRS GRID ENGAGED</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-1.5 overflow-hidden">
        {/* Left Column: Target Registry (FBI / Interpol) */}
        <div className="lg:col-span-4 h-full overflow-hidden flex flex-col border border-white/5">
          <div className="h-6 bg-red-950/20 border-b border-red-900/30 flex items-center px-3 justify-between shrink-0">
            <span className="text-[8px] font-bold text-red-500 tracking-widest uppercase flex items-center gap-1">
              <Target size={10} /> 01. TARGET REGISTRY
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <GlobalTargets />
          </div>
        </div>

        {/* Center Column: Biometrics & Secure Comms */}
        <div className="lg:col-span-5 h-full flex flex-col gap-1.5 overflow-hidden">
          {/* Top Half: Biometrics (ABIS) */}
          <div className="flex-1 overflow-hidden flex flex-col border border-white/5">
            <div className="h-6 bg-green-950/20 border-b border-green-900/30 flex items-center px-3 justify-between shrink-0">
              <span className="text-[8px] font-bold text-green-400 tracking-widest uppercase flex items-center gap-1">
                <Shield size={10} /> 02. ABIS FACIAL LOCK
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <BiometricTracker />
            </div>
          </div>

          {/* Bottom Half: Secure Comms */}
          <div className="flex-1 overflow-hidden flex flex-col border border-white/5">
            <div className="h-6 bg-cyan-950/20 border-b border-cyan-900/30 flex items-center px-3 justify-between shrink-0">
              <span className="text-[8px] font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1">
                <Radio size={10} /> 03. SECURE COMMS LINK
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <SecureComms />
            </div>
          </div>
        </div>

        {/* Right Column: ATAK Blue Force Tracker */}
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col border border-white/5">
          <div className="h-6 bg-green-950/20 border-b border-green-900/30 flex items-center px-3 justify-between shrink-0">
            <span className="text-[8px] font-bold text-green-400 tracking-widest uppercase flex items-center gap-1">
              <Users size={10} /> 04. BLUE FORCE BOARD
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <PersonnelStatus />
          </div>
        </div>
      </div>
    </div>
  );
};

export default C2TacticalCenter;
