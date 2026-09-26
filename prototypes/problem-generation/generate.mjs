import { compile, candidateClaims, say } from "./facts.mjs";

// The one contract everything produces:
//   { stem, diagram, options[4], answerIndex, solution[], difficulty }

// ---------- arithmetic the model is NOT trusted to do ----------
// The model emits an expression string. We validate it, then WE evaluate it.
const SAFE = /^[0-9+\-*/(). ]+$/;
function evaluate(expr) {
  if (!SAFE.test(expr)) throw new Error(`unsafe expression: ${expr}`);
  const v = Function(`"use strict"; return (${expr});`)();
  if (!Number.isFinite(v)) throw new Error(`non-finite: ${expr}`);
  return v;
}

const randInt = (rng, [lo, hi]) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = (xs, rng) =>
  xs.map((x) => ({ x, k: rng() })).sort((a, b) => a.k - b.k).map((o) => o.x);

// ---------- template: a parameter space + an expression + misconceptions ----------
const PACKS = {
  id: "multiply-then-subtract",
  topic: "multi-step arithmetic",
  params: { a: [3, 9], b: [3, 8], c: [2, 15] },
  valid: (p) => p.a * p.b - p.c > 1,
  stem: (p) =>
    `A pack has ${p.a} stickers. Maya buys ${p.b} packs, then gives away ${p.c}. How many stickers are left?`,
  expr: (p) => `${p.a} * ${p.b} - ${p.c}`,
  steps: (p) => [`${p.a} × ${p.b} = ${p.a * p.b}`, `${p.a * p.b} − ${p.c} = ${p.a * p.b - p.c}`],
  // each one is a real wrong path, not a random number
  misconceptions: [
    { why: "stopped after the first step", expr: (p) => `${p.a} * ${p.b}` },
    { why: "added instead of subtracting", expr: (p) => `${p.a} * ${p.b} + ${p.c}` },
    { why: "added the two factors", expr: (p) => `${p.a} + ${p.b} - ${p.c}` },
  ],
  difficulty: (p) => (p.a * p.b > 40 ? 3 : 2),
};

function fromTemplate(t, rng) {
  let p;
  for (let tries = 0; ; tries++) {
    if (tries > 200) throw new Error("no valid parameters");
    p = Object.fromEntries(Object.entries(t.params).map(([k, r]) => [k, randInt(rng, r)]));
    if (t.valid(p)) break;
  }

  const answer = evaluate(t.expr(p));

  // wrong options, in misconception order, filtered for sanity
  const wrong = [];
  for (const m of t.misconceptions) {
    const v = evaluate(m.expr(p));
    if (v === answer || v <= 0 || !Number.isInteger(v)) continue;
    if (wrong.some((w) => w.v === v)) continue;
    wrong.push({ v, why: m.why });
  }
  // backfill near-misses if misconceptions collided
  for (let d = 1; wrong.length < 3; d++) {
    for (const v of [answer + d, answer - d]) {
      if (wrong.length >= 3) break;
      if (v > 0 && v !== answer && !wrong.some((w) => w.v === v))
        wrong.push({ v, why: `off by ${d}` });
    }
  }

  const opts = shuffle([{ v: answer, correct: true }, ...wrong.slice(0, 3)], rng);
  return {
    templateId: t.id,
    stem: t.stem(p),
    diagram: null,
    options: opts.map((o) => String(o.v)),
    answerIndex: opts.findIndex((o) => o.correct),
    solution: t.steps(p),
    rationale: opts.map((o) => (o.correct ? "correct" : o.why)),
    difficulty: t.difficulty(p),
  };
}

// ---------- same contract, geometry archetype ----------
function fromDiagram(diagram, rng) {
  const model = compile(diagram.facts);
  const claims = candidateClaims(diagram);
  const tru = claims.filter((c) => model.holds(c));
  const fls = claims.filter((c) => !model.holds(c));
  const answer = tru[Math.floor(rng() * tru.length)];

  // keep every option the same relationship type, or reject the problem
  const near = fls.filter((c) => c.type === answer.type);
  if (near.length < 3) return null;

  const opts = shuffle([answer, ...near.slice(0, 3)], rng);
  return {
    templateId: diagram.id,
    stem: "Which statement is indicated by the marks on the diagram?",
    diagram: { points: diagram.points, edges: diagram.edges, facts: diagram.facts },
    options: opts.map(say),
    answerIndex: opts.indexOf(answer),
    solution: [`The marks assert: ${diagram.facts.map(say).join("; ")}`],
    rationale: opts.map((o) => (o === answer ? "correct" : "not shown by the marks")),
    difficulty: 2,
  };
}

export { fromTemplate, fromDiagram, PACKS, evaluate };
