// normalize-test.jsx
//
// Adapter that converts the ZIP test-bank schema into the shape expected by
// the existing mock-test engine. Keeps the runner untouched.
//
// ZIP test JSON (flat):
//   { id, exam, section, type, title, durationSeconds, questionCount,
//     instructions, questions:[{ id, questionType, prompt, options,
//     correctAnswer, ... }], passages?, listeningScripts?, questionGroups? }
//
// Engine wants:
//   { examId, testId, testType, title,
//     sections:[{ id, name, icon, timeSecs, type, parts/passages/tasks/cards }] }

(function () {

  // Map ZIP questionType strings → engine question types
  const QTYPE_MAP = {
    multiple_choice: "mcq",
    multiple_choice_single: "mcq",
    multiple_choice_multiple: "mcq_multi",
    multi_select: "mcq_multi",
    choose_two: "mcq_multi",
    true_false_not_given: "tfng",
    yes_no_not_given: "yng",
    fill_in_the_blanks: "fill",
    fill_in_the_blank: "fill",
    fill_in_blanks: "fill",
    sentence_completion: "sent_fill",
    form_field: "form_field",
    note_completion: "fill",
    notes_completion: "fill",
    short_answer: "fill",
    summary_completion: "fill",
    diagram_completion: "fill",
    label_diagram: "fill",
    form_completion: "form_completion",
    table_completion: "table_completion",
    flowchart_completion: "fill",
    map_labelling: "map_label",
    matching_categorise: "match_cat",
    plan_diagram_labelling: "mcq",
    matching: "match_heading",
    matching_headings: "match_heading",
    matching_information: "match_heading",
    matching_features: "match_heading",
    text_completion: "mcq",
    sentence_equivalence: "mcq_multi",
    reading_comprehension: "mcq",
    critical_reasoning: "mcq",
    problem_solving: "mcq",
    quantitative_comparison: "mcq",
    numeric_entry: "fill",
    multiple_answer: "mcq_multi",
    data_sufficiency: "mcq",
    two_part_analysis: "mcq",
    multi_source_reasoning: "mcq",
    table_analysis: "mcq",
    graphics_interpretation: "mcq",
    read_aloud: "speaking_task",
    repeat_sentence: "speaking_task",
    describe_image: "speaking_task",
    retell_lecture: "speaking_task",
    answer_short_question: "speaking_task",
    summarize_written_text: "writing_task",
    write_essay: "writing_task",
    essay: "writing_task",
    personal_introduction: "speaking_task",
    // PTE-specific reading item types — preserved as-is for PTEReadingSection
    reading_writing_fill_blanks: "pte_rwfib",
    reorder_paragraphs: "pte_reorder",
    fill_in_blanks: "pte_fib",
    // PTE Listening types
    select_missing_word: "mcq",
    highlight_incorrect_words: "pte_highlight",
    highlight_correct_summary: "mcq",
    summarize_spoken_text: "writing_task",
    write_from_dictation: "pte_dictation",
    writing_task: "writing_task",
    speaking_task: "speaking_task",
    // TOEFL-specific types
    factual_information: "mcq",
    negative_factual: "mcq",
    inference: "mcq",
    rhetorical_purpose: "mcq",
    vocabulary_in_context: "mcq",
    sentence_simplification: "mcq",
    insert_text: "mcq",
    prose_summary: "mcq_multi",
    // GRE writing types
    integrated_writing: "writing_task",
    academic_discussion: "writing_task",
    // GMAT writing types
    issue: "writing_task",
    argument: "writing_task",
  };

  // PTE item types that need special rendering
  const PTE_ITEM_TYPES = new Set([
    "pte_rwfib","pte_reorder","pte_fib","pte_highlight","pte_dictation",
    "reading_writing_fill_blanks","reorder_paragraphs","fill_in_blanks",
    "highlight_incorrect_words","write_from_dictation",
  ]);

  function normaliseOptionLabels(opts) {
    // Engine renders option letters A-E itself; strip any embedded "A. " prefix.
    return (opts || []).map(o => String(o || "").replace(/^[A-Z]\.\s*/, ""));
  }

  function letterFromAnswer(correctAnswer, options) {
    // ZIP may store the answer either as full text or letter; engine wants the letter.
    if (!correctAnswer) return "";
    const ca = String(correctAnswer).trim();
    if (/^[A-E]$/.test(ca)) return ca;
    if (Array.isArray(options)) {
      const idx = options.findIndex(o => String(o).trim() === ca || String(o).trim().replace(/^[A-Z]\.\s*/, "") === ca);
      if (idx >= 0) return ["A","B","C","D","E","F","G","H"][idx];
    }
    return ca; // fill-in / free text
  }

  function normaliseQuestion(q, idx) {
    // v4 bank tags single-fill questions as form_completion / note_completion /
    // table_completion without including a fields[] array. Treat those as
    // plain fill-in-the-blank so numbering and rendering work correctly.
    let questionType = q.questionType;
    const hasFieldsArray = Array.isArray(q.fields) && q.fields.length > 0;
    if (
      (questionType === "form_completion" ||
       questionType === "table_completion" ||
       questionType === "note_completion" ||
       questionType === "flowchart_completion") &&
      !hasFieldsArray
    ) {
      questionType = "fill";
    }
    const t = QTYPE_MAP[questionType] || "mcq";
    const options = normaliseOptionLabels(q.options);
    const base = {
      id: q.id,
      num: idx + 1,
      type: t,
      text: q.prompt || q.text || "",
      explanation: q.explanation || "",
      topic: q.topic || "",
      difficulty: q.difficulty || "medium",
      dataTable: q.dataTable || undefined, // GRE Data Interpretation table (rendered above the options)
    };
    if (t === "mcq" || t === "match_heading") {
      base.options = options;
      base.answer = letterFromAnswer(q.correctAnswer, q.options);
    } else if (t === "mcq_multi") {
      base.options = options;
      base.selectCount = q.selectCount || (Array.isArray(q.correctAnswer) ? q.correctAnswer.length : 2);
      base.answer = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map(a => letterFromAnswer(a, q.options))
        : (typeof q.correctAnswer === "string"
            ? q.correctAnswer.split(",").map(x => letterFromAnswer(x.trim(), q.options))
            : []);
    } else if (t === "tfng") {
      base.answer = String(q.correctAnswer || "").toUpperCase().match(/^(TRUE|FALSE|NOT GIVEN|T|F|NG)/)?.[0] || "";
      if (base.answer === "TRUE") base.answer = "T";
      else if (base.answer === "FALSE") base.answer = "F";
      else if (base.answer === "NOT GIVEN") base.answer = "NG";
    } else if (t === "yng") {
      base.answer = String(q.correctAnswer || "").toUpperCase().match(/^(YES|NO|NOT GIVEN|Y|N|NG)/)?.[0] || "";
      if (base.answer === "YES") base.answer = "Y";
      else if (base.answer === "NO") base.answer = "N";
      else if (base.answer === "NOT GIVEN") base.answer = "NG";
    } else if (t === "form_field") {
      // Part 1 table form field — blank can be in left (label) or right (answer) column
      base.answer      = String(q.answer || q.correctAnswer || "").trim();
      base.altAnswers  = q.alternateAnswers || q.altAnswers || [];
      base.label       = q.label || q.prompt || "";
      base.prefix      = q.prefix || "";
      base.suffix      = q.suffix || "";
      base.labelBlank  = !!q.labelBlank;
      base.labelSuffix = q.labelSuffix || "";
      base.rightContent= q.rightContent || "";
      base.num         = q.num || (idx + 1);
    } else if (t === "sent_fill") {
      // Sentence completion with inline blank — sentenceText contains __BLANK__
      base.answer = String(q.correctAnswer || "").trim();
      base.altAnswers = q.alternateAnswers || q.altAnswers || [];
      // If sentenceText is not set, derive it from prompt by converting _____ → __BLANK__
      const rawSentence = q.sentenceText || q.prompt || q.text || "";
      base.sentenceText = rawSentence.replace(/_{3,}/g, "__BLANK__");
      base.num = q.num || (idx + 1);
    } else if (t === "fill") {
      base.answer = String(q.correctAnswer || "").trim();
      base.altAnswers = q.alternateAnswers || q.altAnswers || [];
      // Pull a word-limit hint from instructions if present
      const ins = q.instructions || "";
      const m = ins.match(/NO MORE THAN (ONE|TWO|THREE|FOUR|FIVE) WORDS?/i);
      if (m) {
        base.wordLimit = { ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5 }[m[1].toUpperCase()];
      }
      if (/AND[\/ -]OR A NUMBER/i.test(ins)) base.allowNumber = true;
    } else if (t === "form_completion" || t === "table_completion") {
      base.fields = (q.fields || []).map((f, i) => ({
        id: f.id || `f${i+1}`,
        num: f.num || (idx + i + 1),
        label: f.label || "",
        answer: f.answer || "",
      }));
      base.title = q.title || "";
    } else if (t === "map_label") {
      // Map/plan labelling — student writes a letter (A, B, C...)
      base.answer     = String(q.correctAnswer || "").toUpperCase().trim();
      base.mapTitle   = q.mapTitle || "";
      base.mapKey     = q.mapKey   || {};          // {A:"Reception", B:"Hall", ...}
      base.mapLetters = q.mapLetters || Object.keys(q.mapKey || {});
      base.mapDescription = q.mapDescription || "";
    } else if (t === "match_cat") {
      // Matching/categorise — fixed categories A/B/C, student picks one per item
      base.answer          = String(q.correctAnswer || "").toUpperCase().trim();
      base.categoryOptions = q.categoryOptions || [];  // ["A. She agrees", "B. She is undecided", "C. She disagrees"]
    } else if (t === "writing_task") {
      base.prompt = q.prompt;
      base.wordTarget = q.wordTarget || 150;
      base.sampleAnswer = q.modelAnswer || q.sampleAnswer || "";
      base.rubric = q.rubric || ["task achievement","coherence","vocabulary","grammar"];
    } else if (t === "speaking_task") {
      base.topic = q.topic || q.prompt;
      base.prompt = q.prompt;
      base.points = q.points || q.cuePoints || [];
      base.prepSeconds = q.prepSeconds || 60;
      base.responseSeconds = q.responseSeconds || 120;
      base.rubric = q.rubric || ["fluency","vocabulary","grammar","pronunciation"];
    }
    // Pass a chart/table/image spec through to the renderer (GMAT Data Insights,
    // and any MCQ-style item that carries a visual). Consumed by LP_VisualRenderer.
    if (q.visual) base.visual = q.visual;
    return base;
  }

  // ─────────── Per-section normalisers ───────────

  function normaliseListening(test) {
    // Build a map of listeningScripts by id and by part number
    const scripts = (test.listeningScripts || []).reduce((m, s) => {
      m[s.id] = s;
      const pNum = s.sectionPart || s.part;
      if (pNum != null) m["part" + pNum] = s;
      return m;
    }, {});
    const groups = (test.questionGroups || []).reduce((m, g) => {
      m[g.part] = g; return m;
    }, {});

    // Detect whether questions use scriptId (TOEFL style) or part (IELTS style)
    const questionsArr = test.questions || [];
    const usesScriptId = questionsArr.length > 0 && questionsArr.every(q => !q.part && q.scriptId);

    let parts;

    if (usesScriptId) {
      // TOEFL / scriptId-based grouping:
      // Preserve the order of scripts so conversations and lectures appear in sequence.
      const scriptOrder = (test.listeningScripts || []).map(s => s.id);
      const byScript = {};
      for (const q of questionsArr) {
        const sid = q.scriptId || "default";
        (byScript[sid] = byScript[sid] || []).push(q);
      }
      parts = scriptOrder
        .filter(sid => byScript[sid])
        .map((sid, idx) => {
          const script = scripts[sid] || {};
          const partQs = byScript[sid] || [];
          const partNum = idx + 1;
          const typeLabel = script.type === "conversation" ? "Conversation" : "Lecture";
          const discipline = script.discipline ? ` — ${script.discipline}` : "";
          return {
            id: `${test.id}-s${idx + 1}`,
            partNum,
            scriptType: script.type || "lecture",   // "conversation" | "lecture"
            context: script.title || `${typeLabel} ${partNum}${discipline}`,
            audioScript: script.script || script.text || "",
            mapKey: script.mapKey || null,
            mapTitle: script.mapTitle || null,
            formLayout: script.formLayout || null,
            questions: partQs.map((q, i) => normaliseQuestion(q, i)),
          };
        });
    } else {
      // IELTS / part-based grouping (default)
      const byPart = {};
      for (const q of questionsArr) {
        const p = q.part || 1;
        (byPart[p] = byPart[p] || []).push(q);
      }
      parts = Object.keys(byPart).sort().map(pk => {
        const partNum = parseInt(pk, 10);
        const partQs = byPart[pk];
        const firstQ = partQs[0] || {};
        const script = scripts[firstQ.audioScriptId] || scripts["part" + partNum] || {};
        const group = groups[partNum] || {};
        return {
          id: `${test.id}-p${partNum}`,
          partNum,
          context: group.title || script.title || `Part ${partNum}`,
          audioScript: script.text || script.script || "",
          mapKey:      script.mapKey    || null,
          mapTitle:    script.mapTitle  || null,
          formLayout:  script.formLayout || null,
          questions: partQs.map((q, i) => normaliseQuestion(q, i)),
        };
      });
    }

    return { id: "listening", name: "Listening", icon: "🎧",
             timeSecs: test.durationSeconds || 1800, type: "listening", parts };
  }

  function normaliseReading(test) {
    const passages = test.passages || [];
    const passById = passages.reduce((m, p) => (m[p.id] = p, m), {});
    const byPassage = {};
    for (const q of test.questions || []) {
      const pid = q.passageId || passages[0]?.id || "default";
      (byPassage[pid] = byPassage[pid] || []).push(q);
    }
    // Track cumulative question offset so numbering is continuous across passages
    // e.g. IELTS: Passage1=Q1-14, Passage2=Q15-27, Passage3=Q28-40
    let qOffset = 0;
    const out = passages.length ? passages.map(p => {
      const pqs = byPassage[p.id] || [];
      const offset = qOffset;
      qOffset += pqs.length;
      return {
        id: p.id,
        title: p.title || "Passage",
        text: p.text || p.passage || p.content || "",
        questions: pqs.map((q, i) => normaliseQuestion(q, offset + i)),
      };
    }) : [{
      id: "default",
      title: test.title || "Reading",
      text: "",
      questions: (test.questions || []).map((q, i) => normaliseQuestion(q, i)),
    }];
    return { id: "reading", name: "Reading", icon: "📖",
             timeSecs: test.durationSeconds || 3600, type: "reading", passages: out };
  }

  function normaliseWriting(test) {
    const tasks = (test.questions || []).map((q, i) => {
      const n = normaliseQuestion(q, i);
      const task = { id: n.id, prompt: n.prompt || q.prompt, wordTarget: n.wordTarget || 150,
               sampleAnswer: n.sampleAnswer, type: q.questionType };
      // Pass task metadata
      if (q.taskType)          task.taskType = q.taskType;
      if (q.taskNumber)        task.taskNumber = q.taskNumber;
      if (q.minWords)        { task.minWords = q.minWords; task.wordTarget = q.minWords; }
      if (q.variant)           task.variant = q.variant;
      if (test.variant)        task.examVariant = test.variant;   // academic / general
      if (q.letterSituation)   task.letterSituation = q.letterSituation;
      if (q.letterType)        task.letterType = q.letterType;
      if (q.visual)            task.visual = q.visual;
      // TOEFL integrated writing fields
      if (q.readingPassage)    task.readingPassage = q.readingPassage;
      if (q.readingText)       task.readingPassage = q.readingText;       // alt field name
      if (q.readingTitle)      task.readingTitle = q.readingTitle;
      if (q.professorPrompt)   task.professorPrompt = q.professorPrompt;
      if (q.lectureDescription) task.professorPrompt = q.lectureDescription; // alt field name
      // TOEFL academic discussion fields
      if (q.discussionContext) task.discussionContext = q.discussionContext;
      // Support both professorPost (standard) and professorQuestion/professorName (TOEFL content format)
      if (q.professorPost)     task.professorPost = q.professorPost;
      if (q.professorQuestion) task.professorPost = q.professorQuestion;
      if (q.professorName)     task.professorName = q.professorName;
      if (q.studentPosts)      task.studentPosts = q.studentPosts;
      // Support TOEFL content format with individual student fields
      if (!task.studentPosts && (q.student1Response || q.student2Response)) {
        task.studentPosts = [];
        if (q.student1Response) task.studentPosts.push({ name: q.student1Name || "Student 1", response: q.student1Response });
        if (q.student2Response) task.studentPosts.push({ name: q.student2Name || "Student 2", response: q.student2Response });
      }
      if (q.targetWords)       task.wordTarget = parseInt(String(q.targetWords).split("-")[0]) || 150;
      if (q.timeSeconds)       task.timeSecs = q.timeSeconds;
      // GRE writing: situation (the claim/argument text) + prompt (the instruction)
      if (q.situation)         task.situation = q.situation;
      if (q.writingInstructions) task.writingInstructions = q.writingInstructions;
      if (q.rubric)            task.rubric = q.rubric;
      if (q.wordTarget)        task.wordTarget = q.wordTarget;
      if (!task.wordTarget || task.wordTarget < 10) task.wordTarget = 150;
      return task;
    });
    return { id: "writing", name: "Writing", icon: "✍️",
             timeSecs: test.durationSeconds || 3600, type: "writing", tasks };
  }

  function normaliseSpeaking(test) {
    const cards = (test.questions || []).map((q, i) => {
      const n = normaliseQuestion(q, i);
      return {
        id:              n.id,
        part:            q.part || null,          // 1, 2, or 3 — used by speaking renderer
        questionType:    q.questionType || "",
        isCueCard:       q.isCueCard || q.part === 2,
        topic:           n.topic || q.prompt,
        prompt:          q.prompt,
        visual:          q.visual || null,        // chart/graph to describe (PTE describe_image)
        photoUrl:        q.photoUrl || null,      // photo to describe (Duolingo)
        photoAlt:        q.photoAlt || "",
        followUpQuestion:     q.followUpQuestion     || null,
        followUpModelAnswer:  q.followUpModelAnswer  || null,
        points:          n.points,
        prepSeconds:     n.prepSeconds,
        responseSeconds: n.responseSeconds,
        sampleAnswer:    n.sampleAnswer || q.modelAnswer || q.sampleAnswer || "",
        rubric:          n.rubric || q.rubric || ["fluency","coherence","vocabulary","grammar","pronunciation"],
      };
    });
    return { id: "speaking", name: "Speaking", icon: "🎤",
             timeSecs: test.durationSeconds || 840, type: "speaking", cards };
  }

  function normaliseFlat(test, sectionLabel = "Section") {
    // GMAT/GRE flat schema → wrap as one "reading-style" section with no passage
    const passages = [{
      id: test.id + "-main",
      title: test.title || sectionLabel,
      text: "",
      questions: (test.questions || []).map((q, i) => normaliseQuestion(q, i)),
    }];
    // GMAT and GRE Quant/Verbal show one question per page in real exams.
    const isPaginated = (test.exam === "gmat" || test.exam === "gre");
    return { id: test.section || "section", name: sectionLabel,
             icon: "📋", timeSecs: test.durationSeconds || 1800,
             type: "reading", passages, paginated: isPaginated };
  }

  // ── PTE Reading: preserve each item with its original questionType ──────────
  function normalisePteReading(test) {
    // Each PTE reading question is a self-contained item (passage/blanks/paragraphs embedded)
    const items = (test.questions || []).map((q, i) => {
      const base = {
        id:           q.id || `pte-r-${i+1}`,
        num:          i + 1,
        questionType: q.questionType,                    // preserve original for renderer
        itemLabel:    q.itemLabel || q.questionType,
        instructions: q.instructions || q.instruction || "",
        topic:        q.topic || "",
        difficulty:   q.difficulty || "medium",
        explanation:  q.explanation || "",
      };
      // reading_writing_fill_blanks / fill_in_blanks
      if (q.questionType === "reading_writing_fill_blanks" || q.questionType === "fill_in_blanks") {
        base.passage    = q.passage || q.text || "";
        base.blanks     = q.blanks || [];
        base.wordBank   = q.wordBank || [];
        // correctAnswers can be: array on q.correctAnswers, or derived from q.blanks if objects
        base.correctAnswers = Array.isArray(q.correctAnswers)
          ? q.correctAnswers
          : (q.blanks || []).map(b => (typeof b === "object" ? b.correctAnswer : ""));
      }
      // reorder_paragraphs
      else if (q.questionType === "reorder_paragraphs") {
        // Support both "sentences" and "paragraphs" keys
        base.paragraphs  = q.sentences || q.paragraphs || [];
        base.correctOrder = q.correctOrder || [];
      }
      // multiple_choice_multiple
      else if (q.questionType === "multiple_choice_multiple") {
        base.passage        = q.passage || q.text || "";
        base.question       = q.question || q.prompt || "";
        base.options        = (q.options || []).map(o => String(o).replace(/^[A-Z]\.\s*/,""));
        base.correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswer];
      }
      // multiple_choice_single
      else if (q.questionType === "multiple_choice_single") {
        base.passage       = q.passage || q.text || "";
        base.question      = q.question || q.prompt || "";
        base.options       = (q.options || []).map(o => String(o).replace(/^[A-Z]\.\s*/,""));
        base.correctAnswer = q.correctAnswer || "";
      }
      // Legacy / old-format MCQ (reading_comprehension, critical_reasoning, problem_solving etc.)
      else if (Array.isArray(q.options) && q.options.length > 0) {
        base.questionType  = "multiple_choice_single";
        base.passage       = q.passage || q.text || "";
        base.question      = q.question || q.prompt || q.text || "";
        base.options       = (q.options || []).map(o => String(o).replace(/^[A-Z]\.\s*/,""));
        base.correctAnswer = q.correctAnswer || "";
      }
      return base;
    });
    return {
      id: "reading", name: "Reading", icon: "📖",
      timeSecs: test.durationSeconds || 1800,
      type: "pte_reading",
      items,
    };
  }

  // ── PTE Listening: preserve each item with its original questionType ─────────
  function normalisePteListening(test) {
    const items = (test.questions || []).map((q, i) => {
      const base = {
        id:           q.id || `pte-l-${i+1}`,
        num:          i + 1,
        questionType: q.questionType,
        topic:        q.topic || test.topic || "",
        explanation:  q.explanation || "",
        prompt:       q.prompt || "",
        audioScript:  q.audioScript || "",
      };
      if (q.questionType === "summarize_spoken_text") {
        base.wordLimit   = q.wordLimit || { min: 50, max: 70 };
        base.modelAnswer = q.modelAnswer || "";
      } else if (q.questionType === "multiple_choice_multiple") {
        base.question      = q.question || q.prompt || "";
        base.options       = q.options || [];
        base.correctAnswers = q.correctAnswers || [];
        base.requiredCount = q.requiredCount || 2;
      } else if (q.questionType === "fill_in_blanks_listening") {
        base.transcript    = q.transcript || "";
        base.correctAnswers = q.correctAnswers || [];
      } else if (q.questionType === "highlight_correct_summary") {
        base.options       = q.options || [];
        base.correctAnswer = q.correctAnswer || "";
      } else if (q.questionType === "multiple_choice_single") {
        base.question      = q.question || q.prompt || "";
        base.options       = q.options || [];
        base.correctAnswer = q.correctAnswer || "";
      } else if (q.questionType === "select_missing_word") {
        base.options       = q.options || [];
        base.correctAnswer = q.correctAnswer || "";
      } else if (q.questionType === "highlight_incorrect_words") {
        base.displayTranscript = q.displayTranscript || "";
        base.incorrectWords    = q.incorrectWords || [];
        base.correctWords      = q.correctWords || [];
      } else if (q.questionType === "write_from_dictation") {
        base.correctAnswer = q.correctAnswer || "";
      }
      return base;
    });
    return {
      id: "listening", name: "Listening", icon: "🎧",
      timeSecs: test.durationSeconds || 1800,
      type: "pte_listening",
      topic: test.topic || "",
      items,
    };
  }

  // ── PTE Speaking & Writing: keep each task with its own type + stimulus ──────
  function normalisePteSpeakingWriting(test) {
    const SPEAK_PREP = { read_aloud: 35, repeat_sentence: 3, describe_image: 25, retell_lecture: 10, answer_short_question: 3 };
    const SPEAK_RESP = { read_aloud: 40, repeat_sentence: 15, describe_image: 40, retell_lecture: 40, answer_short_question: 10 };
    const items = (test.questions || []).map((q, i) => {
      const qt = q.questionType === "write_essay" ? "essay" : q.questionType; // alias
      return {
      id:            q.id || `pte-sw-${i+1}`,
      num:           i + 1,
      questionType:  qt,
      topic:         q.topic || "",
      prompt:        q.prompt || "",
      readText:      q.readText || q.passageText || q.passage || "",
      audioScript:   q.audioScript || "",
      visual:        q.visual || null,
      keyPoints:     q.keyPoints || [],
      correctAnswer: q.correctAnswer || "",
      modelAnswer:   q.modelAnswer || "",
      prepSeconds:     q.prepSeconds     || SPEAK_PREP[qt] || 25,
      responseSeconds: q.responseSeconds || SPEAK_RESP[qt] || 40,
      wordMin:       q.wordMin || (qt === "essay" ? 200 : qt === "summarize_written_text" ? 5 : undefined),
      wordMax:       q.wordMax || (qt === "essay" ? 300 : qt === "summarize_written_text" ? 75 : undefined),
      };
    });
    return {
      id: "speaking-writing", name: "Speaking & Writing", icon: "🎤",
      timeSecs: test.durationSeconds || 4500,
      type: "pte_sw", isPteSW: true,
      items,
    };
  }

  // ─────────── CELPIP-specific normalisers ──────────────────────

  function normaliseCelpipReading(test) {
    // CELPIP reading has 4 parts: correspondence (emails), schedule, article, viewpoints
    const passages = (test.passages || []).map(p => ({
      id: p.id,
      part: p.part,
      partTitle: p.partTitle || `Part ${p.part}`,
      type: p.type || "article",
      title: p.title || "Reading Passage",
      // For correspondence: emails array
      emails: p.emails || null,
      // For schedule/diagram: intro + schedule rows
      intro: p.intro || null,
      schedule: p.schedule || null,
      // For article: plain text
      text: p.content || p.text || "",
      // For viewpoints: array of {name, text}
      viewpoints: p.viewpoints || null,
      questions: [],
    }));
    const passById = passages.reduce((m,p) => (m[p.id]=p,m), {});
    for (const q of test.questions || []) {
      const pid = q.passageId || (passages[0] || {}).id;
      if (passById[pid]) passById[pid].questions.push(normaliseQuestion(q, 0));
    }
    return { id: "reading", name: "Reading", icon: "📖",
             timeSecs: test.durationSeconds || 3300, type: "reading",
             isCelpip: true, celpipParts: test.parts || [], passages };
  }

  function normaliseCelpipWriting(test) {
    // CELPIP writing: supports both test.tasks[] and test.questions[] (converted format)
    const tasks = (test.tasks || test.questions || []).map(t => ({
      id: t.id,
      taskNumber: t.taskNumber,
      taskType: t.taskType,       // "email" | "survey_response"
      title: t.title,
      timeMinutes: t.timeMinutes,
      wordCountGuideline: t.wordCountGuideline || "150–200 words",
      // Email task fields
      scenario: t.scenario || null,
      recipient: t.recipient || null,
      bulletPoints: t.bulletPoints || [],
      formatGuidance: t.formatGuidance || null,
      // Survey task fields
      surveyPrompt: t.surveyPrompt || null,
      optionA: t.optionA || null,
      optionB: t.optionB || null,
      // Common
      rubric: t.rubric || [],
      modelAnswerNotes: t.modelAnswerNotes || null,
      // Legacy support
      prompt: t.scenario || t.surveyPrompt || t.prompt || "",
      wordTarget: 175,
    }));
    return { id: "writing", name: "Writing", icon: "✍️",
             timeSecs: test.durationSeconds || 3180, type: "writing", isCelpip: true, tasks };
  }

  function normaliseCelpipSpeaking(test) {
    // CELPIP speaking: 8 tasks with specific types; supports both tasks[] and questions[]
    const tasks = (test.tasks || test.questions || []).map((t, i) => ({
      id: t.id || `celpip-sp-t${i+1}`,
      taskNumber: t.taskNumber || (i + 1),
      taskType: t.taskType,       // giving_advice | personal_experience | describing_a_scene | etc.
      title: t.title,
      prepSeconds: t.prepSeconds || 30,
      responseSeconds: t.responseSeconds || 60,
      prompt: t.prompt,
      sceneDescription: t.sceneDescription || null,
      optionA: t.optionA || null,
      optionB: t.optionB || null,
      tip: t.tip || null,
      rubric: t.rubric || ["content_coherence","vocabulary","listenability","task_fulfillment"],
    }));
    return { id: "speaking", name: "Speaking", icon: "🎤",
             timeSecs: test.durationSeconds || 1200, type: "speaking",
             isCelpip: true, tasks };
  }

  // ─────────── Main entry: test JSON → engine config ───────────

  function normaliseTest(test) {
    if (!test) return null;
    const section = test.section || "";
    const exam = test.exam || "";

    let secObj;
    if (exam === "pte" && section === "listening") {
      secObj = normalisePteListening(test);
    } else if (exam === "pte" && (section === "speaking-writing" || section === "speaking_writing")) {
      secObj = normalisePteSpeakingWriting(test);
    } else if (test.listeningScripts && (test.listeningScripts.length || section.includes("listening"))) {
      secObj = normaliseListening(test);
    } else if (exam === "pte" && section === "reading") {
      secObj = normalisePteReading(test);
    } else if (exam === "celpip" && section === "reading") {
      secObj = normaliseCelpipReading(test);
    } else if (exam === "celpip" && section === "writing") {
      secObj = normaliseCelpipWriting(test);
    } else if (exam === "celpip" && section === "speaking") {
      secObj = normaliseCelpipSpeaking(test);
    } else if (section === "reading" || test.passages) {
      secObj = normaliseReading(test);
    } else if (section === "writing" || (test.questions || []).some(q => /writing/i.test(q.questionType || ""))) {
      secObj = normaliseWriting(test);
    } else if (section === "speaking" || (test.questions || []).some(q => /speaking|read_aloud|repeat_sentence|describe_image/i.test(q.questionType || ""))) {
      secObj = normaliseSpeaking(test);
    } else {
      // GMAT/GRE flat
      const label = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ");
      secObj = normaliseFlat(test, label);
    }

    return {
      examId: exam,
      testId: test.id,
      testType: section ? "section_" + section : "section",
      title: test.title,
      sections: [secObj],
    };
  }

  // ─────────── Full mock: compose sections lazily ───────────

  async function buildFullMockConfig(mockComposition, loadTest) {
    // mockComposition.sections = [{ section, testId, file }]
    const sectionConfigs = [];
    for (const ref of mockComposition.sections || []) {
      try {
        const sectionTest = await loadTest(ref.file);
        const normal = normaliseTest(sectionTest);
        if (normal && normal.sections[0]) sectionConfigs.push(normal.sections[0]);
      } catch (e) {
        console.warn("Skipping section in full mock:", ref.section, e?.message);
      }
    }
    return {
      examId: mockComposition.exam,
      testId: mockComposition.id,
      testType: "full",
      title: mockComposition.title,
      sections: sectionConfigs,
    };
  }

  window.LP_NORMALIZE = { normaliseTest, normaliseQuestion, buildFullMockConfig, normalisePteListening };
})();
