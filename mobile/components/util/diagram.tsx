import { useCallback, useMemo } from "react";
import { SvgXml } from "react-native-svg";
import { AppColor, useColor } from "@/theme/color";

const MARKER = /<marker\b([^>]*)>([\s\S]*?)<\/marker>/g;

/**
 * react-native-svg cannot read `orient="auto-start-reverse"`. It parses the
 * value as a number and the whole screen dies with a NumberFormatException.
 *
 * Dropping to `orient="auto"` would be wrong: the bank uses marker-start on
 * seventeen arrows, and those heads would then point back along the line. So
 * each affected marker gains a twin, turned half a turn about its own anchor,
 * and marker-start points at the twin.
 *
 * The fix lives here rather than in the bank because the bank is also rendered
 * on the web, where auto-start-reverse works and is the right thing to write.
 */
function twinReversedMarkers(svg: string) {
  const twins: string[] = [];
  const reversed = new Set<string>();

  const withForward = svg.replace(MARKER, (whole, attrs: string, inner) => {
    if (!attrs.includes("auto-start-reverse")) {
      return whole;
    }
    const id = attrs.match(/id="([^"]+)"/)?.[1];
    const forward = attrs.replace(
      /orient="auto-start-reverse"/,
      'orient="auto"',
    );
    if (id) {
      const x = attrs.match(/refX="([^"]+)"/)?.[1] ?? "0";
      const y = attrs.match(/refY="([^"]+)"/)?.[1] ?? "0";
      reversed.add(id);
      twins.push(
        `<marker${forward.replace(`id="${id}"`, `id="${id}-rs"`)}>` +
          `<g transform="rotate(180 ${x} ${y})">${inner}</g></marker>`,
      );
    }
    return `<marker${forward}>${inner}</marker>`;
  });

  if (twins.length === 0) {
    return svg;
  }

  return withForward
    .replace("<defs>", `<defs>${twins.join("")}`)
    .replace(/marker-start="url\(#([^)]+)\)"/g, (whole, id: string) =>
      reversed.has(id) ? `marker-start="url(#${id}-rs)"` : whole,
    );
}

/**
 * The bank ships colour placeholders rather than hex, so one diagram works in
 * both themes. See the header of problems/geometry-bank.ts.
 */
export function usePaintDiagram() {
  const primary = useColor(AppColor.accent);
  const ink = useColor(AppColor.diagramInk);
  const ink2 = useColor(AppColor.diagramInk2);
  const grid = useColor(AppColor.diagramGrid);
  // What is actually behind the diagram, which is the page, not a card.
  const surface = useColor(AppColor.background);

  return useCallback(
    (svg: string) =>
      twinReversedMarkers(svg)
        .replaceAll("{{primary}}", primary)
        .replaceAll("{{ink}}", ink)
        .replaceAll("{{ink2}}", ink2)
        .replaceAll("{{grid}}", grid)
        .replaceAll("{{surface}}", surface),
    [primary, ink, ink2, grid, surface],
  );
}

/** Height over width, so a caller can size a diagram from its own width. */
export function viewBoxRatio(svg: string) {
  const box = svg.match(
    /viewBox="\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (!box) {
    return 0.75;
  }
  const width = Number(box[3]);
  const height = Number(box[4]);
  return width > 0 && height > 0 ? height / width : 0.75;
}

type DiagramProps = {
  xml: string;
  width: number;
  /** The diagram shrinks to fit rather than pushing the answers off screen. */
  maxHeight?: number;
};

export function Diagram({ xml, width, maxHeight }: DiagramProps) {
  const paint = usePaintDiagram();
  const painted = useMemo(() => paint(xml), [paint, xml]);
  const natural = width * viewBoxRatio(xml);
  const height = maxHeight ? Math.min(natural, maxHeight) : natural;

  return <SvgXml xml={painted} width="100%" height={height} />;
}
