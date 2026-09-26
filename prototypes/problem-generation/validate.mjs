import { Problem } from "./schema.mjs";

const norm = (d) => ((d % 360) + 360) % 360;
const ccw = (from, to) => norm(to - from) || 360;   // full turn, never 0

// a*v + b  evaluated at v
const at = (m, v) => (m.kind === "known" ? m.degrees : m.coefficient * v + m.constant);
const coef = (m) => (m.kind === "known" ? 0 : m.coefficient);
const konst = (m) => (m.kind === "known" ? m.degrees : m.constant);

/** Derive the variable from the relations. Never trust a stated answer. */
function solve(diagram, variable) {
  const byId = new Map(diagram.angles.map((a) => [a.id, a]));
  for (const r of diagram.relations) {
    const ms = r.angleIds.map((id) => byId.get(id)?.measure).filter(Boolean);
    if (ms.length !== r.angleIds.length) continue;

    if (r.type === "sum") {
      const a = ms.reduce((s, m) => s + coef(m), 0);
      const b = ms.reduce((s, m) => s + konst(m), 0);
      if (a !== 0) return { value: (r.totalDegrees - b) / a, via: r.name };
    } else {
      const [p, q] = ms;
      const a = coef(p) - coef(q);
      if (a !== 0) return { value: (konst(q) - konst(p)) / a, via: r.name };
    }
  }
  return null;
}

export function check(raw) {
  const parsed = Problem.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  }
  const p = parsed.data;
  const errors = [];
  const d = p.diagram;

  if (d) {
    const rayIds = new Set(d.rays.map((r) => r.id));
    const angleIds = new Set(d.angles.map((a) => a.id));
    for (const a of d.angles) {
      if (!rayIds.has(a.from)) errors.push(`angle ${a.id}: unknown ray "${a.from}"`);
      if (!rayIds.has(a.to)) errors.push(`angle ${a.id}: unknown ray "${a.to}"`);
    }
    for (const r of d.relations)
      for (const id of r.angleIds)
        if (!angleIds.has(id)) errors.push(`relation ${r.name}: unknown angle "${id}"`);

    // 1. the answer must FOLLOW from the relations, not be asserted
    const derived = solve(d, p.solveFor);
    if (!derived) errors.push(`no relation determines ${p.solveFor}`);
    else if (Math.abs(derived.value - p.answer.value) > 1e-9)
      errors.push(`stated ${p.solveFor}=${p.answer.value} but relations give ${derived.value} (via ${derived.via})`);

    // 2. if it claims to be to scale, the drawing must agree with the labels
    if (d.scale === "exact" && derived) {
      const dir = new Map(d.rays.map((r) => [r.id, r.degrees]));
      for (const a of d.angles) {
        const drawn = ccw(dir.get(a.from), dir.get(a.to));
        const stated = at(a.measure, derived.value);
        if (Math.abs(drawn - stated) > 0.5)
          errors.push(`angle ${a.id}: drawn ${drawn.toFixed(1)}° but labelled ${stated}°`);
      }
      const total = d.angles.reduce((s, a) => s + ccw(dir.get(a.from), dir.get(a.to)), 0);
      if (d.relations.some((r) => r.name === "around_point") && Math.abs(total - 360) > 0.5)
        errors.push(`angles around the point sweep ${total}°, not 360°`);
    }
  }

  // 3. option hygiene
  const ids = p.options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) errors.push("duplicate option ids");
  if (!ids.includes(p.correctOptionId)) errors.push(`correctOptionId "${p.correctOptionId}" not among options`);
  for (const o of p.options) {
    const isCorrect = o.id === p.correctOptionId;
    if (isCorrect && o.misconception) errors.push(`correct option ${o.id} carries a misconception`);
    if (!isCorrect && !o.misconception) errors.push(`distractor ${o.id} has no misconception`);
  }
  const texts = p.options.map((o) => o.label.plainText);
  if (new Set(texts).size !== texts.length) errors.push("duplicate option text");

  return { ok: errors.length === 0, errors, problem: p };
}
