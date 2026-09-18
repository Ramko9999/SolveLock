import React from "react";
import {
  Text as DefaultText,
  TextInput as DefaultTextInput,
  View as DefaultView,
  Dimensions,
  PixelRatio,
} from "react-native";
import { AppColor, useColor } from "./color";

type TextSizeProps = {
  micro?: boolean;
  xtiny?: boolean;
  tiny?: boolean;
  smaller?: boolean;
  small?: boolean;
  sneutral?: boolean;
  neutral?: boolean;
  large?: boolean;
  larger?: boolean;
  big?: boolean;
  bigger?: boolean;
  huge?: boolean;
  huger?: boolean;
  superhuge?: boolean;
};

type TextWeightProps = {
  thin?: boolean;
  extralight?: boolean;
  light?: boolean;
  regular?: boolean;
  medium?: boolean;
  semibold?: boolean;
  bold?: boolean;
  extrabold?: boolean;
  black?: boolean;
};

type TextColorProps = {
  background?: boolean;
  primary?: boolean;
  accent?: boolean;
  surface?: boolean;
  fill?: boolean;
  muted?: boolean;
  correct?: boolean;
  wrong?: boolean;
  onFilled?: boolean;
};

type TextItalicProps = {
  italic?: boolean;
};

type TextFontFamilyProps = {
  /** System serif (New York on iOS). */
  serif?: boolean;
  /** System monospace (SF Mono on iOS) — fixed digit widths so a changing
   *  countdown or answer doesn't jiggle the layout. */
  mono?: boolean;
};

type TextProps = DefaultText["props"] &
  TextSizeProps &
  TextColorProps &
  TextWeightProps &
  TextItalicProps &
  TextFontFamilyProps;

export function scaleFontSize(size: number) {
  const { width, height } = Dimensions.get("window");
  const scale = Math.min(width / 375, height / 810);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function getFontSize({
  micro,
  xtiny,
  tiny,
  smaller,
  small,
  sneutral,
  neutral,
  large,
  larger,
  big,
  bigger,
  huge,
  huger,
  superhuge,
}: TextSizeProps) {
  if (micro) return scaleFontSize(8);
  if (xtiny) return scaleFontSize(9.5);
  if (tiny) return scaleFontSize(11);
  if (smaller) return scaleFontSize(12);
  if (small) return scaleFontSize(13);
  if (sneutral) return scaleFontSize(14);
  if (neutral) return scaleFontSize(16);
  if (large) return scaleFontSize(18);
  if (larger) return scaleFontSize(20);
  if (big) return scaleFontSize(23);
  if (bigger) return scaleFontSize(26);
  if (huge) return scaleFontSize(30);
  if (huger) return scaleFontSize(34);
  if (superhuge) return scaleFontSize(60);

  return scaleFontSize(14);
}

function getFontColor({
  background,
  primary,
  accent,
  surface,
  fill,
  muted,
  correct,
  wrong,
  onFilled,
}: TextColorProps) {
  if (background) return AppColor.background;
  if (primary) return AppColor.primary;
  if (accent) return AppColor.accent;
  if (surface) return AppColor.surface;
  if (fill) return AppColor.fill;
  if (muted) return AppColor.muted;
  if (correct) return AppColor.correct;
  if (wrong) return AppColor.wrong;
  if (onFilled) return AppColor.onFilled;

  return AppColor.primary;
}

export function getFontWeight({
  thin,
  extralight,
  light,
  regular,
  medium,
  semibold,
  bold,
  extrabold,
  black,
}: TextWeightProps) {
  if (thin) return "100";
  if (extralight) return "200";
  if (light) return "300";
  if (regular) return "400";
  if (medium) return "500";
  if (semibold) return "600";
  if (bold) return "700";
  if (extrabold) return "800";
  if (black) return "900";

  return "400";
}

function getFontItalic({ italic }: TextItalicProps) {
  return italic ? "italic" : "normal";
}

function getFontFamily(props: TextFontFamilyProps) {
  if (props.serif) return "ui-serif";
  if (props.mono) return "ui-monospace";
  return "ui-sans-serif";
}

export const Text = React.forwardRef(
  (props: TextProps, ref: React.ForwardedRef<DefaultText>) => {
    const { style, ...otherProps } = props;
    const color = useColor(getFontColor(props));
    return (
      <DefaultText
        ref={ref}
        style={[
          {
            fontSize: getFontSize(props),
            color,
            fontWeight: getFontWeight(props),
            fontStyle: getFontItalic(props),
            fontFamily: getFontFamily(props),
          },
          style,
        ]}
        {...otherProps}
      />
    );
  },
);

type TextInputProps = DefaultTextInput["props"] &
  TextSizeProps &
  TextColorProps &
  TextWeightProps &
  TextItalicProps &
  TextFontFamilyProps;

export const TextInput = React.forwardRef(
  (props: TextInputProps, ref: React.ForwardedRef<DefaultTextInput>) => {
    const { style, ...otherProps } = props;
    const color = useColor(getFontColor(props));
    return (
      <DefaultTextInput
        ref={ref}
        style={[
          {
            fontSize: getFontSize(props),
            color,
            fontWeight: getFontWeight(props),
            fontStyle: getFontItalic(props),
            fontFamily: getFontFamily(props),
          },
          style,
        ]}
        {...otherProps}
      />
    );
  },
);

export const View = React.forwardRef(
  (props: DefaultView["props"], ref: React.ForwardedRef<DefaultView>) => {
    return <DefaultView ref={ref} {...props} />;
  },
);
