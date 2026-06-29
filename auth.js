(function() {
  const USERS_KEY = "lp_users";
  const SESSION_KEY = "lp_session";
  const TOKEN_KEY = "lp_token";
  const HISTORY_KEY = "lp_history";
  const API = "";
  let backendPromise = null;
  function backendReady() {
    if (backendPromise) return backendPromise;
    backendPromise = fetch(API + "/api/health", { signal: AbortSignal.timeout(2e3) }).then((r) => r.ok).catch(() => false);
    return backendPromise;
  }
  async function api(path, method, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : void 0, signal: AbortSignal.timeout(8e3) });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  }
  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }
  function setSession(user, token) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    } catch {
      return {};
    }
  }
  function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  }
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h.toString(16);
  }
  const subscribers = /* @__PURE__ */ new Set();
  function notify(user) {
    subscribers.forEach((fn) => {
      try {
        fn(user);
      } catch (e) {
      }
    });
  }
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }
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
          pushHistory();
          try {
            if (window.gtag) window.gtag("event", "sign_up", { method: "email" });
            if (window.LP_REFERRAL) window.LP_REFERRAL.trackSignup();
          } catch (e) {
          }
          return { ok: true, user: data.user };
        }
        if (status === 409) return { ok: false, error: data.error || "An account with this email already exists. Try signing in." };
        if (data && data.error && status < 500) return { ok: false, error: data.error };
      } catch (e) {
      }
    }
    const res = localSignUp(name, email, password);
    if (res.ok) {
      setSession(res.user);
      notify(res.user);
    }
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
          await pullHistory();
          return { ok: true, user: data.user };
        }
        if (status === 401) return { ok: false, error: data.error || "Invalid email or password." };
        if (data && data.error && status < 500) return { ok: false, error: data.error };
      } catch (e) {
      }
    }
    const res = localSignIn(email, password);
    if (res.ok) {
      setSession(res.user);
      notify(res.user);
    }
    return res;
  }
  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    notify(null);
  }
  async function requestReset(email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
    email = email.trim().toLowerCase();
    if (!await backendReady()) return { ok: false, error: "Resetting your password needs an internet connection. Please try again online." };
    try {
      await api("/api/auth/forgot", "POST", { email });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't send the code right now. Check your connection and try again." };
    }
  }
  async function resetPassword(email, code, newPassword) {
    if (!email || !newPassword) return { ok: false, error: "Enter your email and a new password." };
    if (!/^\d{6}$/.test(String(code || "").trim())) return { ok: false, error: "Enter the 6-digit code from your email." };
    if (newPassword.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
    email = email.trim().toLowerCase();
    if (!await backendReady()) return { ok: false, error: "Resetting your password needs an internet connection. Please try again online." };
    try {
      const { status, data } = await api("/api/auth/reset", "POST", { email, code: String(code).trim(), password: newPassword });
      if (status === 200) return { ok: true };
      if (data && data.error) return { ok: false, error: data.error };
      return { ok: false, error: "Couldn't reset your password. Please try again." };
    } catch (e) {
      return { ok: false, error: "Couldn't reach the server. Please try again." };
    }
  }
  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function histKey(h) {
    return (h.exam || "") + "|" + (h.date || h.ts || "") + "|" + (h.score != null ? h.score : h.overall != null ? h.overall : "");
  }
  async function pushHistory() {
    const token = getToken();
    if (!token) return;
    try {
      await api("/api/auth/history", "POST", { history: readHistory() }, token);
    } catch (e) {
    }
  }
  async function pullHistory() {
    const token = getToken();
    if (!token) return;
    try {
      const { status, data } = await api("/api/auth/history", "GET", null, token);
      if (status === 200 && Array.isArray(data.history)) {
        const seen = /* @__PURE__ */ new Set();
        const merged = [];
        [].concat(data.history, readHistory()).forEach((h) => {
          const k = histKey(h);
          if (seen.has(k)) return;
          seen.add(k);
          merged.push(h);
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
        await api("/api/auth/history", "POST", { history: merged }, token).catch(() => {
        });
      }
    } catch (e) {
    }
  }
  function emailExists(email) {
    return !!loadUsers()[email];
  }
  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }
  window.LP_AUTH = { getUser, signUp, signIn, signOut, requestReset, resetPassword, emailExists, subscribe, getToken, pushHistory, pullHistory, backendReady };
})();
(function() {
  const { useState } = React;
  function LoginScreen({ onNav, onSuccess }) {
    const [mode, setMode] = useState("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [resetStep, setResetStep] = useState(1);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const switchMode = (m) => {
      setMode(m);
      setError("");
      setNotice("");
      setResetStep(1);
      setCode("");
    };
    React.useEffect(() => {
      if (!window.LP_SEO) return;
      window.LP_SEO.set({
        title: (mode === "signup" ? "Create Free Account" : mode === "reset" ? "Reset Password" : "Sign in") + " | LandingPrep",
        description: "Free LandingPrep account \u2014 track your mock test scores, save progress across IELTS, TOEFL, PTE, GRE and GMAT. No credit card required.",
        robots: "noindex,nofollow"
      });
    }, [mode]);
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
      e == null ? void 0 : e.preventDefault();
      if (busy) return;
      setError("");
      setNotice("");
      setBusy(true);
      const A = window.LP_AUTH;
      let result;
      try {
        if (mode === "signup") result = await A.signUp(name, email, password);
        else if (mode === "reset") result = resetStep === 1 ? await A.requestReset(email) : await A.resetPassword(email, code, password);
        else result = await A.signIn(email, password);
      } catch (err) {
        result = { ok: false, error: "Something went wrong. Please try again." };
      }
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (mode === "reset") {
        if (resetStep === 1) {
          setResetStep(2);
          setNotice("If an account exists for " + email + ", we've emailed a 6-digit reset code. It expires in 15 minutes \u2014 check your inbox and spam.");
          return;
        }
        setPassword("");
        setCode("");
        setResetStep(1);
        setMode("signin");
        setNotice("Password updated \u2014 you can sign in with your new password now.");
        return;
      }
      if (onSuccess) onSuccess(result.user);
      else onNav("home");
    };
    const title = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your free account" : resetStep === 1 ? "Reset your password" : "Enter your reset code";
    const sub = mode === "signin" ? "Sign in to track your progress, save your test history, and continue where you left off." : mode === "signup" ? "Free forever. No credit card. Track scores across IELTS, TOEFL, GRE, GMAT and more." : resetStep === 1 ? "Enter your account email and we'll send a 6-digit code to verify it's you." : "We emailed a 6-digit code to " + email + ". Enter it below with your new password.";
    const submitLabel = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : resetStep === 1 ? "Send reset code" : "Reset password";
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "login", onNav }), /* @__PURE__ */ React.createElement("div", { className: "login-shell" }, /* @__PURE__ */ React.createElement("form", { className: "login-card", onSubmit: submit }, /* @__PURE__ */ React.createElement("h1", null, title), /* @__PURE__ */ React.createElement("p", { className: "sub" }, sub), error && /* @__PURE__ */ React.createElement("div", { className: "login-error" }, error), notice && /* @__PURE__ */ React.createElement("div", { className: "login-notice" }, notice), mode === "signup" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", null, "Full name"), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "Your name", value: name, onChange: (e) => setName(e.target.value), required: true })), /* @__PURE__ */ React.createElement("label", null, "Email"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        placeholder: "you@example.com",
        value: email,
        onChange: (e) => setEmail(e.target.value),
        required: true,
        readOnly: mode === "reset" && resetStep === 2,
        style: mode === "reset" && resetStep === 2 ? { opacity: 0.7 } : void 0
      }
    ), mode === "reset" && resetStep === 2 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", null, "6-digit code"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        autoComplete: "one-time-code",
        maxLength: 6,
        placeholder: "123456",
        value: code,
        onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
        required: true,
        style: { letterSpacing: "6px", fontSize: 18, textAlign: "center" }
      }
    )), (mode !== "reset" || resetStep === 2) && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("label", null, mode === "reset" ? "New password" : "Password"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        placeholder: mode === "signin" ? "Your password" : "At least 6 characters",
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true
      }
    )), mode === "signin" && /* @__PURE__ */ React.createElement("div", { className: "login-forgot" }, /* @__PURE__ */ React.createElement("a", { onClick: () => switchMode("reset") }, "Forgot password?")), mode === "reset" && resetStep === 2 && /* @__PURE__ */ React.createElement("div", { className: "login-forgot" }, /* @__PURE__ */ React.createElement("a", { onClick: () => {
      setResetStep(1);
      setCode("");
      setPassword("");
      setError("");
      setNotice("");
    } }, "\u2190 Use a different email / resend code")), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "login-btn", disabled: busy }, busy ? "Please wait\u2026" : submitLabel), /* @__PURE__ */ React.createElement("div", { className: "toggle" }, mode === "signin" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Don't have an account? ", /* @__PURE__ */ React.createElement("a", { onClick: () => switchMode("signup") }, "Create one \u2192")), mode === "signup" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Already have an account? ", /* @__PURE__ */ React.createElement("a", { onClick: () => switchMode("signin") }, "Sign in \u2192")), mode === "reset" && /* @__PURE__ */ React.createElement(React.Fragment, null, "Remembered it? ", /* @__PURE__ */ React.createElement("a", { onClick: () => switchMode("signin") }, "Back to sign in \u2192"))), /* @__PURE__ */ React.createElement("div", { className: "toggle", style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement("a", { onClick: () => onNav("home") }, "\u2190 Back to home")))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_LoginScreen = LoginScreen;
})();
