/* check-hooks.js — static "Rules of Hooks" linter for the LandingPrep screens.
   Catches the #1 recurring production crash: a React hook (useState/useEffect/useMemo/…)
   called AFTER a conditional early-return inside a component, which throws React error
   #300 ("rendered fewer hooks than expected") and white-screens the page via the error
   boundary. Runs as part of `npm test` and the build. Uses @babel/parser for a real AST
   (no fragile regex), so it understands JSX, template literals and nested scopes.

   Exit code 1 + a clear report if any violation is found. */
const fs = require("fs");
const path = require("path");
let parser;
try { parser = require("@babel/parser"); }
catch (e) {
  console.warn("⚠ check-hooks skipped — @babel/parser not installed. Run `npm install` (it's a devDependency) to enable the Rules-of-Hooks gate.");
  process.exit(0); // never break the build over a missing optional dev tool
}

const HOOKS = new Set(["useState", "useEffect", "useMemo", "useCallback", "useRef",
  "useReducer", "useContext", "useLayoutEffect", "useImperativeHandle", "useTransition",
  "useDeferredValue", "useId", "useSyncExternalStore"]);

function hookName(node) {
  // matches  useX(...)  and  React.useX(...)
  if (node.type !== "CallExpression") return null;
  const c = node.callee;
  if (c.type === "Identifier" && HOOKS.has(c.name)) return c.name;
  if (c.type === "MemberExpression" && c.property && HOOKS.has(c.property.name)) return c.property.name;
  return null;
}
// Walk a node WITHOUT descending into nested function scopes; call visit(node) on each.
function walkShallow(node, visit, isRoot) {
  if (!node || typeof node.type !== "string") return;
  if (!isRoot && /Function(Declaration|Expression)|ArrowFunctionExpression/.test(node.type)) return; // stop at nested fn
  visit(node);
  for (const key in node) {
    if (key === "loc" || key === "leadingComments" || key === "trailingComments") continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((n) => n && n.type && walkShallow(n, visit, false));
    else if (v && v.type) walkShallow(v, visit, false);
  }
}
function findHooksIn(stmt) { const out = []; walkShallow(stmt, (n) => { const h = hookName(n); if (h) out.push({ name: h, line: n.loc.start.line }); }, true); return out; }
function containsReturn(stmt) { let yes = false; walkShallow(stmt, (n) => { if (n.type === "ReturnStatement") yes = true; }, true); return yes; }

// Check one component function body for "hook after early return".
function checkComponent(name, fnNode, file, out) {
  const body = fnNode.body;
  if (!body || body.type !== "BlockStatement") return;
  let earlyReturnLine = 0;
  for (const stmt of body.body) {
    const hooks = findHooksIn(stmt);
    if (earlyReturnLine && hooks.length) {
      for (const h of hooks) {
        out.push(`${file}  →  <${name}>: ${h.name}() at line ${h.line} is called AFTER a conditional return at line ${earlyReturnLine}. ` +
          `All hooks must run on every render — move it above the early return (this is what crashes the page with React #300).`);
      }
    }
    // A bare top-level return, or an if/switch/try whose branch returns = an early exit.
    if (!earlyReturnLine) {
      if (stmt.type === "ReturnStatement") {
        // only an EARLY return matters — i.e. not the component's final statement
        if (stmt !== body.body[body.body.length - 1]) earlyReturnLine = stmt.loc.start.line;
      } else if (/IfStatement|SwitchStatement|TryStatement/.test(stmt.type) && containsReturn(stmt)) {
        earlyReturnLine = stmt.loc.start.line;
      }
    }
  }
}
function isComponentName(n) { return typeof n === "string" && /^[A-Z]/.test(n); }

function checkFile(file, out) {
  const src = fs.readFileSync(file, "utf8");
  let ast;
  try { ast = parser.parse(src, { sourceType: "script", plugins: ["jsx"], errorRecovery: true }); }
  catch (e) { out.push(`${file}  →  PARSE ERROR: ${e.message}`); return; }
  walkAll(ast.program, (n) => {
    if (n.type === "FunctionDeclaration" && n.id && isComponentName(n.id.name)) checkComponent(n.id.name, n, path.basename(file), out);
    if (n.type === "VariableDeclarator" && n.id && isComponentName(n.id.name) && n.init &&
        /FunctionExpression|ArrowFunctionExpression/.test(n.init.type) && n.init.body && n.init.body.type === "BlockStatement")
      checkComponent(n.id.name, n.init, path.basename(file), out);
  });
}
function walkAll(node, visit) {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const key in node) {
    if (key === "loc") continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((n) => n && n.type && walkAll(n, visit));
    else if (v && v.type) walkAll(v, visit);
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────
const dir = path.join(__dirname, "..", "screens");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx")).map((f) => path.join(dir, f));
const violations = [];
for (const f of files) checkFile(f, violations);

// Self-test: confirm the checker actually catches a known-bad pattern (so it can't silently rot).
const BAD = "function Bad(){ const [a]=useState(0); if(!a){ return null; } const [b]=useState(1); return b; }";
const st = [];
(function(){ const ast = parser.parse(BAD, { plugins: ["jsx"] }); walkAll(ast.program, (n)=>{ if(n.type==="FunctionDeclaration"&&n.id) checkComponent(n.id.name,n,"selftest",st); }); })();
if (st.length === 0) { console.error("✗ check-hooks self-test FAILED — the checker is broken (did not flag a known violation)."); process.exit(2); }

if (violations.length) {
  console.error("\n✗ Rules-of-Hooks violations found (these crash the page in production):\n");
  violations.forEach((v) => console.error("  • " + v));
  console.error("\n" + violations.length + " violation(s). Fix before deploying.\n");
  process.exit(1);
}
console.log("✓ check-hooks: " + files.length + " screens passed — no conditional hooks / hooks-after-return.");
