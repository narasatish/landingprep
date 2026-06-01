/* global React, window */
"use strict";

// LandingPrep — hand-drawn SVG landmark illustrations per destination country.
// Self-contained (no external image assets) so they work offline and stay crisp.
(function () {
  const L = {
    usa: { bg: "#3c3b6e", el: (
      <g fill="#fff">
        <rect x="19" y="56" width="11" height="29" /><rect x="32" y="46" width="13" height="39" />
        <rect x="48" y="38" width="10" height="47" /><rect x="51" y="26" width="3" height="12" />
        <rect x="60" y="50" width="12" height="35" /><rect x="73" y="58" width="9" height="27" />
        <rect x="35" y="50" width="2" height="2" /><rect x="40" y="55" width="2" height="2" />
      </g>) },
    canada: { bg: "#d52b1e", el: (
      <g fill="#fff">
        <rect x="47" y="30" width="6" height="55" /><ellipse cx="50" cy="44" rx="11" ry="4" />
        <ellipse cx="50" cy="58" rx="7" ry="3" /><rect x="49" y="14" width="2" height="16" />
      </g>) },
    uk: { bg: "#00247d", el: (
      <g fill="#fff">
        <rect x="41" y="32" width="18" height="53" /><polygon points="41,32 59,32 50,16" />
        <circle cx="50" cy="44" r="6" fill="#00247d" /><rect x="49.2" y="40" width="1.6" height="4.5" fill="#fff" /><rect x="50" y="43.2" width="3.5" height="1.6" fill="#fff" />
      </g>) },
    australia: { bg: "#0a7d8c", el: (
      <g fill="#fff">
        <path d="M16 82 Q26 52 38 82 Z" /><path d="M34 82 Q48 44 64 82 Z" /><path d="M58 82 Q72 54 84 82 Z" />
        <rect x="14" y="82" width="72" height="4" />
      </g>) },
    germany: { bg: "#1c1c1c", el: (
      <g fill="#ffce00">
        <rect x="26" y="40" width="48" height="7" /><rect x="29" y="33" width="42" height="5" />
        <rect x="29" y="47" width="5" height="38" /><rect x="39" y="47" width="5" height="38" />
        <rect x="48" y="47" width="5" height="38" /><rect x="57" y="47" width="5" height="38" /><rect x="66" y="47" width="5" height="38" />
      </g>) },
    ireland: { bg: "#169b62", el: (
      <g fill="#fff">
        <path d="M8 84 Q50 70 92 84 L92 88 L8 88 Z" opacity="0.5" />
        <rect x="45" y="42" width="9" height="43" /><polygon points="44,42 56,42 50,30" />
        <rect x="47" y="50" width="2" height="5" fill="#169b62" /><rect x="51" y="50" width="2" height="5" fill="#169b62" />
      </g>) },
    "new-zealand": { bg: "#0d5c3a", el: (
      <g fill="#fff">
        <polygon points="14,84 42,40 70,84" /><polygon points="34,84 62,46 86,84" opacity="0.85" />
        <polygon points="36,55 42,40 49,55" fill="#0d5c3a" opacity="0.25" />
      </g>) },
    singapore: { bg: "#ed2939", el: (
      <g fill="#fff">
        <rect x="30" y="46" width="6" height="39" /><rect x="47" y="46" width="6" height="39" /><rect x="64" y="46" width="6" height="39" />
        <path d="M24 40 L76 40 L70 47 L30 47 Z" /><ellipse cx="60" cy="38" rx="9" ry="2" />
      </g>) },
    netherlands: { bg: "#ae1c28", el: (
      <g fill="#fff">
        <polygon points="43,85 57,85 54,46 46,46" /><polygon points="44,46 56,46 50,36" />
        <rect x="48.5" y="20" width="3" height="50" transform="rotate(45 50 45)" />
        <rect x="48.5" y="20" width="3" height="50" transform="rotate(-45 50 45)" />
        <circle cx="50" cy="45" r="3" fill="#ae1c28" />
      </g>) },
  };

  function Landmark({ id, className }) {
    const d = L[id];
    if (!d) return null;
    return (
      <svg className={className} viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill={d.bg} />
        {d.el}
      </svg>
    );
  }

  window.LP_Landmark = Landmark;
})();
