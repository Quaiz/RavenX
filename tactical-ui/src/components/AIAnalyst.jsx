import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Zap, Shield, AlertTriangle, Loader2, Trash2, ChevronDown } from 'lucide-react';
import useStore from '../store';
import {
 GPS_INTERFERENCE, DISPLACEMENT_EVENTS, LIVE_VESSELS,
 INTERNET_OUTAGES, MILITARY_BASES, NUCLEAR_FACILITIES,
} from '../tactical_data';
import { streamAiResponse } from '../aiManager';

// ─── System Prompt ─────────────────────────────────────────────────────────────

const buildSystemPrompt = (dashboardContext) => `You are RAVEN — an elite AI Intelligence Analyst embedded within the RavenX Global Tactical Dashboard. You are a senior intelligence officer with deep expertise in:

- Geopolitical analysis and threat assessment
- Military operations and force disposition
- OSINT (Open Source Intelligence) analysis
- Maritime security and chokepoint analysis
- Nuclear proliferation monitoring
- Cyber warfare and electronic warfare
- Economic intelligence and sanctions analysis
- Humanitarian crisis assessment
- Weather/environmental impact on operations

YOUR OPERATING PARAMETERS:
- You speak with authority, precision, and deep analytical depth, using military/intelligence terminology
- You provide highly detailed, structured analysis with THREAT LEVELS (CRITICAL/HIGH/MEDIUM/LOW)
- You dive deep into geopolitical contexts, historical precedence, and strategic implications
- You give actionable, multi-faceted intelligence assessments and probability matrices
- When asked, you generate comprehensive, multi-paragraph intelligence briefings
- You reference real-world geopolitical events and dynamics extensively
- Provide thorough, exhaustive analysis — do NOT be overly concise. Explain the"Why"and"How"
- Use markdown formatting: **bold** for emphasis, bullet points for structured breakdowns
- When giving threat assessments, use structured format with categories

DASHBOARD CONTEXT (LIVE TELEMETRY):
${dashboardContext}

QUICK COMMANDS YOU SUPPORT:
- /briefing — Generate a daily intelligence briefing
- /threats — List current global threat hotspots
- /status [region] — Strategic assessment of a specific region
- /compare [A] vs [B] — Compare two nations/regions
- /maritime — Maritime security overview
- /nuclear — Nuclear threat assessment
- /cyber — Cyber threat landscape
- /forecast — 7-day geopolitical forecast

Remember: You ARE the intelligence system. You don't"look up"data — you HAVE it. Respond as if you are briefing a field commander.`;

// ─── Context Builder ───────────────────────────────────────────────────────────

const buildDashboardContext = (state) => {
 const { mapConfig, feeds, weatherData, activeCountry } = state;
 const lines = [];

 lines.push(`TIMESTAMP: ${new Date().toISOString()}`);
 lines.push(`ACTIVE MAP OVERLAYS: ${mapConfig.activeOverlays.join(', ') || 'NONE'}`);
 lines.push(`FOCUSED COUNTRY: ${activeCountry || 'GLOBAL'}`);
 lines.push(`BASE MAP: ${mapConfig.baseMap}`);

 // Weather
 if (weatherData) {
 lines.push(`\nWEATHER (${weatherData.city}): ${weatherData.temp}°C, Wind ${weatherData.wind}km/h, Humidity ${weatherData.humidity}%, AQI ${weatherData.aqi}`);
 }

 // Markets
 if (feeds.markets) {
 lines.push(`\nMARKET DATA: BTC $${feeds.markets.btc?.toFixed(0)}, Gold $${feeds.markets.gold?.toFixed(0)}, Oil $${feeds.markets.oil?.toFixed(1)}`);
 }

 // OSINT Events
 if (feeds.gdelt?.length > 0) {
 const highSev = feeds.gdelt.filter(e => e.severity === 'HIGH');
 lines.push(`\nOSINT EVENTS: ${feeds.gdelt.length} total, ${highSev.length} HIGH SEVERITY`);
 highSev.slice(0, 8).forEach(e => {
 lines.push(` - [${e.severity}] ${e.title} (${e.source})`);
 });
 }

 // GPS Interference
 lines.push(`\nGPS INTERFERENCE ZONES: ${GPS_INTERFERENCE.length} active`);
 GPS_INTERFERENCE.forEach(g => lines.push(` - [${g.severity}] ${g.desc}`));

 // Displacement
 lines.push(`\nDISPLACEMENT EVENTS:`);
 DISPLACEMENT_EVENTS.forEach(d => lines.push(` - ${d.desc}: ${d.people} displaced (${d.type})`));

 // Internet Outages
 lines.push(`\nINTERNET OUTAGES:`);
 INTERNET_OUTAGES.forEach(o => lines.push(` - [${o.status}] ${o.target}`));

 // Military Vessels
 lines.push(`\nLIVE NAVAL VESSELS: ${LIVE_VESSELS.length} tracked`);
 LIVE_VESSELS.filter(v => v.type === 'MILITARY').forEach(v => {
 lines.push(` - ${v.name} (${v.type}) at ${v.lat}°N, ${v.lon}°E, Speed: ${v.speed}kts, Heading: ${v.heading}°`);
 });

 // Nuclear Facilities
 if (NUCLEAR_FACILITIES?.length > 0) {
 lines.push(`\nNUCLEAR FACILITIES: ${NUCLEAR_FACILITIES.length} monitored`);
 }

 // Military Bases
 if (MILITARY_BASES?.length > 0) {
 lines.push(`\nMILITARY INSTALLATIONS: ${MILITARY_BASES.length} in registry`);
 }

 // Aircraft
 if (feeds.aircraft?.length > 0) {
 lines.push(`\nAIRCRAFT TRACKED: ${feeds.aircraft.length}`);
 const military = feeds.aircraft.filter(a => a.squawk === '7700' || a.squawk === '7500' || a.squawk === '7600');
 if (military.length > 0) {
 lines.push(` ⚠ EMERGENCY SQUAWKS DETECTED: ${military.length}`);
 }
 }

 return lines.join('\n');
};

