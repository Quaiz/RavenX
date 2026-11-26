import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronRight } from 'lucide-react';
import useStore from '../store';
import { audio } from '../utils/audioEngine';
import { streamAiResponse } from '../aiManager';

const COMMANDS = ['target', 'clear', 'ping', 'help', 'exit', 'close', 'scan', 'logs', 'trace', 'sat'];

const CommandPalette = () => {
  const isOpen = useStore(s => s.isCommandPaletteOpen);
  const setIsOpen = useStore(s => s.setCommandPaletteOpen);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  
  // History state
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const setActiveCountry = useStore(s => s.setActiveCountry);
  const setMapTarget = useStore(s => s.setMapTarget);
  const setBaseMap = useStore(s => s.setBaseMap);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const pushOutput = (cmdText, resText) => {
    setOutput(prev => {
      const newOut = [...prev];
      if (cmdText) newOut.push({ type: 'cmd', text: cmdText });
      if (resText) newOut.push({ type: 'res', text: resText });
      return newOut;
    });
    setTimeout(() => {
      const el = document.getElementById('cmd-output-container');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  const executeCommand = async (cmd) => {
    if (!cmd.trim()) return;
    
    // Add to history
    setHistory(prev => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const args = cmd.trim().toLowerCase().split(' ');
    const action = args[0];
    const target = args.slice(1).join(' ');

    let response = '';

    switch (action) {
      case 'target':
        if (!target) {
          response = 'ERROR: target name required. Usage: target [country]';
        } else {
          setActiveCountry(target.toUpperCase());
          response = `Target locked on: ${target.toUpperCase()}. Re-routing map...`;
          setTimeout(() => setIsOpen(false), 1000);
        }
        pushOutput(`> ${cmd}`, response);
        break;

      case 'clear':
        setActiveCountry(null);
        response = 'Target cleared. Returning to global view.';
        pushOutput(`> ${cmd}`, response);
        break;

      case 'ping':
        response = 'PONG. Connection to central server is stable (Latency: 14ms)';
        pushOutput(`> ${cmd}`, response);
        break;

      case 'trace':
        if (!target) {
          pushOutput(`> ${cmd}`, 'ERROR: target required. Usage: trace [ip/domain]');
        } else {
          pushOutput(`> ${cmd}`, `Tracing network route to ${target}...`);
          try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/trace?q=${encodeURIComponent(target)}`);
            const data = await res.json();
            if (data.status === 'success') {
              pushOutput(null, `[TRACE COMPLETE]\nIP: ${data.query}\nLOC: ${data.lat}, ${data.lon}\nORG: ${data.isp} / ${data.org}\nGEO: ${data.city}, ${data.regionName}, ${data.country}`);
            } else {
              pushOutput(null, `ERROR: Trace failed. Target unreachable or invalid.`);
            }
          } catch (e) {
            pushOutput(null, 'ERROR: Connection to backend trace API failed.');
          }
        }
        break;

      case 'sat':
        if (!target) {
          pushOutput(`> ${cmd}`, 'ERROR: coordinates/city required. Usage: sat [query]');
        } else {
          pushOutput(`> ${cmd}`, `Acquiring satellite lock on: ${target.toUpperCase()}...`);
          try {
            // Check if coordinates were passed (e.g., 21.0, 105.8)
            const coordsMatch = target.match(/([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)/);
            if (coordsMatch) {
              const lat = parseFloat(coordsMatch[1]);
              const lon = parseFloat(coordsMatch[2]);
              setBaseMap('RECON');
              setMapTarget({ lat, lng: lon, zoom: 16 });
              pushOutput(null, `[SAT LOCK ACQUIRED]: ${lat}, ${lon}`);
              setTimeout(() => setIsOpen(false), 1500);
            } else {
              // Search Nominatim
              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(target)}`);
              const data = await res.json();
              if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setBaseMap('RECON');
                setMapTarget({ lat, lng: lon, zoom: 16 });
                pushOutput(null, `[SAT LOCK ACQUIRED]: ${data[0].display_name}`);
                setTimeout(() => setIsOpen(false), 1500);
              } else {
                pushOutput(null, `ERROR: Target coordinates not found in geodatabase.`);
              }
            }
          } catch (e) {
            pushOutput(null, 'ERROR: Satellite uplink failed.');
          }
        }
        break;

      case 'scan':
        if (!target) {
          pushOutput(`> ${cmd}`, 'ERROR: target required. Usage: scan [country]');
        } else {
          pushOutput(`> ${cmd}`, `Scanning tactical intel for ${target.toUpperCase()}...`);
          let aiText = '';
          streamAiResponse(
            [{ role: 'user', parts: [{ text: `Provide a highly concise, 2-sentence military and economic strategic summary of ${target}. Use a tactical, intelligence briefing tone.` }] }],
            {
              config: { temperature: 0.2, maxOutputTokens: 150 },
              onChunk: (chunk) => { aiText += chunk; },
              onComplete: () => { pushOutput(null, `[AI INTEL]: ${aiText}`); },
              onError: () => { pushOutput(null, 'ERROR: Connection to AI subsystem failed.'); }
            }
          );
        }
        break;

      case 'logs':
        pushOutput(`> ${cmd}`, 'Fetching system telemetry logs...');
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logs`);
          const data = await res.json();
          if (res.ok) {
            pushOutput(null, `[SYSTEM TELEMETRY]\nOS: ${data.os}\nPython: ${data.python_version}\nUptime: ${data.uptime}\nActive Threads: ${data.active_threads}\nMemory Usage: ${data.memory_usage_mb} MB`);
          } else {
            pushOutput(null, 'ERROR: Could not fetch telemetry.');
          }
        } catch (e) {
          pushOutput(null, 'ERROR: Connection to log server failed.');
        }
        break;

      case 'help':
        response = 'COMMANDS: target [country] | clear | ping | scan [country] | logs | trace [ip/domain] | sat [query] | exit';
        pushOutput(`> ${cmd}`, response);
        break;

      case 'exit':
      case 'close':
        setIsOpen(false);
        break;

      default:
        response = `Command not recognized: ${action}. Type 'help' for available commands.`;
        pushOutput(`> ${cmd}`, response);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInput(history[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = input.toLowerCase();
      const match = COMMANDS.find(c => c.startsWith(current));
      if (match) {
        setInput(match + ' ');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/70 flex flex-col justify-end sm:justify-start sm:pt-[15vh] p-2 sm:p-0" style={{ height: '100dvh' }}>
      <div className="w-full sm:max-w-2xl sm:mx-auto bg-[#060d08]/95 border border-[#4bd865]/50 shadow-[0_18px_48px_rgba(0,0,0,0.92)] font-mono text-[#eef6ee] flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-top-4 duration-200">
        {/* Watcher-02 Green Header */}
        <div
          className="flex items-center justify-between h-8 border-b border-black shrink-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(42,96,48,0.9) 0%, rgba(24,56,29,0.92) 48%, rgba(10,20,12,0.96) 100%)',
          }}
        >
          <div className="flex items-center h-full">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-full bg-[#261111] hover:bg-[#e05252] text-[#ff6b6b] hover:text-[#090c09] border-r border-black/80 font-mono text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer"
              title="Close Command Link"
            >
              X
            </button>
            <div className="flex items-center gap-2 px-3">
              <Terminal size={13} className="text-[#39e75f]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#eef6ee]">
                // TACTICAL COMMAND LINK
              </span>
            </div>
          </div>
          <div className="flex items-center h-full">
            <div className="h-5 px-2 bg-[#071109] border border-[#39e75f]/40 text-[#39e75f] font-mono text-[8px] font-bold tracking-widest flex items-center justify-center">
              ON.SE1
            </div>
            <div className="w-1.5 h-full bg-[#39e75f] ml-1.5 border-l border-black/80" />
          </div>
        </div>

        {/* Output Area */}
        <div id="cmd-output-container" className="p-4 flex-1 sm:flex-none sm:max-h-[40vh] overflow-y-auto custom-scrollbar space-y-2 text-[11px] sm:text-xs bg-[#050b07]/90">
          <div className="text-[#a3cca7]/65 mb-4 tracking-wide">
            WATCHER PROGRAM // TACTICAL COMMAND LINK v2.4<br/>
            Type 'help' for available operational directives.
          </div>
          {output.map((line, i) => (
            <div key={i} className={line.type === 'cmd' ? 'text-[#eef6ee] font-bold' : 'text-[#39e75f] mb-2 whitespace-pre-wrap'}>
              {line.text}
            </div>
          ))}
        </div>

        {/* Mobile Quick Chips */}
        <div className="sm:hidden flex items-center gap-2 px-2 pb-2 overflow-x-auto no-scrollbar shrink-0 border-t border-[#4bd865]/20 pt-2">
          {['trace', 'sat', 'scan', 'logs', 'target', 'clear'].map(c => (
            <button key={c} onClick={() => setInput(c + ' ')} className="px-2 py-1 bg-[#122616] text-[#39e75f] text-[9px] uppercase tracking-widest border border-[#39e75f]/40 whitespace-nowrap">
              {c}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-2.5 sm:p-3 border-t border-[#4bd865]/30 bg-[#071009] flex items-center gap-2 shrink-0">
          <ChevronRight size={16} className="text-[#39e75f] animate-pulse hidden sm:block" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none outline-none text-[#eef6ee] text-[13px] sm:text-sm font-mono placeholder:text-[#a3cca7]/30 uppercase"
            autoComplete="off"
            spellCheck="false"
          />
          <div className="hidden sm:flex text-[9px] text-[#a3cca7]/45 tracking-widest uppercase items-center gap-2 border border-[#39e75f]/25 px-2 py-0.5 bg-[#050a06]">
            <span><span className="text-[#39e75f] font-bold">TAB</span> = Auto-complete</span>
            <span><span className="text-[#39e75f] font-bold">↑/↓</span> = History</span>
            <span><span className="text-[#39e75f] font-bold">ESC</span> = Close</span>
          </div>
          <button onClick={() => { executeCommand(input); setInput(''); }} className="sm:hidden bg-[#16301b] text-[#39e75f] p-1.5 px-3 uppercase text-[10px] font-bold tracking-widest border border-[#39e75f]/40">
            EXEC
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
