const API = import.meta.env.VITE_BACKEND_URL + '';

// ─── Session Storage ───────────────────────────────────────────────────────────

export function getSession() {
 try {
 const raw = localStorage.getItem('ravenx_session');
 return raw ? JSON.parse(raw) : null;
 } catch { return null; }
}

function setSession(data) {
 localStorage.setItem('ravenx_session', JSON.stringify(data));
}

export function clearSession() {
 localStorage.removeItem('ravenx_session');
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function register(username, password) {
 const res = await fetch(`${API}/api/auth/register`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'REGISTRATION FAILED');
 setSession(data);
 return data; // { token, user: { id, username } }
}

export async function login(username, password) {
 const res = await fetch(`${API}/api/auth/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'LOGIN FAILED');
 setSession(data);
 return data;
}

export async function logout(token) {
 try {
 await fetch(`${API}/api/auth/logout`, {
 method: 'POST',
 headers: { Authorization: `Bearer ${token}` },
 });
 } catch {}
 clearSession();
}

export async function updateProfile(token, updates) {
 const res = await fetch(`${API}/api/auth/update`, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify(updates),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'UPDATE FAILED');
 // If username changed, update local session
 if (data.user) {
 const session = getSession();
 if (session) setSession({ ...session, user: data.user });
 }
 return data;
}

// ─── Layout API ───────────────────────────────────────────────────────────────

export async function fetchLayout(token) {
 const res = await fetch(`${API}/api/layout`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 if (res.status === 401) throw new Error('UNAUTHORIZED');
 if (!res.ok) return null;
 const data = await res.json();
 return data.layout; // { activeModules, windowStates } or null
}

export async function saveLayout(token, layout) {
 try {
 await fetch(`${API}/api/layout`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ layout }),
 });
 } catch {}
}
