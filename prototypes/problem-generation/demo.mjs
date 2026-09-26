import { compile, buildMultipleChoice, say } from "./facts.mjs";

// Isosceles triangle: two ticks on AB and AC, arcs on the two base angles.
const triangle = {
  edges: [
    { from: "A", to: "B" }, { from: "B", to: "C" }, { from: "A", to: "C" },
  ],
  angles: ["ABC", "ACB", "BAC"],
  facts: [
    { type: "congruent_segments", refs: ["AB", "AC"] },
    { type: "congruent_angles",   refs: ["ABC", "ACB"] },
  ],
};

const model = compile(triangle.facts);

console.log("--- querying the marks directly ---");
for (const q of [
  { type: "congruent_segments", refs: ["BA", "CA"] },  // same as AB/AC, written backwards
  { type: "congruent_segments", refs: ["AB", "BC"] },
  { type: "congruent_angles",   refs: ["CBA", "BCA"] },// vertex-in-middle, reversed
  { type: "congruent_angles",   refs: ["ABC", "BAC"] },
]) {
  console.log(`  ${say(q).padEnd(26)} -> ${model.holds(q) ? "INDICATED" : "not indicated"}`);
}

console.log("\n--- tick/arc groups the renderer uses ---");
console.log("  segments:", model.tickGroups(), " angles:", model.arcGroups());

// Transitivity for free: a third segment marked congruent to AC.
const chained = compile([
  { type: "congruent_segments", refs: ["AB", "AC"] },
  { type: "congruent_segments", refs: ["AC", "DE"] },
]);
console.log("\n--- transitivity ---");
console.log("  AB \u2245 DE was never marked, but ->",
  chained.holds({ type: "congruent_segments", refs: ["AB", "DE"] }) ? "INDICATED" : "not indicated");

// Midpoint expands into a congruence.
const mid = compile([{ type: "midpoint", refs: ["M", "AB"] }]);
console.log("\n--- midpoint ---");
console.log("  M midpoint of AB  =>  AM \u2245 MB ->",
  mid.holds({ type: "congruent_segments", refs: ["AM", "MB"] }) ? "INDICATED" : "not indicated");

console.log("\n--- generated multiple choice (seeded) ---");
let s = 7;
const rng = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let i = 0; i < 3; i++) {
  const p = buildMultipleChoice(triangle, rng);
  console.log(`\n  ${p.stem}`);
  p.options.forEach((o, j) =>
    console.log(`    ${"ABCD"[j]}) ${o}${j === p.answerIndex ? "   <-- answer (computed)" : ""}`));
}
