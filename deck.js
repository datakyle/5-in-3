// Card picking for Name 3 in 5.
//
// How "no repeats" works:
// - Every prompt gets a stable ID from its text, so adding or reordering
//   prompts never resets anyone's history.
// - When a card is revealed, its ID and the time are saved on this device.
// - Draws always come from cards this device hasn't seen yet.
// - Once every card in the chosen categories has been seen, the game deals
//   the ones seen longest ago, so recent cards stay out of rotation.
// - Within a game a card never comes up twice, and categories take turns so
//   you don't get three food cards in a row.
(function (root) {
  function normalize(text) {
    return text.replace(/<\/?em>/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  // FNV-1a hash, base 36. Short, stable, and good enough for ~1,000 prompts.
  function idFor(text) {
    let h = 0x811c9dc5;
    for (const ch of normalize(text)) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(36);
  }

  function buildCards(categories) {
    return categories.flatMap((c) =>
      c.q.map((text) => ({ id: idFor(text), text, cat: c.id, catName: c.name, adult: !!c.adult }))
    );
  }

  // store = { load() -> object|null, save(object) }
  function createDeck(cards, store) {
    const known = new Set(cards.map((c) => c.id));
    let seen = {};
    try { seen = store.load() || {}; } catch (e) { seen = {}; }
    for (const id of Object.keys(seen)) if (!known.has(id)) delete seen[id]; // drop removed prompts

    let usedThisGame = new Set();
    let catCount = {};
    let lastCat = null;
    let clock = 0;

    const persist = () => { try { store.save(seen); } catch (e) {} };
    const pool = (enabled) => cards.filter((c) => enabled.has(c.cat));
    const now = () => Math.max(Date.now(), ++clock); // strictly increasing, even within one millisecond
    const pick = (list, rand) => list[Math.floor(rand() * list.length)];

    function draw(enabled, rand = Math.random) {
      const available = pool(enabled).filter((c) => !usedThisGame.has(c.id));
      if (!available.length) return null;

      let candidates = available.filter((c) => !seen[c.id]);
      if (!candidates.length) {
        // Everything has been seen: deal from the oldest quarter.
        const oldest = available.slice().sort((a, b) => seen[a.id] - seen[b.id]);
        candidates = oldest.slice(0, Math.max(1, Math.ceil(oldest.length / 4)));
      }

      const byCat = {};
      for (const c of candidates) (byCat[c.cat] = byCat[c.cat] || []).push(c);
      let cats = Object.keys(byCat);
      if (cats.length > 1) cats = cats.filter((k) => k !== lastCat);
      const fewest = Math.min(...cats.map((k) => catCount[k] || 0));
      cats = cats.filter((k) => (catCount[k] || 0) === fewest);
      return pick(byCat[pick(cats, rand)], rand);
    }

    // Call when a card is revealed.
    function markSeen(card) {
      clock = now();
      seen[card.id] = clock;
      usedThisGame.add(card.id);
      catCount[card.cat] = (catCount[card.cat] || 0) + 1;
      lastCat = card.cat;
      persist();
    }

    // Call when a card is skipped before it's revealed: not marked seen, but not dealt again this game.
    function pass(card) { usedThisGame.add(card.id); }

    function newGame() { usedThisGame = new Set(); catCount = {}; lastCat = null; }

    function reset(enabled) {
      for (const c of pool(enabled)) delete seen[c.id];
      persist();
    }

    return {
      draw, markSeen, pass, newGame, reset,
      poolSize: (enabled) => pool(enabled).length,
      freshCount: (enabled) => pool(enabled).filter((c) => !seen[c.id]).length,
    };
  }

  const api = { normalize, idFor, buildCards, createDeck };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Deck = api;
})(typeof window !== "undefined" ? window : globalThis);
