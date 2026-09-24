import { check } from "./validate.mjs";

const mt = (latex, plainText) => ({ latex, plainText });

// ---- #20: reflex angle around a point. 3 rays at 0deg, 35deg, 64deg ----
const q20 = {
  id: "ws-lakeside-p2-q20",
  schemaVersion: 1,
  source: {
    worksheetId: "lakeside-angles-p2",
    printedNumber: "20)",
    confidence: "low",
    uncertainPaths: [
      "diagram.angles.a1.measure.constant",  // could be -24 or +24
      "diagram.angles.a3.measure.degrees",   // 296 or 295
    ],
  },
  stem: mt("Find the value of \(x\).", "Find the value of x."),
  solveFor: "x",
  diagram: {
    kind: "angle",
    scale: "exact",
    altText: "Three rays from a point. Two small angles labelled x minus 24 degrees and 29 degrees, and a reflex angle of 296 degrees.",
    viewport: { width: 320, height: 260 },
    vertex: { x: 160, y: 140 },
    rays: [
      { id: "r1", degrees: 0,  arrow: "end" },
      { id: "r2", degrees: 35, arrow: "end" },
      { id: "r3", degrees: 64, arrow: "end" },
    ],
    angles: [
      { id: "a1", from: "r1", to: "r2", role: "unknown", arcs: 1,
        measure: { kind: "linear", variable: "x", coefficient: 1, constant: -24 },
        label: mt("(x-24)^\circ", "x minus 24 degrees") },
      { id: "a2", from: "r2", to: "r3", role: "given", arcs: 1,
        measure: { kind: "known", degrees: 29 },
        label: mt("29^\circ", "29 degrees") },
      { id: "a3", from: "r3", to: "r1", role: "given", arcs: 1,
        measure: { kind: "known", degrees: 296 },
        label: mt("296^\circ", "296 degrees") },
    ],
    relations: [
      { type: "sum", name: "around_point", angleIds: ["a1", "a2", "a3"], totalDegrees: 360 },
    ],
  },
  options: [
    { id: "o1", label: mt("x = 59", "x equals 59") },
    { id: "o2", label: mt("x = 35", "x equals 35"), misconception: "solved for the angle, not for x" },
    { id: "o3", label: mt("x = 11", "x equals 11"), misconception: "read the label as x plus 24" },
    { id: "o4", label: mt("x = 64", "x equals 64"), misconception: "used 180 instead of 360" },
  ],
  correctOptionId: "o1",
  answer: { variable: "x", value: 59 },
  solution: [
    mt("(x-24) + 29 + 296 = 360", "x minus 24, plus 29, plus 296, equals 360"),
    mt("x - 24 = 35", "x minus 24 equals 35"),
    mt("x = 59", "x equals 59"),
  ],
  metadata: { skill: "angles-around-a-point", difficulty: 3 },
};

// ---- #19: linear pair. (3x+18) and 93 on a straight line ----
const q19 = structuredClone(q20);
Object.assign(q19, {
  id: "ws-lakeside-p2-q19",
  source: { ...q20.source, printedNumber: "19)", confidence: "medium", uncertainPaths: [] },
  answer: { variable: "x", value: 23 },
  correctOptionId: "o1",
  options: [
    { id: "o1", label: mt("x = 23", "x equals 23") },
    { id: "o2", label: mt("x = 25", "x equals 25"), misconception: "used 180 - 93 = 87 then divided wrong" },
    { id: "o3", label: mt("x = 87", "x equals 87"), misconception: "stopped at the angle measure" },
    { id: "o4", label: mt("x = 54", "x equals 54"), misconception: "treated it as 360 around a point" },
  ],
  solution: [mt("(3x+18) + 93 = 180", "3x plus 18, plus 93, equals 180"), mt("3x = 69", "3x equals 69"), mt("x = 23", "x equals 23")],
  metadata: { skill: "linear-pair", difficulty: 2 },
});
q19.diagram = {
  ...q20.diagram,
  altText: "Two rays from a point on a line. One angle is 3x plus 18 degrees, the other is 93 degrees.",
  rays: [
    { id: "r1", degrees: 0,   arrow: "end" },
    { id: "r2", degrees: 87,  arrow: "end" },   // (3*23+18) = 87
    { id: "r3", degrees: 180, arrow: "end" },
  ],
  angles: [
    { id: "a1", from: "r1", to: "r2", role: "unknown", arcs: 1,
      measure: { kind: "linear", variable: "x", coefficient: 3, constant: 18 },
      label: mt("(3x+18)^\circ", "3 x plus 18 degrees") },
    { id: "a2", from: "r2", to: "r3", role: "given", arcs: 1,
      measure: { kind: "known", degrees: 93 },
      label: mt("93^\circ", "93 degrees") },
  ],
  relations: [{ type: "sum", name: "linear_pair", angleIds: ["a1", "a2"], totalDegrees: 180 }],
};

// ---- the example from the pasted plan, transcribed into this schema ----
const pasted = structuredClone(q20);
Object.assign(pasted, { id: "pasted-plan-example", answer: { variable: "x", value: 12 } });
pasted.diagram = {
  ...q20.diagram,
  scale: "exact",
  rays: [
    { id: "r1", degrees: 110, arrow: "end" },
    { id: "r2", degrees: 63,  arrow: "end" },
    { id: "r3", degrees: 24,  arrow: "end" },
  ],
  angles: [
    { id: "a1", from: "r2", to: "r1", role: "unknown", arcs: 1,
      measure: { kind: "linear", variable: "x", coefficient: 1, constant: 24 },
      label: mt("(x+24)^\circ", "x plus 24 degrees") },
    { id: "a2", from: "r3", to: "r2", role: "given", arcs: 1,
      measure: { kind: "known", degrees: 29 }, label: mt("29^\circ", "29 degrees") },
    { id: "a3", from: "r1", to: "r3", role: "given", arcs: 1,
      measure: { kind: "known", degrees: 295 }, label: mt("295^\circ", "295 degrees") },
  ],
  relations: [{ type: "sum", name: "around_point", angleIds: ["a1", "a2", "a3"], totalDegrees: 360 }],
};

for (const [name, q] of [["#19 linear pair", q19], ["#20 reflex", q20], ["pasted-plan example", pasted]]) {
  const r = check(q);
  console.log(`\n${name}  ->  ${r.ok ? "PASS" : "FAIL"}`);
  r.errors?.forEach((e) => console.log(`   - ${e}`));
  if (r.ok) console.log(`   ${r.problem.solveFor} = ${r.problem.answer.value}, confidence ${r.problem.source.confidence}` +
    (r.problem.source.uncertainPaths.length ? `, review: ${r.problem.source.uncertainPaths.join(", ")}` : ""));
}
