import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

/** Rows visible at once. Odd, so one sits in the middle. */
const ROWS = 5;

const durationWheelStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(),
    width: "100%",
  },
  band: {
    position: "absolute",
    left: "12%",
    right: "12%",
    borderRadius: Radius.xl,
  },
  row: {
    ...StyleUtils.flexRowCenterAll(8),
    width: "100%",
  },
});

type DurationWheelProps = {
  values: number[];
  value: number;
  unit: string;
  onChange: (value: number) => void;
};

export function DurationWheel({
  values,
  value,
  unit,
  onChange,
}: DurationWheelProps) {
  const { height } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const fill = useColor(AppColor.fill);

  const rowHeight = Math.round(height * 0.072);

  // Where to start. A ref, because every later change comes from the scroll
  // itself -- reacting to those would fight the finger.
  const start = useRef(values.indexOf(value) * rowHeight);

  useEffect(() => {
    if (start.current < 0) {
      return;
    }
    // Without the frame delay the ScrollView has no layout yet and ignores it.
    const frame = setTimeout(
      () => scroller.current?.scrollTo({ y: start.current, animated: false }),
      0,
    );
    return () => clearTimeout(frame);
  }, []);

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / rowHeight);
    const next = values[Math.min(Math.max(index, 0), values.length - 1)];
    if (next !== undefined && next !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(next);
    }
  };

  return (
    <View style={[durationWheelStyles.container, { height: rowHeight * ROWS }]}>
      <View
        style={[
          durationWheelStyles.band,
          {
            height: rowHeight,
            top: rowHeight * ((ROWS - 1) / 2),
            backgroundColor: fill,
          },
        ]}
      />
      <ScrollView
        ref={scroller}
        showsVerticalScrollIndicator={false}
        snapToInterval={rowHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={settle}
        contentContainerStyle={{
          paddingVertical: rowHeight * ((ROWS - 1) / 2),
        }}
      >
        {values.map((option) => {
          const picked = option === value;
          return (
            <View
              key={option}
              style={[durationWheelStyles.row, { height: rowHeight }]}
            >
              <Text big={picked} large={!picked} bold={picked} muted={!picked}>
                {option}
              </Text>
              <Text small muted>
                {unit}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
