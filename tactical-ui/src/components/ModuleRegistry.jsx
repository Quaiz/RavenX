import React, { useState, useMemo, useEffect } from 'react';
import useStore, { MODULE_CATEGORIES } from '../store';
import { audio } from '../utils/audioEngine';
import { X, Search, Globe, TrendingUp, Shield, Activity, Map } from 'lucide-react';

const CATEGORY_META = {
 CORE: { icon: Map, color: 'text-primary' },
 INTELLIGENCE: { icon: Shield, color: 'text-cyan-400' },
 MARKETS: { icon: TrendingUp, color: 'text-amber-500' },
 STRATEGIC: { icon: Globe, color: 'text-primary' },
 ENVIRONMENTAL: { icon: Activity, color: 'text-green-500' },
};

const ModuleRegistry = ({ isOpen, onClose, isWatcherOpen = false }) => {
 const { activeModules, toggleModule } = useStore();
 const [activeTab, setActiveTab] = useState('ALL');
 const [search, setSearch] = useState('');
 const [shouldRender, setShouldRender] = useState(isOpen);
 const [isClosing, setIsClosing] = useState(false);

 useEffect(() => {
   if (isOpen) {
     setShouldRender(true);
     setIsClosing(false);
   } else if (shouldRender) {
     setIsClosing(true);
     const t = setTimeout(() => {
       setShouldRender(false);
       setIsClosing(false);
     }, 215);
     return () => clearTimeout(t);
   }
 }, [isOpen, shouldRender]);

 const categories = Object.keys(MODULE_CATEGORIES);

 // Flatten all modules with category info
 const allModules = useMemo(() => {
 const result = [];
 for (const [cat, modules] of Object.entries(MODULE_CATEGORIES)) {
 for (const m of modules) {
 result.push({ ...m, category: cat });
 }
 }
 return result;
 }, []);

 // Filter by search and active tab
 const filteredModules = allModules.filter(m => {
 const matchTab = activeTab === 'ALL' || m.category === activeTab;
 const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
 return matchTab && matchSearch;
 });

 // Group by category for display
 const groupedModules = useMemo(() => {
 const groups = {};
 for (const m of filteredModules) {
 if (!groups[m.category]) groups[m.category] = [];
 groups[m.category].push(m);
 }
 return groups;
 }, [filteredModules]);

 const totalCount = allModules.length;
 const activeCount = activeModules.filter(id => id !== 'MAP_MODULE' && id !== 'AI_ANALYST').length;

 if (!shouldRender) return null;

 return (
 <div
   className={`fixed left-14 z-[19500] pointer-events-auto ${
     isClosing ? 'macos-window-exit' : 'macos-window-enter'
   }`}
   style={{
     bottom: isWatcherOpen ? '146px' : '32px',
   }}
 >
 <div className="w-[390px] sm:w-[435px] max-w-[calc(100vw-4.5rem)] h-[430px] max-h-[calc(100dvh-165px)] bg-[#071009]/95 border border-[#4bd865]/50 shadow-[0_22px_55px_rgba(0,0,0,0.92)] flex flex-col overflow-hidden">

 {/* ═══ HEADER (WATCHER-02 Green Style) ═══ */}
 <div
   className="h-9 border-b border-black flex items-center justify-between shrink-0"
   style={{
     background: 'linear-gradient(90deg, rgba(42,96,48,0.9) 0%, rgba(24,56,29,0.92) 48%, rgba(10,20,12,0.96) 100%)',
   }}
 >
 <div className="flex items-center h-full">
   <button
     type="button"
     onClick={() => { audio.playClick(); onClose(); }}
     className="w-8 h-full bg-[#261111] hover:bg-[#e05252] text-[#ff6b6b] hover:text-[#090c09] border-r border-black/80 font-mono text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer"
     title="Close Modules"
   >
     X
   </button>
   <div className="flex items-center gap-2.5 px-3">
     <span className="text-[12px] font-bold tracking-[0.2em] text-[#eef6ee] uppercase">// TACTICAL MODULES</span>
     <span className="mw4-badge px-1.5 py-0.5 text-[7px] leading-none">{activeCount}/{totalCount}</span>
   </div>
 </div>
 <div className="flex items-center h-full">
   <div className="h-5 px-2 bg-[#071109] border border-[#39e75f]/40 text-[#39e75f] font-mono text-[8px] font-bold tracking-widest flex items-center justify-center">
     ON.SE1
   </div>
   <div className="w-1.5 h-full bg-[#39e75f] ml-1.5 border-l border-black/80" />
 </div>
 </div>

 {/* ═══ SEARCH ═══ */}
 <div className="px-5 pt-3.5 pb-2.5 shrink-0">
 <div className="flex items-center gap-3 px-3 py-2 bg-[#0c0e0d] border border-white/10 focus-within:border-primary/50 transition-colors">
 <Search size={13} className="text-white/30 shrink-0"/>
 <input
 type="text"
 placeholder="Filter tactical modules..."
 className="bg-transparent border-none outline-none text-[11px] text-[#e8eae6] w-full placeholder:text-white/25 tracking-wider"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 </div>

 {/* ═══ CATEGORY TABS (MW4 Bone-White Active Tab Pills) ═══ */}
 <div className="px-5 pb-3 flex gap-1 flex-wrap shrink-0 border-b border-white/5">
 <button
 onClick={() => { audio.playClick(); setActiveTab('ALL'); }}
 className={`px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase ${activeTab === 'ALL'
 ? 'mw4-tab-active'
 : 'mw4-tab border border-white/5'
 }`}
 >
 ALL <span className="opacity-60 ml-0.5">{totalCount}</span>
 </button>
 {categories.map(cat => {
 const count = MODULE_CATEGORIES[cat].length;
 return (
 <button
 key={cat}
 onClick={() => { audio.playClick(); setActiveTab(cat); }}
 className={`px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase ${activeTab === cat
 ? 'mw4-tab-active'
 : 'mw4-tab border border-white/5'
 }`}
 >
 {cat} <span className="opacity-60 ml-0.5">{count}</span>
 </button>
 );
 })}
 </div>

 {/* ═══ MODULE LIST (MW4 Settings Rows + Sage Toggle Switches) ═══ */}
 <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3">
 {Object.entries(groupedModules).map(([category, modules]) => (
 <div key={category} className="mb-3.5">
 {/* Category header */}
 <div className="flex items-center gap-2 mb-1.5 py-1">
 <div className="text-[8px] font-bold text-[#c6d67a]/70 tracking-[0.22em] uppercase">{category}</div>
 <div className="flex-1 h-px bg-white/8"/>
 </div>

 {/* Module items */}
 <div className="space-y-1">
 {modules.map(m => {
 const isActive = activeModules.includes(m.id);
 const meta = CATEGORY_META[m.category] || CATEGORY_META.INTELLIGENCE;
 const IconComp = meta.icon;

 return (
 <div
 key={m.id}
 onClick={() => { audio.playClick(); toggleModule(m.id); }}
 className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer group ${isActive
 ? 'mw4-row-active'
 : 'mw4-row'
 }`}
 >
 {/* Icon */}
 <div className={`w-7 h-7 flex items-center justify-center border shrink-0 ${isActive
 ? 'border-primary/40 bg-primary/10'
 : 'border-white/8 bg-black/25 group-hover:border-white/15'
 }`}>
 <IconComp size={13} className={isActive ? 'text-[#d8e89e]' : 'text-white/35 group-hover:text-white/70'} />
 </div>

 {/* Text */}
 <div className="flex-1 min-w-0">
 <div className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-[#d8e89e]' : 'text-[#e8eae6]/80 group-hover:text-[#e8eae6]'}`}>
 {m.name}
 </div>
 <div className="text-[8px] text-white/35 tracking-wider truncate leading-relaxed">
 {m.desc}
 </div>
 </div>

 {/* MW4 On/Off Label + Sage Toggle Switch */}
 <div className="flex items-center gap-2 shrink-0">
 <span className={`text-[8px] font-mono uppercase tracking-widest ${isActive ? 'text-[#c6d67a]' : 'text-white/30'}`}>
 {isActive ? 'On' : 'Off'}
 </span>
 <div className={`mw4-toggle ${isActive ? 'mw4-toggle-on' : ''}`} />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 {/* ═══ FOOTER ═══ */}
 <div className="h-9 border-t border-white/10 bg-[#0e110f] flex items-center justify-between px-5 shrink-0">
 <div className="text-[8px] text-white/40 uppercase tracking-widest font-mono">
 <span className="text-[#c6d67a] font-bold">{activeCount}</span> ACTIVE · {totalCount} AVAILABLE
 </div>
 <div className="text-[8px] text-white/30 uppercase tracking-widest font-mono">
 CLICK ROW TO TOGGLE
 </div>
 </div>

 </div>
 </div>
 );
};

export default ModuleRegistry;
