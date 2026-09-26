// ---------- 1. canonical forms ----------
// A segment is unordered: "BA" and "AB" are the same thing.
const seg = (s) => [...s].sort().join("");
// An angle keeps its vertex in the middle: "CBA" === "ABC".
const ang = (a) => {
  const [p, v, q] = a;
  return p < q ? `${p}${v}${q}` : `${q}${v}${p}`;
};
const pairKey = (a, b) => [a, b].sort().join("|");

// ---------- 2. congruence is an equivalence relation ----------
class DSU {
  constructor() { this.parent = new Map(); }
  find(x) {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let r = x;
    while (this.parent.get(r) !== r) r = this.parent.get(r);
    return r;
  }
  union(a, b) { this.parent.set(this.find(a), this.find(b)); }
  same(a, b) { return this.find(a) === this.find(b); }
  classes() {
    const g = new Map();
    for (const k of this.parent.keys()) {
      const r = this.find(k);
      if (!g.has(r)) g.set(r, []);
      g.get(r).push(k);
    }
    return [...g.values()].filter((c) => c.length > 1);
  }
}

const eachPair = (xs, fn) => {
  for (let i = 0; i < xs.length; i++)
    for (let j = i + 1; j < xs.length; j++) fn(xs[i], xs[j]);
};

// ---------- 3. compile the marks into a queryable model ----------
function compile(facts, { mode = "marked" } = {}) {
  const congSeg = new DSU();
  const congAng = new DSU();
  const parallel = new DSU();
  const perp = new Set();
  const right = new Set();

  for (const f of facts) {
    switch (f.type) {
      case "congruent_segments":
        eachPair(f.refs.map(seg), (a, b) => congSeg.union(a, b));
        break;
      case "congruent_angles":
        eachPair(f.refs.map(ang), (a, b) => congAng.union(a, b));
        break;
      case "parallel":
        eachPair(f.refs.map(seg), (a, b) => parallel.union(a, b));
        break;
      case "perpendicular":
        perp.add(pairKey(seg(f.refs[0]), seg(f.refs[1])));
        break;
      case "right_angle":
        right.add(ang(f.refs[0]));
        break;
      case "midpoint": {
        // "M is the midpoint of AB"  =>  AM congruent to MB
        const [m, s] = f.refs;
        congSeg.union(seg(s[0] + m), seg(m + s[1]));
        break;
      }
    }
  }

  // Deductions the marks *license* but don't state outright.
  // Only applied in "derived" mode -- see the note below.
  if (mode === "derived") {
    for (const a of right) perp.add(pairKey(seg(a[0] + a[1]), seg(a[1] + a[2])));
    const lines = [...new Set([...perp].flatMap((k) => k.split("|")))];
    // two lines perpendicular to the same line are parallel to each other
    for (const l of lines) {
      const orth = lines.filter((m) => perp.has(pairKey(l, m)));
      eachPair(orth, (a, b) => parallel.union(a, b));
    }
  }

  return {
    holds(claim) {
      switch (claim.type) {
        case "congruent_segments": return congSeg.same(seg(claim.refs[0]), seg(claim.refs[1]));
        case "congruent_angles":   return congAng.same(ang(claim.refs[0]), ang(claim.refs[1]));
        case "parallel":           return parallel.same(seg(claim.refs[0]), seg(claim.refs[1]));
        case "perpendicular":      return perp.has(pairKey(seg(claim.refs[0]), seg(claim.refs[1])));
        case "right_angle":        return right.has(ang(claim.refs[0]));
        default: return false;
      }
    },
    tickGroups: () => congSeg.classes(),   // class 0 -> 1 tick, class 1 -> 2 ticks ...
    arcGroups: () => congAng.classes(),
  };
}

// ---------- 4. say it in English ----------
const say = (c) => ({
  congruent_segments: `${c.refs[0]} \u2245 ${c.refs[1]}`,
  congruent_angles:   `\u2220${c.refs[0]} \u2245 \u2220${c.refs[1]}`,
  parallel:           `${c.refs[0]} \u2225 ${c.refs[1]}`,
  perpendicular:      `${c.refs[0]} \u22a5 ${c.refs[1]}`,
  right_angle:        `\u2220${c.refs[0]} is a right angle`,
}[c.type]);

// ---------- 5. enumerate every claim the figure could make ----------
function candidateClaims(diagram) {
  const segs = diagram.edges.map((e) => seg(e.from + e.to));
  const out = [];
  eachPair(segs, (a, b) => {
    out.push({ type: "congruent_segments", refs: [a, b] });
    out.push({ type: "parallel", refs: [a, b] });
    out.push({ type: "perpendicular", refs: [a, b] });
  });
  eachPair(diagram.angles ?? [], (a, b) =>
    out.push({ type: "congruent_angles", refs: [a, b] }));
  return out;
}

// ---------- 6. build a 4-option multiple choice ----------
function buildMultipleChoice(diagram, rng = Math.random) {
  const model = compile(diagram.facts);
  const claims = candidateClaims(diagram);
  const tru = claims.filter((c) => model.holds(c));
  const fls = claims.filter((c) => !model.holds(c));
  if (!tru.length || fls.length < 3) return null;

  const answer = tru[Math.floor(rng() * tru.length)];
  // near misses first: same relationship type, then anything else
  const near = fls.filter((c) => c.type === answer.type);
  const rest = fls.filter((c) => c.type !== answer.type);
  const wrong = [...near, ...rest].slice(0, 3);

  const options = [answer, ...wrong]
    .map((c) => ({ c, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.c);

  return {
    stem: "Which statement is indicated by the marks on the diagram?",
    options: options.map(say),
    answerIndex: options.indexOf(answer),
  };
}

export { compile, candidateClaims, buildMultipleChoice, say };
