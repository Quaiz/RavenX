import React, { useState, useRef, useMemo } from 'react';
import { Search, Crosshair, ShieldAlert, Target, Zap, Rocket, Anchor, Plane, Loader2, Info } from 'lucide-react';
import { streamAiResponse } from '../aiManager';

import { HARDWARE_DATABASE } from '../data/hardwareDatabase';

const TYPE_ICONS = {
  'AIR': Plane,
  'LAND': Target,
  'NAVAL': Anchor,
  'WEAPONS': Crosshair,
  'MISSILES': Rocket
};

const MilitaryHardware = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [selectedItem, setSelectedItem] = useState(() => {
    const saved = localStorage.getItem('raven_hardware_selected');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [aiAnalysis, setAiAnalysis] = useState(() => localStorage.getItem('raven_hardware_analysis') || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const abortRef = useRef(null);

  // Filter Logic
  const filteredHardware = useMemo(() => {
    return HARDWARE_DATABASE.filter(item => {
      const matchType = filterType === 'ALL' || item.type === filterType;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.class.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [search, filterType]);

  const selectItem = (item) => {
    setSelectedItem(item);
    setAiAnalysis('');
    if (abortRef.current) abortRef.current.abort();
    localStorage.setItem('raven_hardware_selected', JSON.stringify(item));
    localStorage.removeItem('raven_hardware_analysis');
  };

  const analyzeTactics = async () => {
    if (!selectedItem) return;
    setAiAnalysis('');
    setIsAiLoading(true);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const prompt = `You are RAVEN, a military intelligence AI.
Perform a clinical, classified strategic assessment of the following hardware:
System Name: ${selectedItem.name}
Class: ${selectedItem.class}
Origin: ${selectedItem.origin}

Include:
1. Primary Operational Role
2. Key Advantages & Vulnerabilities
3. Global Proliferation (Who uses it?)
4. Threat Level (Low/Med/High/Extreme) and Justification.

Respond in a raw, data-driven, tactical tone. Do not use markdown headers (#), just uppercase bold text. Keep it concise.`;

    try {
      let firstChunk = false;
      await streamAiResponse(prompt, {
        signal: abortRef.current.signal,
        config: { temperature: 0.6, maxOutputTokens: 600 },
        onChunk: (text) => {
          if (!firstChunk) { setAiAnalysis(''); firstChunk = true; }
          setAiAnalysis(prev => prev + text);
        },
        onComplete: () => {
          setIsAiLoading(false);
          localStorage.setItem('raven_hardware_analysis', aiAnalysis);
        },
        onError: (err) => {
          if (err.name !== 'AbortError') setAiAnalysis('ERROR: NEURAL LINK SEVERED.');
          setIsAiLoading(false);
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') setAiAnalysis('ERROR: NEURAL LINK SEVERED.');
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0000] border border-amber-900/30 text-white font-mono">
      {/* HEADER */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b border-amber-900/50 bg-amber-950/20">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6 bg-amber-900/30 border border-amber-500/50">
            <Crosshair size={12} className="text-amber-500" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-500 tracking-widest">GLOBAL HARDWARE REGISTRY</div>
            <div className="text-[9px] text-amber-500/50 tracking-wider">TACTICAL ASSET ANALYSIS</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - LIST */}
        <div className={`shrink-0 flex-col border-r border-amber-900/30 bg-black/40 transition-all duration-300 ${
          selectedItem ? 'hidden md:flex md:w-[35%]' : 'flex w-full'
        }`}>
          {/* Filters */}
          <div className="p-3 border-b border-amber-900/30 bg-amber-950/10 space-y-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/50"/>
              <input 
                type="text"
                placeholder="SEARCH DESIGNATION..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/60 border border-amber-900/50 py-1.5 pl-7 pr-2 text-[10px] text-amber-400 placeholder:text-amber-900 focus:outline-none focus:border-amber-500 transition-colors uppercase"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
              {['ALL', 'AIR', 'LAND', 'NAVAL', 'WEAPONS', 'MISSILES'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-1 text-[8px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap border ${
                    filterType === type 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                    : 'bg-black/60 text-amber-600/50 border-amber-900/30 hover:border-amber-500/30 hover:text-amber-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredHardware.map((item) => {
              const Icon = TYPE_ICONS[item.type] || Crosshair;
              const isSelected = selectedItem?.id === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className={`flex items-start gap-3 p-2 cursor-pointer transition-all border group ${
                    isSelected 
                    ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                    : 'bg-black/60 border-amber-900/30 hover:border-amber-500/50 hover:bg-amber-950/20'
                  }`}
                >
                  <div className="shrink-0 w-8 h-8 bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
                    <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-amber-700 group-hover:text-amber-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-amber-50 truncate group-hover:text-amber-400 uppercase">
                      {item.name}
                    </div>
                    <div className="text-[8px] text-amber-500/60 truncate uppercase">
                      {item.class} // {item.origin}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredHardware.length === 0 && (
              <div className="text-center p-4 text-[9px] text-amber-500/40 uppercase">NO HARDWARE FOUND</div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - DETAILS */}
        {selectedItem ? (
          <div className="flex-1 flex flex-col bg-black/80 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(245,158,11,1)_50%)] bg-[length:100%_4px] mix-blend-overlay z-0"></div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10 space-y-6">
              
              {/* Image & Title */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <button onClick={() => setSelectedItem(null)} className="md:hidden text-amber-500/70 hover:text-amber-400 text-[9px] font-bold tracking-widest uppercase mb-2">
                      &lt; BACK TO REGISTRY
                    </button>
                    <div className="text-[16px] font-bold text-white tracking-widest uppercase">{selectedItem.name}</div>
                    <div className="text-[10px] text-amber-500/80 tracking-widest uppercase mt-0.5">
                      {selectedItem.origin} // {selectedItem.class}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-amber-950 border border-amber-900 text-[9px] font-bold text-amber-500 tracking-widest">
                    {selectedItem.type}
                  </div>
                </div>
                
                {/* Hardware Image */}
                <div className="w-full h-48 md:h-64 border border-amber-900/50 bg-black/50 p-1 relative group">
                  {/* Tactical Brackets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500 pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500 pointer-events-none"></div>
                  
                  <img src={selectedItem.image} alt={selectedItem.name} referrerPolicy="no-referrer" onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }} className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
                </div>
                
                <div className="text-[10px] text-amber-50/80 leading-relaxed uppercase border-l-2 border-amber-500/50 pl-3">
                  {selectedItem.desc}
                </div>
              </div>

              {/* Specs Bars */}
              <div>
                <div className="flex items-center gap-2 mb-3 border-b border-amber-900/50 pb-1">
                  <Zap size={12} className="text-amber-500"/>
                  <span className="text-[10px] font-bold text-amber-500 tracking-widest">TECHNICAL SPECIFICATIONS</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {selectedItem.stats.map((stat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-amber-500/70">{stat.label}</span>
                        <span className="text-amber-100">{stat.text}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-amber-950/50 border border-amber-900/30 overflow-hidden flex">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Assessment */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-amber-900/50 pb-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={12} className="text-amber-500"/>
                    <span className="text-[10px] font-bold text-amber-500 tracking-widest">TACTICAL ASSESSMENT</span>
                  </div>
                  {!aiAnalysis && !isAiLoading && (
                    <button 
                      onClick={analyzeTactics}
                      className="text-[8px] px-2 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/30 transition-colors uppercase font-bold tracking-widest"
                    >
                      REQUEST AI ANALYSIS
                    </button>
                  )}
                </div>

                {(aiAnalysis || isAiLoading) ? (
                  <div className="p-3 border border-amber-500/30 bg-amber-950/20 relative">
                    <div className="text-[8px] text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={10} /> SYSTEM NEURAL OUTPUT {isAiLoading && <Loader2 size={8} className="animate-spin"/>}
                    </div>
                    <div className="text-[10px] text-amber-100 uppercase leading-relaxed whitespace-pre-wrap">
                      {aiAnalysis || 'INITIALIZING NEURAL LINK...'}
                      {isAiLoading && <span className="inline-block w-1.5 h-3 ml-1 bg-amber-400 animate-pulse align-middle"/>}
                    </div>
                  </div>
                ) : (
                  <div className="text-[9px] text-amber-500/40 uppercase italic text-center p-4 border border-amber-900/20 border-dashed">
                    AWAITING AI DECRYPTION PROTOCOL
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-black/60 relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(245,158,11,1)_50%)] bg-[length:100%_4px]"></div>
             <div className="text-center opacity-30">
               <Crosshair size={48} className="mx-auto mb-4 text-amber-500"/>
               <div className="text-[12px] font-bold tracking-widest text-amber-500 uppercase">AWAITING HARDWARE SELECTION</div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MilitaryHardware;
