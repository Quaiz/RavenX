import React, { useState } from 'react';
import { X, Search, Layers, Map as MapIcon, ChevronUp, ChevronDown, Sliders } from 'lucide-react';
import useStore from '../store';

const CATEGORY_COLORS = {
 DARK: { bg: 'bg-cyan-900/30', border: 'border-cyan-700/40', text: 'text-cyan-400', label: 'text-cyan-500/60' },
 LIGHT: { bg: 'bg-neutral-700/30', border: 'border-neutral-500/30', text: 'text-neutral-300', label: 'text-neutral-400/60' },
 SATELLITE: { bg: 'bg-emerald-900/30', border: 'border-emerald-600/40', text: 'text-emerald-400', label: 'text-emerald-500/60' },
 TERRAIN: { bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', text: 'text-yellow-500', label: 'text-yellow-600/60' },
 STYLISED: { bg: 'bg-stone-700/30', border: 'border-stone-500/30', text: 'text-stone-300', label: 'text-stone-400/60' },
};

const OVERLAY_CATEGORIES = ['ALL', 'CONFLICT', 'MILITARY', 'ENVIRO', 'HUMANITARIAN', 'MARITIME', 'INFRA', 'SPACE', 'WEATHER'];

const LayerSelector = ({ isOpen, onClose }) => {
 const { mapConfig, baseMaps, overlayLayers, setBaseMap, toggleOverlay } = useStore();
 const [baseMapCategory, setBaseMapCategory] = useState('ALL');
 const [overlayCategory, setOverlayCategory] = useState('ALL');
 const [searchQuery, setSearchQuery] = useState('');
 const [baseMapExpanded, setBaseMapExpanded] = useState(true);

 const baseMapCategories = ['ALL', 'DARK', 'LIGHT', 'SATELLITE', 'TERRAIN', 'STYLISED'];

 const filteredBaseMaps = baseMaps.filter(m =>
 (baseMapCategory === 'ALL' || m.category === baseMapCategory)
 );

 const filteredOverlays = (overlayLayers || []).filter(l => {
 const matchCat = overlayCategory === 'ALL' || l.category === overlayCategory;
 const matchSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase());
 return matchCat && matchSearch;
 });

 const activeOverlayCount = mapConfig.activeOverlays.length;
 const currentBaseMap = baseMaps.find(m => m.id === mapConfig.baseMap);

 if (!isOpen) return null;

 return (
 <div className="absolute top-0 left-0 z-[3000] w-[320px] bg-[#0a0d11]/98 backdrop-blur-md border-r border-white/5 shadow-2xl flex flex-col h-full overflow-hidden">

 {/* ═══ HEADER ═══ */}
 <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-3">
 <Layers size={14} className="text-white/40"/>
 <span className="text-[11px] font-bold tracking-[0.3em] text-white/80 uppercase">// Overlays</span>
 </div>
 <div className="flex items-center gap-4">
 <span className="text-[9px] font-bold text-primary tracking-widest">{activeOverlayCount}/3 FREE</span>
 <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
 <X size={14} />
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto no-scrollbar">

 {/* ═══ BASE MAP SECTION ═══ */}
 <div className="border-b border-white/5">
 <button
 onClick={() => setBaseMapExpanded(prev => !prev)}
 className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
 >
 <div className="flex items-center gap-2">
 <MapIcon size={12} className="text-white/30"/>
 <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase">// Base Map</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{currentBaseMap?.name || 'RECON'}</span>
 {baseMapExpanded ? <ChevronUp size={12} className="text-white/30"/> : <ChevronDown size={12} className="text-white/30"/>}
 </div>
 </button>

 {baseMapExpanded && (
 <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
 {/* Category Tabs */}
 <div className="flex gap-1 flex-wrap">
 {baseMapCategories.map(cat => (
 <button
 key={cat}
 onClick={() => setBaseMapCategory(cat)}
 className={`px-2.5 py-1 text-[7px] font-bold tracking-widest transition-all border ${baseMapCategory === cat
 ? 'bg-primary/20 border-primary/50 text-primary'
 : 'bg-white/[0.03] border-white/5 text-white/30 hover:text-white/60 hover:border-white/10'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Map Grid */}
 <div className="grid grid-cols-3 gap-1.5">
 {filteredBaseMaps.map(m => {
 const isActive = mapConfig.baseMap === m.id;
 const colors = CATEGORY_COLORS[m.category] || CATEGORY_COLORS.DARK;

 return (
 <button
 key={m.id}
 onClick={() => setBaseMap(m.id)}
 className={`flex flex-col p-2.5 border transition-all relative group ${isActive
 ? `${colors.bg} border-primary/60`
 : `bg-black/40 ${colors.border} hover:border-white/20`
 }`}
 >
 <span className={`text-[6px] font-bold uppercase tracking-widest mb-1 ${isActive ? colors.text : colors.label}`}>
 {m.category}
 </span>
 <span className={`text-[9px] font-bold tracking-wider uppercase ${isActive ? 'text-primary' : 'text-white/60 group-hover:text-white/80'}`}>
 {m.name}
 </span>
 {isActive && (
 <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_#ffb800]" />
 )}
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>

 {/* ═══ SEARCH ═══ */}
 <div className="px-4 py-3 border-b border-white/5">
 <div className="relative">
 <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15"/>
 <input
 type="text"
 placeholder="Search layers..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-black/50 border border-white/5 py-2.5 pl-9 pr-3 text-[10px] text-white font-mono focus:outline-none focus:border-primary/30 placeholder:text-white/15"
 />
 </div>
 </div>

 {/* ═══ OVERLAY CATEGORY TABS ═══ */}
 <div className="px-4 pt-3 pb-2">
 <div className="flex gap-1 flex-wrap">
 {OVERLAY_CATEGORIES.map(cat => {
 const count = cat === 'ALL'
 ? overlayLayers?.length || 0
 : (overlayLayers || []).filter(l => l.category === cat).length;

 return (
 <button
 key={cat}
 onClick={() => setOverlayCategory(cat)}
 className={`px-2 py-1 text-[7px] font-bold tracking-widest transition-all border ${overlayCategory === cat
 ? 'bg-primary/15 border-primary/40 text-primary'
 : 'bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50 hover:border-white/10'
 }`}
 >
 {cat} {cat === 'ALL' && <span className="text-primary/80 ml-0.5">{activeOverlayCount}</span>}
 </button>
 );
 })}
 </div>
 </div>

 {/* ═══ OVERLAY GRID ═══ */}
 <div className="px-4 pb-4">
 <div className="grid grid-cols-2 gap-1.5">
 {filteredOverlays.map(l => {
 const isActive = mapConfig.activeOverlays.includes(l.id);

 return (
 <div
 key={l.id}
 onClick={() => toggleOverlay(l.id)}
 className={`p-3 border flex flex-col gap-2 transition-all cursor-pointer relative group ${isActive
 ? 'bg-primary/5 border-primary/30'
 : 'bg-black/30 border-white/5 hover:bg-white/[0.03] hover:border-white/10'
 }`}
 >
 {/* Active left glow bar */}
 {isActive && <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-primary rounded-full shadow-[0_0_4px_#ffb800]" />}

 <div className="flex justify-between items-start">
 <span className={`text-[8px] font-bold tracking-wider uppercase leading-tight ${isActive ? 'text-primary' : 'text-white/70 group-hover:text-white/90'}`}>
 {l.name}
 </span>
 <Sliders size={10} className={`shrink-0 ml-1 ${isActive ? 'text-primary/40' : 'text-white/10 opacity-0 group-hover:opacity-100'} transition-opacity`} />
 </div>

 <div className="flex items-center gap-2">
 {/* Toggle indicator */}
 <div className={`w-3.5 h-2 border transition-all ${isActive
 ? 'bg-primary border-primary shadow-[0_0_4px_rgba(255,184,0,0.3)]'
 : 'border-white/15 bg-transparent'
 }`} />
 <span className="text-[6px] text-white/20 font-bold uppercase tracking-wider">{l.category}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 );
};

export default LayerSelector;
