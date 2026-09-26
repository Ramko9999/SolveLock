// math-question-schema.ts

/**
 * Canonical Math Question + Diagram Schema
 *
 * Display text is normal prose with optional inline LaTex:
 *   "Find \\(x\\) if \\(3x + 8 = 23\\)."
 *
 * The question/diagram schema is intentionally renderer-agnostic:
 * - Render with react-native-svg, React Native Skia, JSXGraph, or server-generated SVG.
 * - Never make SVG/TikZ/LLM output the canonical source of mathematical truth.
 * - Keep mathematical constraints separate from visual positioning.
 */

export type SchemaVersion = 1;

export type MathQuestion = {
  id: string;
  schemaVersion: SchemaVersion;

  /**
   * Normal prose with embedded inline/block LaTeX.
   *
   * Example:
   * "Find the value of \\(x\\)."
   */
  question: string;

  /**
   * Optional visual component accompanying the question.
   * Render it between question text and answer options in a simple first UI.
   */
  diagram?: Diagram;

  /**
   * Start with MCQ for v1.
   * Stable IDs allow client-side option shuffling without breaking correctness.
   */
  options: MultipleChoiceOption[];

  correctOptionId: string;

  /**
   * Redundant by design: this becomes essential for free response,
   * answer validation, option shuffling, generation, and review flows.
   */
  answer?: CanonicalAnswer;

  metadata?: QuestionMetadata;

  source?: QuestionSource;

  validation?: QuestionValidation;

  variation?: VariationMetadata;
};

export type MultipleChoiceOption = {
  id: string;

  /**
   * Prose with optional inline/block LaTeX.
   *
   * Example:
   * "\\(x = 12\\)"
   */
  text: string;

  /**
   * Helpful for LLM generation, analysis, and later personalized feedback.
   *
   * Example:
   * "Added instead of subtracting the constant."
   */
  misconception?: string;
};

export type CanonicalAnswer = {
  type: "integer" | "decimal" | "fraction" | "expression" | "choice" | "text";

  /**
   * Canonical machine-readable value.
   *
   * Examples:
   * "12"
   * "3/4"
   * "x=7"
   * "choice_b"
   */
  value: string;

  /**
   * Optional display representation.
   *
   * Example:
   * "\\(\\frac{3}{4}\\)"
   */
  latex?: string;

  unit?: string;

  /**
   * Useful later for numeric/free-response questions.
   *
   * Example: ["12", "12.0", "12.00"]
   */
  acceptedValues?: string[];
};

export type QuestionMetadata = {
  gradeBand?:
    | "6"
    | "7"
    | "8"
    | "algebra_1"
    | "geometry"
    | "algebra_2"
    | "unknown";

  skill?: string;
  subskill?: string;

  difficulty?: 1 | 2 | 3 | 4 | 5;

  tags?: string[];
};

export type QuestionSource = {
  type: "worksheet_scan" | "template" | "manual" | "ai_generated";

  worksheetId?: string;
  sourceQuestionId?: string;
  generatedFromQuestionId?: string;
  model?: string;

  /**
   * Pixel crop from the original uploaded worksheet image.
   * Keep this for review/debugging—not for actual question rendering.
   */
  sourceCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  extractionConfidence?: number;
  requiresReview?: boolean;
  uncertainFields?: string[];
};

export type QuestionValidation = {
  status: "draft" | "passed" | "needs_review" | "failed";

  /**
   * Examples:
   * "angle-around-point-v1"
   * "linear-equation-v1"
   * "pythagorean-theorem-v1"
   */
  validator?: string;

  /**
   * Human-readable/LaTex display equation used by the validator.
   *
   * Example:
   * "\\((x+24) + 29 + 295 = 360\\)"
   */
  equationLatex?: string;

  checks?: ValidationCheck[];
};

export type ValidationCheck = {
  name: string;
  status: "passed" | "failed" | "skipped";
  detail?: string;
};

export type VariationMetadata = {
  /**
   * Examples:
   * "angles_around_a_point"
   * "linear_equation_ax_plus_b_equals_c"
   * "pythagorean_integer_triple"
   */
  family: string;

  templateVersion?: string;

  /**
   * The specific numerical/semantic values used in this generated instance.
   */
  parameters?: Record<string, unknown>;

  /**
   * Rules that must remain true when creating a related variation.
   *
   * Example:
   * ["total_angle_measure_is_360", "integer_solution"]
   */
  invariants?: string[];
};

/* -------------------------------------------------------------------------- */
/*                                SHARED TYPES                                */
/* -------------------------------------------------------------------------- */

export type MathText = {
  /**
   * Prose with optional LaTeX.
   *
   * Examples:
   * "\\(93^\\circ\\)"
   * "\\((3x+18)^\\circ\\)"
   * "Point \\(A\\)"
   */
  text: string;

  /**
   * Screen-reader-friendly fallback.
   *
   * Example:
   * "3 x plus 18 degrees"
   */
  plainText?: string;
};

export type Viewport = {
  width: number;
  height: number;
  padding?: number;
};

