import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, MapPin, Phone, Globe, Database, DollarSign, Activity, ChevronRight, Hash, Network, Search, Loader2, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';
import useStore from '../store';
import { TransformWrapper, TransformComponent } from"react-zoom-pan-pinch";
import * as d3 from 'd3-force';

const ICONS = {
 User, Shield, MapPin, Phone, Globe, Database, DollarSign, Activity, ChevronRight, Hash, Network
};

const getTypeIcon = (type) => {
 if (!type) return User;
 const t = type.toUpperCase();
 if (t.includes('PERSON')) return User;
 if (t.includes('ORG') || t.includes('COMPANY')) return Shield;
 if (t.includes('LOC') || t.includes('COUNTRY') || t.includes('CITY')) return MapPin;
 if (t.includes('PHONE')) return Phone;
 if (t.includes('IP') || t.includes('DOMAIN') || t.includes('URL')) return Globe;
 if (t.includes('FINAN') || t.includes('BANK')) return DollarSign;
 return Activity;
};

const truncate = (str, length = 18) => {
 if (!str) return '';
 return str.length > length ? str.substring(0, length) + '...' : str;
};

const LinkAnalysis = () => {
 const activeCountry = useStore(state => state.activeCountry);
 const operations = useStore(state => state.operations || []);
 const activeOperationId = useStore(state => state.activeOperationId);
 const setActiveOperation = useStore(state => state.setActiveOperation);
 const createOperation = useStore(state => state.createOperation);
 const addLinkToOperation = useStore(state => state.addLinkToOperation);

 const [target, setTarget] = useState(() => localStorage.getItem('raven_link_target') || '');
 const [nodes, setNodes] = useState(() => {
 try {
 const saved = localStorage.getItem('raven_link_nodes');
 return saved ? JSON.parse(saved) : [];
 } catch { return []; }
 });
 const [links, setLinks] = useState(() => {
 try {
 const saved = localStorage.getItem('raven_link_links');
 return saved ? JSON.parse(saved) : [];
 } catch { return []; }
 });
 const [loading, setLoading] = useState(false);
 const [expanding, setExpanding] = useState(false);
 const [activeNode, setActiveNode] = useState(null);
 const [hoveredNode, setHoveredNode] = useState(null);
 
 // Link drawing state
 const [isLinking, setIsLinking] = useState(false);
 const [linkSource, setLinkSource] = useState(null);
 const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

 const [tick, setTick] = useState(0);
 const svgRef = useRef(null);
 const simulationRef = useRef(null);
 
 // Sync global operation into local state
 useEffect(() => {
 if (!activeOperationId) return;
 const op = operations?.find(o => o.id === activeOperationId);
 if (!op) return;

 // Merge global nodes into local nodes (preserving D3 x,y if they exist locally)
 setNodes(prev => {
 const existingIds = new Set(prev.map(n => n.id));
 const newNodes = op.nodes.filter(n => !existingIds.has(n.id)).map(globalNode => ({ 
 ...globalNode, 
 x: 2000 + (Math.random() - 0.5) * 200, 
 y: 2000 + (Math.random() - 0.5) * 200 
 }));
 
 const updatedPrev = prev.map(p => {
 const globalN = op.nodes.find(gn => gn.id === p.id);
 return globalN ? { ...globalN, x: p.x, y: p.y, vx: p.vx, vy: p.vy } : p;
 });

 return [...updatedPrev, ...newNodes];
 });

 setLinks(prev => {
 const existingSigs = new Set(prev.map(l => {
 const s = typeof l.source === 'object' ? l.source.id : l.source;
 const t = typeof l.target === 'object' ? l.target.id : l.target;
 return `${s}-${t}`;
 }));
 
 const newLinks = op.links.filter(l => {
 const s = typeof l.source === 'object' ? l.source.id : l.source;
 const t = typeof l.target === 'object' ? l.target.id : l.target;
 return !existingSigs.has(`${s}-${t}`) && !existingSigs.has(`${t}-${s}`);
 });
 
 return [...prev, ...newLinks];
 });
 }, [activeOperationId, operations]);

 // D3 Physics Engine
 useEffect(() => {
 if (nodes.length === 0) return;

 if (!simulationRef.current) {
 simulationRef.current = d3.forceSimulation()
 .force("charge", d3.forceManyBody().strength(-800)) // Strong repulsion
 .force("collide", d3.forceCollide().radius(70)) // Prevent overlaps
 .force("center", d3.forceCenter(2000, 2000));
 
 simulationRef.current.on("tick", () => {
 setTick(t => t + 1); // Trigger re-render
 });
 }

 const sim = simulationRef.current;
 
 const mappedLinks = links.map(l => ({
 ...l,
 source: typeof l.source === 'string' ? nodes.find(n => n.id === l.source) : l.source,
 target: typeof l.target === 'string' ? nodes.find(n => n.id === l.target) : l.target
 })).filter(l => l.source && l.target);

 sim.nodes(nodes);
 sim.force("link", d3.forceLink(mappedLinks).id(d => d.id).distance(200));
 sim.alpha(1).restart();

 return () => sim.stop();
 }, [nodes, links]); // Re-run physics when node or link references change

 useEffect(() => {
 if (activeCountry && activeCountry !== target) {
 setTarget(activeCountry);
 fetchGraphData(activeCountry);
 }
 }, [activeCountry]);

 // Persist state
 useEffect(() => {
 localStorage.setItem('raven_link_target', target);
 }, [target]);

 useEffect(() => {
 if (tick > 0 && tick % 10 !== 0) return; // Throttle saving to every 10 ticks
 const storableNodes = nodes.map(n => ({ 
 id: n.id, label: n.label, type: n.type, color: n.color, 
 icon: n.icon, size: n.size, x: n.x, y: n.y 
 }));
 localStorage.setItem('raven_link_nodes', JSON.stringify(storableNodes));
 }, [nodes, tick]);

 useEffect(() => {
 const storableLinks = links.map(l => ({ 
 source: typeof l.source === 'object' ? l.source.id : l.source, 
 target: typeof l.target === 'object' ? l.target.id : l.target,
 label: l.label
 }));
 localStorage.setItem('raven_link_links', JSON.stringify(storableLinks));
 }, [links]);

 const fetchGraphData = async (query) => {
 setLoading(true);
 try {
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/osint/graph?target=${encodeURIComponent(query)}`);
 const data = await res.json();
 if (data.nodes) {
 // Give them random initial positions near the center, D3 will sort them out
 const mappedNodes = data.nodes.map(n => ({
 ...n,
 x: 2000 + (Math.random() - 0.5) * 100,
 y: 2000 + (Math.random() - 0.5) * 100
 }));
 setNodes(mappedNodes);
 setActiveNode(mappedNodes[0]?.id || null);
 }
 if (data.links) setLinks(data.links);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 const handleSearch = (e) => {
 e.preventDefault();
 if (target.trim()) fetchGraphData(target);
 };



 const handleNodeClick = (id, e) => {
 if (isLinking && linkSource) {
 if (linkSource !== id) {
 const newLink = { source: linkSource, target: id, label: 'MANUAL LINK' };
 setLinks(prev => [...prev, newLink]);
 if (activeOperationId) {
 addLinkToOperation(activeOperationId, newLink);
 }
 }
 setIsLinking(false);
 setLinkSource(null);
 return;
 }
 setActiveNode(id);
 };

 const startLinking = () => {
 if (!activeNode) return;
 setIsLinking(true);
 setLinkSource(activeNode);
 };

 const handleMouseMove = (e) => {
 if (isLinking && svgRef.current) {
 const pt = svgRef.current.createSVGPoint();
 pt.x = e.clientX;
 pt.y = e.clientY;
 const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
 setMousePos({ x: svgP.x, y: svgP.y });
 }
 };

 const handleCreateOperation = (e) => {
 e.preventDefault();
 const name = prompt('ENTER OPERATION CODENAME:');
 if (name) {
 createOperation(name);
 }
 };

 const handleExpandGraph = async () => {
 if (!selectedNode || expanding) return;
 setExpanding(true);
 try {
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/osint/graph?target=${encodeURIComponent(selectedNode.label)}`);
 const data = await res.json();
 
 if (data.nodes && data.links) {
 // filter out TGT-01 and any nodes we already have
 const existingLabels = new Set(nodes.map(n => n.label));
 const newNodes = data.nodes.filter(n => n.id !== 'TGT-01' && !existingLabels.has(n.label));
 
 if (newNodes.length === 0) {
 setExpanding(false);
 return; // Nothing new to add
 }
 
 const idMap = {};
 
 const adjustedNodes = newNodes.map((n, i) => {
 const newId = `EX-${Math.floor(Math.random() * 900) + 100}-${i}`;
 idMap[n.id] = newId;
 
 // Give them an initial position near the parent, D3 will push them apart
 const angle = Math.random() * Math.PI * 2;
 const radius = 20;
 
 return {
 ...n,
 id: newId,
 x: selectedNode.x + radius * Math.cos(angle),
 y: selectedNode.y + radius * Math.sin(angle)
 };
 });
 
 const adjustedLinks = data.links.map(l => {
 const source = l.source === 'TGT-01' ? selectedNode.id : (idMap[l.source] || l.source);
 const target = l.target === 'TGT-01' ? selectedNode.id : (idMap[l.target] || l.target);
 return { ...l, source, target };
 });
 
 setNodes(prev => [...prev, ...adjustedNodes]);
 setLinks(prev => [...prev, ...adjustedLinks]);
 }
 } catch (e) {
 console.error(e);
 } finally {
 setExpanding(false);
 }
 };

 const getConnectedLinks = (nodeId) => {
 return links.filter(l => l.source === nodeId || l.target === nodeId);
 };

 const getConnectedNodes = (nodeId) => {
 const links = getConnectedLinks(nodeId);
 return links.map(l => l.source === nodeId ? l.target : l.source);
 };

 const selectedNode = nodes.find(n => n.id === activeNode);
 const connectedNodes = activeNode ? getConnectedNodes(activeNode) : [];

 return (
 <div className="relative w-full h-full text-white overflow-hidden bg-[#030407] font-mono">
 
 {/* GRAPH AREA */}
 <div className="absolute inset-0 cursor-crosshair overflow-hidden"onMouseMove={handleMouseMove} onClick={() => { if (isLinking && !hoveredNode) { setIsLinking(false); setLinkSource(null); } }}>
 {/* Top Left Controls */}
 <div className="absolute top-4 left-4 z-50 flex flex-col gap-3">
 
 {/* OSINT Search Bar */}
 <form onSubmit={handleSearch} className="flex">
 <input 
 type="text"
 value={target}
 onChange={(e) => setTarget(e.target.value.toUpperCase())}
 placeholder="SEARCH ENTITY GRAPH..."
 className="bg-black/80 border border-white/20 text-white text-[10px] uppercase tracking-widest px-3 py-2 w-48 md:w-64 outline-none focus:border-primary transition-all"
 />
 <button type="submit"className="bg-primary/20 hover:bg-primary/40 border-y border-r border-white/20 text-primary px-3 flex items-center justify-center transition-all">
 {loading ? <Loader2 size={14} className="animate-spin"/> : <Search size={14} />}
 </button>
 </form>

 {/* Operations Toolbar Overlay */}
 <div className="flex flex-col gap-2 bg-black/80 p-3 border border-white/10 backdrop-blur-md w-fit">
 <div className="flex items-center gap-3">
 <Shield size={16} className="text-primary"/>
 <span className="text-[10px] font-bold tracking-widest text-white uppercase">ACTIVE OPERATION</span>
 </div>
 <div className="flex gap-2">
 <select 
 value={activeOperationId || ''} 
 onChange={(e) => setActiveOperation(e.target.value)}
 className="bg-black/60 border border-primary/50 text-white text-[10px] uppercase tracking-widest px-3 py-2 w-48 md:w-64 outline-none focus:border-primary transition-all"
 >
 <option value="" disabled>-- SELECT OP --</option>
 {(operations || []).map(op => (
 <option key={op.id} value={op.id}>{op.name} ({op.nodes?.length || 0} NODES)</option>
 ))}
 </select>
 <button onClick={handleCreateOperation} className="bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary px-3 py-2 text-[10px] font-bold tracking-widest transition-all">
 + NEW OP
 </button>
 </div>
 </div>
 </div>

 <TransformWrapper
 initialScale={1}
 minScale={0.1}
 maxScale={5}
 centerOnInit={true}
 limitToBounds={true}
 wheel={{ step: 0.00005 }}
 panning={{ velocityDisabled: true }}
 alignmentAnimation={{ animationTime: 0 }}
 >
 {({ zoomIn, zoomOut, resetTransform }) => (
 <>
 {/* Controls Overlay */}
 <div className="absolute bottom-16 lg:bottom-4 right-4 lg:right-auto lg:left-4 z-50 flex flex-col lg:flex-row gap-2">
 <button onClick={() => zoomIn()} className="w-8 h-8 flex items-center justify-center bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 backdrop-blur-sm"><ZoomIn size={14}/></button>
 <button onClick={() => zoomOut()} className="w-8 h-8 flex items-center justify-center bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 backdrop-blur-sm"><ZoomOut size={14}/></button>
 <button onClick={() => resetTransform()} className="w-8 h-8 flex items-center justify-center bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 backdrop-blur-sm"><Maximize size={14}/></button>
 </div>
 
 <TransformComponent wrapperClass="!w-full !h-full"contentClass="w-[4000px] h-[4000px]">
 <div className="relative w-[4000px] h-[4000px]">
 {/* Background Grid */}
 <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
 style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

 {/* SVG Lines */}
 <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none">
 {links.map((link, i) => {
 const s = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
 const t = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);
 if (!s || !t || s.x === undefined || t.x === undefined) return null;
 const isHighlighted = activeNode === s.id || activeNode === t.id || hoveredNode === s.id || hoveredNode === t.id;
 const isDimmed = activeNode && !isHighlighted;
 
 return (
 <g key={i}>
 <line
 x1={`${s.x}px`} y1={`${s.y}px`}
 x2={`${t.x}px`} y2={`${t.y}px`}
 stroke={isHighlighted ? s.color : 'rgba(255, 255, 255, 0.3)'}
 strokeWidth={isHighlighted ? 2 : 1.5}
 strokeDasharray={link.label === 'Spotted (48h ago)' || link.label === 'Mentioned' ? '4,4' : 'none'}
 opacity={isDimmed ? 0.4 : 1}
 />
 {/* Data Packets Animation */}
 {isHighlighted && (
 <circle r="3"fill="#00f2ff"opacity="0.8">
 <animateMotion dur="2s"repeatCount="indefinite"path={`M ${s.x} ${s.y} L ${t.x} ${t.y}`} />
 </circle>
 )}
 </g>
 );
 })}

 {/* Manual Link Drawing */}
 {isLinking && linkSource && (() => {
 const sNode = nodes.find(n => n.id === linkSource);
 if (!sNode) return null;
 return (
 <line x1={sNode.x} y1={sNode.y} x2={mousePos.x} y2={mousePos.y} stroke="#ef4444"strokeWidth="2"strokeDasharray="5,5"/>
 );
 })()}
 </svg>

 {/* Nodes */}
 {nodes.map(node => {
 const isSelected = activeNode === node.id;
 const isConnected = connectedNodes.includes(node.id);
 const isDimmed = activeNode && !isSelected && !isConnected;
 const Icon = typeof node.icon === 'string' ? (ICONS[node.icon] || getTypeIcon(node.type)) : (node.icon || getTypeIcon(node.type));
 const nodeSize = node.size || 1;

 return (
 <div
 key={node.id}
 className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 ${isSelected ? 'z-20 scale-125' : 'z-10'} ${isDimmed ? 'opacity-60' : 'opacity-100 hover:scale-110'} transition-transform duration-200`}
 style={{ left: `${node.x}px`, top: `${node.y}px` }}
 onMouseEnter={() => setHoveredNode(node.id)}
 onMouseLeave={() => setHoveredNode(null)}
 onClick={() => handleNodeClick(node.id)}
 onDoubleClick={() => handleExpandGraph()}
 >
 {/* Node Hexagon/Circle */}
 <div 
 className={`flex items-center justify-center cursor-pointer border ${isSelected ? 'animate-pulse box-glow' : ''} hover:scale-110 transition-transform`}
 style={{ 
 width: `${32 * nodeSize}px`, 
 height: `${32 * nodeSize}px`,
 backgroundColor: 'rgba(0,0,0,0.8)',
 borderColor: node.color,
 boxShadow: isSelected ? `0 0 20px ${node.color}40, inset 0 0 10px ${node.color}40` : 'none'
 }}
 >
 <Icon size={16 * nodeSize} color={node.color} className={isSelected ? 'text-glow' : ''} />
 </div>
 
 {/* Node Label */}
 <div className="mt-1 text-center pointer-events-none flex flex-col items-center">
 <div 
 className={`font-bold tracking-widest whitespace-nowrap transition-all ${isSelected || hoveredNode === node.id ? 'text-[10px] z-30' : 'text-[8px] opacity-70'}`}
 style={{ 
 color: node.color, 
 textShadow: `0 0 4px ${node.color}, 0 0 8px #000, 0 0 12px #000` 
 }}
 >
 {isSelected || hoveredNode === node.id ? node.label : truncate(node.label, 12)}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </TransformComponent>
 </>
 )}
 </TransformWrapper>
 </div>

 {/* RIGHT PANEL - ENTITY DETAILS (FLOATING) */}
 <div className={`absolute bottom-0 lg:bottom-auto lg:top-0 lg:right-0 w-full lg:w-80 bg-black/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col z-50 transition-all duration-300 ${selectedNode ? 'h-[40vh] lg:h-full' : 'h-10 lg:h-full'}`}>
 <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <Network size={14} className="text-primary"/>
 <span className="text-[10px] font-bold text-primary tracking-widest uppercase">ENTITY INTEL</span>
 </div>
 {selectedNode && (
 <button onClick={() => setActiveNode(null)} className="lg:hidden w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
 <X size={12} />
 </button>
 )}
 </div>

 {selectedNode ? (
 <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 border flex items-center justify-center bg-black"style={{ borderColor: selectedNode.color, boxShadow: `0 0 15px ${selectedNode.color}30` }}>
 {React.createElement(typeof selectedNode.icon === 'string' ? ICONS[selectedNode.icon] || User : selectedNode.icon || User, { size: 20, color: selectedNode.color })}
 </div>
 <div>
 <div className="text-[9px] text-white/50 tracking-widest uppercase">{selectedNode.type}</div>
 <div className="text-[12px] font-bold tracking-wider"style={{ color: selectedNode.color }}>{selectedNode.label}</div>
 <div className="text-[8px] text-white/30 font-mono">{selectedNode.id}</div>
 </div>
 </div>

 {selectedNode.img && (
 <img src={selectedNode.img} alt="target"className="w-full h-32 object-cover border border-white/20"/>
 )}
 
 {selectedNode.desc && (
 <div className="p-3 bg-white/5 border border-white/10 text-[10px] text-white/80 leading-relaxed font-mono">
 <div className="text-[8px] text-primary mb-1 uppercase tracking-widest">// INTELLIGENCE FILE</div>
 {selectedNode.desc}
 </div>
 )}

 <div className="space-y-1">
 <div className="text-[8px] text-white/40 tracking-widest uppercase mb-2">Metadata</div>
 <div className="flex justify-between border-b border-white/5 pb-1">
 <span className="text-[9px] text-white/50">STATUS</span>
 <span className="text-[9px] text-red-400 font-bold">ACTIVE_MONITORING</span>
 </div>
 <div className="flex justify-between border-b border-white/5 pb-1">
 <span className="text-[9px] text-white/50">CONFIDENCE</span>
 <span className="text-[9px] text-green-400 font-bold">94.2%</span>
 </div>
 <div className="flex justify-between border-b border-white/5 pb-1">
 <span className="text-[9px] text-white/50">LAST_SEEN</span>
 <span className="text-[9px] text-white">48 HOURS AGO</span>
 </div>
 </div>

 <div>
 <div className="text-[8px] text-white/40 tracking-widest uppercase mb-2">Connected Edges ({getConnectedLinks(selectedNode.id).length})</div>
 <div className="space-y-2">
 {getConnectedLinks(selectedNode.id).map((link, i) => {
 const targetId = link.source === selectedNode.id ? link.target : link.source;
 const targetNode = nodes.find(n => n.id === targetId);
 if (!targetNode) return null;
 return (
 <div key={i} className="flex flex-col p-2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors"onClick={() => handleNodeClick(targetId)}>
 <div className="flex items-center gap-2 mb-1">
 <ChevronRight size={10} className="text-primary"/>
 <span className="text-[9px] text-white/70 font-bold uppercase">{link.label}</span>
 </div>
 <div className="flex items-center gap-2 pl-4">
 {React.createElement(typeof targetNode.icon === 'string' ? ICONS[targetNode.icon] || User : targetNode.icon || User, { size: 10, color: targetNode.color })}
 <span className="text-[10px]" style={{ color: targetNode.color }}>{targetNode.label}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="flex gap-2 mt-4">
 <button 
 onClick={startLinking}
 className="flex-1 py-2 border border-green-500/30 text-green-400 flex justify-center items-center gap-2 text-[9px] font-bold tracking-widest uppercase hover:bg-green-500/10 transition-colors"
 >
 <Network size={12} />
 CONNECT NODE
 </button>
 <button 
 onClick={handleExpandGraph}
 disabled={expanding}
 className="flex-1 py-2 border border-primary/30 text-primary flex justify-center items-center gap-2 text-[9px] font-bold tracking-widest uppercase hover:bg-primary/10 transition-colors disabled:opacity-50"
 >
 {expanding ? <Loader2 size={12} className="animate-spin"/> : <Database size={12} />}
 EXPAND
 </button>
 </div>
 </div>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center p-4 text-center opacity-50">
 <Network size={24} className="mb-2 text-white/20"/>
 <div className="text-[9px] tracking-widest uppercase text-white/40">SELECT ENTITY NODE TO VIEW LINK ANALYSIS</div>
 </div>
 )}
 </div>
 </div>
 );
};

export default LinkAnalysis;
