import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Diagram } from "@/components/util/diagram";
import { gate } from "@/enforcement/gate";
import {
  type BankChoice,
  type BankProblem,
  GEOMETRY_BANK,
} from "@/problems/geometry-bank";
import { useQuotaStore } from "@/store/quota";
import { useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

/** A choice long enough that the big tile face would wrap badly. */
const LONG_CHOICE = 10;

/** No repeats inside one check. Only a run longer than the bank wraps. */
function drawRun(count: number): BankProblem[] {
  const deck = [...GEOMETRY_BANK];
  for (let slot = deck.length - 1; slot > 0; slot -= 1) {
    const swap = Math.floor(Math.random() * (slot + 1));
    [deck[slot], deck[swap]] = [deck[swap], deck[slot]];
  }
  return Array.from({ length: count }, (_, slot) => deck[slot % deck.length]);
}

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
  },
  pressable: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
    borderRadius: Radius.xxl,
    borderBottomWidth: 3,
    overflow: "hidden",
  },
  picture: {
    ...StyleUtils.flexRowCenterAll(),
    width: "82%",
  },
});

type AnswerTileProps = {
  choice: BankChoice;
  state: TileState;
  disabled: boolean;
  /** Picture choices need room, so the whole grid squares up together. */
  aspectRatio: number;
  onSelect: () => void;
};

function AnswerTile({
  choice,
  state,
  disabled,
  aspectRatio,
  onSelect,
}: AnswerTileProps) {
  const { width } = useWindowDimensions();
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

  const tileWidth = width * 0.42;

  return (
    <Animated.View
      style={[answerTileStyles.container, { aspectRatio }, containerStyle]}
    >
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
        {"svg" in choice ? (
          <View style={answerTileStyles.picture}>
            <Diagram
              xml={choice.svg}
              width={tileWidth * 0.82}
              maxHeight={tileWidth * 0.78}
            />
          </View>
        ) : (
          <Text
            huge={choice.text.length <= LONG_CHOICE}
            neutral={choice.text.length > LONG_CHOICE}
            extrabold
            onFilled={state !== "idle"}
            style={{ textAlign: "center", paddingHorizontal: "6%" }}
          >
            {choice.text}
          </Text>
        )}
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
  problem: BankProblem;
  selected: number | null;
  onSelect: (choice: number) => void;
};

function AnswerGrid({ problem, selected, onSelect }: AnswerGridProps) {
  const { width } = useWindowDimensions();
  const gap = width * 0.031;
  const revealed = selected !== null;
  const pictures = problem.choices.some((choice) => "svg" in choice);

  const stateFor = (choice: number): TileState => {
    if (!revealed) {
      return "idle";
    }
    if (choice === problem.answer) {
      return "correct";
    }
    if (choice === selected) {
      return "wrong";
    }
    return "idle";
  };

  const rows = [
    [0, 1],
    [2, 3],
  ];

  return (
    <View style={[answerGridStyles.container, { gap }]}>
      {rows.map((row) => (
        <View key={row.join("-")} style={[answerGridStyles.row, { gap }]}>
          {row.map((choice) => (
            <AnswerTile
              key={choice}
              choice={problem.choices[choice]}
              state={stateFor(choice)}
              disabled={revealed}
              aspectRatio={pictures ? 1.05 : 1.55}
              onSelect={() => onSelect(choice)}
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
    ...StyleUtils.flexColumn(),
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: "6%",
    paddingBottom: "6%",
    gap: 18,
  },
  questionText: {
    lineHeight: 30,
  },
  diagram: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
  },
});

export default function SolveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const background = useColor(AppColor.background);
  const releaseQuota = useQuotaStore((s) => s.releaseQuota);
  const token = useSetupStore((s) => s.selection?.token ?? null);
  const quotaMinutes = useSetupStore((s) => s.quotaMinutes);
  const setArmedAt = useSetupStore((s) => s.setArmedAt);
  const countCorrect = useSetupStore((s) => s.countCorrect);
  const problemsPerCheck = useSetupStore((s) => s.problemsPerCheck);
  const run = useMemo(() => drawRun(problemsPerCheck), [problemsPerCheck]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);

  const problem = run[index];

  // The cover is still up, deliberately, so the child never glimpses the game
  // between tapping Start and the first problem. Drop it now we have drawn.
  useEffect(() => {
    gate?.dismissCover();
  }, []);

  useEffect(() => {
    return () => {
      if (advance.current) {
        clearTimeout(advance.current);
      }
    };
  }, []);

  const handleSelect = useCallback(
    (choice: number) => {
      if (selected !== null) {
        return;
      }
      setSelected(choice);

      const isRight = choice === problem.answer;
      if (isRight) {
        countCorrect();
      }
      Haptics.impactAsync(
        isRight
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      );

      advance.current = setTimeout(
        () => {
          if (index + 1 >= run.length) {
            // Android hands the child straight back to the game. iOS cannot,
            // so it drops them on our home screen and they find it themselves.
            if (gate) {
              const game = gate.getBlockedPackage();
              gate.resetUsage();
              gate.clearBlocked();
              router.replace("/");
              if (game) {
                gate.launchApp(game);
              }
              return;
            }
            setArmedAt(Date.now());
            releaseQuota(quotaMinutes, token);
            router.replace("/");
            return;
          }
          setIndex((current) => current + 1);
          setSelected(null);
        },
        isRight ? REVEAL_MS.correct : REVEAL_MS.wrong,
      );
    },
    [
      selected,
      problem.answer,
      index,
      router,
      releaseQuota,
      token,
      quotaMinutes,
      setArmedAt,
      countCorrect,
      run,
    ],
  );

  return (
    <View
      style={[
        solveStyles.container,
        { backgroundColor: background, paddingTop: insets.top },
      ]}
    >
      <View style={solveStyles.content}>
        <ProgressBar ratio={(index + 1) / run.length} />
        <ScrollView
          contentContainerStyle={solveStyles.question}
          showsVerticalScrollIndicator={false}
        >
          <Text large bold style={solveStyles.questionText}>
            {problem.stem}
          </Text>
          {problem.diagram ? (
            <View style={solveStyles.diagram}>
              <Diagram
                xml={problem.diagram}
                width={width * 0.88}
                maxHeight={height * 0.35}
              />
            </View>
          ) : null}
        </ScrollView>
        <AnswerGrid
          problem={problem}
          selected={selected}
          onSelect={handleSelect}
        />
      </View>
    </View>
  );
}
