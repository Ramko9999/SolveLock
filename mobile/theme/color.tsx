import { type ColorSchemeName, useColorScheme } from "react-native";

/** Brand indigo — interactive accent (same in light and dark). */
export const BRAND_INDIGO = "#4C5BD4";

const ACCENT = BRAND_INDIGO;

export enum AppColor {
  primary = "primary",
  background = "background",
  groupedBackground = "groupedBackground",
  accent = "accent",
  surface = "surface",
  fill = "fill",
  muted = "muted",
  correct = "correct",
  wrong = "wrong",
}

const LIGHT_COLORS: Record<AppColor, string> = {
  [AppColor.background]: "#FFFFFF",
  [AppColor.groupedBackground]: "#F5F5F5",
  [AppColor.primary]: "#000000",
  [AppColor.accent]: ACCENT,
  [AppColor.surface]: "#FFFFFF",
  [AppColor.fill]: "#EEEEEE",
  [AppColor.muted]: "#8E8E93",
  [AppColor.correct]: "#2E9E5B",
  [AppColor.wrong]: "#D9453D",
};

const DARK_COLORS: Record<AppColor, string> = {
  [AppColor.background]: "#111111",
  [AppColor.groupedBackground]: "#1A1A1A",
  [AppColor.primary]: "#FFFFFF",
  [AppColor.accent]: "#8592F0",
  [AppColor.surface]: "#242424",
  [AppColor.fill]: "#1E1E1E",
  [AppColor.muted]: "#8E8E93",
  [AppColor.correct]: "#4CC47C",
  [AppColor.wrong]: "#FF6B64",
};

export function getColor(color: AppColor, theme: ColorSchemeName) {
  return theme === "light" ? LIGHT_COLORS[color] : DARK_COLORS[color];
}

export function useColor(color: AppColor) {
  const colorScheme = useColorScheme();
  const scheme: ColorSchemeName = colorScheme === "dark" ? "dark" : "light";
  return getColor(color, scheme);
}

export function toRgba(color: string, alpha: number = 1): string {
  const hexColor = color.replace("#", "");
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
