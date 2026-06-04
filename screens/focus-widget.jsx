/* global React, window */
"use strict";

// LandingPrep — floating Focus Timer + Study Music widget. Mounted once at the app
// root so it's on every page and keeps running as the user navigates. The timer is a
// thin view over window.LP_FOCUS; the music streams from YouTube (curated, verified
// embeddable channels) in a small VISIBLE player, plus a "paste any link" field so the
// user can play their own track (e.g. flute). The panel is always mounted (toggled on/
// off-screen with CSS) so the music keeps playing when it's closed and across pages.
(function () {
  const { useState, useEffect } = React;
  const PF = [15, 25, 50], PB = [5, 10];

  // Verified embeddable study-music streams (tested live). yt = null means "Off".
  const TRACKS = [
    { ic: "🔇", name: "Off",        yt: null },
    { ic: "🎧", name: "Lo-fi",      yt: "5yx6BWlEVcY" },
    { ic: "🎹", name: "Jazz Piano", yt: "Dx5qFachd3A" },
    { ic: "🌌", name: "Synthwave",  yt: "4xDzrJKXOOY" },
    { ic: "🌧️", name: "Rain",       yt: "q76bMs-NwRk" },
    { ic: "🎻", name: "Classical",  yt: "jgpJVI3tDbY" },
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
    useEffect(() => { if (!window.LP_FOCUS) return; return window.LP_FOCUS.subscribe(() => force((x) => x + 1)); }, []);

    const F = window.LP_FOCUS;
    if (!F) return null;
    const s = F.get();
    if (s.hidden) return null;

    const running = s.running;
    const modeMin = s.mode === "focus" ? s.focusMin : s.mode === "long" ? F.LONG_MIN : s.breakMin;
    const total = modeMin * 60;
    const pct = total > 0 ? Math.round(((total - s.secs) / total) * 100) : 0;
    const mm = String(Math.floor(s.secs / 60)).padStart(2, "0");
    const ss = String(s.secs % 60).padStart(2, "0");
    const label = s.mode === "focus" ? "Focus" : s.mode === "long" ? "Long break" : "Break";
    const nowName = (TRACKS.find((t) => t.yt === track) || {}).name;

    const playCustom = () => { const id = ytId(customUrl); if (id) { setTrack(id); setCustomUrl(""); } };

    return (
      <>
        <button className={"focus-fab" + (running ? " ticking" : "")} onClick={() => setOpen((o) => !o)} aria-label="Focus timer and study music" title="Focus timer & study music">
          {running ? <span className="focus-fab-time">{mm}<small>:{ss}</small></span> : <span className="focus-fab-icon">🍅</span>}
        </button>

        {/* Always mounted; toggled on/off-screen via CSS so the music iframe keeps playing when closed + across navigation. */}
        <div className={"focus-panel " + (open ? "open" : "closed")} role="dialog" aria-label="Focus timer and study music" aria-hidden={!open}>
          <div className="focus-panel-head">
            <strong>🍅 Focus &amp; Music</strong>
            <button className="focus-x" onClick={() => setOpen(false)} aria-label="Close" tabIndex={open ? 0 : -1}>✕</button>
          </div>

          <div className="focus-mini">
            <div className={"pomo-ring small " + (s.mode === "focus" ? "focus" : "rest")} style={{ "--pct": pct + "%" }}>
              <div className="pomo-inner">
                <div className="pomo-time">{mm}:{ss}</div>
                <div className="pomo-mode">{label}</div>
              </div>
            </div>
            <div className="pomo-dots">{Array.from({ length: F.LONG_AFTER }).map((_, i) => <span key={i} className={"pomo-dot" + (i < s.cycle ? " on" : "")} />)}</div>
            <div className="tool-row btns pomo-btns">
              <button className="tool-btn" onClick={F.startStop} tabIndex={open ? 0 : -1}>{running ? "⏸ Pause" : "▶ Start"}</button>
              <button className="tool-btn ghost" onClick={F.skip} tabIndex={open ? 0 : -1}>⏭</button>
              <button className="tool-btn ghost" onClick={F.reset} tabIndex={open ? 0 : -1}>↺</button>
            </div>
            <div className="pomo-settings small">
              <div className="pomo-set-group"><span>Focus</span>{PF.map((m) => <button key={m} className={"pomo-chip" + (s.focusMin === m ? " on" : "")} onClick={() => F.setFocus(m)} tabIndex={open ? 0 : -1}>{m}</button>)}</div>
              <div className="pomo-set-group"><span>Break</span>{PB.map((m) => <button key={m} className={"pomo-chip" + (s.breakMin === m ? " on" : "")} onClick={() => F.setBreak(m)} tabIndex={open ? 0 : -1}>{m}</button>)}</div>
            </div>
            <div className="pomo-stats small"><strong>{s.sessions}</strong> today · <strong>{s.minutes}</strong> min</div>
          </div>

          <div className="focus-sounds">
            <div className="fs-title">🎧 Study music{nowName ? " — " + nowName : ""}</div>
            {track && (
              <iframe className="focus-yt" title="Study music"
                src={"https://www.youtube-nocookie.com/embed/" + track + "?autoplay=1&playsinline=1"}
                allow="autoplay; encrypted-media" />
            )}
            <div className="fs-options">
              {TRACKS.map((t) => (
                <button key={t.name} className={"fs-opt" + (track === t.yt ? " on" : "")} onClick={() => setTrack(t.yt)} title={t.name} tabIndex={open ? 0 : -1}>
                  <span className="fs-ic">{t.ic}</span><span className="fs-lbl">{t.name}</span>
                </button>
              ))}
            </div>
            <div className="fs-custom">
              <input type="text" placeholder="Paste a YouTube link (flute, etc.)" value={customUrl} tabIndex={open ? 0 : -1}
                onChange={(e) => setCustomUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") playCustom(); }} />
              <button className="tool-btn" onClick={playCustom} tabIndex={open ? 0 : -1}>▶</button>
            </div>
            <p className="fs-note">Music streams from YouTube — tap once to start it. Tap Off to stop.</p>
          </div>

          <button className="focus-hide-link" onClick={() => F.setHidden(true)} tabIndex={open ? 0 : -1}>Hide this button — bring it back from Tools → Focus Timer</button>
        </div>
      </>
    );
  }

  window.LP_FocusWidget = FocusWidget;
})();
