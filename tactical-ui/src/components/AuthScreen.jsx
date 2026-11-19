import React, { useState } from 'react';
import { login, register } from '../auth';
import ScrambleText from './ScrambleText';
import { audio } from '../utils/audioEngine';

const PRIMARY = 'rgb(var(--color-primary))';
const PRIMARY_RGBA = (alpha) => `rgba(var(--color-primary), ${alpha})`;

const Input = ({ label, type = 'text', value, onChange, placeholder, disabled }) => (
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-military font-bold tracking-[0.2em] uppercase text-white/50">
 // {label}
 </label>
 <input
 type={type}
 value={value}
 onChange={e => onChange(e.target.value)}
 placeholder={placeholder}
 disabled={disabled}
 autoComplete="off"
 className="w-full bg-transparent border-0 border-b-2 pb-2 font-military font-bold text-[16px] text-white/90 placeholder-white/20 outline-none tracking-widest transition-colors"
 style={{
 borderBottomColor: 'rgba(255,255,255,0.1)',
 caretColor: PRIMARY,
 }}
 onFocus={e => e.target.style.borderBottomColor = PRIMARY}
 onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.1)'}
 />
 </div>
);

const AuthScreen = ({ onSuccess }) => {
 const [tab, setTab] = useState('login'); // 'login' | 'register'
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [btnHovered, setBtnHovered] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError('');

 if (tab === 'register') {
 if (password !== confirmPassword) {
 audio.playError();
 setError('PASSWORDS DO NOT MATCH');
 return;
 }
 }

 audio.playAuthClick();
 setLoading(true);
 try {
 const data = tab === 'login'
 ? await login(username, password)
 : await register(username, password);
 audio.playSuccess();
 onSuccess(data);
 } catch (err) {
 audio.playError();
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div
 className="fixed inset-0 z-[99998] flex items-center justify-center"
 style={{
 background: 'radial-gradient(ellipse 65% 65% at 50% 45%, #171c18 0%, #0c0e0d 72%)',
 }}
 >
 {/* Subtle top-left & bottom-right tactical corner ticks */}
 {['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r',
 'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'].map((cls, i) => (
 <div key={i} className={`absolute w-5 h-5 ${cls} border-white/10`} style={{ zIndex: 2 }} />
 ))}

 <div className="relative w-full max-w-md px-8 py-9 bg-[#121513] border border-white/10" style={{ zIndex: 3 }}>
 {/* Header */}
 <div className="flex items-center gap-3.5 mb-8 pb-5 border-b border-white/10">
 <div className="w-11 h-11 border border-primary/35 flex items-center justify-center bg-[#191e1a] shrink-0">
 <img src="/raven_favicon.png" alt="Raven Logo" className="w-6 h-6 object-contain opacity-90" />
 </div>
 <div className="flex flex-col">
 <div className="flex items-center gap-2">
 <span className="text-[24px] leading-none font-stencil tracking-[0.18em] text-[#e8eae6]">RAVEN-X</span>
 <span className="mw4-badge px-1.5 py-0.5 text-[8px] leading-none">OPS</span>
 </div>
 <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/40 mt-1.5">
 WATCHER PROGRAM // ACCESS TERMINAL
 </span>
 </div>
 </div>

 {/* MW4 Top Tab Switcher (Bone-white active pill) */}
 <div className="flex gap-1 mb-7 p-1 bg-[#0c0e0d] border border-white/10">
 {['login', 'register'].map(t => (
 <button
 key={t}
 type="button"
 onClick={() => { setTab(t); setError(''); }}
 className={`flex-1 py-2 text-[11px] font-military font-bold tracking-[0.2em] uppercase ${
 tab === t ? 'mw4-tab-active' : 'mw4-tab'
 }`}
 >
 {t === 'login' ? 'SIGN IN' : 'REGISTER'}
 </button>
 ))}
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="flex flex-col gap-5">
 <Input label="Operator ID" value={username} onChange={setUsername}
 placeholder="agent_codename" disabled={loading} />
 <Input label="Passkey" type="password" value={password} onChange={setPassword}
 placeholder="••••••••••" disabled={loading} />
 {tab === 'register' && (
 <Input label="Confirm Passkey" type="password" value={confirmPassword}
 onChange={setConfirmPassword} placeholder="••••••••••" disabled={loading} />
 )}

 {/* Error */}
 {error && (
 <div className="font-military font-bold text-[11px] tracking-wider text-[#f07167] border-l-2 border-[#d94638] px-3 py-2.5 bg-[#d94638]/10">
 // ERROR: {error}
 </div>
 )}

 {/* MW4 Olive-Phosphor Active CTA Button */}
 <button
 type="submit"
 onMouseEnter={() => { setBtnHovered(true); audio.playHover(); }}
 onMouseLeave={() => setBtnHovered(false)}
 onClick={() => audio.playAuthClick()}
 disabled={loading || !username || !password}
 className={`mt-3 py-3.5 px-5 font-military font-bold text-[13px] tracking-[0.28em] uppercase transition-all flex items-center justify-between ${
 loading || !username || !password
 ? 'bg-white/[0.03] border border-white/10 text-white/25 cursor-not-allowed'
 : 'mw4-row-active cursor-pointer hover:brightness-110'
 }`}
 >
 <span className="flex items-center gap-2.5">
 <span className="text-[15px] leading-none">»</span>
 <span>
 {loading
 ? 'AUTHENTICATING...'
 : <ScrambleText text={tab === 'login' ? 'AUTHENTICATE' : 'CREATE ACCOUNT'} trigger={btnHovered} duration={260} />}
 </span>
 </span>
 <span className="text-[9px] font-mono tracking-widest opacity-60">ENTER</span>
 </button>
 </form>

 {/* Footer */}
 <div className="mt-7 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[9px] tracking-[0.18em] uppercase text-white/25">
 <span>CLEARANCE: EYES ONLY</span>
 <span>SECURE LINK</span>
 </div>
 </div>
 </div>
 );
};

export default AuthScreen;
