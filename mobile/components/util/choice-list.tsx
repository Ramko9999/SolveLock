import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Text } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

const choiceListStyles = StyleSheet.create({
  content: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "6%",
    paddingBottom: "6%",
  },
  option: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: "6%",
    borderRadius: Radius.xxl,
  },
  label: {
    flex: 1,
  },
});

export type Choice<T> = {
  value: T;
  label: string;
  detail?: string;
};

type ChoiceListProps<T> = {
  choices: Choice<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

export function ChoiceList<T extends string | number>({
  choices,
  selected,
  onSelect,
}: ChoiceListProps<T>) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);

  return (
    <ScrollView contentContainerStyle={choiceListStyles.content}>
      {choices.map((choice) => {
        const picked = choice.value === selected;
        return (
          <Pressable
            key={String(choice.value)}
            onPress={() => onSelect(choice.value)}
            style={[
              choiceListStyles.option,
              { backgroundColor: picked ? accent : fill },
            ]}
          >
            <Text
              large
              semibold
              onFilled={picked}
              style={choiceListStyles.label}
            >
              {choice.label}
            </Text>
            {choice.detail ? (
              <Text small onFilled={picked} muted={!picked}>
                {choice.detail}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
