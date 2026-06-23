import React, { useState } from 'react';
import { updateProfile, logout as apiLogout } from '../auth';
import { X, LogOut, User, Lock, Check } from 'lucide-react';
import ScrambleText from './ScrambleText';
import { audio } from '../utils/audioEngine';

const Field = ({ label, type = 'text', value, onChange, placeholder, disabled }) => (
 <div className="flex flex-col gap-1.5">
 <label className="text-[7px] font-mono font-bold tracking-[0.3em] uppercase text-white/25">// {label}</label>
 <input
 type={type}
 value={value}
 onChange={e => onChange(e.target.value)}
 placeholder={placeholder}
 disabled={disabled}
 autoComplete="off"
 className="bg-transparent border-0 border-b pb-1.5 font-mono text-[12px] text-white/80 placeholder-white/10 outline-none tracking-wider w-full transition-colors border-white/10 focus:border-primary caret-primary"
 />
 </div>
);

const ProfileModal = ({ user, token, onClose, onLogout, onUsernameChange }) => {
 const [section, setSection] = useState('name'); // 'name' | 'password'
 const [newUsername, setNewUsername] = useState(user.username);
 const [oldPassword, setOldPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [logoutHovered, setLogoutHovered] = useState(false);

 const clearMessages = () => { setError(''); setSuccess(''); };

 const handleUpdateName = async (e) => {
 e.preventDefault();
 clearMessages();
 if (newUsername === user.username) { setError('NO CHANGES DETECTED'); return; }
 setLoading(true);
 try {
 const data = await updateProfile(token, { username: newUsername });
 onUsernameChange(data.user.username);
 setSuccess('DISPLAY NAME UPDATED SUCCESSFULLY');
 } catch (err) {
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 const handleUpdatePassword = async (e) => {
 e.preventDefault();
 clearMessages();
 if (newPassword !== confirmPassword) { setError('PASSWORDS DO NOT MATCH'); return; }
 setLoading(true);
 try {
 await updateProfile(token, { old_password: oldPassword, new_password: newPassword });
 setOldPassword(''); setNewPassword(''); setConfirmPassword('');
 setSuccess('PASSWORD UPDATED SUCCESSFULLY');
 } catch (err) {
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 const handleLogout = async () => {
 audio.playInitialize();
 await apiLogout(token);
 onLogout();
 };

 return (
 <div className="fixed inset-0 z-[99990] flex items-center justify-center"style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
 <div className="relative w-full max-w-sm border font-mono overflow-hidden"
 style={{ background: '#0a0c10', borderColor: 'rgba(255,255,255,0.08)' }}>

 {/* Header */}
 <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
 <div className="flex items-center gap-2.5">
 <div className="w-4 h-4 border border-primary/40 flex items-center justify-center">
 <User size={10} className="text-primary"/>
 </div>
 <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/60">AGENT PROFILE</span>
 </div>
 <button onClick={() => { audio.playClick(); onClose(); }} className="text-white/20 hover:text-white/60 transition-colors">
 <X size={14} />
 </button>
 </div>

 {/* Agent ID */}
 <div className="px-5 py-4 border-b border-white/5 bg-primary/5">
 <div className="text-[7px] text-white/25 tracking-widest uppercase mb-1">// CURRENT AGENT ID</div>
 <div className="text-sm font-bold tracking-[0.2em] uppercase text-primary">{user.username}</div>
 </div>

 {/* Section tabs */}
 <div className="flex border-b border-white/5">
 <button
 onClick={() => { audio.playClick(); setSection('name'); clearMessages(); }}
 className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[8px] tracking-[0.25em] uppercase transition-colors border-b -mb-[1px] ${section === 'name' ? 'text-primary border-primary' : 'text-white/20 border-transparent'}`}
 >
 <User size={9} /> NAME
 </button>
 <button
 onClick={() => { audio.playClick(); setSection('password'); clearMessages(); }}
 className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[8px] tracking-[0.25em] uppercase transition-colors border-b -mb-[1px] ${section === 'password' ? 'text-primary border-primary' : 'text-white/20 border-transparent'}`}
 >
 <Lock size={9} /> PASSWORD
 </button>
 </div>

 <div className="px-5 py-5">
 {/* Change Name */}
 {section === 'name' && (
 <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
 <Field label="New Display Name"value={newUsername} onChange={setNewUsername}
 placeholder="new_codename"disabled={loading} />
 <button type="submit"disabled={loading} onClick={() => audio.playClick()}
 className={`py-2.5 text-[9px] tracking-[0.3em] uppercase font-bold border transition-all ${loading ? 'border-primary text-primary bg-transparent' : 'border-primary bg-primary text-black'}`}>
 {loading ? '// UPDATING...' : '[ CONFIRM UPDATE ]'}
 </button>
 </form>
 )}

 {/* Change Password */}
 {section === 'password' && (
 <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
 <Field label="Current Password"type="password"value={oldPassword} onChange={setOldPassword} placeholder="••••••••" disabled={loading} />
 <Field label="New Password"type="password"value={newPassword} onChange={setNewPassword} placeholder="••••••••" disabled={loading} />
 <Field label="Confirm New Password"type="password"value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" disabled={loading} />
 <button type="submit"disabled={loading} onClick={() => audio.playClick()}
 className={`py-2.5 text-[9px] tracking-[0.3em] uppercase font-bold border transition-all ${loading ? 'border-primary text-primary bg-transparent' : 'border-primary bg-primary text-black'}`}>
 {loading ? '// UPDATING...' : '[ UPDATE PASSWORD ]'}
 </button>
 </form>
 )}

 {/* Feedback */}
 {error && <div className="mt-3 text-[8px] font-mono text-red-500/80 tracking-wider border border-red-500/15 px-3 py-2">// ERROR: {error}</div>}
 {success && <div className="mt-3 text-[8px] font-mono tracking-wider border border-primary/20 text-primary/90 px-3 py-2 flex items-center gap-2"><Check size={10} /> {success}</div>}
 </div>

 {/* Logout */}
 <div className="px-5 pb-5">
 <div className="border-t pt-4"style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
 <button onClick={handleLogout}
 onMouseEnter={() => setLogoutHovered(true)}
 onMouseLeave={() => setLogoutHovered(false)}
 className="w-full flex items-center justify-center gap-2 py-2.5 text-[9px] font-bold tracking-[0.3em] uppercase border border-red-500/30 text-red-500/60 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/50 transition-all">
 <LogOut size={11} /> <ScrambleText text="TERMINATE SESSION"trigger={logoutHovered} duration={300} />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};

export default ProfileModal;
