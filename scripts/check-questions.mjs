// Validates questions.js: no duplicates, no empty or overlong prompts, balanced <em> tags.
// Usage: node scripts/check-questions.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../questions.js", import.meta.url), "utf8");
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const qs = ctx.window.QUESTIONS;

const errors = [];
if (!Array.isArray(qs)) errors.push("window.QUESTIONS is not an array");

const seen = new Map();
const norm = (q) => q.replace(/<\/?em>/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

(qs || []).forEach((q, i) => {
  const line = `#${i + 1} "${q}"`;
  if (typeof q !== "string" || !q.trim()) return errors.push(`${line}: empty or not a string`);
  if (q.length > 80) errors.push(`${line}: longer than 80 characters`);
  if (/^name\s*3/i.test(q)) errors.push(`${line}: drop the "Name 3" prefix, the card adds it`);
  const opens = (q.match(/<em>/g) || []).length, closes = (q.match(/<\/em>/g) || []).length;
  if (opens !== closes) errors.push(`${line}: unbalanced <em> tags`);
  if (/<(?!\/?em>)/.test(q)) errors.push(`${line}: only <em> is allowed`);
  const key = norm(q);
  if (seen.has(key)) errors.push(`${line}: duplicate of #${seen.get(key) + 1}`);
  else seen.set(key, i);
});

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in questions.js:\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ ${qs.length} questions, no duplicates.`);
