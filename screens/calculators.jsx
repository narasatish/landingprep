/* global React, window */
"use strict";

// LandingPrep — study-abroad calculators: GPA/percentage/CGPA converter and an
// education-loan EMI calculator. Rendered as a Tools tab.
(function () {
  const { useState } = React;

  // Percentage → US 4.0 GPA band (indicative, WES-style)
  function pctToGpa4(p) {
    if (p >= 85) return 4.0; if (p >= 80) return 3.7; if (p >= 75) return 3.3;
    if (p >= 70) return 3.0; if (p >= 65) return 2.7; if (p >= 60) return 2.3;
    if (p >= 55) return 2.0; if (p >= 50) return 1.7; return 1.0;
  }
  function classOf(p) {
    if (p >= 70) return "First Class with Distinction";
    if (p >= 60) return "First Class";
    if (p >= 50) return "Second Class";
    if (p >= 40) return "Pass Class";
    return "Below passing";
  }

  function GpaCalc() {
    const [type, setType] = useState("percentage");
    const [val, setVal] = useState("");
    const v = parseFloat(val);
    let pct = null;
    if (!isNaN(v)) {
      if (type === "percentage") pct = v;
      else if (type === "cgpa10") pct = v * 9.5;          // common Indian formula
      else pct = (v / 4) * 100;                            // US GPA → % (approx)
    }
    const ok = pct != null && pct >= 0 && pct <= 100;
    return (
      <div className="tool-card">
        <h2>🧮 GPA / Percentage / CGPA Converter</h2>
        <p className="tool-sub">Convert your marks between Indian percentage, 10-point CGPA and the US 4.0 GPA scale universities ask for.</p>
        <div className="tool-row">
          <label>My score is in
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="cgpa10">CGPA (out of 10)</option>
              <option value="gpa4">GPA (out of 4)</option>
            </select>
          </label>
          <label>Value
            <input type="number" step="0.01" value={val} onChange={e => setVal(e.target.value)}
              placeholder={type === "percentage" ? "e.g. 78" : type === "cgpa10" ? "e.g. 8.2" : "e.g. 3.3"} />
          </label>
        </div>
        {ok ? (
          <div className="convert-out">
            <div className="convert-grid">
              <div className="convert-cell"><span>Percentage</span><strong>{pct.toFixed(1)}%</strong></div>
              <div className="convert-cell"><span>CGPA (10)</span><strong>{(pct / 9.5).toFixed(2)}</strong></div>
              <div className="convert-cell"><span>US GPA (4.0)</span><strong>{pctToGpa4(pct).toFixed(1)}</strong></div>
              <div className="convert-cell"><span>Classification</span><strong style={{ fontSize: 13 }}>{classOf(pct)}</strong></div>
            </div>
            <p className="tool-note">Indicative — universities use their own conversion (and many accept a WES/official evaluation). CGPA↔% uses the common ×9.5 formula.</p>
          </div>
        ) : <p className="tool-note">Enter a valid value to convert.</p>}
      </div>
    );
  }

  function LoanCalc() {
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("11");
    const [years, setYears] = useState("8");
    const [cur, setCur] = useState("$");
    const P = parseFloat(amount), R = parseFloat(rate), Y = parseFloat(years);
    let emi = null, total = null, interest = null;
    if (P > 0 && R >= 0 && Y > 0) {
      const r = R / 12 / 100, n = Y * 12;
      emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      total = emi * n; interest = total - P;
    }
    const fmt = (x) => cur + " " + Math.round(x).toLocaleString(cur === "₹" ? "en-IN" : "en-US");
    return (
      <div className="tool-card">
        <h2>💰 Education Loan EMI Calculator</h2>
        <p className="tool-sub">Estimate your monthly repayment and total interest on an education loan.</p>
        <div className="tool-row">
          <label>Currency
            <select value={cur} onChange={e => setCur(e.target.value)}>
              <option value="$">$ USD</option><option value="€">€ EUR</option><option value="£">£ GBP</option><option value="₹">₹ INR</option>
            </select>
          </label>
          <label>Loan amount
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 3000000" />
          </label>
          <label>Interest rate (% p.a.)
            <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
          </label>
          <label>Tenure (years)
            <input type="number" value={years} onChange={e => setYears(e.target.value)} />
          </label>
        </div>
        {emi != null ? (
          <div className="convert-out">
            <div className="convert-grid">
              <div className="convert-cell"><span>Monthly EMI</span><strong>{fmt(emi)}</strong></div>
              <div className="convert-cell"><span>Total interest</span><strong>{fmt(interest)}</strong></div>
              <div className="convert-cell"><span>Total payable</span><strong>{fmt(total)}</strong></div>
            </div>
            <p className="tool-note">Indicative reducing-balance EMI. Actual terms (moratorium, processing fees, floating rates) vary by lender.</p>
          </div>
        ) : <p className="tool-note">Enter loan amount, rate and tenure to calculate.</p>}
      </div>
    );
  }

  // ── Cost & ROI calculator: is studying abroad worth it? ────────────────────
  // Typical starting salaries (USD/yr) for international grads, by destination.
  const SALARY = { USA: 75000, UK: 42000, Canada: 55000, Australia: 58000, Germany: 55000, Ireland: 50000, "New Zealand": 48000, Singapore: 60000, Netherlands: 52000 };
  const CCY = { USA: "$", UK: "£", Canada: "C$", Australia: "A$", Germany: "€", Ireland: "€", "New Zealand": "NZ$", Singapore: "S$", Netherlands: "€" };

  function RoiCalc() {
    const countries = Object.keys(SALARY);
    const [country, setCountry] = useState("USA");
    const [years, setYears] = useState(2);
    const [tuition, setTuition] = useState("");
    const [living, setLiving] = useState("");
    const [scholarship, setScholarship] = useState("");
    const [salary, setSalary] = useState("");
    const sym = CCY[country] || "$";
    const fmt = (n) => sym + Math.round(n).toLocaleString();

    const tCost = (parseFloat(tuition) || 0) * (parseFloat(years) || 0);
    const lCost = (parseFloat(living) || 0) * (parseFloat(years) || 0);
    const schol = parseFloat(scholarship) || 0;
    const totalCost = Math.max(0, tCost + lCost - schol);
    const sal = parseFloat(salary) || SALARY[country];
    // Net annual gain vs a home baseline (~40% of abroad salary), after ~25% tax + living.
    const netAnnual = Math.max(1, sal * 0.75 * 0.45);
    const payback = totalCost > 0 ? totalCost / netAnnual : 0;
    const verdict = payback === 0 ? "" : payback <= 2 ? "Excellent ROI — pays back fast." : payback <= 4 ? "Solid ROI — typical for top destinations." : payback <= 6 ? "Reasonable — worth it for long-term/PR plans." : "Long payback — weigh PR, experience and non-financial value.";

    return (
      <div className="tool-card">
        <h2>📈 Cost &amp; ROI Calculator</h2>
        <p className="tool-sub">Estimate your total study-abroad cost and how fast a higher salary pays it back. All values in your destination's currency.</p>
        <div className="tool-row">
          <label>Destination
            <select value={country} onChange={(e) => { setCountry(e.target.value); setSalary(""); }}>{countries.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </label>
          <label>Course length (yrs)<input type="number" step="0.5" min="1" max="5" value={years} onChange={(e) => setYears(e.target.value)} /></label>
          <label>Tuition / yr ({sym})<input type="number" value={tuition} onChange={(e) => setTuition(e.target.value)} placeholder="e.g. 40000" /></label>
          <label>Living / yr ({sym})<input type="number" value={living} onChange={(e) => setLiving(e.target.value)} placeholder="e.g. 16000" /></label>
          <label>Scholarship (total {sym})<input type="number" value={scholarship} onChange={(e) => setScholarship(e.target.value)} placeholder="optional" /></label>
          <label>Expected salary / yr ({sym})<input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={"default " + SALARY[country].toLocaleString()} /></label>
        </div>
        {(tuition || living) ? (
          <div className="roi-result">
            <div className="roi-grid">
              <div className="roi-cell"><span>Total cost</span><strong>{fmt(totalCost)}</strong></div>
              <div className="roi-cell"><span>Expected salary</span><strong>{fmt(sal)}/yr</strong></div>
              <div className="roi-cell"><span>Est. net annual gain</span><strong>{fmt(netAnnual)}</strong></div>
              <div className="roi-cell highlight"><span>Payback period</span><strong>{payback ? payback.toFixed(1) + " yrs" : "—"}</strong></div>
            </div>
            {verdict && <p className="roi-verdict">{payback <= 4 ? "✅" : "ℹ️"} {verdict}</p>}
            <p className="tool-note">Indicative only. Net gain assumes ~45% of your abroad salary is disposable income above a home-country baseline, after tax and living costs. Real ROI depends on your field, city, currency and PR outcome.</p>
          </div>
        ) : <p className="tool-note">Enter your tuition and living cost to see total cost and payback period.</p>}
      </div>
    );
  }

  function CalculatorsPanel() {
    return (
      <div className="calc-panel">
        <RoiCalc />
        <GpaCalc />
        <LoanCalc />
      </div>
    );
  }
  window.LP_CalculatorsPanel = CalculatorsPanel;
})();
