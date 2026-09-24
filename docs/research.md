# Problem generation — research notes

Design sessions, September 2026. Nothing here is built yet. This records the
decisions, the reasoning behind them, and the things that are still open, so a
future session doesn't re-derive it.

Runnable prototype: [`prototypes/problem-generation/`](../prototypes/problem-generation).
Not app code — throwaway, but it runs and it produced most of the findings below.

---

## The central decision

**The model authors content. Deterministic code decides what is true.**

The naive pipeline is photo → model → "give me five more like this" → show. It
fails for a reason that isn't about model quality: you need 30–60 problems a day
per kid, generated unattended, and a wrong answer lands inside a gate the kid
cannot skip.

| Answer accuracy | Wrong answers reaching the kid |
| --- | --- |
| 97% | 1–2 every day |
| 99% | 1 every 2 days |
| 99.9% | 1 every 2–3 weeks |

A model that is 99% right at grade-school math is excellent and still hands a kid
a wrong answer every other day. That is not a prompting problem. The fix is to
make errors *catchable*, not rarer.

Corollary: you cannot hand-verify your way there either. Zero errors in 300
sampled instances only proves you're under ~1%. Reaching 0.1% by sampling would
take ~3,000 hand-checked items per prompt change, which nobody will ever do.
Confidence has to come from structure.

---

## Where an answer comes from, strongest first

1. **Derived** — falls out of structure you already hold. "Is CD ∥ EF indicated?"
   is a lookup in a fact graph. An angle measure is known because *you* chose the
   coordinates. Zero error rate, narrow applicability.
