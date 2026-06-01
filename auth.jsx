// LandingPrep — auth. Uses the real backend (server.js) when it's reachable
// (secure scrypt hashing + tokens + cross-device history sync) and falls back to
// a localStorage prototype when it isn't, so the site works either way.

(function () {
  const USERS_KEY = "lp_users";
  const SESSION_KEY = "lp_session";
  const TOKEN_KEY = "lp_token";
  const HISTORY_KEY = "lp_history";
  // Same-origin: when you run `node server.js`, the API and the page share a host.
  const API = "";

  // One-time backend health check, cached for the session.
  let backendPromise = null;
  function backendReady() {
    if (backendPromise) return backendPromise;
    backendPromise = fetch(API + "/api/health", { signal: AbortSignal.timeout(2000) })
      .then((r) => r.ok).catch(() => false);
    return backendPromise;
  }
  async function api(path, method, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(8000) });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  }
  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function setSession(user, token) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function hash(s) {
    // Simple non-cryptographic hash for prototype — DO NOT use in production
    let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return h.toString(16);
  }

  const subscribers = new Set();
  function notify(user) { subscribers.forEach(fn => { try { fn(user); } catch(e){} }); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
  }

  // ── localStorage prototype (fallback when backend is unreachable) ──────────
  function localSignUp(name, email, password) {
    const users = loadUsers();
    if (users[email]) return { ok: false, error: "An account with this email already exists. Try signing in." };
    users[email] = { name, email, hash: hash(password), createdAt: 0 };
    saveUsers(users);
    return { ok: true, user: { name, email } };
  }
  function localSignIn(email, password) {
    const users = loadUsers();
    const u = users[email];
    if (!u || u.hash !== hash(password)) return { ok: false, error: "Invalid email or password." };
    return { ok: true, user: { name: u.name, email: u.email } };
  }
  function localReset(email, newPassword) {
    const users = loadUsers();
    if (!users[email]) return { ok: false, error: "No account found with this email. Create one instead." };
    users[email].hash = hash(newPassword);
    saveUsers(users);
    return { ok: true };
  }

  // ── Public auth API: backend-first, localStorage fallback ──────────────────
  async function signUp(name, email, password) {
    if (!name || !email || !password) return { ok: false, error: "All fields are required." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
    email = email.trim().toLowerCase();
    if (await backendReady()) {
      try {
        const { status, data } = await api("/api/auth/signup", "POST", { name, email, password });
        if (status === 200 && data.token) {
          setSession(data.user, data.token);
          notify(data.user);
          pushHistory(); // upload any locally-stored history to the new account
          return { ok: true, user: data.user };
        }
        if (status === 409) return { ok: false, error: data.error || "An account with this email already exists. Try signing in." };
        if (data && data.error && status < 500) return { ok: false, error: data.error };
      } catch (e) { /* network hiccup → fall through to local */ }
    }
    const res = localSignUp(name, email, password);
    if (res.ok) { setSession(res.user); notify(res.user); }
    return res;
  }

  async function signIn(email, password) {
    if (!email || !password) return { ok: false, error: "Enter your email and password." };
    email = email.trim().toLowerCase();
    if (await backendReady()) {
      try {
        const { status, data } = await api("/api/auth/signin", "POST", { email, password });
        if (status === 200 && data.token) {
          setSession(data.user, data.token);
          notify(data.user);
          await pullHistory(); // bring this account's history to this device
          return { ok: true, user: data.user };
        }
        if (status === 401) return { ok: false, error: data.error || "Invalid email or password." };
        if (data && data.error && status < 500) return { ok: false, error: data.error };
      } catch (e) { /* fall through to local */ }
    }
    const res = localSignIn(email, password);
    if (res.ok) { setSession(res.user); notify(res.user); }
    return res;
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    notify(null);
  }

  async function resetPassword(email, newPassword) {
    if (!email || !newPassword) return { ok: false, error: "Enter your email and a new password." };
    if (newPassword.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
    email = email.trim().toLowerCase();
    if (await backendReady()) {
      try {
        const { status, data } = await api("/api/auth/reset", "POST", { email, password: newPassword });
        if (status === 200) return { ok: true };
        if (status === 404) return { ok: false, error: data.error || "No account found with this email. Create one instead." };
        if (data && data.error && status < 500) return { ok: false, error: data.error };
      } catch (e) { /* fall through to local */ }
    }
    return localReset(email, newPassword);
  }

  // ── Cross-device history sync ──────────────────────────────────────────────
  function readHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch (e) { return []; }
  }
  function histKey(h) {
    return (h.exam || "") + "|" + (h.date || h.ts || "") + "|" + (h.score != null ? h.score : (h.overall != null ? h.overall : ""));
  }
  async function pushHistory() {
    const token = getToken();
    if (!token) return;
    try { await api("/api/auth/history", "POST", { history: readHistory() }, token); } catch (e) {}
  }
  async function pullHistory() {
    const token = getToken();
    if (!token) return;
    try {
      const { status, data } = await api("/api/auth/history", "GET", null, token);
      if (status === 200 && Array.isArray(data.history)) {
        // Merge: union of remote + local, de-duped, so every device converges.
        const seen = new Set();
        const merged = [];
        [].concat(data.history, readHistory()).forEach((h) => {
          const k = histKey(h);
          if (seen.has(k)) return;
          seen.add(k); merged.push(h);
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
        await api("/api/auth/history", "POST", { history: merged }, token).catch(() => {});
      }
    } catch (e) {}
  }

  function emailExists(email) { return !!loadUsers()[email]; }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  window.LP_AUTH = { getUser, signUp, signIn, signOut, resetPassword, emailExists, subscribe, getToken, pushHistory, pullHistory, backendReady };
})();

// ── Login screen component ────────────────────────────────────────────────
(function () {
  const { useState } = React;

  function LoginScreen({ onNav, onSuccess }) {
    const [mode, setMode] = useState("signin"); // signin | signup | reset
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const switchMode = (m) => { setMode(m); setError(""); setNotice(""); };

    React.useEffect(() => {
      if (!window.LP_SEO) return;
      window.LP_SEO.set({
        title: (mode === "signup" ? "Create Free Account" : mode === "reset" ? "Reset Password" : "Sign in") + " | LandingPrep",
        description: "Free LandingPrep account — track your mock test scores, save progress across IELTS, TOEFL, PTE, GRE and GMAT. No credit card required.",
        robots: "noindex,nofollow"
      });
    }, [mode]);

    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
      e?.preventDefault();
      if (busy) return;
      setError(""); setNotice(""); setBusy(true);
      const A = window.LP_AUTH;
      let result;
      try {
        if (mode === "signup") result = await A.signUp(name, email, password);
        else if (mode === "reset") result = await A.resetPassword(email, password);
        else result = await A.signIn(email, password);
      } catch (err) {
        result = { ok: false, error: "Something went wrong. Please try again." };
      }
      setBusy(false);
      if (!result.ok) { setError(result.error); return; }
      if (mode === "reset") {
        setPassword(""); setNotice("Password updated. You can sign in with your new password now.");
        setMode("signin");
        return;
      }
      if (onSuccess) onSuccess(result.user);
      else onNav("home");
    };

    const title = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your free account" : "Reset your password";
    const sub = mode === "signin"
      ? "Sign in to track your progress, save your test history, and continue where you left off."
      : mode === "signup"
        ? "Free forever. No credit card. Track scores across IELTS, TOEFL, GRE, GMAT and more."
        : "Enter your account email and a new password to reset it.";
    const submitLabel = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";

    return (
      <>
        <window.LP_TopBar current="login" onNav={onNav} />
        <div className="login-shell">
          <form className="login-card" onSubmit={submit}>
            <h1>{title}</h1>
            <p className="sub">{sub}</p>

            {error && <div className="login-error">{error}</div>}
            {notice && <div className="login-notice">{notice}</div>}

            {mode === "signup" && (
              <>
                <label>Full name</label>
                <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </>
            )}
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>{mode === "reset" ? "New password" : "Password"}</label>
            <input type="password"
              placeholder={mode === "signin" ? "Your password" : "At least 6 characters"}
              value={password} onChange={(e) => setPassword(e.target.value)} required />

            {mode === "signin" && (
              <div className="login-forgot">
                <a onClick={() => switchMode("reset")}>Forgot password?</a>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={busy}>{busy ? "Please wait…" : submitLabel}</button>

            <div className="toggle">
              {mode === "signin" && (<>Don't have an account? <a onClick={() => switchMode("signup")}>Create one →</a></>)}
              {mode === "signup" && (<>Already have an account? <a onClick={() => switchMode("signin")}>Sign in →</a></>)}
              {mode === "reset" && (<>Remembered it? <a onClick={() => switchMode("signin")}>Back to sign in →</a></>)}
            </div>

            <div className="toggle" style={{ marginTop: 8 }}>
              <a onClick={() => onNav("home")}>← Back to home</a>
            </div>
          </form>
        </div>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_LoginScreen = LoginScreen;
})();
