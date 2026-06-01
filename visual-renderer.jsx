// visual-renderer.jsx — renders chart/table/visual data for writing tasks.
//
// Two modes:
//   1. If task.visual exists (chartData / tableData / imageUrl etc.) → render it.
//   2. If task.prompt mentions chart/graph/table/map but no visual data
//      is attached → render a clearly-labelled SAMPLE chart so the student
//      has something to describe. This is a temporary stand-in until the
//      content bank includes real visuals.

(function () {
  // ── Detect what kind of visual a prompt is asking for ──────────────
  function detectVisualType(prompt) {
    const p = (prompt || "").toLowerCase();
    if (/\bpie\s*chart\b/.test(p)) return "pie";
    if (/\bline\s*graph\b|\bline\s*chart\b/.test(p)) return "line";
    if (/\bbar\s*chart\b/.test(p)) return "bar";
    if (/\btable\b/.test(p)) return "table";
    if (/\bmap\b|\bplan\b/.test(p)) return "map";
    if (/\bprocess\b|\bdiagram\b|\bflow\s*chart\b/.test(p)) return "process";
    if (/\bgraph\b|\bchart\b/.test(p)) return "bar"; // generic fallback
    return null;
  }

  // ── Deterministic synthetic data from prompt (stable per task) ─────
  function syntheticBarSeries(prompt) {
    let h = 0;
    for (let i = 0; i < (prompt || "").length; i++) h = ((h << 5) - h + prompt.charCodeAt(i)) | 0;
    const seed = Math.abs(h);
    const rng = (n) => ((seed * (n + 7) * 9301 + 49297) % 233280) / 233280;
    const years = ["2018", "2019", "2020", "2021", "2022"];
    const cities = ["City A", "City B", "City C"];
    const data = cities.map((c, ci) => ({
      label: c,
      values: years.map((_, yi) => Math.round(20 + rng(ci * 5 + yi) * 60)),
    }));
    return { years, cities, data };
  }

  const CHART_COLOURS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

  // ── Bar chart ────────────────────────────────────────────────────────
  function BarChart({ series, title, yLabel, sample }) {
    const W = 560, H = 280, padX = 52, padY = 30;
    const allValues = series.data.flatMap(s => s.values);
    const maxVal = Math.max(...allValues, 10);
    const barGroups = series.years.length;
    const groupW = (W - 2 * padX) / barGroups;
    const seriesCount = series.data.length;
    const barW = Math.max(6, (groupW - 8) / seriesCount);

    return (
      <div className="visual-card">
        <div className="visual-head">
          {sample && <span className="visual-sample-pill">SAMPLE</span>}
          <h4>{title || "Data comparison"}</h4>
          {yLabel && <span className="visual-axis-y">{yLabel}</span>}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="visual-svg" preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const y = H - padY - (H - 2 * padY) * f;
            return (
              <g key={i}>
                <line x1={padX} y1={y} x2={W - padX / 2} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={padX - 6} y={y + 4} fontSize="11" textAnchor="end" fill="#6b7280">{Math.round(maxVal * f)}</text>
              </g>
            );
          })}
          {series.data.map((s, si) =>
            s.values.map((v, yi) => {
              const x = padX + groupW * yi + 4 + si * barW;
              const h = (H - 2 * padY) * (v / maxVal);
              const y = H - padY - h;
              return <rect key={`${si}-${yi}`} x={x} y={y} width={barW - 2} height={h} fill={CHART_COLOURS[si % CHART_COLOURS.length]} rx="2" />;
            })
          )}
          {series.years.map((yr, i) => {
            const x = padX + groupW * i + groupW / 2;
            return <text key={i} x={x} y={H - 8} fontSize="11" textAnchor="middle" fill="#6b7280">{yr}</text>;
          })}
        </svg>
        <div className="visual-legend">
          {series.data.map((s, i) => (
            <span key={i} className="visual-legend-item">
              <i style={{ background: CHART_COLOURS[i % CHART_COLOURS.length] }} /> {s.label}
            </span>
          ))}
        </div>
        {sample && <div className="visual-note"><strong>Note:</strong> Sample chart — real exam papers supply specific data. Describe the trends, comparisons and key features shown.</div>}
      </div>
    );
  }

  // ── Line chart ───────────────────────────────────────────────────────
  function LineChart({ series, title, yLabel, sample }) {
    const W = 560, H = 260, padX = 52, padY = 30;
    const allValues = series.data.flatMap(s => s.values);
    const maxVal = Math.max(...allValues, 10);
    const minVal = Math.min(...allValues, 0);
    const range = maxVal - minVal || 1;
    const n = series.years.length;
    const xStep = (W - 2 * padX) / Math.max(1, n - 1);
    const toX = (i) => padX + i * xStep;
    const toY = (v) => H - padY - ((v - minVal) / range) * (H - 2 * padY);

    return (
      <div className="visual-card">
        <div className="visual-head">
          {sample && <span className="visual-sample-pill">SAMPLE</span>}
          <h4>{title || "Trends over time"}</h4>
          {yLabel && <span className="visual-axis-y">{yLabel}</span>}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="visual-svg" preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const v = minVal + range * f;
            const y = toY(v);
            return (
              <g key={i}>
                <line x1={padX} y1={y} x2={W - padX / 2} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={padX - 6} y={y + 4} fontSize="11" textAnchor="end" fill="#6b7280">{Math.round(v)}</text>
              </g>
            );
          })}
          {series.data.map((s, si) => {
            const colour = CHART_COLOURS[si % CHART_COLOURS.length];
            const pts = s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
            return (
              <g key={si}>
                <polyline points={pts} fill="none" stroke={colour} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {s.values.map((v, i) => <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill={colour} stroke="#fff" strokeWidth="1.5" />)}
              </g>
            );
          })}
          {series.years.map((yr, i) => (
            <text key={i} x={toX(i)} y={H - 8} fontSize="11" textAnchor="middle" fill="#6b7280">{yr}</text>
          ))}
        </svg>
        <div className="visual-legend">
          {series.data.map((s, i) => (
            <span key={i} className="visual-legend-item">
              <i style={{ background: CHART_COLOURS[i % CHART_COLOURS.length] }} /> {s.label}
            </span>
          ))}
        </div>
        {sample && <div className="visual-note"><strong>Note:</strong> Sample chart — describe the trends, peaks and overall patterns shown in the line graph.</div>}
      </div>
    );
  }

  // ── Table ──────────────────────────────────────────────────────────
  function TableView({ data, sample }) {
    return (
      <div className="visual-card">
        <div className="visual-head">
          {sample && <span className="visual-sample-pill">SAMPLE</span>}
          <h4>{data.title || "Data table"}</h4>
        </div>
        <table className="visual-table">
          <thead>
            <tr>{(data.headers || []).map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {(data.rows || []).map((row, ri) => (
              <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
        {sample && <div className="visual-note"><strong>Note:</strong> Sample table — describe the rows, columns, and most striking comparisons.</div>}
      </div>
    );
  }

  // ── Pie chart (synthetic for now) ─────────────────────────────────
  function PieChart({ data, sample }) {
    const slices = data.slices || [
      { label: "Category A", value: 35 },
      { label: "Category B", value: 25 },
      { label: "Category C", value: 22 },
      { label: "Category D", value: 18 },
    ];
    const total = slices.reduce((s, x) => s + x.value, 0);
    const colours = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
    const R = 80, cx = 120, cy = 100;
    let a = -Math.PI / 2;
    const paths = slices.map((s, i) => {
      const frac = s.value / total;
      const a2 = a + frac * 2 * Math.PI;
      const x1 = cx + R * Math.cos(a), y1 = cy + R * Math.sin(a);
      const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      const large = frac > 0.5 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
      a = a2;
      return { d, colour: colours[i % colours.length], pct: Math.round(frac * 100), label: s.label };
    });
    return (
      <div className="visual-card">
        <div className="visual-head">
          {sample && <span className="visual-sample-pill">SAMPLE</span>}
          <h4>{data.title || "Distribution"}</h4>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 240 200" style={{ width: 220, height: 180 }}>
            {paths.map((p, i) => <path key={i} d={p.d} fill={p.colour} stroke="#fff" strokeWidth="2" />)}
          </svg>
          <div className="visual-legend" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            {paths.map((p, i) => (
              <span key={i} className="visual-legend-item">
                <i style={{ background: p.colour }} /> {p.label} — {p.pct}%
              </span>
            ))}
          </div>
        </div>
        {sample && <div className="visual-note"><strong>Note:</strong> Sample distribution — describe the largest, smallest and any notable proportions.</div>}
      </div>
    );
  }

  // ── Map / process placeholder (kept simple for now) ───────────────
  function GenericPlaceholder({ kind, sample }) {
    const labels = { map: "Map / Plan", process: "Process Diagram" };
    return (
      <div className="visual-card visual-placeholder">
        <div className="visual-head">
          {sample && <span className="visual-sample-pill">SAMPLE</span>}
          <h4>{labels[kind] || "Visual"}</h4>
        </div>
        <div className="visual-placeholder-body">
          <span className="visual-placeholder-icon">{kind === "map" ? "🗺️" : "🔄"}</span>
          <p>
            This task asks you to describe a <strong>{kind}</strong>.
            Visual content for this specific test is not yet attached. Practice by describing the
            general features such a {kind} would contain — for a map, key locations and their
            relative position; for a process, the sequence of stages.
          </p>
        </div>
      </div>
    );
  }

  // ── Main entry: renders whatever's appropriate ────────────────────
  function VisualRenderer({ task }) {
    if (!task) return null;
    const explicit = task.visual || task.visualData || task.chart;
    const promptStr = task.prompt || "";

    // 1) Explicit visual data on the task → render it.
    if (explicit) {
      if (explicit.chartType === "line" || explicit.type === "line") {
        const series = explicit.series
          ? { years: explicit.xAxis || [], data: explicit.series.map(s => ({ label: s.label, values: s.values || [] })) }
          : syntheticBarSeries(promptStr);
        return <LineChart series={series} title={explicit.title} yLabel={explicit.yLabel} />;
      }
      if (explicit.chartType === "bar" || explicit.type === "bar") {
        const series = explicit.series
          ? { years: explicit.xAxis || [], cities: explicit.series.map(s => s.label || "Series"), data: explicit.series.map(s => ({ label: s.label, values: s.values || [] })) }
          : syntheticBarSeries(promptStr);
        return <BarChart series={series} title={explicit.title} yLabel={explicit.yLabel} />;
      }
      if (explicit.chartType === "pie" || explicit.type === "pie") return <PieChart data={explicit} />;
      if (explicit.chartType === "table" || explicit.type === "table" || Array.isArray(explicit.rows)) return <TableView data={explicit} />;
      if (explicit.imageUrl) return (
        <div className="visual-card">
          <img src={explicit.imageUrl} alt={explicit.title || "Visual"} style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }} />
        </div>
      );
    }

    // 2) Prompt references a visual but none is attached → synthetic sample.
    const detected = detectVisualType(promptStr);
    if (!detected) return null;

    if (detected === "bar") return <BarChart series={syntheticBarSeries(promptStr)} sample />;
    if (detected === "line") return <LineChart series={syntheticBarSeries(promptStr)} sample />;
    if (detected === "pie") return <PieChart data={{}} sample />;
    if (detected === "table") return <TableView data={{ headers: ["Year", "City A", "City B", "City C"], rows: ["2018","2019","2020","2021","2022"].map((y,i) => [y, 20+i*8, 30+i*6, 25+i*7]) }} sample />;
    return <GenericPlaceholder kind={detected} sample />;
  }

  window.LP_VisualRenderer = VisualRenderer;
})();