export type DiagramStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeDash?: "solid" | "dashed" | "dotted";
  fill?: string;
  fillOpacity?: number;
  opacity?: number;

  labelColor?: string;
  fontFamily?: string;
  fontSize?: number;

  backgroundColor?: string;
};

export type ElementStyle = Omit<DiagramStyle, "backgroundColor" | "fontFamily" | "fontSize">;

/* -------------------------------------------------------------------------- */
/*                                  DIAGRAMS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Renderer-agnostic union of all supported diagram types.
 *
 * Start production support with:
 * - angle
 * - geometry
 * - number_line
 * - table
 * - coordinate_plane
 *
 * The remaining types can live in your schema now but do not need a renderer
 * until a real worksheet requires them.
 */
export type Diagram =
  | AngleDiagram
  | GeometryDiagram
  | CoordinatePlaneDiagram
  | NumberLineDiagram
  | TableDiagram
  | BarModelDiagram
  | ChartDiagram
  | SolidFigureDiagram;

export type DiagramBase = {
  id?: string;
  version: SchemaVersion;

  altText: string;

  viewport?: Viewport;

  style?: DiagramStyle;

  source?: {
    sourceCrop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };

    extractionConfidence?: number;
    requiresReview?: boolean;
    uncertainFields?: string[];
  };
};

/* -------------------------------------------------------------------------- */
/*                               ANGLE DIAGRAM                                */
/* -------------------------------------------------------------------------- */

/**
 * Use for:
 * - linear pairs
 * - vertical angles
 * - supplementary/complementary angles
 * - angles around a point
 * - reflex-angle questions
 * - worksheet items like "Find x" #19–#22 in the uploaded page
 */
export type AngleDiagram = DiagramBase & {
  kind: "angle";

  vertex: {
    id: string;
    x: number;
    y: number;
    label?: MathText;
  };

  rays: AngleRay[];

  angles: AngleRegion[];

  constraints?: AngleConstraint[];
};

export type AngleRay = {
  id: string;

  /**
   * Direction from positive x-axis in standard math degrees.
   *
   * Renderer note:
   * Screen/SVG y coordinates normally increase downward, so most renderers use:
   * x = cx + r * cos(theta)
   * y = cy - r * sin(theta)
   */
  degrees: number;

  length?: number;

  arrow?: "none" | "end" | "both";

  style?: ElementStyle;
};

export type AngleRegion = {
  id: string;

  startRayId: string;
  endRayId: string;

  /**
   * - minor: smaller turn between rays
   * - major: larger turn between rays
   * - reflex: explicitly the >180-degree region
   */
  sweep: "minor" | "major" | "reflex";

  label?: MathText;

  /**
   * Only include when the angle is known as a numerical value.
   * Example: 93 or 295.
   */
  measureDegrees?: number;

  role?: "given" | "unknown" | "derived";

  arc?: {
    radius?: number;

    /**
     * Visual congruence marker count.
     * This is separate from the actual degree measure.
     */
    count?: 0 | 1 | 2 | 3;

    style?: ElementStyle;
  };
};

export type AngleConstraint =
  | {
      type: "adjacent_sum";
      angleIds: string[];
      totalDegrees: number;
    }
  | {
      type: "around_point";
      angleIds?: string[];
      totalDegrees: 360;
    }
  | {
      type: "linear_pair";
      angleAId: string;
      angleBId: string;
      totalDegrees: 180;
    }
  | {
      type: "vertical_angles";
      angleAId: string;
      angleBId: string;
    }
  | {
      type: "congruent_angles";
      angleIds: string[];
    }
  | {
      type: "supplementary_angles";
      angleAId: string;
      angleBId: string;
      totalDegrees: 180;
    }
  | {
      type: "complementary_angles";
      angleAId: string;
      angleBId: string;
      totalDegrees: 90;
    };

/* -------------------------------------------------------------------------- */
/*                            GENERAL 2D GEOMETRY                             */
/* -------------------------------------------------------------------------- */

/**
 * Use for:
 * - triangles, quadrilaterals, polygons
 * - circles and arcs
 * - parallel lines and transversals
 * - perimeter / area / Pythagorean theorem
 * - markings: right angles, ticks, parallel arrows, dimensions
 */
export type GeometryDiagram = DiagramBase & {
  kind: "geometry";

  points: GeometryPoint[];

  elements: GeometryElement[];

  constraints?: GeometryConstraint[];
};

export type GeometryPoint = {
  id: string;
  x: number;
  y: number;

  label?: MathText;

  visible?: boolean;

  style?: ElementStyle;
};

export type GeometryElement =
  | SegmentElement
  | LineElement
  | RayElement
  | PolylineElement
  | PolygonElement
  | CircleElement
  | ArcElement
  | AngleMarkerElement
  | RightAngleMarkerElement
  | TickMarkElement
  | ParallelMarkElement
  | ArrowMarkerElement
  | DimensionElement
  | DiagramTextElement
  | ShadedRegionElement;

export type SegmentElement = {
  id: string;
  type: "segment";

  from: string;
  to: string;

  label?: MathText;
  style?: ElementStyle;
};

export type LineElement = {
  id: string;
  type: "line";

  pointA: string;