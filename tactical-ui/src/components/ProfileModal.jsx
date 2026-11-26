import React, { useState, useEffect } from 'react';
import { updateProfile, logout as apiLogout } from '../auth';
import { LogOut, User, Lock, Check } from 'lucide-react';
import ScrambleText from './ScrambleText';
import { audio } from '../utils/audioEngine';

const Field = ({ label, type = 'text', value, onChange, placeholder, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[8px] font-mono font-bold tracking-[0.25em] uppercase text-[#a3cca7]/60">
      // {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      className="bg-[#050b07] border border-[#4bd865]/30 px-2.5 py-1.5 font-mono text-[12px] text-[#eef6ee] placeholder-[#a3cca7]/25 outline-none tracking-wider w-full transition-colors focus:border-[#39e75f] caret-[#39e75f]"
    />
  </div>
);

const ProfileModal = ({ isOpen = true, user, token, onClose, onLogout, onUsernameChange }) => {
  const [section, setSection] = useState('name'); // 'name' | 'password'
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoutHovered, setLogoutHovered] = useState(false);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (user?.username) setNewUsername(user.username);
  }, [user?.username]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const t = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 215);
      return () => clearTimeout(t);
    }
  }, [isOpen, shouldRender]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    clearMessages();
    if (newUsername === user.username) {
      setError('NO CHANGES DETECTED');
      return;
    }
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
    if (newPassword !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }
    setLoading(true);
    try {
      await updateProfile(token, { old_password: oldPassword, new_password: newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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

  if (!shouldRender || !user) return null;

  return (
    <div
      className={`fixed bottom-8 left-12 sm:left-14 z-[99990] pointer-events-auto ${
        isClosing ? 'macos-window-exit' : 'macos-window-enter'
      }`}
    >
      <div className="relative w-[330px] sm:w-[370px] max-w-[calc(100vw-3.5rem)] bg-[#060d08]/95 border border-[#4bd865]/50 shadow-[0_20px_50px_rgba(0,0,0,0.92)] font-mono overflow-hidden">
        {/* WATCHER-02 Green Header */}
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
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="w-8 h-full bg-[#261111] hover:bg-[#e05252] text-[#ff6b6b] hover:text-[#090c09] border-r border-black/80 font-mono text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer"
              title="Close Agent Profile"
            >
              X
            </button>
            <div className="flex items-center gap-2 px-3">
              <User size={13} className="text-[#39e75f]" />
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#eef6ee]">
                // AGENT PROFILE
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

        {/* Agent ID */}
        <div className="px-4 py-3 border-b border-[#4bd865]/25 bg-[#0a170d]/80">
          <div className="text-[8px] text-[#a3cca7]/60 tracking-widest uppercase mb-0.5">
            // CURRENT OPERATOR ID
          </div>
          <div className="text-sm font-bold tracking-[0.18em] uppercase text-[#39e75f]">
            {user.username}
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-[#4bd865]/25 bg-[#050b07]">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setSection('name');
              clearMessages();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors border-b-2 cursor-pointer ${
              section === 'name'
                ? 'text-[#39e75f] border-[#39e75f] bg-[#122616]/50'
                : 'text-[#a3cca7]/45 border-transparent hover:text-[#eef6ee]'
            }`}
          >
            <User size={10} /> CODENAME
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setSection('password');
              clearMessages();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors border-b-2 cursor-pointer ${
              section === 'password'
                ? 'text-[#39e75f] border-[#39e75f] bg-[#122616]/50'
                : 'text-[#a3cca7]/45 border-transparent hover:text-[#eef6ee]'
            }`}
          >
            <Lock size={10} /> SECURITY KEY
          </button>
        </div>

        <div className="p-4">
          {section === 'name' && (
            <form onSubmit={handleUpdateName} className="flex flex-col gap-3.5">
              <Field
                label="New Display Name"
                value={newUsername}
                onChange={setNewUsername}
                placeholder="new_codename"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                onClick={() => audio.playClick()}
                className="py-2 text-[9px] tracking-[0.25em] uppercase font-bold mw4-hero-btn cursor-pointer"
              >
                {loading ? '// UPDATING...' : '[ CONFIRM UPDATE ]'}
              </button>
            </form>
          )}

          {section === 'password' && (
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
              <Field
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={setOldPassword}
                placeholder="••••••••"
                disabled={loading}
              />
              <Field
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••"
                disabled={loading}
              />
              <Field
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                onClick={() => audio.playClick()}
                className="py-2 text-[9px] tracking-[0.25em] uppercase font-bold mw4-hero-btn cursor-pointer"
              >
                {loading ? '// UPDATING...' : '[ UPDATE PASSWORD ]'}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-3 text-[9px] font-mono text-[#ff6b6b] tracking-wider border border-[#ef5350]/40 bg-[#261111]/60 px-3 py-1.5">
              // ERROR: {error}
            </div>
          )}
          {success && (
            <div className="mt-3 text-[9px] font-mono tracking-wider border border-[#39e75f]/40 bg-[#122616]/60 text-[#39e75f] px-3 py-1.5 flex items-center gap-2">
              <Check size={11} /> {success}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="px-4 pb-4">
          <div className="border-t border-[#4bd865]/20 pt-3">
            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={() => setLogoutHovered(true)}
              onMouseLeave={() => setLogoutHovered(false)}
              className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold tracking-[0.25em] uppercase border border-[#ef5350]/45 bg-[#261111]/50 text-[#ff6b6b] hover:bg-[#e05252] hover:text-[#090c09] transition-all cursor-pointer"
            >
              <LogOut size={11} />{' '}
              <ScrambleText text="TERMINATE SESSION" trigger={logoutHovered} duration={300} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
