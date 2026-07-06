(function() {
  const { useState } = React;
  function parseRwFibPassage(passage) {
    const parts = [];
    const re = /__(\d+)__/g;
    let last = 0, m;
    while ((m = re.exec(passage)) !== null) {
      if (m.index > last) parts.push({ type: "text", text: passage.slice(last, m.index) });
      parts.push({ type: "blank", index: parseInt(m[1], 10) });
      last = m.index + m[0].length;
    }
    if (last < passage.length) parts.push({ type: "text", text: passage.slice(last) });
    return parts;
  }
  function parseFibPassage(passage) {
    const parts = [];
    const re = /__(\d+)\[([^\]]+)\]__/g;
    let last = 0, m;
    while ((m = re.exec(passage)) !== null) {
      if (m.index > last) parts.push({ type: "text", text: passage.slice(last, m.index) });
      parts.push({ type: "blank", index: parseInt(m[1], 10), options: m[2].split("|") });
      last = m.index + m[0].length;
    }
    if (last < passage.length) parts.push({ type: "text", text: passage.slice(last) });
    return parts;
  }
  function PTEReadingSection({ sec, answers, setAnswer, sectionId }) {
    const items = sec.items || [];
    const [idx, setIdx] = useState(0);
    const total = items.length;
    const current = items[idx];
    if (!current) return /* @__PURE__ */ React.createElement("div", { className: "pte-empty" }, "No items available for this section.");
    const handleNext = () => setIdx((i) => Math.min(total - 1, i + 1));
    const handlePrev = () => setIdx((i) => Math.max(0, i - 1));
    const answered = items.filter((it) => {
      const a = answers[sectionId + "_" + it.id];
      return a !== void 0 && a !== null && a !== "" && !(Array.isArray(a) && a.length === 0) && !(typeof a === "object" && !Array.isArray(a) && Object.keys(a).length === 0);
    }).length;
    const TYPE_LABELS = {
      reading_writing_fill_blanks: "Reading & Writing: Fill in the Blanks",
      fill_in_blanks: "Reading: Fill in the Blanks",
      reorder_paragraphs: "Re-order Paragraphs",
      multiple_choice_multiple: "Multiple Choice (Multiple Answer)",
      multiple_choice_single: "Multiple Choice (Single Answer)"
    };
    const INSTRUCTIONS = {
      reading_writing_fill_blanks: "There are some gaps in the text below. Select the best word from the word bank to fill each gap.",
      fill_in_blanks: "Below is a text with blanks. Click on each blank and select the appropriate option from the dropdown list.",
      reorder_paragraphs: "The text boxes in the right panel have been placed in a random order. Restore the original order by dragging the boxes into the left panel.",
      multiple_choice_multiple: "Read the text and answer the question by selecting ALL correct responses.",
      multiple_choice_single: "Read the text and answer the question by selecting the correct response."
    };
    return /* @__PURE__ */ React.createElement("div", { className: "pte-shell" }, /* @__PURE__ */ React.createElement("div", { className: "pte-topbar" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-counter" }, "Item ", /* @__PURE__ */ React.createElement("strong", null, idx + 1), " of ", /* @__PURE__ */ React.createElement("strong", null, total)), /* @__PURE__ */ React.createElement("div", { className: "pte-progress-track" }, /* @__PURE__ */ React.createElement("div", { className: "pte-progress-fill", style: { width: `${(idx + 1) / total * 100}%` } })), /* @__PURE__ */ React.createElement("div", { className: "pte-answered-count" }, answered, "/", total, " answered")), /* @__PURE__ */ React.createElement("div", { className: "pte-item-label-bar" }, /* @__PURE__ */ React.createElement("span", { className: "pte-item-type-pill" }, TYPE_LABELS[current.questionType] || current.questionType)), /* @__PURE__ */ React.createElement("div", { className: "pte-instruction" }, INSTRUCTIONS[current.questionType] || "Answer the question below."), /* @__PURE__ */ React.createElement("div", { className: "pte-item-body" }, /* @__PURE__ */ React.createElement(
      PTEItem,
      {
        item: current,
        answer: answers[sectionId + "_" + current.id],
        onAnswer: (val) => setAnswer(sectionId + "_" + current.id, val)
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "pte-nav-row" }, /* @__PURE__ */ React.createElement("button", { className: "btn pte-nav-btn", onClick: handlePrev, disabled: idx === 0 }, "\u25C0 Previous"), /* @__PURE__ */ React.createElement("div", { className: "pte-dot-row" }, items.map((it, i) => {
      const a = answers[sectionId + "_" + it.id];
      const done = a !== void 0 && a !== null && a !== "" && !(Array.isArray(a) && a.length === 0) && !(typeof a === "object" && !Array.isArray(a) && Object.keys(a).length === 0);
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: it.id,
          className: "pte-dot" + (i === idx ? " active" : "") + (done ? " done" : ""),
          onClick: () => setIdx(i),
          title: `Item ${i + 1}`
        }
      );
    })), /* @__PURE__ */ React.createElement("button", { className: "btn pte-nav-btn", onClick: handleNext, disabled: idx === total - 1 }, "Next \u25B6")));
  }
  function PTEItem({ item, answer, onAnswer }) {
    const qt = item.questionType;
    if (qt === "reading_writing_fill_blanks") return /* @__PURE__ */ React.createElement(PTERwFib, { item, answer, onAnswer });
    if (qt === "fill_in_blanks") return /* @__PURE__ */ React.createElement(PTEFib, { item, answer, onAnswer });
    if (qt === "reorder_paragraphs") return /* @__PURE__ */ React.createElement(PTEReorder, { item, answer, onAnswer });
    if (qt === "multiple_choice_multiple") return /* @__PURE__ */ React.createElement(PTEMcqMulti, { item, answer, onAnswer });
    if (qt === "multiple_choice_single") return /* @__PURE__ */ React.createElement(PTEMcqSingle, { item, answer, onAnswer });
    if (item.options && item.options.length > 0) {
      return /* @__PURE__ */ React.createElement(
        PTEMcqSingle,
        {
          item: {
            ...item,
            questionType: "multiple_choice_single",
            question: item.question || item.prompt || item.text || ""
          },
          answer,
          onAnswer
        }
      );
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-unsupported" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("em", null, "Item type ", /* @__PURE__ */ React.createElement("code", null, qt), " \u2014 not yet rendered.")), item.passage && /* @__PURE__ */ React.createElement("p", { style: { whiteSpace: "pre-wrap" } }, item.passage));
  }
  function PTERwFib({ item, answer, onAnswer }) {
    const ans = answer || {};
    const wordBank = item.wordBank || [];
    const parsedPassage = parseRwFibPassage(item.passage || "");
    const blankIndices = parsedPassage.filter((p) => p.type === "blank").map((p) => p.index);
    const usedWords = Object.values(ans);
    const available = wordBank.filter((w) => !usedWords.includes(w));
    function handleBlankClick(index) {
      const updated = { ...ans };
      delete updated[index];
      onAnswer(Object.keys(updated).length ? updated : {});
    }
    function handleWordClick(word) {
      const firstEmpty = blankIndices.find((bi) => !ans[bi]);
      if (firstEmpty == null) return;
      onAnswer({ ...ans, [firstEmpty]: word });
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-rwfib" }, /* @__PURE__ */ React.createElement("div", { className: "pte-rwfib-passage" }, parsedPassage.map((seg, i) => {
      if (seg.type === "text") return /* @__PURE__ */ React.createElement("span", { key: i }, seg.text);
      const filled = ans[seg.index];
      return /* @__PURE__ */ React.createElement(
        "span",
        {
          key: i,
          className: "pte-blank" + (filled ? " filled" : ""),
          onClick: filled ? () => handleBlankClick(seg.index) : void 0,
          title: filled ? "Click to remove" : "Select a word below"
        },
        filled ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "pte-blank-word" }, filled), /* @__PURE__ */ React.createElement("span", { className: "pte-blank-x" }, "\u2715")) : /* @__PURE__ */ React.createElement("span", { className: "pte-blank-placeholder" }, "(", seg.index, ")")
      );
    })), /* @__PURE__ */ React.createElement("div", { className: "pte-word-bank-label" }, "Word Bank \u2014 click a word to place it in the next empty gap:"), /* @__PURE__ */ React.createElement("div", { className: "pte-word-bank" }, wordBank.map((w, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: "pte-word-chip" + (usedWords.includes(w) ? " used" : ""),
        disabled: usedWords.includes(w),
        onClick: () => handleWordClick(w)
      },
      w
    ))), Object.keys(ans).length > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn pte-clear-btn", onClick: () => onAnswer({}) }, "Clear all gaps"));
  }
  function PTEFib({ item, answer, onAnswer }) {
    const ans = answer || {};
    const parsedPassage = parseFibPassage(item.passage || "");
    function handleChange(index, val) {
      onAnswer({ ...ans, [index]: val });
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-fib" }, /* @__PURE__ */ React.createElement("div", { className: "pte-fib-passage" }, parsedPassage.map((seg, i) => {
      if (seg.type === "text") return /* @__PURE__ */ React.createElement("span", { key: i }, seg.text);
      return /* @__PURE__ */ React.createElement(
        "select",
        {
          key: i,
          className: "pte-fib-select" + (ans[seg.index] ? " filled" : ""),
          value: ans[seg.index] || "",
          onChange: (e) => handleChange(seg.index, e.target.value)
        },
        /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 choose \u2014"),
        (seg.options || []).map((opt, oi) => /* @__PURE__ */ React.createElement("option", { key: oi, value: opt }, opt))
      );
    })));
  }
  function PTEReorder({ item, answer, onAnswer }) {
    const paragraphs = item.paragraphs || [];
    const currentOrder = Array.isArray(answer) && answer.length ? answer : [];
    const placed = new Set(currentOrder);
    const unplaced = paragraphs.filter((p) => !placed.has(p.id));
    const orderedPlaced = currentOrder.map((id) => paragraphs.find((p) => p.id === id)).filter(Boolean);
    function moveToTarget(id) {
      onAnswer([...currentOrder, id]);
    }
    function removeFromTarget(id) {
      onAnswer(currentOrder.filter((x) => x !== id));
    }
    function moveUp(i) {
      if (i === 0) return;
      const o = [...currentOrder];
      [o[i - 1], o[i]] = [o[i], o[i - 1]];
      onAnswer(o);
    }
    function moveDown(i) {
      if (i === currentOrder.length - 1) return;
      const o = [...currentOrder];
      [o[i], o[i + 1]] = [o[i + 1], o[i]];
      onAnswer(o);
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-cols" }, /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-panel source" }, /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-panel-title" }, "Source \u2014 click a paragraph to add it to the right"), unplaced.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-empty" }, "All paragraphs placed") : unplaced.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, className: "pte-para-card source-card", onClick: () => moveToTarget(p.id) }, /* @__PURE__ */ React.createElement("span", { className: "pte-para-id" }, p.id), /* @__PURE__ */ React.createElement("span", { className: "pte-para-text" }, p.text)))), /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-panel target" }, /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-panel-title" }, "Target \u2014 arrange in correct order"), orderedPlaced.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "pte-reorder-empty" }, "Add paragraphs from the left") : orderedPlaced.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: p.id, className: "pte-para-card target-card" }, /* @__PURE__ */ React.createElement("div", { className: "pte-para-arrows" }, /* @__PURE__ */ React.createElement("button", { onClick: () => moveUp(i), disabled: i === 0 }, "\u25B2"), /* @__PURE__ */ React.createElement("button", { onClick: () => moveDown(i), disabled: i === orderedPlaced.length - 1 }, "\u25BC")), /* @__PURE__ */ React.createElement("span", { className: "pte-para-id" }, p.id), /* @__PURE__ */ React.createElement("span", { className: "pte-para-text" }, p.text), /* @__PURE__ */ React.createElement("button", { className: "pte-para-remove", "aria-label": "Remove paragraph", onClick: () => removeFromTarget(p.id) }, "\u2715")))));
  }
  function PTEMcqMulti({ item, answer, onAnswer }) {
    var _a;
    const selected = Array.isArray(answer) ? answer : [];
    const required = item.requiredCount || ((_a = item.correctAnswers) == null ? void 0 : _a.length) || 2;
    function toggle(opt) {
      if (selected.includes(opt)) {
        onAnswer(selected.filter((x) => x !== opt));
      } else {
        if (selected.length >= required) return;
        onAnswer([...selected, opt]);
      }
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-multi" }, item.passage && /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-passage" }, item.passage), /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-question" }, item.question), /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-note" }, "Select ", required, " option", required > 1 ? "s" : "", "."), /* @__PURE__ */ React.createElement("div", { className: "pte-options" }, (item.options || []).map((opt, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: "pte-option" + (selected.includes(opt) ? " selected" : "") }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: selected.includes(opt),
        onChange: () => toggle(opt)
      }
    ), opt))));
  }
  function PTEMcqSingle({ item, answer, onAnswer }) {
    return /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-single" }, item.passage && /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-passage" }, item.passage), /* @__PURE__ */ React.createElement("div", { className: "pte-mcq-question" }, item.question || item.prompt || ""), /* @__PURE__ */ React.createElement("div", { className: "pte-options" }, (item.options || []).map((opt, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: "pte-option" + (answer === opt ? " selected" : "") }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: item.id + "-opt",
        checked: answer === opt,
        onChange: () => onAnswer(opt)
      }
    ), opt))));
  }
  function PTEReadingReview({ sec, answers, sectionId }) {
    const items = sec.items || [];
    return /* @__PURE__ */ React.createElement("div", { className: "pte-review" }, /* @__PURE__ */ React.createElement("h3", { className: "pte-review-title" }, "PTE Reading \u2014 Review"), items.map((item, idx) => {
      const userAns = answers[sectionId + "_" + item.id];
      const qt = item.questionType;
      return /* @__PURE__ */ React.createElement("div", { key: item.id, className: "pte-review-item" }, /* @__PURE__ */ React.createElement("div", { className: "pte-review-item-header" }, /* @__PURE__ */ React.createElement("span", { className: "pte-review-num" }, "Item ", idx + 1), /* @__PURE__ */ React.createElement("span", { className: "pte-review-qtype" }, qt)), (qt === "reading_writing_fill_blanks" || qt === "fill_in_blanks") && (() => {
        const correctAnswers = item.correctAnswers || [];
        const userMap = userAns || {};
        const parsedP = qt === "reading_writing_fill_blanks" ? parseRwFibPassage(item.passage || "") : parseFibPassage(item.passage || "");
        const blanks = parsedP.filter((s) => s.type === "blank");
        return /* @__PURE__ */ React.createElement("div", { className: "pte-review-body" }, /* @__PURE__ */ React.createElement("div", { className: "pte-review-passage" }, parsedP.map((seg, i) => {
          if (seg.type === "text") return /* @__PURE__ */ React.createElement("span", { key: i }, seg.text);
          const userWord = userMap[seg.index];
          const correctWord = correctAnswers[seg.index - 1] || "?";
          const ok = userWord === correctWord;
          return /* @__PURE__ */ React.createElement("span", { key: i, className: "pte-review-blank " + (ok ? "correct" : "incorrect") }, userWord || "\u2014", !ok && /* @__PURE__ */ React.createElement("span", { className: "pte-review-correct-word" }, " (", correctWord, ")"));
        })), item.explanation && /* @__PURE__ */ React.createElement("div", { className: "pte-review-explanation" }, item.explanation));
      })(), qt === "reorder_paragraphs" && (() => {
        const correct = item.correctOrder || [];
        const user = Array.isArray(userAns) ? userAns : [];
        return /* @__PURE__ */ React.createElement("div", { className: "pte-review-body" }, /* @__PURE__ */ React.createElement("div", { className: "pte-review-orders" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Your order:"), " ", user.join(" \u2192 ") || "\u2014"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Correct order:"), " ", correct.join(" \u2192 "))), item.explanation && /* @__PURE__ */ React.createElement("div", { className: "pte-review-explanation" }, item.explanation));
      })(), qt === "multiple_choice_multiple" && (() => {
        const selected = Array.isArray(userAns) ? userAns : [];
        const expected = item.correctAnswers || [];
        return /* @__PURE__ */ React.createElement("div", { className: "pte-review-body" }, item.passage && /* @__PURE__ */ React.createElement("div", { className: "pte-review-passage-short" }, item.passage.substring(0, 200), "\u2026"), /* @__PURE__ */ React.createElement("div", { className: "pte-review-mcq-q" }, item.question), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Your answer:"), " ", selected.join("; ") || "\u2014"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Correct:"), " ", expected.join("; ")), item.explanation && /* @__PURE__ */ React.createElement("div", { className: "pte-review-explanation" }, item.explanation));
      })(), (qt === "multiple_choice_single" || !qt && item.options) && (() => {
        const ok = userAns === item.correctAnswer;
        return /* @__PURE__ */ React.createElement("div", { className: "pte-review-body" }, item.passage && /* @__PURE__ */ React.createElement("div", { className: "pte-review-passage-short" }, item.passage.substring(0, 200), "\u2026"), /* @__PURE__ */ React.createElement("div", { className: "pte-review-mcq-q" }, item.question || item.prompt || ""), /* @__PURE__ */ React.createElement("div", { className: "pte-review-answer " + (ok ? "correct" : "incorrect") }, /* @__PURE__ */ React.createElement("strong", null, "Your answer:"), " ", userAns || "\u2014"), !ok && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Correct:"), " ", item.correctAnswer), item.explanation && /* @__PURE__ */ React.createElement("div", { className: "pte-review-explanation" }, item.explanation));
      })());
    }));
  }
  function scorePteReading(sec, answers, sectionId) {
    const items = sec.items || [];
    let correct = 0, total = 0;
    for (const item of items) {
      const ua = answers[sectionId + "_" + item.id];
      const qt = item.questionType;
      if (qt === "reading_writing_fill_blanks" || qt === "fill_in_blanks") {
        const correctAnswers = item.correctAnswers || [];
        const userMap = ua || {};
        correctAnswers.forEach((ca, i) => {
          total++;
          if (userMap[i + 1] === ca) correct++;
        });
      } else if (qt === "reorder_paragraphs") {
        const correctOrder = item.correctOrder || [];
        const userOrder = Array.isArray(ua) ? ua : [];
        total += correctOrder.length;
        correctOrder.forEach((id, i) => {
          if (userOrder[i] === id) correct++;
        });
      } else if (qt === "multiple_choice_multiple") {
        const selected = Array.isArray(ua) ? ua : [];
        const expected = item.correctAnswers || [];
        total += expected.length;
        expected.forEach((e) => {
          if (selected.includes(e)) correct++;
        });
      } else if (qt === "multiple_choice_single") {
        total++;
        if (ua === item.correctAnswer) correct++;
      }
    }
    return { correct, total };
  }
  window.LP_PTE_RENDERER = { PTEReadingSection, PTEReadingReview, scorePteReading };
})();
