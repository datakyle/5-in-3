// Validates questions.js and the no-repeat deck.
// Checks: structure, exact and near duplicates, ID collisions, formatting,
// and that the deck never repeats a card until the pool is used up.
// Usage: node scripts/check-questions.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const Deck = require("../deck.js");

const src = readFileSync(new URL("../questions.js", import.meta.url), "utf8");
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const cats = ctx.window.CATEGORIES;

const errors = [];
const warnings = [];
if (!Array.isArray(cats) || !cats.length) errors.push("window.CATEGORIES must be a non-empty array");

// Words that don't change what a prompt asks for.
const STOP = new Set("a an the that are aren't arent of in on to you your with for or and from any is it who what things thing words word than not".split(" "));
const tokens = (q) => new Set(Deck.normalize(q).split(" ").filter((w) => w && !STOP.has(w)).map((w) => w.replace(/s$/, "")));

const all = [];
const catIds = new Set();
for (const c of cats || []) {
  if (!c.id || !c.name || !Array.isArray(c.q)) { errors.push(`Category ${JSON.stringify(c.id)} needs id, name, and q[]`); continue; }
  if (catIds.has(c.id)) errors.push(`Duplicate category id "${c.id}"`);
  catIds.add(c.id);
  c.q.forEach((q, i) => {
    const where = `${c.id} #${i + 1} "${q}"`;
    if (typeof q !== "string" || !q.trim()) return errors.push(`${where}: empty or not a string`);
    if (q.length > 80) errors.push(`${where}: longer than 80 characters`);
    if (/^name\s*(3|three)\b/i.test(q)) errors.push(`${where}: drop the "Name 3" prefix, the card adds it`);
    if ((q.match(/<em>/g) || []).length !== (q.match(/<\/em>/g) || []).length) errors.push(`${where}: unbalanced <em> tags`);
    if (/<(?!\/?em>)/.test(q)) errors.push(`${where}: only <em> is allowed`);
    all.push({ cat: c.id, q, where, norm: Deck.normalize(q), id: Deck.idFor(q), tok: tokens(q) });
  });
}

const byNorm = new Map(), byId = new Map();
for (const p of all) {
  if (byNorm.has(p.norm)) errors.push(`${p.where}: duplicate of ${byNorm.get(p.norm).where}`);
  else byNorm.set(p.norm, p);
  if (byId.has(p.id) && byId.get(p.id).norm !== p.norm) errors.push(`${p.where}: ID collides with ${byId.get(p.id).where}, reword one`);
  else byId.set(p.id, p);
}

// Near duplicates: prompts that share most of their meaningful words.
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const a = all[i].tok, b = all[j].tok;
    if (!a.size || !b.size) continue;
    let inter = 0; for (const t of a) if (b.has(t)) inter++;
    const sim = inter / (a.size + b.size - inter);
    if (sim >= 0.75) errors.push(`Near duplicate (${sim.toFixed(2)}): ${all[i].where} ~ ${all[j].where}`);
    else if (sim >= 0.6) warnings.push(`Similar (${sim.toFixed(2)}): ${all[i].where} ~ ${all[j].where}`);
  }
}

// Deck behavior: draw through every card twice; no repeats inside a full cycle.
if (!errors.length) {
  const cards = Deck.buildCards(cats);
  let mem = {};
  const deck = Deck.createDeck(cards, { load: () => mem, save: (v) => { mem = { ...v }; } });
  const enabled = new Set(cats.map((c) => c.id));
  let seed = 7; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const drawn = new Set();
  for (let i = 0; i < cards.length; i++) {
    if (i % 30 === 0) deck.newGame(); // simulate many games in a row
    const c = deck.draw(enabled, rand);
    if (!c) { errors.push(`Deck ran dry after ${i} draws`); break; }
    if (drawn.has(c.id)) { errors.push(`Deck repeated "${c.text}" after ${i} draws`); break; }
    drawn.add(c.id); deck.markSeen(c);
  }
  if (deck.freshCount(enabled) !== 0) errors.push("Deck still reports fresh cards after a full cycle");
}

for (const w of warnings) console.warn("! " + w);
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ` + errors.join("\n  "));
  process.exit(1);
}
const adult = (cats || []).filter((c) => c.adult).reduce((n, c) => n + c.q.length, 0);
console.log(`✓ ${all.length} prompts (${all.length - adult} general, ${adult} 18+) in ${cats.length} categories. No duplicates, no repeats in a full deck cycle.`);
