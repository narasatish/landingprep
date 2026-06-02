"use strict";
(function() {
  function rr(x, a, b, w, h, r) {
    x.beginPath();
    x.moveTo(a + r, b);
    x.arcTo(a + w, b, a + w, b + h, r);
    x.arcTo(a + w, b + h, a, b + h, r);
    x.arcTo(a, b + h, a, b, r);
    x.arcTo(a, b, a + w, b, r);
    x.closePath();
  }
  function wrap(x, text, cx, cy, maxW, lh) {
    const words = String(text || "").split(/\s+/);
    let line = "", y = cy;
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (x.measureText(t).width > maxW && line) {
        x.fillText(line, cx, y);
        line = w;
        y += lh;
      } else line = t;
    }
    if (line) x.fillText(line, cx, y);
    return y;
  }
  async function make(opts) {
    const o = opts || {};
    const W = 1080, H = 1080;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#7c3aed");
    g.addColorStop(1, "#06b6d4");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    x.fillStyle = "#ffffff";
    rr(x, 80, 150, 920, 800, 44);
    x.fill();
    x.textAlign = "center";
    x.fillStyle = "#4f46e5";
    x.font = "bold 46px Arial, sans-serif";
    x.fillText("\u{1F393} LandingPrep", W / 2, 280);
    x.fillStyle = "#0f172a";
    x.font = "600 42px Arial, sans-serif";
    wrap(x, o.title || "My result", W / 2, 380, 780, 50);
    x.fillStyle = "#0d9488";
    x.font = "bold 230px Arial, sans-serif";
    x.fillText(String(o.big != null ? o.big : ""), W / 2, 690);
    x.fillStyle = "#64748b";
    x.font = "600 38px Arial, sans-serif";
    x.fillText(o.label || "", W / 2, 760);
    x.fillStyle = "#475569";
    x.font = "400 32px Arial, sans-serif";
    wrap(x, o.sub || "", W / 2, 840, 820, 42);
    x.fillStyle = "#94a3b8";
    x.font = "400 30px Arial, sans-serif";
    x.fillText("Free practice \u2192 landingprep.com", W / 2, 1020);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    if (!blob) return;
    try {
      const file = new File([blob], "landingprep-result.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My LandingPrep result", text: o.title || "My result on LandingPrep" });
        return;
      }
    } catch (e) {
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landingprep-result.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3e3);
  }
  window.LP_ShareCard = { make };
})();
