import os

filepath = 'tactical-ui/src/Layout.jsx'
with open(filepath, 'a', encoding='utf-8') as f:
    f.write("""
{/* SLIM BOTTOM NEWS TICKER — always visible below modules ON DESKTOP */}
 {!isMobile && <NewsTicker minimizedModules={minimizedModules} restoreModule={restoreModule} getModuleIcon={getModuleIcon} />}

 {/* MOBILE BOTTOM TABS */}
 {isMobile && !showGreeting && (
 <div className="fixed bottom-0 left-0 w-full bg-[#0a0d11]/98 border-t border-white/10 z-[100000] flex items-center px-2 overflow-x-auto no-scrollbar shadow-[0_-5px_20px_rgba(0,0,0,0.8)] "style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
 <button
 onClick={() => { audio.playClick(); setMobileActiveTab('MAP_MODULE'); }}
 className={`flex-shrink-0 min-w-[60px] h-10 flex flex-col items-center justify-center mx-1 relative transition-colors ${mobileActiveTab === 'MAP_MODULE' ? 'text-primary' : 'text-white/40 hover:text-white/80'}`}
 >
 <Map size={14} className="mb-1"/>
 <span className="text-[7px] font-bold uppercase tracking-widest">Map</span>
 {mobileActiveTab === 'MAP_MODULE' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary " style={{ marginBottom: 'env(safe-area-inset-bottom)' }} />}
 </button>

 {activeModules.filter(id => id !== 'MAP_MODULE').map(id => {
 const IconComp = getModuleIcon(id);
 const title = getModuleTitle(id).replace('// ', '');
 const isActive = mobileActiveTab === id;
 return (
 <button
 key={id}
 onClick={() => { audio.playClick(); setMobileActiveTab(id); }}
 className={`flex-shrink-0 min-w-[70px] px-2 h-10 flex flex-col items-center justify-center mx-1 relative transition-colors ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/80'}`}
 >
 <IconComp size={14} className="mb-1"/>
 <span className="text-[7px] font-bold uppercase tracking-widest truncate w-full text-center">{title}</span>
 {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary " style={{ marginBottom: 'env(safe-area-inset-bottom)' }} />}
 </button>
 )
 })}
 </div>
 )}

 {/* Module Registry Modal */}
 <ModuleRegistry isOpen={isRegistryOpen} onClose={() => setIsRegistryOpen(false)} />

 {/* Profile Modal */}
 {isProfileOpen && currentUser && (
 <ProfileModal
 user={currentUser}
 token={user?.token}
 onClose={() => setIsProfileOpen(false)}
 onLogout={handleLogout}
 onUsernameChange={handleUsernameChange}
 />
 )}

 <CommandPalette />

  {/* TOAST NOTIFICATIONS */}
 {!showGreeting && (
 <div className="fixed top-16 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
 {(notifications || []).filter(n => n.isToast).map(noti => (
 <div key={noti.id} className={`w-80 pointer-events-auto tactical-glass border-l-4 ${noti.type === 'CRITICAL' ? 'border-l-red-500' : noti.type === 'WARNING' ? 'border-l-yellow-500' : 'border-l-primary'} p-3 shadow-2xl bg-[#05080d]/90  animate-in slide-in-from-right fade-in duration-300`}>
 <div className="flex justify-between items-start mb-1">
 <div className="flex items-center gap-2">
 {noti.type === 'CRITICAL' && <AlertTriangle size={12} className="text-red-500"/>}
 {noti.type === 'WARNING' && <AlertTriangle size={12} className="text-yellow-500"/>}
 {noti.type === 'INFO' && <Info size={12} className="text-primary"/>}
 <span className={`text-[10px] font-bold tracking-widest ${noti.type === 'CRITICAL' ? 'text-red-500' : noti.type === 'WARNING' ? 'text-yellow-500' : 'text-primary'}`}>{noti.type} ALERT</span>
 </div>
 <button onClick={() => dismissToast(noti.id)} className="text-white/40 hover:text-white">
 <X size={12} />
 </button>
 </div>
 <div className="text-[11px] text-white/90 font-mono leading-tight">{noti.text}</div>
 <div className="text-[8px] text-white/30 mt-2">{new Date(noti.time).toLocaleTimeString()}</div>
 </div>
 ))}
 </div>
 )}

 {/* NOTIFICATION LOG PANEL */}
 {isNotiOpen && (
 <div className="fixed top-14 right-0 bottom-6 w-80 bg-[#05080d]/95  border-l border-white/10 z-[99990] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
 <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <Bell size={12} className="text-primary"/>
 <span className="text-[10px] font-bold text-primary tracking-widest uppercase">SYSTEM LOGS</span>
 </div>
 <button onClick={() => setIsNotiOpen(false)} className="text-white/50 hover:text-white"><X size={14}/></button>
 </div>
 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
 {!(notifications && notifications.length > 0) ? (
 <div className="text-[10px] text-white/30 uppercase tracking-widest text-center mt-10">No recent alerts</div>
 ) : (
 notifications.map(noti => (
 <div key={noti.id} className={`border border-white/5 p-3 bg-white/[0.02] ${noti.type === 'CRITICAL' ? 'border-l-2 border-l-red-500' : noti.type === 'WARNING' ? 'border-l-2 border-l-yellow-500' : 'border-l-2 border-l-primary'}`}>
 <div className="flex justify-between items-start mb-1">
 <span className={`text-[9px] font-bold tracking-widest ${noti.type === 'CRITICAL' ? 'text-red-500' : noti.type === 'WARNING' ? 'text-yellow-500' : 'text-primary'}`}>{noti.type}</span>
 <span className="text-[8px] text-white/40">{new Date(noti.time).toLocaleTimeString()}</span>
 </div>
 <div className="text-[10px] text-white/80 font-mono mt-1 leading-relaxed">{noti.text}</div>
 </div>
 ))
 )}
 </div>
 <div className="p-3 border-t border-white/10 shrink-0">
 <button onClick={() => useStore.getState().clearNotifications()} className="w-full py-1.5 border border-white/10 text-[9px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-colors">
 Clear Logs
 </button>
 </div>
 </div>
 )}

 {/* Greeting overlay / Boot Sequence */}
 {showGreeting && currentUser && (
 <div className="fixed inset-0 z-[99995] flex flex-col items-center justify-center font-military overflow-y-auto overflow-x-hidden py-8"
 style={{ background: 'rgba(5,7,10,0.85)', backdropFilter: 'blur(16px)' }}>
 
 {/* Hex Dump Background */}
 <div className="absolute top-0 left-0 w-full opacity-10 pointer-events-none font-mono text-[10px] md:text-[14px] text-primary whitespace-pre-wrap break-all leading-none select-none z-0"
 style={{ animation: 'hexScroll 30s linear infinite', height: '200%' }}>
 {HEX_DUMP}
 </div>

 {/* Scanlines */}
 <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{
 background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 4px)',
 }} />
 <div className="absolute inset-0 pointer-events-none opacity-20"style={{
 background: 'radial-gradient(circle at center, rgba(var(--color-primary), 0.2) 0%, transparent 70%)',
 }} />
 
 {/* Main Console */}
 <div className="relative flex flex-col items-start w-[800px] max-w-[95vw] h-auto p-6 md:p-8 border border-white/10 bg-black/40   shrink-0 my-auto">
 {/* HUD Corners */}
 <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"/>
 <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"/>
 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"/>
 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"/>

 <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 w-full border-b border-white/10 pb-4">
 <div className="w-12 h-12 md:w-16 md:h-16 border border-primary/50 flex items-center justify-center bg-primary/10  relative shrink-0">
 <RavenLogo size={24} className="text-primary animate-pulse md:w-[32px] md:h-[32px]"/>
 </div>
 <div>
 <div className="text-[28px] md:text-[40px] font-stencil tracking-[0.2em] uppercase text-white  leading-none">RAVEN_OS</div>
 <div className="text-[10px] md:text-[12px] text-primary/80 tracking-widest uppercase font-mono mt-2">v9.2.4 // SECURE BOOT SEQUENCE</div>
 </div>
 </div>

 <div className="w-full mb-6 font-mono text-[11px] md:text-[13px] uppercase tracking-wider min-h-[180px] md:min-h-[220px]">
 <div className="space-y-3">
 {bootStep >= 1 && <div className="text-white/40 animate-in fade-in duration-100">&gt; INITIALIZING CORE KERNEL............. <span className="text-green-500">OK</span></div>}
 {bootStep >= 2 && <div className="text-white/40 animate-in fade-in duration-100">&gt; LOADING MIL-SPEC ENCRYPTION MODULES.. <span className="text-green-500">OK</span></div>}
 {bootStep >= 3 && <div className="text-white/40 animate-in fade-in duration-100">&gt; CONNECTING TO SATELLITE UPLINK....... <span className="text-yellow-500">ESTABLISHED</span></div>}
 {bootStep >= 4 && <div className="text-white/40 animate-in fade-in duration-100">&gt; SYNCING BLUE FORCE TRACKER........... <span className="text-green-500">OK</span></div>}
 {bootStep >= 5 && <div className="text-primary  animate-in fade-in duration-100">&gt; AUTHENTICATING USER CREDENTIALS......</div>}
 {bootReady && (
 <>
 <div className="text-green-500 font-bold animate-in fade-in duration-100">&gt; IDENTITY VERIFIED: {currentUser?.username || 'OPERATOR'}</div>
 <div className="text-white animate-in fade-in duration-100"style={{ animationDelay: '200ms' }}>&gt; ACCESS LEVEL: <span className="text-red-500 font-bold bg-red-500/20 px-1">TOP SECRET // NOFORN</span></div>
 </>
 )}
 </div>
 </div>

 <button
 onClick={bootReady ? () => { audio.playInitialize(); onEnterDashboard(); } : undefined}
 onMouseEnter={() => { setBootHovered(true); if(bootReady) audio.playHover(); }}
 onMouseLeave={() => setBootHovered(false)}
 disabled={!bootReady}
 className={`w-full py-4 md:py-6 text-[14px] md:text-[16px] font-bold tracking-[0.4em] uppercase border transition-all group relative overflow-hidden ${bootReady ? 'border-primary text-primary hover:bg-primary hover:text-black cursor-pointer' : 'border-white/10 text-white/30 cursor-not-allowed'}`}
 style={{ boxShadow: bootReady ? '0 0 20px rgba(var(--color-primary),0.2)' : 'none' }}
 >
 <div className={`absolute inset-0 bg-primary/20 translate-y-full ${bootReady ? 'group-hover:translate-y-0' : ''} transition-transform duration-300`} />
 <span className="relative flex items-center justify-center gap-3">
 {bootReady ? (
 <>
 [ <ScrambleText text="INITIALIZE WORKSPACE"trigger={bootHovered} duration={300} /> ]
 <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform"/>
 </>
 ) : (
 <span>[ SECURE BOOT IN PROGRESS... ]</span>
 )}
 </span>
 </button>
 </div>
 </div>
 )}

 <style dangerouslySetInnerHTML={{
 __html: `
 @keyframes tickerScroll {
 0% { transform: translateX(0); }
 100% { transform: translateX(-50%); }
 }
 
 @keyframes hexScroll {
 0% { transform: translateY(0); }
 100% { transform: translateY(-50%); }
 }
 
 @keyframes moveUp {
 0% { transform: translateY(100%); }
 100% { transform: translateY(-50%); }
 }
 `}} />
 </div>
 );
};

export default Layout;
""")
print("Successfully appended Layout.jsx")
