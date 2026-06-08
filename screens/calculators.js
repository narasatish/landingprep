"use strict";
(function() {
  const { useState } = React;
  function pctToGpa4(p) {
    if (p >= 85) return 4;
    if (p >= 80) return 3.7;
    if (p >= 75) return 3.3;
    if (p >= 70) return 3;
    if (p >= 65) return 2.7;
    if (p >= 60) return 2.3;
    if (p >= 55) return 2;
    if (p >= 50) return 1.7;
    return 1;
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
      else if (type === "cgpa10") pct = v * 9.5;
      else pct = v / 4 * 100;
    }
    const ok = pct != null && pct >= 0 && pct <= 100;
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F9EE} GPA / Percentage / CGPA Converter"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Convert your marks between Indian percentage, 10-point CGPA and the US 4.0 GPA scale universities ask for."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "My score is in", /* @__PURE__ */ React.createElement("select", { value: type, onChange: (e) => setType(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "percentage" }, "Percentage (%)"), /* @__PURE__ */ React.createElement("option", { value: "cgpa10" }, "CGPA (out of 10)"), /* @__PURE__ */ React.createElement("option", { value: "gpa4" }, "GPA (out of 4)"))), /* @__PURE__ */ React.createElement("label", null, "Value", /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        step: "0.01",
        value: val,
        onChange: (e) => setVal(e.target.value),
        placeholder: type === "percentage" ? "e.g. 78" : type === "cgpa10" ? "e.g. 8.2" : "e.g. 3.3"
      }
    ))), ok ? /* @__PURE__ */ React.createElement("div", { className: "convert-out" }, /* @__PURE__ */ React.createElement("div", { className: "convert-grid" }, /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "Percentage"), /* @__PURE__ */ React.createElement("strong", null, pct.toFixed(1), "%")), /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "CGPA (10)"), /* @__PURE__ */ React.createElement("strong", null, (pct / 9.5).toFixed(2))), /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "US GPA (4.0)"), /* @__PURE__ */ React.createElement("strong", null, pctToGpa4(pct).toFixed(1))), /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "Classification"), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 13 } }, classOf(pct)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Indicative \u2014 universities use their own conversion (and many accept a WES/official evaluation). CGPA\u2194% uses the common \xD79.5 formula.")) : /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Enter a valid value to convert."));
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
      total = emi * n;
      interest = total - P;
    }
    const fmt = (x) => cur + " " + Math.round(x).toLocaleString(cur === "\u20B9" ? "en-IN" : "en-US");
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4B0} Education Loan EMI Calculator"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Estimate your monthly repayment and total interest on an education loan."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Currency", /* @__PURE__ */ React.createElement("select", { value: cur, onChange: (e) => setCur(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "$" }, "$ USD"), /* @__PURE__ */ React.createElement("option", { value: "\u20AC" }, "\u20AC EUR"), /* @__PURE__ */ React.createElement("option", { value: "\xA3" }, "\xA3 GBP"), /* @__PURE__ */ React.createElement("option", { value: "\u20B9" }, "\u20B9 INR"))), /* @__PURE__ */ React.createElement("label", null, "Loan amount", /* @__PURE__ */ React.createElement("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "e.g. 3000000" })), /* @__PURE__ */ React.createElement("label", null, "Interest rate (% p.a.)", /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.1", value: rate, onChange: (e) => setRate(e.target.value) })), /* @__PURE__ */ React.createElement("label", null, "Tenure (years)", /* @__PURE__ */ React.createElement("input", { type: "number", value: years, onChange: (e) => setYears(e.target.value) }))), emi != null ? /* @__PURE__ */ React.createElement("div", { className: "convert-out" }, /* @__PURE__ */ React.createElement("div", { className: "convert-grid" }, /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "Monthly EMI"), /* @__PURE__ */ React.createElement("strong", null, fmt(emi))), /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "Total interest"), /* @__PURE__ */ React.createElement("strong", null, fmt(interest))), /* @__PURE__ */ React.createElement("div", { className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, "Total payable"), /* @__PURE__ */ React.createElement("strong", null, fmt(total)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Indicative reducing-balance EMI. Actual terms (moratorium, processing fees, floating rates) vary by lender.")) : /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Enter loan amount, rate and tenure to calculate."));
  }
  const SALARY = { USA: 75e3, UK: 42e3, Canada: 55e3, Australia: 58e3, Germany: 55e3, Ireland: 5e4, "New Zealand": 48e3, Singapore: 6e4, Netherlands: 52e3 };
  const CCY = { USA: "$", UK: "\xA3", Canada: "C$", Australia: "A$", Germany: "\u20AC", Ireland: "\u20AC", "New Zealand": "NZ$", Singapore: "S$", Netherlands: "\u20AC" };
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
    const netAnnual = Math.max(1, sal * 0.75 * 0.45);
    const payback = totalCost > 0 ? totalCost / netAnnual : 0;
    const verdict = payback === 0 ? "" : payback <= 2 ? "Excellent ROI \u2014 pays back fast." : payback <= 4 ? "Solid ROI \u2014 typical for top destinations." : payback <= 6 ? "Reasonable \u2014 worth it for long-term/PR plans." : "Long payback \u2014 weigh PR, experience and non-financial value.";
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4C8} Cost & ROI Calculator"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Estimate your total study-abroad cost and how fast a higher salary pays it back. All values in your destination's currency."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Destination", /* @__PURE__ */ React.createElement("select", { value: country, onChange: (e) => {
      setCountry(e.target.value);
      setSalary("");
    } }, countries.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("label", null, "Course length (yrs)", /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.5", min: "1", max: "5", value: years, onChange: (e) => setYears(e.target.value) })), /* @__PURE__ */ React.createElement("label", null, "Tuition / yr (", sym, ")", /* @__PURE__ */ React.createElement("input", { type: "number", value: tuition, onChange: (e) => setTuition(e.target.value), placeholder: "e.g. 40000" })), /* @__PURE__ */ React.createElement("label", null, "Living / yr (", sym, ")", /* @__PURE__ */ React.createElement("input", { type: "number", value: living, onChange: (e) => setLiving(e.target.value), placeholder: "e.g. 16000" })), /* @__PURE__ */ React.createElement("label", null, "Scholarship (total ", sym, ")", /* @__PURE__ */ React.createElement("input", { type: "number", value: scholarship, onChange: (e) => setScholarship(e.target.value), placeholder: "optional" })), /* @__PURE__ */ React.createElement("label", null, "Expected salary / yr (", sym, ")", /* @__PURE__ */ React.createElement("input", { type: "number", value: salary, onChange: (e) => setSalary(e.target.value), placeholder: "default " + SALARY[country].toLocaleString() }))), tuition || living ? /* @__PURE__ */ React.createElement("div", { className: "roi-result" }, /* @__PURE__ */ React.createElement("div", { className: "roi-grid" }, /* @__PURE__ */ React.createElement("div", { className: "roi-cell" }, /* @__PURE__ */ React.createElement("span", null, "Total cost"), /* @__PURE__ */ React.createElement("strong", null, fmt(totalCost))), /* @__PURE__ */ React.createElement("div", { className: "roi-cell" }, /* @__PURE__ */ React.createElement("span", null, "Expected salary"), /* @__PURE__ */ React.createElement("strong", null, fmt(sal), "/yr")), /* @__PURE__ */ React.createElement("div", { className: "roi-cell" }, /* @__PURE__ */ React.createElement("span", null, "Est. net annual gain"), /* @__PURE__ */ React.createElement("strong", null, fmt(netAnnual))), /* @__PURE__ */ React.createElement("div", { className: "roi-cell highlight" }, /* @__PURE__ */ React.createElement("span", null, "Payback period"), /* @__PURE__ */ React.createElement("strong", null, payback ? payback.toFixed(1) + " yrs" : "\u2014"))), verdict && /* @__PURE__ */ React.createElement("p", { className: "roi-verdict" }, payback <= 4 ? "\u2705" : "\u2139\uFE0F", " ", verdict), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Indicative only. Net gain assumes ~45% of your abroad salary is disposable income above a home-country baseline, after tax and living costs. Real ROI depends on your field, city, currency and PR outcome.")) : /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Enter your tuition and living cost to see total cost and payback period."));
  }
  function CalculatorsPanel() {
    return /* @__PURE__ */ React.createElement("div", { className: "calc-panel" }, /* @__PURE__ */ React.createElement(RoiCalc, null), /* @__PURE__ */ React.createElement(GpaCalc, null), /* @__PURE__ */ React.createElement(LoanCalc, null));
  }
  window.LP_CalculatorsPanel = CalculatorsPanel;
})();
