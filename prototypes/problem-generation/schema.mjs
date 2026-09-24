import { z } from "zod";

export const MathText = z.object({
  latex: z.string(),
  plainText: z.string(),          // accessibility + text-to-speech
});

// Every label on this page is either a number or `a*v + b`.
// "b" on its own is just linear(v=b, a=1, b=0) -- one less case to get wrong.
export const Measure = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("known"), degrees: z.number().positive().lt(360) }),
  z.object({
    kind: z.literal("linear"),
    variable: z.string().min(1),
    coefficient: z.number(),
    constant: z.number(),
  }),
]);

export const Ray = z.object({
  id: z.string().min(1),
  degrees: z.number().min(0).lt(360),   // display direction, ccw from +x axis
  arrow: z.enum(["none", "end", "both"]).default("end"),
});

export const Angle = z.object({
  id: z.string().min(1),
  from: z.string().min(1),              // ray id
  to: z.string().min(1),                // swept COUNTER-CLOCKWISE from `from`
  measure: Measure,
  label: MathText.optional(),
  role: z.enum(["given", "unknown"]),
  arcs: z.number().int().min(0).max(3).default(1),
});

// linear_pair / around_point / supplementary / complementary are all `sum`.
// vertical_angles is `equal`. Two rules, one solver.
export const Relation = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sum"),
    angleIds: z.array(z.string()).min(2),
    totalDegrees: z.number().positive(),
    name: z.enum(["linear_pair", "around_point", "supplementary", "complementary", "other"]),
  }),
  z.object({
    type: z.literal("equal"),
    angleIds: z.array(z.string()).min(2),
    name: z.enum(["vertical_angles", "congruent", "other"]),
  }),
]);

export const AngleDiagram = z.object({
  kind: z.literal("angle"),
  // "exact": the drawing must agree with the measures, and we check it.
  // "schematic": deliberately not to scale; we render a disclaimer instead.
  scale: z.enum(["exact", "schematic"]),
  altText: z.string().min(1),
  viewport: z.object({ width: z.number(), height: z.number() }),
  vertex: z.object({ x: z.number(), y: z.number(), label: MathText.optional() }),
  rays: z.array(Ray).min(2),
  angles: z.array(Angle).min(1),
  relations: z.array(Relation).min(1),
});

export const Option = z.object({
  id: z.string().min(1),
  label: MathText,
  misconception: z.string().optional(),   // absent on the correct option
});

export const Problem = z.object({
  id: z.string().min(1),
  schemaVersion: z.literal(1),

  // Where it came from, and how much to trust the read.
  source: z.object({
    worksheetId: z.string(),
    printedNumber: z.string(),            // "20)"
    confidence: z.enum(["high", "medium", "low"]),
    uncertainPaths: z.array(z.string()),  // e.g. ["angles.a1.measure.coefficient"]
  }),

  stem: MathText,
  solveFor: z.string().min(1),
  diagram: AngleDiagram.optional(),

  options: z.array(Option).length(4),
  correctOptionId: z.string(),
  answer: z.object({ variable: z.string(), value: z.number() }),

  solution: z.array(MathText).min(1),
  metadata: z.object({
    skill: z.string(),
    difficulty: z.number().int().min(1).max(5),
  }),
});
