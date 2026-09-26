import { fromTemplate, fromDiagram, PACKS, evaluate } from "./generate.mjs";

let s = 20260922;
const rng = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;

const show = (p) => {
  console.log(`\n  ${p.stem}`);
  p.options.forEach((o, i) => {
    const mark = i === p.answerIndex ? "  <-- answer" : "";
    console.log(`     ${"ABCD"[i]}) ${String(o).padEnd(22)}${mark}   [${p.rationale[i]}]`);
  });
  console.log(`     solution: ${p.solution.join("  ->  ")}   difficulty ${p.difficulty}`);
};

console.log("=== word problems, minted from one template ===");
for (let i = 0; i < 3; i++) show(fromTemplate(PACKS, rng));

console.log("\n\n=== geometry, minted from one scanned figure ===");
const fig = {
  id: "two-transversals",
  points: [
    { id: "D", x: 90,  y: 40  }, { id: "F", x: 210, y: 40  },
    { id: "C", x: 90,  y: 150 }, { id: "E", x: 210, y: 150 },
  ],
  edges: [
    { from: "D", to: "C" }, { from: "F", to: "E" },
    { from: "D", to: "F" }, { from: "C", to: "E" },
  ],
  angles: ["DCE", "FEC", "CDF", "EFD"],
  facts: [
    { type: "congruent_segments", refs: ["DC", "FE"] },
    { type: "parallel", refs: ["DF", "CE"] },
  ],
};
for (let i = 0; i < 2; i++) {
  const p = fromDiagram(fig, rng);
  if (p) show(p); else console.log("\n  (rejected: not enough same-type distractors)");
}

console.log("\n\n=== the gate: model-supplied arithmetic is never trusted ===");
for (const e of ["6 * 4 - 7", "process.exit(1)", "1/0"]) {
  try { console.log(`  ${e.padEnd(18)} -> ${evaluate(e)}`); }
  catch (err) { console.log(`  ${e.padEnd(18)} -> REJECTED (${err.message})`); }
}
