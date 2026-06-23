import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import IntroScreen from './components/IntroScreen';
import AuthScreen from './components/AuthScreen';
import { getSession, fetchLayout } from './auth';
import useStore from './store';
import { audio } from './utils/audioEngine';

// phases: 'intro' | 'auth' | 'greeting' | 'dashboard'

function App() {
 const [phase, setPhase] = useState(() => {
 // Check session synchronously to avoid flashing intro on F5
 const session = getSession();
 return (session?.token && session?.user) ? 'loading_session' : 'intro';
 });
 const [user, setUser] = useState(null); // { id, username, token }
 const loadLayout = useStore(s => s.loadLayout);
 const isSoundEnabled = useStore(s => s.isSoundEnabled);

 useEffect(() => {
 audio.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  useEffect(() => {
    useStore.getState().setNotificationsMuted(phase !== 'dashboard');
  }, [phase]);

 // On mount: restore existing session
 useEffect(() => {
 const session = getSession();
 if (session?.token && session?.user) {
 // Validate session with backend before allowing entry
 fetchLayout(session.token).then(layout => {
 setUser({ ...session.user, token: session.token });
 if (layout) loadLayout(layout);
 setPhase('dashboard');
 }).catch(() => {
 // Token is invalid/expired — boot them out!
 import('./auth').then(m => m.clearSession());
 setPhase('intro');
 });
 } else {
 if (phase === 'loading_session') setPhase('intro');
 }
 }, []);

 const handleAuthSuccess = async (sessionData) => {
 const u = { ...sessionData.user, token: sessionData.token };
 setUser(u);
 // Load saved layout
 const layout = await fetchLayout(sessionData.token);
 if (layout) loadLayout(layout);
 setPhase('greeting');
 };

 const handleLogout = () => {
 setUser(null);
 setPhase('intro');
 };

 return (
 <>
 {/* Loading session (F5 while logged in) */}
 {phase === 'loading_session' && (
 <div className="fixed inset-0 flex items-center justify-center bg-[#05070a] text-primary font-military font-bold tracking-[0.3em]">
 RESTORING SECURE CONNECTION...
 </div>
 )}

 {/* Intro boot sequence */}
 {phase === 'intro' && (
 <IntroScreen onEnter={() => setPhase('auth')} />
 )}

 {/* Auth screen */}
 {phase === 'auth' && (
 <AuthScreen onSuccess={handleAuthSuccess} />
 )}

 {/* Greeting overlay — sits on top of dashboard */}
 {(phase === 'greeting' || phase === 'dashboard') && user && (
 <Layout
 user={user}
 showGreeting={phase === 'greeting'}
 onEnterDashboard={() => setPhase('dashboard')}
 onLogout={handleLogout}
 onUsernameChange={(newName) => setUser(prev => ({ ...prev, username: newName }))}
 />
 )}
 </>
 );
}

export default App;

