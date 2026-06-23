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
 style={{ background: '#05070a' }}
 >
 {/* Scanlines */}
 <div className="absolute inset-0 pointer-events-none"style={{
 background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
 zIndex: 1,
 }} />

 {/* Radial glow */}
 <div className="absolute inset-0 pointer-events-none"style={{
 background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${PRIMARY_RGBA(0.05)} 0%, transparent 70%)`,
 zIndex: 1,
 }} />

 {/* Corner brackets */}
 {['top-5 left-5 border-t border-l', 'top-5 right-5 border-t border-r',
 'bottom-5 left-5 border-b border-l', 'bottom-5 right-5 border-b border-r'].map((cls, i) => (
 <div key={i} className={`absolute w-6 h-6 ${cls} border-white/10`} style={{ zIndex: 2 }} />
 ))}

 <div className="relative w-full max-w-sm px-8"style={{ zIndex: 3 }}>
 {/* Logo */}
 <div className="flex flex-col items-center mb-10">
 <div className="w-10 h-10 border flex items-center justify-center mb-4"
 style={{ borderColor: PRIMARY_RGBA(0.4), background: PRIMARY_RGBA(0.08) }}>
 <img src="/raven_favicon.png"alt="Raven Logo"className="w-6 h-6 object-contain opacity-80"/>
 </div>
 <div className="text-[28px] leading-none font-stencil tracking-[0.2em] text-white/90"style={{ textShadow: `0 0 10px ${PRIMARY_RGBA(0.3)}` }}>RAVEN-X</div>
 <div className="text-[14px] font-stencil tracking-[0.3em] uppercase mt-1"style={{ color: PRIMARY_RGBA(0.9) }}>
 SECURE ACCESS TERMINAL
 </div>
 </div>

 {/* Tab switcher */}
 <div className="flex gap-0 mb-8 border-b border-white/5">
 {['login', 'register'].map(t => (
 <button
 key={t}
 onClick={() => { setTab(t); setError(''); }}
 className="flex-1 pb-2.5 text-[12px] font-military font-bold tracking-[0.2em] uppercase transition-colors"
 style={{
 color: tab === t ? PRIMARY : 'rgba(255,255,255,0.2)',
 borderBottom: tab === t ? `1px solid ${PRIMARY}` : '1px solid transparent',
 marginBottom: -1,
 }}
 >
 {t === 'login' ? '// LOGIN' : '// REGISTER'}
 </button>
 ))}
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="flex flex-col gap-6">
 <Input label="Username"value={username} onChange={setUsername}
 placeholder="agent_codename"disabled={loading} />
 <Input label="Password"type="password"value={password} onChange={setPassword}
 placeholder="••••••••••" disabled={loading} />
 {tab === 'register' && (
 <Input label="Confirm Password"type="password"value={confirmPassword}
 onChange={setConfirmPassword} placeholder="••••••••••" disabled={loading} />
 )}

 {/* Error */}
 {error && (
 <div className="font-military font-bold text-[12px] tracking-wider text-red-500/90 border-l-4 border-red-500 px-4 py-3 bg-red-500/10">
 // ERROR: {error}
 </div>
 )}

 {/* Submit */}
 <button
 type="submit"
 onMouseEnter={() => { setBtnHovered(true); audio.playHover(); }}
 onMouseLeave={() => setBtnHovered(false)}
 onClick={() => audio.playAuthClick()}
 disabled={loading || !username || !password}
 className="mt-4 py-4 font-military font-bold text-[14px] tracking-[0.3em] uppercase transition-all border-2"
 style={{
 borderColor: loading ? 'rgba(255,255,255,0.1)' : PRIMARY,
 color: loading ? 'rgba(255,255,255,0.2)' : '#05070a',
 background: loading ? 'transparent' : PRIMARY,
 cursor: loading ? 'not-allowed' : 'pointer',
 }}
 >
 {loading
 ? '// AUTHENTICATING...'
 : <span>[ <ScrambleText text={tab === 'login' ? 'AUTHENTICATE' : 'CREATE ACCOUNT'} trigger={btnHovered} duration={300} /> ]</span>}
 </button>
 </form>

 {/* Footer */}
 <div className="mt-8 text-center font-military font-bold text-[10px] tracking-[0.2em] uppercase text-white/20">
 UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
 </div>
 </div>
 </div>
 );
};

export default AuthScreen;
