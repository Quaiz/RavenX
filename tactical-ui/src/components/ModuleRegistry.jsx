import React, { useState, useMemo } from 'react';
import useStore, { MODULE_CATEGORIES, WORKSPACE_MODULES } from '../store';
import { audio } from '../utils/audioEngine';
import { X, Search, Globe, TrendingUp, Shield, Activity, Map, ChevronRight } from 'lucide-react';

const CATEGORY_META = {
 CORE: { icon: Map, color: 'text-primary' },
 INTELLIGENCE: { icon: Shield, color: 'text-cyan-400' },
 MARKETS: { icon: TrendingUp, color: 'text-amber-500' },
 STRATEGIC: { icon: Globe, color: 'text-primary' },
 ENVIRONMENTAL: { icon: Activity, color: 'text-green-500' },
};

const ModuleRegistry = ({ isOpen, onClose }) => {
 const { activeModules, toggleModule, activeWorkspace } = useStore();
 const [activeTab, setActiveTab] = useState('ALL');
 const [search, setSearch] = useState('');

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
 const activeCount = activeModules.length;

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="w-full max-w-xl h-[540px] bg-[#0c0f14] border border-white/8 shadow-2xl flex flex-col overflow-hidden ">

 {/* ═══ HEADER ═══ */}
 <div className="h-12 border-b border-white/5 flex items-center justify-between px-5 bg-white/[0.02] shrink-0">
 <div className="flex items-center gap-3">
 <span className="text-[11px] font-bold tracking-[0.2em] text-white/80 uppercase">// Modules</span>
 </div>
 <button onClick={() => { audio.playClick(); onClose(); }} className="p-1.5 hover:bg-white/5 text-white/30 hover:text-white transition-colors ">
 <X size={16} />
 </button>
 </div>

 {/* ═══ SEARCH ═══ */}
 <div className="px-5 pt-4 pb-3 shrink-0">
 <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.03] border border-white/5 ">
 <Search size={13} className="text-white/15 shrink-0"/>
 <input
 type="text"
 placeholder="Search modules..."
 className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder:text-white/15 tracking-wider"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 </div>

 {/* ═══ CATEGORY TABS ═══ */}
 <div className="px-5 pb-3 flex gap-1.5 flex-wrap shrink-0">
 <button
 onClick={() => { audio.playClick(); setActiveTab('ALL'); }}
 className={`px-2.5 py-1 text-[7px] font-bold tracking-widest transition-all border ${activeTab === 'ALL'
 ? 'bg-primary/15 border-primary/40 text-primary'
 : 'bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50'
 }`}
 >
 ALL <span className="text-primary/70 ml-0.5">{totalCount}</span>
 </button>
 {categories.map(cat => {
 const count = MODULE_CATEGORIES[cat].length;
 return (
 <button
 key={cat}
 onClick={() => { audio.playClick(); setActiveTab(cat); }}
 className={`px-2.5 py-1 text-[7px] font-bold tracking-widest transition-all border ${activeTab === cat
 ? 'bg-primary/15 border-primary/40 text-primary'
 : 'bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50'
 }`}
 >
 {cat} <span className="text-white/15 ml-0.5">{count}</span>
 </button>
 );
 })}
 </div>

 {/* ═══ MODULE LIST ═══ */}
 <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
 {Object.entries(groupedModules).map(([category, modules]) => (
 <div key={category} className="mb-3">
 {/* Category header */}
 <div className="flex items-center gap-2 mb-1.5 py-1">
 <div className="text-[7px] font-bold text-white/15 tracking-[0.25em] uppercase">// {category}</div>
 <div className="flex-1 h-px bg-white/5"/>
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
 className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all group ${isActive
 ? 'bg-primary/8 border border-primary/25'
 : 'border border-transparent hover:bg-white/[0.02] hover:border-white/5'
 }`}
 >
 {/* Icon */}
 <div className={`w-7 h-7 flex items-center justify-center border shrink-0 ${isActive
 ? 'border-primary/30 bg-primary/10'
 : 'border-white/5 bg-white/[0.02] group-hover:border-white/10'
 }`}>
 <IconComp size={13} className={isActive ? 'text-primary' : 'text-white/20 group-hover:text-white/40'} />
 </div>

 {/* Text */}
 <div className="flex-1 min-w-0">
 <div className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-primary' : 'text-white/70 group-hover:text-white/90'}`}>
 {m.name}
 </div>
 <div className="text-[7px] text-white/20 uppercase tracking-wider truncate leading-relaxed group-hover:text-white/30">
 {m.desc}
 </div>
 </div>

 {/* Active indicator */}
 {isActive && (
 <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_#ffb800] shrink-0"/>
 )}
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 {/* ═══ FOOTER ═══ */}
 <div className="h-9 border-t border-white/5 bg-black/40 flex items-center justify-between px-5 shrink-0">
 <div className="text-[7px] text-white/15 uppercase tracking-widest font-bold">
 <span className="text-primary/50">{activeCount}</span> MODULES · <span className="text-white/20">{totalCount}</span> TOTAL
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[6px] text-white/10 uppercase tracking-widest">SRC</span>
 <span className="text-[7px] text-primary/30 font-bold tracking-wider">CATEGORY</span>
 <span className="text-[6px] text-white/10 uppercase tracking-widest ml-2">ALL</span>
 <span className="text-[7px] text-primary/30 font-bold tracking-wider">ITEMS</span>
 </div>
 </div>

 </div>
 </div>
 );
};

export default ModuleRegistry;
