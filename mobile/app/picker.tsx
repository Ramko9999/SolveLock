import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type Selection, useSetupStore } from "@/store/setup";
import { Text, View } from "@/theme";
import { AppColor, useColor } from "@/theme/color";
import { Radius } from "@/theme/design-tokens";
import { StyleUtils } from "@/theme/style-utils";

type Category = {
  id: string;
  name: string;
  hint: string;
};

/** Stand-in for Apple's FamilyActivityPicker, which is a native view we cannot
 *  run in Expo Go. Names mirror Apple's ActivityCategory list. */
const CATEGORIES: Category[] = [
  {
    id: "games",
    name: "Games",
    hint: "Roblox, Fortnite, anything new they install",
  },
  { id: "social", name: "Social", hint: "Messaging and social networks" },
  {
    id: "entertainment",
    name: "Entertainment",
    hint: "Streaming and short video",
  },
  { id: "photo-video", name: "Photo & Video", hint: "Camera and video apps" },
];

const categoryRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(2),
    width: "100%",
    paddingVertical: "4%",
    paddingHorizontal: "5%",
    borderRadius: Radius.xxl,
  },
});

type CategoryRowProps = {
  category: Category;
  selected: boolean;
  onToggle: () => void;
};

function CategoryRow({ category, selected, onToggle }: CategoryRowProps) {
  const fill = useColor(AppColor.fill);
  const accent = useColor(AppColor.accent);

  return (
    <Pressable
      onPress={onToggle}
      style={[
        categoryRowStyles.container,
        { backgroundColor: selected ? accent : fill },
      ]}
    >
      <Text large bold onFilled={selected}>
        {category.name}
      </Text>
      <Text small medium onFilled={selected} muted={!selected}>
        {category.hint}
      </Text>
    </Pressable>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "6%",
    paddingTop: "6%",
    paddingBottom: "8%",
    gap: 10,
  },
  heading: {
    ...StyleUtils.flexColumn(4),
    paddingBottom: "5%",
  },
  footer: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "6%",
    paddingTop: "4%",
  },
  save: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingVertical: "4.5%",
    borderRadius: Radius.xxl,
  },
});

export default function PickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const background = useColor(AppColor.background);
  const accent = useColor(AppColor.accent);
  const fill = useColor(AppColor.fill);
  const setSelection = useSetupStore((s) => s.setSelection);
  const existing = useSetupStore((s) => s.selection);
  const [chosen, setChosen] = useState<string[]>(existing?.categories ?? []);

  const toggle = (id: string) =>
    setChosen((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  const save = () => {
    const selection: Selection = {
      categories: chosen,
      categoryCount: chosen.length,
      applicationCount: 0,
      webDomainCount: 0,
      includeEntireCategory: true,
      token: chosen.length > 0 ? `fake:${chosen.join("+")}` : null,
    };
    setSelection(selection);
    router.back();
  };

  return (
    <View style={[pickerStyles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={pickerStyles.content}>
        <View style={pickerStyles.heading}>
          <Text huge bold>
            Choose what to gate
          </Text>
          <Text small muted>
            A category also covers apps installed later.
          </Text>
        </View>
        {CATEGORIES.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            selected={chosen.includes(category.id)}
            onToggle={() => toggle(category.id)}
          />
        ))}
      </ScrollView>
      <View
        style={[pickerStyles.footer, { paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          onPress={save}
          disabled={chosen.length === 0}
          style={[
            pickerStyles.save,
            { backgroundColor: chosen.length > 0 ? accent : fill },
          ]}
        >
          <Text
            large
            extrabold
            onFilled={chosen.length > 0}
            muted={chosen.length === 0}
          >
            {chosen.length > 0 ? `Save ${chosen.length}` : "Pick at least one"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
