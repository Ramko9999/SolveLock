import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuotaStore } from "@/store/quota";
import { useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

type Problem = {
  question: string;
  options: number[];
  answer: number;
};

const PROBLEMS: Problem[] = [
  {
    question:
      "A pack has 6 stickers. Maya buys 4 packs, then gives away 7. How many are left?",
    options: [24, 17, 31, 16],
    answer: 17,
  },
  {
    question:
      "A bus holds 32 kids. 3 buses are full and 5 more ride with parents. How many kids in all?",
    options: [96, 101, 37, 105],
    answer: 101,
  },
  {
    question:
      "Liam reads 15 pages a night for 6 nights. The book has 120 pages. How many are left?",
    options: [30, 90, 105, 25],
    answer: 30,
  },
];

const PRESS_SPRING = { damping: 20, stiffness: 340 };

/** A wrong answer holds longer so the right one is readable before moving on. */
const REVEAL_MS = { correct: 340, wrong: 1150 };

const progressBarStyles = StyleSheet.create({
  track: {
    width: "100%",
    height: 6,
    borderRadius: Radius.round,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: Radius.round,
  },
});

type ProgressBarProps = {
  ratio: number;
};

function ProgressBar({ ratio }: ProgressBarProps) {
  const track = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);
  const filled = useSharedValue(ratio);

  useEffect(() => {
    filled.value = withTiming(ratio, { duration: 280 });
  }, [ratio, filled]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${filled.value * 100}%`,
  }));

  return (
    <View style={[progressBarStyles.track, { backgroundColor: track }]}>
      <Animated.View
        style={[progressBarStyles.fill, fillStyle, { backgroundColor: accent }]}
      />
    </View>
  );
}

type TileState = "idle" | "correct" | "wrong";

const answerTileStyles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1.55,
  },
  pressable: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
    borderRadius: Radius.xxl,
    borderBottomWidth: 3,
  },
});

type AnswerTileProps = {
  value: number;
  state: TileState;
  disabled: boolean;
  onSelect: () => void;
};

function AnswerTile({ value, state, disabled, onSelect }: AnswerTileProps) {
  const fill = useColor(AppColor.fill);
  const edge = useColor(AppColor.edge);
  const correct = useColor(AppColor.correct);
  const wrong = useColor(AppColor.wrong);
  const scale = useSharedValue(1);

  const background =
    state === "correct" ? correct : state === "wrong" ? wrong : fill;

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[answerTileStyles.container, containerStyle]}>
      <Pressable
        disabled={disabled}
        onPress={onSelect}
        onPressIn={() => {
          scale.value = withSpring(0.96, PRESS_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, PRESS_SPRING);
        }}
        style={[
          answerTileStyles.pressable,
          {
            backgroundColor: background,
            borderBottomColor: state === "idle" ? edge : background,
          },
        ]}
      >
        <Text huge extrabold onFilled={state !== "idle"}>
          {value}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const answerGridStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    width: "100%",
  },
  row: {
    ...StyleUtils.flexRow(),
    width: "100%",
  },
});

type AnswerGridProps = {
  problem: Problem;
  selected: number | null;
  onSelect: (value: number) => void;
};

function AnswerGrid({ problem, selected, onSelect }: AnswerGridProps) {
  const { width } = useWindowDimensions();
  const gap = width * 0.031;
  const revealed = selected !== null;

  const stateFor = (value: number): TileState => {
    if (!revealed) return "idle";
    if (value === problem.answer) return "correct";
    if (value === selected) return "wrong";
    return "idle";
  };

  const rows = [problem.options.slice(0, 2), problem.options.slice(2, 4)];

  return (
    <View style={[answerGridStyles.container, { gap }]}>
      {rows.map((row) => (
        <View key={row.join("-")} style={[answerGridStyles.row, { gap }]}>
          {row.map((value) => (
            <AnswerTile
              key={value}
              value={value}
              state={stateFor(value)}
              disabled={revealed}
              onSelect={() => onSelect(value)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const solveStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "6%",
    paddingTop: "8%",
    paddingBottom: "10%",
  },
  question: {
    paddingTop: "14%",
  },
  questionText: {
    lineHeight: 39,
  },
  spacer: {
    flex: 1,
  },
});

export default function SolveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const releaseQuota = useQuotaStore((s) => s.releaseQuota);
  const token = useSetupStore((s) => s.selection?.token ?? null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);

  const problem = PROBLEMS[index];

  useEffect(() => {
    return () => {
      if (advance.current) {
        clearTimeout(advance.current);
      }
    };
  }, []);

  const handleSelect = useCallback(
    (value: number) => {
      if (selected !== null) {
        return;
      }
      setSelected(value);

      const isRight = value === problem.answer;
      Haptics.impactAsync(
        isRight
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      );

      advance.current = setTimeout(
        () => {
          if (index + 1 >= PROBLEMS.length) {
            releaseQuota(token);
            router.replace("/");
            return;
          }
          setIndex((current) => current + 1);
          setSelected(null);
        },
        isRight ? REVEAL_MS.correct : REVEAL_MS.wrong,
      );
    },
    [selected, problem.answer, index, router, releaseQuota, token],
  );

  return (
    <View
      style={[
        solveStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={solveStyles.content}>
        <ProgressBar ratio={(index + 1) / PROBLEMS.length} />
        <View style={solveStyles.question}>
          <Text huge bold style={solveStyles.questionText}>
            {problem.question}
          </Text>
        </View>
        <View style={solveStyles.spacer} />
        <AnswerGrid
          problem={problem}
          selected={selected}
          onSelect={handleSelect}
        />
      </View>
    </View>
  );
}
