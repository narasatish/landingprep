// Unit tests for the Instagram posting pipeline — OFFLINE, no network, no posting.
// Guards the content pipeline against regressions: valid content for every slot, the
// 2026 hashtag cap (≤6 on-topic tags), and Instagram's 2,200-char caption hard limit.
//   node tools/ig-pipeline.test.js
const assert = require("assert");
const ig = require("../scripts/ig-poster.js");

let pass = 0, fail = 0;
function test(name, fn) { try { fn(); pass++; console.log("  ✓ " + name); } catch (e) { fail++; console.error("  ✗ " + name + " — " + e.message); } }

console.log("IG pipeline unit tests (offline):");
const NOW = new Date("2026-06-19T09:00:00Z");

test("SLOTS === 5", () => assert.strictEqual(ig.SLOTS, 5));

test("slotFromHour always returns a valid slot 0..4 for every UTC hour", () => {
  for (let h = 0; h < 24; h++) {
    const s = ig.slotFromHour(new Date(Date.UTC(2026, 5, 19, h, 0, 0)));
    assert.ok(Number.isInteger(s) && s >= 0 && s < ig.SLOTS, "hour " + h + " -> " + s);
  }
});

for (let slot = 0; slot < ig.SLOTS; slot++) {
  test("slot " + slot + ": produces content with a real caption + 1..6 on-topic hashtags", () => {
    const c = ig.pickForSlot(NOW, slot);
    assert.ok(c, "pickForSlot returned null for slot " + slot);
    const caption = c.caption || c.headline || "";
    assert.ok(caption.trim().length > 10, "caption too short/empty");
    assert.ok(Array.isArray(c.tags) && c.tags.length >= 1, "no hashtags");
    assert.ok(c.tags.length <= 6, "slot " + slot + " has " + c.tags.length + " hashtags — 2026 IG penalizes >6 tag-stuffing");
    c.tags.forEach((t) => assert.ok(/^[a-z0-9]+$/.test(t), "malformed hashtag: '" + t + "'"));
  });

  test("slot " + slot + ": final caption stays under Instagram's 2,200-char limit and has hashtags", () => {
    const c = ig.pickForSlot(NOW, slot);
    const cap = ig.buildCaption(c);
    assert.ok(typeof cap === "string" && cap.length > 0, "buildCaption returned empty");
    assert.ok(cap.length <= 2200, "caption is " + cap.length + " chars (IG hard limit is 2,200 — the post would FAIL)");
    assert.ok(/#[a-z0-9]/i.test(cap), "no hashtags in the final caption");
  });
}

test("buildCaption hard-truncates an oversized caption to <= 2200 (never lets a post fail on length)", () => {
  const out = ig.buildCaption({ caption: "word ".repeat(2000), tags: ["studyabroad", "ielts", "landingprep"] });
  assert.ok(out.length <= 2200, "oversized caption not truncated: " + out.length + " chars");
});

test("slot rotation is deterministic for a given day (idempotent content)", () => {
  for (let slot = 0; slot < ig.SLOTS; slot++) {
    const a = ig.buildCaption(ig.pickForSlot(NOW, slot));
    const b = ig.buildCaption(ig.pickForSlot(NOW, slot));
    assert.strictEqual(a, b, "slot " + slot + " content is not deterministic within the same day");
  }
});

console.log("\nIG pipeline: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