// ─── Markdown-lite renderer ────────────────────────────────────────────────────

const renderMarkdown = (text) => {
 if (!text) return null;
 const lines = text.split('\n');
 const elements = [];

 lines.forEach((line, idx) => {
 let content = line;

 // Headers
 if (content.startsWith('### ')) {
 elements.push(<div key={idx} className="text-[10px] font-bold text-primary/80 tracking-widest uppercase mt-3 mb-1">{content.slice(4)}</div>);
 return;
 }
 if (content.startsWith('## ')) {
 elements.push(<div key={idx} className="text-[11px] font-bold text-white/90 tracking-wider uppercase mt-3 mb-1 border-b border-white/10 pb-1">{content.slice(3)}</div>);
 return;
 }
 if (content.startsWith('# ')) {
 elements.push(<div key={idx} className="text-xs font-bold text-primary tracking-[0.2em] uppercase mt-2 mb-2">{content.slice(2)}</div>);
 return;
 }

 // Horizontal rule
 if (content.trim() === '---' || content.trim() === '***') {
 elements.push(<div key={idx} className="border-t border-white/10 my-2"/>);
 return;
 }

 // Bold and inline code
 content = content.replace(/\*\*(.+?)\*\*/g, '<b class="text-white/90 font-bold">$1</b>');
 content = content.replace(/`(.+?)`/g, '<code class="text-primary/80 bg-white/5 px-1 text-[9px]">$1</code>');

 // Bullet points
 if (content.trim().startsWith('- ') || content.trim().startsWith('* ')) {
 const indent = content.match(/^\s*/)[0].length;
 const text = content.replace(/^\s*[-*]\s/, '');
 elements.push(
 <div key={idx} className="flex gap-1.5 text-white/60 text-[10px] leading-relaxed"style={{ paddingLeft: `${indent * 4 + 8}px` }}>
 <span className="text-primary/50 shrink-0 mt-0.5">▸</span>
 <span dangerouslySetInnerHTML={{ __html: text }} />
 </div>
 );
 return;
 }

 // Numbered list
 const numMatch = content.match(/^\s*(\d+)\.\s(.+)/);
 if (numMatch) {
 elements.push(
 <div key={idx} className="flex gap-2 text-white/60 text-[10px] leading-relaxed pl-2">
 <span className="text-primary/60 shrink-0 font-bold">{numMatch[1]}.</span>
 <span dangerouslySetInnerHTML={{ __html: numMatch[2].replace(/\*\*(.+?)\*\*/g, '<b class="text-white/90">$1</b>') }} />
 </div>
 );
 return;
 }

 // Empty line
 if (content.trim() === '') {
 elements.push(<div key={idx} className="h-1.5"/>);
 return;
 }

 // Normal paragraph
 elements.push(
 <div key={idx} className="text-white/60 text-[10px] leading-relaxed"dangerouslySetInnerHTML={{ __html: content }} />
 );
 });

 return <>{elements}</>;
};

// ─── Quick Commands ────────────────────────────────────────────────────────────

