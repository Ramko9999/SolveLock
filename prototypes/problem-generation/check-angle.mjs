// The reflex-angle example from the pasted plan.
const rays = { ray_a: 110, ray_b: 63, ray_c: 24 };
const norm = (d) => ((d % 360) + 360) % 360;
const minor = (a, b) => { const d = norm(a - b); return Math.min(d, 360 - d); };

const drawn = {
  angle_x_plus_24: minor(rays.ray_a, rays.ray_b),
  angle_29:        minor(rays.ray_b, rays.ray_c),
  angle_295:       360 - minor(rays.ray_c, rays.ray_a),   // sweep: "reflex"
};

// x from the stated constraint: (x+24) + 29 + 295 = 360
const x = 360 - 295 - 29 - 24;
const labelled = { angle_x_plus_24: x + 24, angle_29: 29, angle_295: 295 };

console.log(`solved x = ${x}\n`);
console.log("angle                 drawn    labelled   match");
for (const k of Object.keys(drawn)) {
  const d = drawn[k], l = labelled[k];
  console.log(`${k.padEnd(20)} ${String(d).padStart(5)}  ${String(l).padStart(9)}   ${d === l ? "yes" : "NO  (off by " + Math.abs(d - l) + ")"}`);
}
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
console.log(`\nsum of drawn: ${sum(drawn)}   sum of labelled: ${sum(labelled)}`);
