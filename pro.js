/* pro.js — premium micro-interactions layer (additive + reversible).
   Currently: animated count-up on stat numbers when they scroll into view.
   Scroll-reveal + tab-fade already exist (app.jsx IntersectionObserver). Respects
   prefers-reduced-motion. Remove the <script> in index.html + this file to revert. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    if (el.getAttribute("data-counted")) return;
    var raw = (el.textContent || "").trim();
    var m = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var prefix = m[1], numStr = m[2], suffix = m[3];
    var target = parseFloat(numStr.replace(/,/g, ""));
    if (!isFinite(target) || target <= 0) return;
    el.setAttribute("data-counted", "1");
    var hasComma = numStr.indexOf(",") >= 0;
    var dur = 1100, start = null;
    function fmt(n) { n = Math.round(n); return hasComma ? n.toLocaleString("en-US") : String(n); }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  function observe() {
    var nums = [].slice.call(document.querySelectorAll(".lp-stat-n:not([data-counted])"));
    if (!nums.length) return false;
    if (reduce || typeof IntersectionObserver === "undefined") return true; // leave static, but "found"
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
    return true;
  }

  // Stats are client-rendered by React; poll briefly until they exist, and re-arm
  // on hash navigation so count-up works whenever the home view (re)mounts.
  function arm() {
    var tries = 0;
    var t = setInterval(function () { tries++; if (observe() || tries > 40) clearInterval(t); }, 250);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arm);
  else arm();
  window.addEventListener("hashchange", function () { setTimeout(arm, 300); });
})();
