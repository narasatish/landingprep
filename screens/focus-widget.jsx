/* global React, window */
"use strict";

// LandingPrep — floating Focus Timer + Study Sounds widget. Mounted once at the app
// root so it's available on every page (like the chat bubble) and keeps running as the
// user navigates. The timer is a thin view over window.LP_FOCUS; study sounds are
// generated with the Web Audio API (no audio files, no copyright, fully reliable).
(function () {
  const { useState, useEffect } = React;

  // ── Generative ambient sound engine (singleton) ──────────────────────────
  const Sounds = (function () {
    let ctx = null, gain = null, node = null, current = "off";
    function ensure() {
      if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return false; ctx = new A(); gain = ctx.createGain(); gain.gain.value = 0.4; gain.connect(ctx.destination); }
      if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
      return true;
    }
    function buffer(type) {
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      if (type === "brown") { let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } }
      else if (type === "pink") { let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; } }
      else { for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; }
      return buf;
    }
    function stop() { if (node) { try { node.stop(); } catch (e) {} try { node.disconnect(); } catch (e) {} node = null; } current = "off"; }
    function play(type, vol) {
      if (!ensure()) return; stop(); if (typeof vol === "number") gain.gain.value = vol;
      const src = ctx.createBufferSource(); src.buffer = buffer(type === "rain" ? "white" : type); src.loop = true;
      if (type === "rain") { const lo = ctx.createBiquadFilter(); lo.type = "lowpass"; lo.frequency.value = 1100; const hi = ctx.createBiquadFilter(); hi.type = "highpass"; hi.frequency.value = 320; src.connect(lo); lo.connect(hi); hi.connect(gain); }
      else { src.connect(gain); }
      try { src.start(); } catch (e) {}
      node = src; current = type;
    }
    function setVol(v) { if (gain) gain.gain.value = v; }
    return { play, stop, setVol, current: () => current };
  })();

  const SOUND_OPTS = [["off", "🔇", "Off"], ["rain", "🌧️", "Rain"], ["brown", "🟤", "Brown"], ["pink", "🌸", "Pink"], ["white", "⚪", "White"]];
  const PF = [15, 25, 50], PB = [5, 10];

  function FocusWidget() {
    const [, force] = useState(0);
    const [open, setOpen] = useState(false);
    const [sound, setSound] = useState("off");
    const [vol, setVol] = useState(0.4);
    useEffect(() => { if (!window.LP_FOCUS) return; return window.LP_FOCUS.subscribe(() => force((x) => x + 1)); }, []);

    const F = window.LP_FOCUS;
    if (!F) return null;
    const s = F.get();
    const running = s.running;
    const modeMin = s.mode === "focus" ? s.focusMin : s.mode === "long" ? F.LONG_MIN : s.breakMin;
    const total = modeMin * 60;
    const pct = total > 0 ? Math.round(((total - s.secs) / total) * 100) : 0;
    const mm = String(Math.floor(s.secs / 60)).padStart(2, "0");
    const ss = String(s.secs % 60).padStart(2, "0");
    const label = s.mode === "focus" ? "Focus" : s.mode === "long" ? "Long break" : "Break";

    const pickSound = (id) => { setSound(id); if (id === "off") Sounds.stop(); else Sounds.play(id, vol); };
    const changeVol = (v) => { setVol(v); Sounds.setVol(v); };

    return (
      <>
        <button className={"focus-fab" + (running ? " ticking" : "")} onClick={() => setOpen((o) => !o)} aria-label="Focus timer and study sounds" title="Focus timer & study sounds">
          {running ? <span className="focus-fab-time">{mm}<small>:{ss}</small></span> : <span className="focus-fab-icon">🍅</span>}
        </button>

        {open && (
          <div className="focus-panel" role="dialog" aria-label="Focus timer and study sounds">
            <div className="focus-panel-head">
              <strong>🍅 Focus &amp; Sounds</strong>
              <button className="focus-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
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
                <button className="tool-btn" onClick={F.startStop}>{running ? "⏸ Pause" : "▶ Start"}</button>
                <button className="tool-btn ghost" onClick={F.skip}>⏭</button>
                <button className="tool-btn ghost" onClick={F.reset}>↺</button>
              </div>
              <div className="pomo-settings small">
                <div className="pomo-set-group"><span>Focus</span>{PF.map((m) => <button key={m} className={"pomo-chip" + (s.focusMin === m ? " on" : "")} onClick={() => F.setFocus(m)}>{m}</button>)}</div>
                <div className="pomo-set-group"><span>Break</span>{PB.map((m) => <button key={m} className={"pomo-chip" + (s.breakMin === m ? " on" : "")} onClick={() => F.setBreak(m)}>{m}</button>)}</div>
              </div>
              <div className="pomo-stats small"><strong>{s.sessions}</strong> today · <strong>{s.minutes}</strong> min</div>
            </div>

            <div className="focus-sounds">
              <div className="fs-title">🎧 Study sounds</div>
              <div className="fs-options">
                {SOUND_OPTS.map(([id, ic, lbl]) => (
                  <button key={id} className={"fs-opt" + (sound === id ? " on" : "")} onClick={() => pickSound(id)} title={lbl}>
                    <span className="fs-ic">{ic}</span><span className="fs-lbl">{lbl}</span>
                  </button>
                ))}
              </div>
              <div className="fs-vol">
                <span>🔉</span>
                <input type="range" min="0" max="1" step="0.05" value={vol} onChange={(e) => changeVol(parseFloat(e.target.value))} aria-label="Volume" />
              </div>
              <p className="fs-note">Generated ambient sound — looped, private to this tab.</p>
            </div>
          </div>
        )}
      </>
    );
  }

  window.LP_FocusWidget = FocusWidget;
})();
