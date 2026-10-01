# Problem catalogue — Florida Reveal Geometry, Volume 1

A sample of the problem types in each lesson. Use it to find what the kid view
must show: which diagrams, which notation, which answer formats.

September 2026. The problems below are our own wording. We do not have the
McGraw Hill text (see [research.md](research.md) for why). Each type comes
from one of these sources:

- **FL-R nn** — item nn of Florida's
  [2025 released Geometry EOC test](https://flfast.org/content/contentresources/en/2025%20Test%20Release%20Support%20Document%20BEST%20Geometry_508.pdf).
  45 real items, with answers and the percentage of students who got each
  one right.
- **FL-S nn** — item nn of the
  [B.E.S.T. Geometry sample test](https://flfast.org/content/contentresources/en/BEST_GEO_Answer-Key_PBT.pdf).
- **IXL** — the skill that IXL maps to the lesson in its
  [Reveal Geometry alignment](https://www.ixl.com/math/skill-plans/reveal-math-2020-geometry.pdf).
  This gives the type of problem, not the problem.

The lesson list comes from the 2020 national edition. The Florida edition has
the same modules. Confirm the lesson order against a physical copy.

---

## What the kid view must show

### Diagram kinds

| # | Kind | Contains | Lessons |
| --- | --- | --- | --- |
| D0 | None | Text only | 1-6, 2-7, 3-2, 3-8, 6-6 |
| D1 | Number line or segment | Points, lengths, expressions on parts | 1-3, 1-4, 1-7 |
| D2 | Coordinate grid | Axes, points, polygons, image and preimage | 1-4, 1-6, 2-3, 2-4, 4-1 to 4-4, 5-7 |
| D3 | Lines and angles | Rays, angle arcs, degree labels, algebra labels such as (3x + 5)°, parallel arrows, right-angle boxes | 2-1, 2-2, 3-6, 3-7, 3-9 |
| D4 | Plane figures with marks | Triangles and quadrilaterals, tick marks for equal sides, multiple arcs for equal angles, medians, bisectors | 5-1 to 5-6, 6-1 to 6-4 |
| D5 | 3D solids | Prisms, pyramids, cones, dashed hidden edges, shading, nets, cross-section planes | 1-2, 2-5, 2-6 |
| D6 | Construction marks | Compass arcs, compass icon | 1-7, 2-1, 6-2 |
| D7 | Proof table | Two columns (Statement, Reason) with one blank | 3-4 to 3-6, 5-3 to 5-6 |
| D8 | Picture choices | Each answer choice is a small diagram | 2-4, 2-6, 3-1, 4-6 |

Volume 2 adds circles (chords, tangents, inscribed angles) and trigonometry
triangles. They use the same D3/D4 parts, plus a circle.

### Notation in the text

Segment bar (AB̄), arc (AC with an arc on top), ∠, △, ≅, ∥, ⊥, ~, primes
(A′), fractions, square roots, π, degree signs, and coordinates. Almost every
item has at least one of these, so the text needs a math renderer, not plain
text.

### Answer formats on the real test, and how we convert them

Our MVP has multiple choice only. The real test uses more formats:

| Real format | Example | Our conversion |
| --- | --- | --- |
| Single choice | FL-R 10, 23 | Use it as is |
| Number entry | FL-R 2, 4, 13 | 4 choices; each wrong choice is a known mistake |
| Choose in a sentence | FL-R 26, 45 | One blank for each problem |
| Select all | FL-R 27, 43 | Change to "Which one is true?" |
| Matching table | FL-R 37 | One row for each problem |
| Drawing | FL-R 30, 39 | Picture choices (D8) |
| Two parts | FL-R 7, 32 | Two problems in a row |

### Difficulty

Florida students got these items right 21–81% of the time. The median is about
34%. Items with a diagram to read (arcs, parallel lines) and items with ratios
are the hardest. We can use the percentage as a starting difficulty for each type.

---

## Samples by lesson

Answer formats: **MC** = multiple choice, **Pic** = picture choices.

### Module 1 — Tools of Geometry

| Lesson | Sample problem | Answer | Diagram | Source |
| --- | --- | --- | --- | --- |
| 1-2 Points, lines, planes | Planes P and Q intersect. What is their intersection? | A line | D5 | IXL |
| 1-3 Line segments | B is between A and C. AB = 2x + 3, BC = 5, AC = 20. Find x. | 6 | D1 | IXL |
| 1-4 Distance | Find the distance between (1, 2) and (7, 10). | 10 | D2 or D0 | IXL |
| 1-6 Partition | A(0, 0), B(9, 6). P is on AB̄ and AP : PB = 1 : 2. Find P. | (3, 2) | D0 | FL-R 2 (23%) |
| 1-7 Midpoints | One endpoint is (2, 5). The midpoint is (4, 1). Find the other endpoint. | (6, −3) | D0 | FL-R 10 (50%) |
| 1-7 Constructions | Which picture shows the construction of a perpendicular bisector? | Pic | D6, D8 | FL-R 17 (39%) |

### Module 2 — Angles and Geometric Figures

| Lesson | Sample problem | Answer | Diagram | Source |
| --- | --- | --- | --- | --- |
| 2-1 Vertical angles | Two lines intersect. Vertical angles are (3x + 10)° and (5x − 20)°. Find x. | 15 | D3 | IXL |
| 2-2 Complementary | ∠1 and ∠2 are complementary. ∠1 = 4x°, ∠2 = (x + 15)°. Find m∠1. | 60° | D3 | IXL |
| 2-3 Area on a grid | A rectangle has vertices (1, 1), (5, 1), (5, 4), (1, 4). Find its perimeter. | 14 | D2 | IXL |
| 2-4 Transformations | Which transformation moves figure A onto figure B? | Reflection | D2 | IXL |
| 2-5 Solids | How many edges does a triangular prism have? | 9 | D5 | IXL |
| 2-6 Nets | Which net folds into a cube? | Pic | D5, D8 | IXL |
| 2-7 Precision | A length is 12 cm to the nearest cm. What is the largest possible length? | 12.5 cm | D0 | IXL |

### Module 3 — Logical Arguments and Line Relationships

| Lesson | Sample problem | Answer | Diagram | Source |
| --- | --- | --- | --- | --- |
| 3-1 Counterexamples | "Every quadrilateral with 4 equal sides is a square." Which shape shows this is false? | A rhombus that is not a square | D8 | FL-R 42 (40%) |
| 3-2 Conditionals | "If a shape is a square, then it has 4 right angles." Which is the contrapositive? | "If it does not have 4 right angles, then it is not a square." | D0 | FL-R 6 (28%) |
| 3-5/3-6 Proofs | Proof table with one missing reason: ∠1 ≅ ∠2 because \_\_\_\_. | Vertical angles are congruent | D3, D7 | FL-S 2 |
| 3-7 Parallel lines | Lines f ∥ g. Corresponding angles are (3x + 5)° and 110°. Find x. | 35 | D3 | FL-R 4 (34%), FL-R 26 (38%) |
| 3-7 Angle names | ∠3 and ∠6 are what type of angle pair? | Alternate interior | D3 | IXL |
| 3-8 Slope | A line has the equation y = ⅔x + 1. What is the slope of a line perpendicular to it? | −3⁄2 | D0 | IXL |
| 3-10 Distance to a line | Find the distance from (0, 5) to the line y = 1. | 4 | D2 | IXL |

### Module 4 — Transformations and Symmetry

| Lesson | Sample problem | Answer | Diagram | Source |
| --- | --- | --- | --- | --- |
| 4-1 Reflections | A(2, 3) is reflected across the y-axis. Find A′. | (−2, 3) | D2 | IXL |
| 4-2 Translations | Triangle XYZ moves to X′Y′Z′ by (x, y) → (x + b, y + c). X(3, −2), X′(−1, 5). Find b. | −4 | D2 | FL-R 22 (46%) |
| 4-3 Rotations | Rotate P(4, 1) 90° counterclockwise about the origin. Find P′. | (−1, 4) | D2 | IXL |
| 4-4 Compositions | Which transformation makes a figure that is NOT congruent? | A dilation | D0 | FL-R 9 (30%), FL-R 40 (53%) |
| 4-6 Symmetry | How many lines of symmetry does a regular hexagon have? | 6 | D4 | IXL |

### Module 5 — Triangles and Congruence

| Lesson | Sample problem | Answer | Diagram | Source |
| --- | --- | --- | --- | --- |
| 5-1 Angle sum | An exterior angle is 120°. One remote interior angle is 45°. Find the other one. | 75° | D4 | IXL |
| 5-2 Corresponding parts | △ABC ≅ △DEF. Which side is congruent to BC̄? | EF̄ | D4 | FL-R 15 (63%) |
| 5-3 to 5-5 Which theorem | Two triangles with tick marks and arcs. Which theorem proves them congruent? | SAS / ASA / AAS / HL / not enough information | D4 | FL-R 41 (35%) |
| 5-6 Isosceles | An isosceles triangle has a base angle of 40°. Find the vertex angle. | 100° | D4 | IXL |
| 5-7 Coordinate proof | T(2, 5), U(6, 6), V(1, 9). Why is △TUV a right triangle? | The slopes of TŪ and TV̄ are ¼ and −4, so they are perpendicular | D2 | FL-R 12 (24%) |

### Module 6 — Relationships in Triangles

| Lesson | Sample problem | Answer | Diagram | Source |
| --- | --- | --- | --- | --- |
| 6-1 Perpendicular bisectors | P is on the perpendicular bisector of AB̄. PA = 3x + 1, PB = 10. Find x. | 3 | D4 | IXL |
| 6-3 Medians | Tick marks show 3 medians meeting at O. What is point O? | The centroid (where the medians meet) | D4 | FL-R 45 (26%) |
| 6-3 Centroid | A median is 12 long. Find the distance from the centroid to the vertex. | 8 | D4 | IXL |
| 6-4 Angle and side | A triangle has sides 5, 7 and 9. Which angle is largest? | The angle across from the side of length 9 | D4 | IXL |
| 6-6 Triangle inequality | Which set of lengths can make a triangle? | 5, 6, 10 (not 3, 4, 8) | D0 | IXL |
| 6-6 Third side | Two sides are 4 and 9. Which length can the third side be? | Between 5 and 13 | D0 | IXL |

---

## Volume 2 types seen on the Florida test

The UI will need these later. They are not in Volume 1.

| Type | Example | Diagram | Source |
| --- | --- | --- | --- |
| Inscribed and central angles | Write the relation between x and y (x = 2y) | Circle + D3 | FL-R 8 (25%) |
| Tangent segments | Two tangents from a point are equal: 4x − 10 = 2x | Circle + D4 | FL-R 32 (51%) |
| Cyclic quadrilateral | Opposite angles are supplementary: 180 − 82 = 98 | Circle + D4 | FL-R 31 (33%) |
| Trig ratios | Match cos and tan to side ratios | D4 right triangle | FL-R 37 (31%) |
| Solids of revolution | Which solid does this shape make when it turns? | D5, D8 | FL-R 16 (81%), 18 |
| Cross-sections | What shape does the cut make? | D5 | FL-R 11 (55%), 34 |
| Surface area | Regular pentagonal pyramid | D5 | FL-R 28 (22%) |
| Circle equation | Which graph shows (x − 1)² + (y + 4)² = 12.25? | D2, D8 | FL-R 20 (34%) |
