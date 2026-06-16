"use strict";
// LandingPrep — referral / invite viral loop (window.LP_REFERRAL).
// Pure JS, no React. Loaded before app.js so first-touch ?ref is captured on
// the very first paint. Measurement is via GA4 events (no backend needed):
//   referral_landing  — a visitor arrived via someone's invite link
//   referral_share    — a user opened the share sheet to invite friends
//   referral_signup   — a referred visitor created an account (fired from auth)
// Attribution is first-touch and stored in localStorage so it survives navigation.
(function () {
  var LS_MINE = "lp_my_ref";     // this device's own invite code
  var LS_REFBY = "lp_ref_by";    // the code that referred this visitor (first-touch)
  var ORIGIN = "https://landingprep.com";

  function ga(event, params) {
    try { if (window.gtag) window.gtag("event", event, params || {}); } catch (e) {}
  }

  // Stable per-device code. Prefers the signed-in user id when available so the
  // same person shares a consistent code across sessions/devices.
  function myCode() {
    try {
      var uid = window.LP_AUTH && window.LP_AUTH.currentUser && window.LP_AUTH.currentUser.uid;
      if (uid) { var short = String(uid).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || null; if (short) { localStorage.setItem(LS_MINE, short); return short; } }
      var existing = localStorage.getItem(LS_MINE);
      if (existing) return existing;
      var code = (Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4)).slice(0, 8);
      localStorage.setItem(LS_MINE, code);
      return code;
    } catch (e) { return "friend"; }
  }

  function link() { return ORIGIN + "/?ref=" + encodeURIComponent(myCode()); }

  function referredBy() { try { return localStorage.getItem(LS_REFBY) || null; } catch (e) { return null; } }

  // Read a ?ref= from either the real query string or inside the hash route
  // (the app uses hash routing, so links may carry it in either place).
  function parseRef() {
    try {
      var q = new URLSearchParams(window.location.search).get("ref");
      if (q) return q;
      var h = window.location.hash || "";
      var m = h.match(/[?&]ref=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }

  // Call once on app start. Records first-touch referral + fires GA.
  function capture() {
    var ref = parseRef();
    if (!ref) return null;
    ref = String(ref).slice(0, 16);
    try {
      if (!localStorage.getItem(LS_REFBY)) {
        localStorage.setItem(LS_REFBY, ref);
        ga("referral_landing", { ref_code: ref });
      }
    } catch (e) {}
    return ref;
  }

  var DEFAULT_MSG =
    "I'm prepping for IELTS/TOEFL/PTE/GRE free on LandingPrep — 1,000+ free mock tests with instant band scores and an speaking partner that talks back. No signup, no fees. Try it 👇";

  // Open the native share sheet (mobile) or WhatsApp (desktop fallback) with a
  // pre-written invite + the user's referral link. opts: { text, title, channel }.
  function invite(opts) {
    var o = opts || {};
    var url = link();
    var text = (o.text || DEFAULT_MSG);
    var full = text + "\n" + url;

    if (o.channel === "whatsapp") {
      ga("referral_share", { method: "whatsapp" });
      window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank", "noopener");
      return;
    }
    if (navigator.share) {
      ga("referral_share", { method: "web_share" });
      navigator.share({ title: o.title || "LandingPrep — free exam prep", text: text, url: url }).catch(function () {});
      return;
    }
    // Desktop, no Web Share API → WhatsApp web is the most-used channel for our audience.
    ga("referral_share", { method: "whatsapp_fallback" });
    window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank", "noopener");
  }

  // Copy the invite link to the clipboard (for a "Copy link" button).
  function copyLink() {
    var url = link();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(url).then(function () { ga("referral_share", { method: "copy" }); return true; }).catch(function () { return false; });
      }
    } catch (e) {}
    return Promise.resolve(false);
  }

  // Fire when a referred visitor signs up (call from the auth success path).
  function trackSignup() {
    var ref = referredBy();
    if (ref) ga("referral_signup", { ref_code: ref });
  }

  window.LP_REFERRAL = { capture: capture, invite: invite, link: link, myCode: myCode, referredBy: referredBy, copyLink: copyLink, trackSignup: trackSignup };
})();