2. **Executed** — the model emits a *computation*, not a number:
   `{ "expr": "6 * 4 - 7", "steps": [...] }`. You evaluate it. The model does
   semantics (what it's good at); code does arithmetic (what it silently fumbles).
   This is the one that generalises past geometry. Distractors come free by
   mutating the expression — drop the last op → "stopped early", flip the sign →
   "wrong operation".
3. **Agreed** — for things you can't execute (proofs, "which diagram shows X"),
   the model answers and a *second, different* model must concur. Cross-model
   agreement beats sampling one model k times, which shares systematic
   misconceptions. Affordable because generation is offline.
4. **Constructed backward** — the trick that beats all three. Pick the answer
   first, build the problem around it. Choose 47°, then draw a 47° angle. Choose
   the leftover, then pick the numbers. You never solve anything, so the error
   rate is zero.

**We are minting problems, not solving them, and minting runs backward.** The
scanned worksheet supplies *structure*, not content.

---

## Diagrams

### Rejected

- **TikZ / LaTeX** for diagrams — needs a LaTeX toolchain, so every instance
  becomes a server render to PNG. Kills offline. And it's write-only: you cannot
  mechanically ask whether the tick marks match the stated answer.
- **Raw SVG as the canonical form** — a picture can't be checked against an
  answer.

LaTeX *is* right for math notation in text and labels. Diagram labels get baked
into the SVG at generation time, so no LaTeX on device. Stems with real notation
(fractions, exponents) will eventually need KaTeX in a small WebView.

### Adopted

Semantic spec is the source of truth; the drawing and the answer are both derived
from it, so they cannot disagree. Marks are never authored — tick counts and
angle arcs are *rendered from* congruence classes (union-find), which also gives
transitivity for free.

### The to-scale decision — make it explicit

`scale: "exact" | "schematic"`. Textbooks legitimately say "not drawn to scale",
but you have to *pick*. Land in between by accident and you get random
inconsistency.

This is not hypothetical. An alternative plan produced by another agent shipped a
canonical reflex-angle example whose rays were drawn at 110°/63°/24°, giving
angles of 47°/39°/274°, while the labels said 36°/29°/295°. Both sum to 360, so
each is internally coherent; the picture simply contradicted its own labels. A
40-line validator catches it. Nothing catches it in TikZ or raw SVG.

---

## The schema

See `prototypes/problem-generation/schema.mjs` (Zod) and `validate.mjs`.

Three layers plus a checker:

| Layer | Fields | Job |
| --- | --- | --- |
| Display | `vertex`, `rays[].degrees`, `viewport` | where things are drawn — never authoritative |
| Meaning | `angles[].measure`, `relations`, `solveFor` | what is true |
| Labels | `label.latex`, `label.plainText` | what a human reads / hears |

Wrapped by `Problem`: `stem`, `options[4]` with stable ids and a `misconception`
on every distractor, `correctOptionId`, derived `answer`, `solution[]`,
`metadata`, and `source`.

**`source` carries `confidence` and `uncertainPaths`** — the specific fields the
extraction wasn't sure about. That drives the parent-review queue. It is not
decoration: two different AIs read the same worksheet problem and got `x = 59`
and `x = 12`, because neither could resolve `(x−24)` vs `(x+24)` from a phone
photo.

### Design choices worth keeping

- **Counter-clockwise `from` → `to`, not a `sweep: minor|major|reflex` enum.** A
  flag can disagree with the coordinates; a computed sweep can't. Reflex is
  simply a sweep over 180.
- **Two relation types, not six.** `sum` and `equal` cover linear pairs, angles
  around a point, supplementary, complementary and vertical angles. One solver
  (~15 lines) handles an entire worksheet page.
- **Structured `measure`, separate from the label.** `known(93)` or
  `linear(x, 3, 18)`. You cannot solve `"\\((3x+18)^\\circ\\)"`.
- **Stable option ids, never option text.** Text gets reformatted, shuffled,
  translated.
- **`plainText` beside every `latex`** — accessibility and text-to-speech.

### What the validator refuses

Referential integrity; an `answer` that doesn't follow from the `relations`
(it re-solves and compares); any drawn sweep that disagrees with its label when
`scale: "exact"`; a correct option carrying a `misconception`; a distractor
without one; duplicate option text.

---

## Rendering

**The unlock: generation is offline, at scan time.** So the diagram engine runs
in Node, emits static SVG into the bank, and the app displays a string. **No
renderer on the device at all** — no `react-native-svg` arc math, no Skia.

| Option | Notes |
| --- | --- |
| **JSXGraph + JessieCode** | MIT/LGPL. Construction semantics with a dependency engine. JessieCode is a sandboxed DSL built for third-party math portals — good shape for model-generated content. Boring and predictable; the recommended start. |
| **Penrose** (CMU, SIGGRAPH 2020) | MIT. You state constraints, it *solves for coordinates* by numerical optimisation — the drawn-vs-labelled bug becomes impossible. Research-grade; layout can be slow or odd. Worth it when layout is genuinely hard (triangles with several congruence constraints), overkill for rays from a point. |
| **Model emits SVG directly** | Cheapest by far. Viable *because* truth lives in the measure/relation block — a wrong picture is then a cosmetic bug, not a wrong answer. Worth testing at M0 before adopting a library. |
| **GeoGebra** | Most capable engine; commercial use requires a licensing arrangement. SolveLock is commercial. |
| **react-native-svg / Skia** | Only needed if you decide to render on device. The workstream this whole section exists to avoid. |

---

## Khan Academy Perseus

Cloned to `C:\Users\ramko\tinkerings\perseus` (shallow, 45 MB).

**Not usable as a renderer.** It's React web on `mafs`, with `jquery` and
`@dnd-kit` in the dependency tree, so Expo would mean a WebView — which costs
native haptic timing and instant screen open, the two things the kid view's
delight budget is spent on. More fundamentally: **Perseus draws on a coordinate
plane; worksheet figures live in free space.** And its static vocabulary
(`locked-figures/`: point, line, vector, polygon, ellipse, label, function) has
**no arc** — arcs exist only inside the interactive angle and polygon graphs. The
exact primitive these worksheets are built from is the one it can't statically
draw.

**Worth taking:**

- `@khanacademy/kmath` and `@khanacademy/kas` are **DOM-free** (no React, no
  jQuery). `kmath` exports `vector`, `point`, `line`, `ray`, `angles`,
  `geometry`. `kas` is Khan Academy Symbolic — expression equivalence checking,
  i.e. their STACK equivalent, and what you'd want for free response. Both run in
  Node or React Native.
- `interactive-graphs/graphs/components/angle-indicators.tsx` — `Arc`,
  `RightAngleSquare`, `shouldDrawArcOutside`, `calculateBisectorPoint`. Port the
  math before writing arc placement from scratch.
- `measurer` is a draggable protractor and ruler — existing art for the "find the
  measure to the nearest degree" problems.
- The widget list is a good catalogue of what a mature item format needs. Their
  multiple-choice widget is `radio`.

There is **no Khan Academy API** — deprecated in 2020, no developer program. And
their content is CC BY-**NC**-SA, so it's unusable commercially regardless.

---

## Question banks

### Commercially usable

| Bank | Size | Level | Licence | Link |
| --- | --- | --- | --- | --- |
| GSM8K | 8.5K | grade school word problems, worked solutions | MIT | [HF](https://huggingface.co/datasets/openai/gsm8k) · [paper](https://arxiv.org/pdf/2110.14168) |
| AQuA-RAT | ~100K | algebra, **5 options + rationales** | Apache 2.0 | [GitHub](https://github.com/google-deepmind/AQuA) · [HF](https://huggingface.co/datasets/deepmind/aqua_rat) |
| SVAMP | ~1K | arithmetic, systematic variations | MIT | [GitHub](https://github.com/arkilpatel/SVAMP) |
| ASDiv | 2,305 | elementary, annotated with **problem type and grade level** | verify | [GitHub](https://github.com/chaochun/nlu-asdiv-dataset) · [paper](https://aclanthology.org/2020.acl-main.92.pdf) |

AQuA-RAT already ships the exact output contract. ASDiv's per-problem grade and
type labels are what adaptive difficulty needs, already done by humans.

### Geometry with diagram annotations — research use only

- **PGPS9K** — 9,022 problems, 4,000 diagrams, grades 6–12, from five textbooks;
  carries both diagram annotations and solution programs. Expands Geometry3K.
  [GitHub](https://github.com/mingliangzhang2018/pgps) (download password
  `PAL_PGPS_2023`)
- **Geometry3K / Inter-GPS** — 3,002 problems with formal-language parses.
  [GitHub](https://github.com/lupantech/InterGPS) ·
  [HF mirror](https://huggingface.co/datasets/hiyouga/geometry3k)
- **PGDP5K** — diagram parsing: 16 shapes, 5 positional relations, 22 symbol
  types. Effectively our extraction task, already labelled.
  [arXiv](https://arxiv.org/abs/2205.09947)

### Parameterized but non-commercial

**WeBWorK Open Problem Library** — ~35,000 parameterized problems with answers
computed in code. Architecturally ideal, and **CC BY-NC-SA 3.0**, so off the
table. [GitHub](https://github.com/openwebwork/webwork-open-problem-library) ·
[licence](https://github.com/openwebwork/webwork-open-problem-library/blob/main/OPL_LICENSE)

The best-engineered open math banks are almost all NC — built by educators for
classrooms, not for products.

### CC BY curriculum (PDFs, needs extraction)

[OpenStax K-12](https://openstax.org/k12/math) ·
[Illustrative Mathematics](https://illustrativemathematics.org) ·
[Open Up Resources](https://openupresources.org) ·
[Utah Middle School Math](https://utahmiddleschoolmath.org)

Verify the licence on the specific book before building on it.

### Conclusion

**Word problems you can source. Geometry you have to generate.** Which is
exactly where the worksheets in this house live, so there's no routing around it.

Two consequences worth acting on:

- The extraction pipeline's first input should be **clean CC BY PDFs**, not phone
  photos. Same pipeline on easy mode — real text layer, no skew, no shadow. Build
  and validate M0–M5 there before touching a blurry photo.
- A pre-built bank ships *with* the app, so it works at install with zero setup —
  which is where [identity.md](identity.md) says parents are most likely to be
  lost. The parent's scan then becomes a **steering signal** (what is this kid
  working on this week) rather than the entire supply.

---

## Evaluation

The test set: the four worksheet pages photographed in September 2026, ~28
problems. Hand-label once. Hold one page back and never look at it while
iterating.

| # | Milestone | Measured on | Gate |
| --- | --- | --- | --- |
| **M0** | Naive one-shot: photo → MC problems, no schema | 4 pages | none — this is the baseline everything must beat |
| **M1** | Segmentation | 28 problems | finds 28/28, invents 0, three runs running |
| **M2** | Triage (direct / convertible / drop) | 28 problems | ≥90% agreement, **and zero drop-items marked usable** |
| **M3** | Extraction fidelity | ~14 diagram problems | ≥95% facts correct; validator passes **100%** |
| **M4** | Answer correctness | ~300 generated instances | zero wrong — but see below |
| **M5** | Distractor quality | ~100 instances | no option eliminable without solving; each maps to a named misconception |
| **M6** | Rendering | 14 diagrams | a stranger reading the SVG extracts the same facts as from the original |
| **M7** | Bank + offline | full pipeline | 500 problems in SQLite, airplane mode, no repeat within a session |

**M0 is the hypothesis that all of this is unnecessary.** Run it first. If it
scores well, most of the architecture above is premature.

Two gates are deliberately asymmetric. M2 cares far more about a construction
problem wrongly marked usable than the reverse. M3's validator gate is 100%, not
95% — a self-contradicting diagram is a bug, not a near miss.

**The unit of evaluation changes at M4.** M1–M3 evaluate *reading*, and the test
items are the 28 hand-labelled problems. M4–M5 evaluate *generating*, and the
test items become the hundreds of instances minted from them. You can't hand-label
those, so the eval must turn into structural checks that run on unlabelled output.
That transition is forced, and it's why M4 is passed by making answers
structurally incapable of being wrong rather than by checking harder.

28 runs out around M3 — a 2-problem swing is noise. Growing to ~100 means 12–15
more pages. Every bad problem that reaches a kid joins the set; it becomes a
regression suite.

### Triage has three buckets, not two

From the actual worksheets, only ~20% of problems are natively multiple choice:

| Type | Count | MC as printed? |
| --- | --- | --- |
| "Write if the statement is indicated by the marks" | ~6 | **yes**, natively binary |
| "Find the measure of each angle to the nearest degree" | 10 | no — needs a protractor |
| "List all information given by the marks" | ~10 | no — the answer is a list |
| "Draw and mark a diagram that…" | 2 | no — it's a construction |

The middle bucket matters: **convert with a transformation that preserves the
skill.** "List all information" becomes *"Which of these is NOT shown by the
marks?"* "Draw a diagram with two congruent segments" inverts to *"Which of these
four diagrams shows that?"* — you lose the construction, you keep the recognition.
Proposing these transformations is exactly what a strong model is for.

Then tell the parent plainly what you dropped and why. Honesty buys more trust
than silent coverage and is cheaper to build.

---

## Model selection

**Do not pick a model before M0 has run.** An alternative plan named Gemini Flash
as primary on general reasoning — the cheap tier assigned to the hardest
perceptual task (reading tick marks off a blurry photo), which is where
degradation shows up first.

Volume is tiny: ~2K input + ~4K output per page, maybe 4 pages a week per family.
The spread between the cheapest and most expensive option is roughly **$20 per
family per year**. One bad extraction poisons a template that fires for weeks.
Optimise accuracy now; revisit cost at scale. The schema is the contract, so
switching later is a config change.

It's two jobs with different answers. **Reading the page** is near-commodity —
frontier handwriting CER clusters within ~0.2 points, and Qwen2.5-VL is
self-hostable and competitive. **Reasoning about the geometry** — emitting
coordinates consistent with asserted facts, proposing MC conversions, staying in
a strict schema — is where models separate. Consider a cheap model for
segmentation and a strong one for the fact graph.

**Your validator is what lets you shop on price.** A cheap model's errors get
caught, not shipped, which turns model choice into a throughput question. Build
the validator before picking a model — it's the measuring instrument.

### Platform

**OpenRouter** is the only aggregator carrying proprietary *and* open models
behind one key. Two caveats: image preprocessing differs per model behind the
gateway (decisive when the signal is a 2-pixel tick mark), and structured-output
support is uneven — which is the variable that matters most here.

For manual iteration, use the **developer playgrounds** (Google AI Studio,
Anthropic Console, OpenAI Playground), **not** the consumer chat apps. Consumer
chat can't do structured outputs at all, hides its own system prompt and routing,
preprocesses images differently, and — the subtle one — **contaminates results**,
because pasting page 2 into a thread that already contains page 1 and your
reaction to it makes page 2's result non-independent.

Playground for M0, API from M1 onward, the moment you want a number.

### Public benchmarks, mapped to our stages

Useful for shortlisting only; none of them measure *generating* problems.

| Rung | Question | Benchmark |
| --- | --- | --- |
| 0 | Can it read a worksheet? | OCRBench v2, DocVQA |
| 1 | Can it turn a diagram into structure? | **PGDP5K** |
| 2 | Does it actually *look* at the diagram? | **MathVerse** |
| 3 | Can it reason over visual math? | MathVista, MATH-Vision |
| 4 | Does it survive templating? | GSM-Symbolic |
| 5 | Does it work on our pages? | the 28 |

**MathVerse is the one to run.** It renders each problem in six versions varying
how much information sits in the text versus the diagram — it exists to catch
models that pattern-match captions instead of reading the picture. On these
worksheets the marks *are* the information, so that's precisely our risk.

Caveats: GSM8K is saturated and contaminated. And every one of these uses clean
rendered images, while our input is a phone photo at an angle with a shadow and a
sticker on the page — so benchmark scores overstate real performance, and the gap
is the part we care about.

---

## Open questions

- Run M0. Everything above is a hypothesis until it has a number.
- ASDiv's licence.
- Whether `scale` should default to `"exact"` or `"schematic"` for generated
  content — a pedagogy call, not a technical one.
- `mode: "marked"` vs `"derived"` in the fact graph: does a two-step consequence
  count as "indicated by the marks"? Most teachers mean directly marked. It's
  also a natural difficulty dial.
- Positioning drift to watch: hints, worked explanations and a weak/strong skills
  dashboard are tutor features for a kid who opted in. A skills dashboard is the
  surveillance pattern [kid-experience.md](kid-experience.md) principle 6 warns
  about. Building the tutor is a legitimate choice — but it's a decision, not a
  detail.