const QUICK_CMDS = [
 { cmd: '/briefing', label: 'DAILY BRIEFING', icon: Shield },
 { cmd: '/threats', label: 'THREAT MAP', icon: AlertTriangle },
 { cmd: '/maritime', label: 'MARITIME', icon: Zap },
 { cmd: '/forecast', label: 'FORECAST', icon: Bot },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const AIAnalyst = () => {
 const [messages, setMessages] = useState(() => {
 const saved = localStorage.getItem('raven_ai_history');
 if (saved) {
 try { return JSON.parse(saved); } catch (e) {}
 }
 return [];
 });
 const [input, setInput] = useState('');
 const [isStreaming, setIsStreaming] = useState(false);
 const [streamingText, setStreamingText] = useState('');
 const chatEndRef = useRef(null);
 const inputRef = useRef(null);
 const abortRef = useRef(null);

 // Zustand store access
 const mapConfig = useStore(s => s.mapConfig);
 const feeds = useStore(s => s.feeds);
 const weatherData = useStore(s => s.weatherData);
 const activeCountry = useStore(s => s.activeCountry);

 const chatContainerRef = useRef(null);

 // Auto-scroll
 useEffect(() => {
 if (chatContainerRef.current) {
 chatContainerRef.current.scrollTo({
 top: chatContainerRef.current.scrollHeight,
 behavior: 'smooth'
 });
 }
 }, [messages, streamingText]);

 // Persist history
 useEffect(() => {
 localStorage.setItem('raven_ai_history', JSON.stringify(messages));
 }, [messages]);

 // Focus input
 useEffect(() => {
 inputRef.current?.focus();
 }, []);

 const sendMessage = useCallback(async (text) => {
 if (!text.trim() || isStreaming) return;
 const userMsg = { role: 'user', content: text.trim() };
 const newMessages = [...messages, userMsg];
 setMessages(newMessages);
 setInput('');
 setIsStreaming(true);
 setStreamingText('');

 // Build context
 const ctx = buildDashboardContext({ mapConfig, feeds, weatherData, activeCountry });
 const systemPrompt = buildSystemPrompt(ctx);

 // Build Gemini request
 const contents = [
 ...newMessages.map(m => ({
 role: m.role === 'user' ? 'user' : 'model',
 parts: [{ text: m.content }]
 }))
 ];

 try {
 abortRef.current = new AbortController();
 let fullText = '';
 
 await streamAiResponse(contents, {
 config: {
 temperature: 0.6,
 maxOutputTokens: 4096,
 token: JSON.parse(localStorage.getItem('ravenx_session') || '{}')?.token
 },
 systemInstruction: { parts: [{ text: systemPrompt }] }, 
 signal: abortRef.current.signal,
 onChunk: (textChunk) => {
 fullText += textChunk;
 setStreamingText(fullText);
 },
 onComplete: () => {
 setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
 setStreamingText('');
 setIsStreaming(false);
 },
 onError: (err) => {
 if (err.name !== 'AbortError') {
 console.error("[AI Analyst Error]", err);
 const errMsg = { role: 'assistant', content: `**CRITICAL ERROR:** Neural network link severed or global rate limits exceeded. \n\n*Error details: ${err.message}*` };
 setMessages(prev => [...prev, errMsg]);
 }
 setStreamingText('');
 setIsStreaming(false);
 }
 });
 } catch (err) {
 if (err.name === 'AbortError') {
 setMessages(prev => [...prev, { role: 'assistant', content: streamingText || '⚠ Analysis interrupted by operator.' }]);
 } else {
 console.error('Gemini API error:', err);
 setMessages(prev => [...prev, { role: 'assistant', content: `⚠ COMMS FAILURE: ${err.message}` }]);
 }
 setStreamingText('');
 setIsStreaming(false);
 } finally {
 abortRef.current = null;
 }
 }, [messages, isStreaming, mapConfig, feeds, weatherData, activeCountry]);

 const handleKeyDown = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 sendMessage(input);
 }
 };

 const clearChat = () => {
 if (isStreaming) {
 abortRef.current?.abort();
 }
 setMessages([]);
 setStreamingText('');
 setIsStreaming(false);
 };

 return (
 <div className="h-full flex flex-col bg-[#05070a] overflow-hidden">

 {/* ── Header Status Bar ── */}
 <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
 <div className="flex items-center gap-2">
 <div className="w-5 h-5 border border-primary/30 bg-primary/5 flex items-center justify-center">
 <Bot size={11} className="text-primary"/>
 </div>
 <div className="flex flex-col leading-none">
 <span className="text-[9px] font-bold tracking-[0.2em] text-white/70 uppercase">RAVENGUARD</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1">
 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse"/>
 <span className="text-[7px] text-green-500/70 font-bold tracking-widest">LINKED</span>
 </div>
 <button onClick={clearChat} className="p-1 text-white/20 hover:text-red-400 transition-colors"title="Clear conversation">
 <Trash2 size={10} />
 </button>
 </div>
 </div>

 {/* ── Chat Messages ── */}
 <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-3">

 {/* Welcome message */}
 {messages.length === 0 && !isStreaming && (
 <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
 <div className="w-12 h-12 border border-primary/20 bg-primary/5 flex items-center justify-center">
 <Shield size={20} className="text-primary/40"/>
 </div>
 <div className="text-center space-y-2">
 <div className="text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">RAVEN INTELLIGENCE SYSTEM</div>
 <div className="text-[8px] text-white/25 max-w-[220px] leading-relaxed uppercase tracking-wider">
 AI analyst with access to all dashboard telemetry. Ask about threats, regions, or request a briefing.
 </div>
 </div>

 {/* Quick Commands */}
 <div className="grid grid-cols-2 gap-1.5 mt-2 w-full max-w-[260px]">
 {QUICK_CMDS.map(({ cmd, label, icon: Icon }) => (
 <button
 key={cmd}
 onClick={() => sendMessage(cmd)}
 className="flex items-center gap-2 px-2.5 py-2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/20 transition-all text-left group"
 >
 <Icon size={10} className="text-primary/40 group-hover:text-primary/70 shrink-0"/>
 <div className="flex flex-col leading-none">
 <span className="text-[8px] font-bold text-white/50 tracking-wider group-hover:text-white/70">{label}</span>
 <span className="text-[7px] text-white/20 font-mono">{cmd}</span>
 </div>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Message Bubbles */}
 {messages.map((msg, i) => (
 <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 {msg.role === 'assistant' && (
 <div className="w-5 h-5 border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
 <Bot size={10} className="text-primary/60"/>
 </div>
 )}
 <div className={`max-w-[90%] ${msg.role === 'user'
 ? 'bg-primary/10 border border-primary/20 px-3 py-2'
 : 'bg-white/[0.02] border border-white/5 px-3 py-2'
 }`}>
 {msg.role === 'user' ? (
 <div className="text-[10px] text-white/80 leading-relaxed font-mono">{msg.content}</div>
 ) : (
 <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
 )}
 </div>
 {msg.role === 'user' && (
 <div className="w-5 h-5 border border-white/10 bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
 <User size={10} className="text-white/40"/>
 </div>
 )}
 </div>
 ))}

 {/* Streaming Response */}
 {isStreaming && (
 <div className="flex gap-2">
 <div className="w-5 h-5 border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
 <Bot size={10} className="text-primary/60 animate-pulse"/>
 </div>
 <div className="max-w-[90%] bg-white/[0.02] border border-white/5 px-3 py-2">
 {streamingText ? (
 <div className="space-y-0.5">
 {renderMarkdown(streamingText)}
 <span className="inline-block w-1.5 h-3 bg-primary/60 animate-pulse ml-0.5"/>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <Loader2 size={10} className="text-primary/50 animate-spin"/>
 <span className="text-[8px] text-white/30 tracking-widest uppercase animate-pulse">ANALYZING TELEMETRY...</span>
 </div>
 )}
 </div>
 </div>
 )}

 <div ref={chatEndRef} />
 </div>

 {/* ── Input Area ── */}
 <div className="px-3 py-2 border-t border-white/5 bg-white/[0.01] shrink-0">
 <div className="flex items-center gap-2">
 <div className="flex-1 relative">
 <input
 ref={inputRef}
 value={input}
 onChange={e => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Ask RAVEN... (or use /briefing, /threats)"
 disabled={isStreaming}
 className="w-full bg-white/[0.03] border border-white/10 px-3 py-2 text-[10px] text-white/80 font-mono placeholder:text-white/15 focus:outline-none focus:border-primary/30 transition-colors disabled:opacity-40"
 />
 </div>
 <button
 onClick={() => sendMessage(input)}
 disabled={!input.trim() || isStreaming}
 className="p-2 border border-white/10 bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
 >
 {isStreaming ? <Loader2 size={12} className="animate-spin"/> : <Send size={12} />}
 </button>
 </div>
 <div className="flex items-center justify-end mt-1.5">
 <span className="text-[7px] text-white/15 tracking-widest uppercase">{messages.length} MSG</span>
 </div>
 </div>
 </div>
 );
};

export default AIAnalyst;
