/* global React, window */
"use strict";

// LandingPrep — tiny Markdown → React renderer for AI answers (headings, bold,
// bullets, numbered lists, inline code). Keeps AI output clean and readable
// instead of showing raw ** and * characters.
(function () {
  function inline(s) {
    const out = [];
    const re = /\*\*(.+?)\*\*|__(.+?)__|`(.+?)`|\*(.+?)\*/g;
    let last = 0, m, k = 0;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[1] != null) out.push(React.createElement("strong", { key: k++ }, m[1]));
      else if (m[2] != null) out.push(React.createElement("strong", { key: k++ }, m[2]));
      else if (m[3] != null) out.push(React.createElement("code", { key: k++ }, m[3]));
      else out.push(React.createElement("em", { key: k++ }, m[4]));
      last = re.lastIndex;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }

  function renderMarkdown(text) {
    const lines = String(text == null ? "" : text).split(/\n/);
    const blocks = [];
    let list = null;
    const flush = () => { if (list) { blocks.push(list); list = null; } };
    lines.forEach((raw) => {
      const line = raw.replace(/\s+$/, "");
      if (!line.trim()) { flush(); return; }
      let m;
      if ((m = line.match(/^(#{1,4})\s+(.*)/))) { flush(); blocks.push({ t: "h", lvl: m[1].length, text: m[2] }); return; }
      // A whole-line bold label like **Strengths:** → treat as a subheading
      if ((m = line.match(/^\*\*(.+?):\*\*\s*$/))) { flush(); blocks.push({ t: "h", lvl: 3, text: m[1] }); return; }
      if ((m = line.match(/^\s*(?:[-*•])\s+(.*)/))) { if (!list || list.t !== "ul") { flush(); list = { t: "ul", items: [] }; } list.items.push(m[1]); return; }
      if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { if (!list || list.t !== "ol") { flush(); list = { t: "ol", items: [] }; } list.items.push(m[1]); return; }
      flush(); blocks.push({ t: "p", text: line });
    });
    flush();
    return blocks.map((b, i) => {
      if (b.t === "h") return React.createElement("h" + Math.min(4, b.lvl + 1), { key: i, className: "md-h" }, inline(b.text));
      if (b.t === "ul") return React.createElement("ul", { key: i, className: "md-ul" }, b.items.map((it, j) => React.createElement("li", { key: j }, inline(it))));
      if (b.t === "ol") return React.createElement("ol", { key: i, className: "md-ol" }, b.items.map((it, j) => React.createElement("li", { key: j }, inline(it))));
      return React.createElement("p", { key: i, className: "md-p" }, inline(b.text));
    });
  }

  function Markdown({ text }) { return React.createElement("div", { className: "md-body" }, renderMarkdown(text)); }

  window.LP_MD = renderMarkdown;
  window.LP_Markdown = Markdown;
})();
