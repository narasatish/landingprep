"use strict";
(function() {
  const { useState, useEffect } = React;
  const PF = [15, 25, 50], PB = [5, 10];
  const TRACKS = [
    { ic: "\u{1F507}", name: "Off", yt: null },
    { ic: "\u{1F3A7}", name: "Lo-fi", yt: "5yx6BWlEVcY" },
    { ic: "\u{1F3B9}", name: "Jazz Piano", yt: "Dx5qFachd3A" },
    { ic: "\u{1F30C}", name: "Synthwave", yt: "4xDzrJKXOOY" },
    { ic: "\u{1F327}\uFE0F", name: "Rain", yt: "q76bMs-NwRk" },
    { ic: "\u{1F3BB}", name: "Classical", yt: "jgpJVI3tDbY" }
  ];
  function ytId(u) {
    if (!u) return null;
    u = String(u).trim();
    if (/^[\w-]{11}$/.test(u)) return u;
    const m = u.match(/(?:v=|\/embed\/|youtu\.be\/|\/live\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function FocusWidget() {
    const [, force] = useState(0);
    const [open, setOpen] = useState(false);
    const [track, setTrack] = useState(null);
    const [customUrl, setCustomUrl] = useState("");
    useEffect(() => {
      if (!window.LP_FOCUS) return;
      return window.LP_FOCUS.subscribe(() => force((x) => x + 1));
    }, []);
    const F = window.LP_FOCUS;
    if (!F) return null;
    const s = F.get();
    if (s.hidden) return null;
    const running = s.running;
    const modeMin = s.mode === "focus" ? s.focusMin : s.mode === "long" ? F.LONG_MIN : s.breakMin;
    const total = modeMin * 60;
    const pct = total > 0 ? Math.round((total - s.secs) / total * 100) : 0;
    const mm = String(Math.floor(s.secs / 60)).padStart(2, "0");
    const ss = String(s.secs % 60).padStart(2, "0");
    const label = s.mode === "focus" ? "Focus" : s.mode === "long" ? "Long break" : "Break";
    const playCustom = () => {
      const id = ytId(customUrl);
      if (id) {
        setTrack(id);
        setCustomUrl("");
      }
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "focus-fab" + (running ? " ticking" : ""), onClick: () => setOpen((o) => !o), "aria-label": "Focus timer and study music", title: "Focus timer & study music" }, running ? /* @__PURE__ */ React.createElement("span", { className: "focus-fab-time" }, mm, /* @__PURE__ */ React.createElement("small", null, ":", ss)) : /* @__PURE__ */ React.createElement("span", { className: "focus-fab-icon" }, "\u{1F345}")), track && /* @__PURE__ */ React.createElement(
      "iframe",
      {
        className: "focus-music-frame",
        title: "Study music",
        src: "https://www.youtube-nocookie.com/embed/" + track + "?autoplay=1&playsinline=1",
        allow: "autoplay; encrypted-media"
      }
    ), open && /* @__PURE__ */ React.createElement("div", { className: "focus-panel", role: "dialog", "aria-label": "Focus timer and study music" }, /* @__PURE__ */ React.createElement("div", { className: "focus-panel-head" }, /* @__PURE__ */ React.createElement("strong", null, "\u{1F345} Focus & Music"), /* @__PURE__ */ React.createElement("button", { className: "focus-x", onClick: () => setOpen(false), "aria-label": "Close" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "focus-mini" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-ring small " + (s.mode === "focus" ? "focus" : "rest"), style: { "--pct": pct + "%" } }, /* @__PURE__ */ React.createElement("div", { className: "pomo-inner" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-time" }, mm, ":", ss), /* @__PURE__ */ React.createElement("div", { className: "pomo-mode" }, label))), /* @__PURE__ */ React.createElement("div", { className: "pomo-dots" }, Array.from({ length: F.LONG_AFTER }).map((_, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "pomo-dot" + (i < s.cycle ? " on" : "") }))), /* @__PURE__ */ React.createElement("div", { className: "tool-row btns pomo-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: F.startStop }, running ? "\u23F8 Pause" : "\u25B6 Start"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: F.skip }, "\u23ED"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: F.reset }, "\u21BA")), /* @__PURE__ */ React.createElement("div", { className: "pomo-settings small" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-set-group" }, /* @__PURE__ */ React.createElement("span", null, "Focus"), PF.map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "pomo-chip" + (s.focusMin === m ? " on" : ""), onClick: () => F.setFocus(m) }, m))), /* @__PURE__ */ React.createElement("div", { className: "pomo-set-group" }, /* @__PURE__ */ React.createElement("span", null, "Break"), PB.map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "pomo-chip" + (s.breakMin === m ? " on" : ""), onClick: () => F.setBreak(m) }, m)))), /* @__PURE__ */ React.createElement("div", { className: "pomo-stats small" }, /* @__PURE__ */ React.createElement("strong", null, s.sessions), " today \xB7 ", /* @__PURE__ */ React.createElement("strong", null, s.minutes), " min")), /* @__PURE__ */ React.createElement("div", { className: "focus-sounds" }, /* @__PURE__ */ React.createElement("div", { className: "fs-title" }, "\u{1F3A7} Study music"), /* @__PURE__ */ React.createElement("div", { className: "fs-options" }, TRACKS.map((t) => /* @__PURE__ */ React.createElement("button", { key: t.name, className: "fs-opt" + (track === t.yt ? " on" : ""), onClick: () => setTrack(t.yt), title: t.name }, /* @__PURE__ */ React.createElement("span", { className: "fs-ic" }, t.ic), /* @__PURE__ */ React.createElement("span", { className: "fs-lbl" }, t.name)))), /* @__PURE__ */ React.createElement("div", { className: "fs-custom" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Paste a YouTube link (flute, etc.)",
        value: customUrl,
        onChange: (e) => setCustomUrl(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") playCustom();
        }
      }
    ), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: playCustom }, "\u25B6")), track && /* @__PURE__ */ React.createElement("div", { className: "fs-now" }, "\u{1F50A} Playing \u2014 keeps going when you close this or change pages."), /* @__PURE__ */ React.createElement("p", { className: "fs-note" }, "Music streams from YouTube. Tap a tile to play, Off to stop.")), /* @__PURE__ */ React.createElement("button", { className: "focus-hide-link", onClick: () => F.setHidden(true) }, "Hide this button \u2014 bring it back from Tools \u2192 Focus Timer")));
  }
  window.LP_FocusWidget = FocusWidget;
})();
