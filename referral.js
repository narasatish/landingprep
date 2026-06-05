"use strict";
(function() {
  var LS_MINE = "lp_my_ref";
  var LS_REFBY = "lp_ref_by";
  var ORIGIN = "https://landingprep.com";
  function ga(event, params) {
    try {
      if (window.gtag) window.gtag("event", event, params || {});
    } catch (e) {
    }
  }
  function myCode() {
    try {
      var uid = window.LP_AUTH && window.LP_AUTH.currentUser && window.LP_AUTH.currentUser.uid;
      if (uid) {
        var short = String(uid).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || null;
        if (short) {
          localStorage.setItem(LS_MINE, short);
          return short;
        }
      }
      var existing = localStorage.getItem(LS_MINE);
      if (existing) return existing;
      var code = (Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4)).slice(0, 8);
      localStorage.setItem(LS_MINE, code);
      return code;
    } catch (e) {
      return "friend";
    }
  }
  function link() {
    return ORIGIN + "/?ref=" + encodeURIComponent(myCode());
  }
  function referredBy() {
    try {
      return localStorage.getItem(LS_REFBY) || null;
    } catch (e) {
      return null;
    }
  }
  function parseRef() {
    try {
      var q = new URLSearchParams(window.location.search).get("ref");
      if (q) return q;
      var h = window.location.hash || "";
      var m = h.match(/[?&]ref=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }
  function capture() {
    var ref = parseRef();
    if (!ref) return null;
    ref = String(ref).slice(0, 16);
    try {
      if (!localStorage.getItem(LS_REFBY)) {
        localStorage.setItem(LS_REFBY, ref);
        ga("referral_landing", { ref_code: ref });
      }
    } catch (e) {
    }
    return ref;
  }
  var DEFAULT_MSG = "I'm prepping for IELTS/TOEFL/PTE/GRE free on LandingPrep \u2014 1,000+ free mock tests with instant band scores and an AI speaking partner that talks back. No signup, no fees. Try it \u{1F447}";
  function invite(opts) {
    var o = opts || {};
    var url = link();
    var text = o.text || DEFAULT_MSG;
    var full = text + "\n" + url;
    if (o.channel === "whatsapp") {
      ga("referral_share", { method: "whatsapp" });
      window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank", "noopener");
      return;
    }
    if (navigator.share) {
      ga("referral_share", { method: "web_share" });
      navigator.share({ title: o.title || "LandingPrep \u2014 free exam prep", text, url }).catch(function() {
      });
      return;
    }
    ga("referral_share", { method: "whatsapp_fallback" });
    window.open("https://wa.me/?text=" + encodeURIComponent(full), "_blank", "noopener");
  }
  function copyLink() {
    var url = link();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(url).then(function() {
          ga("referral_share", { method: "copy" });
          return true;
        }).catch(function() {
          return false;
        });
      }
    } catch (e) {
    }
    return Promise.resolve(false);
  }
  function trackSignup() {
    var ref = referredBy();
    if (ref) ga("referral_signup", { ref_code: ref });
  }
  window.LP_REFERRAL = { capture, invite, link, myCode, referredBy, copyLink, trackSignup };
})();
