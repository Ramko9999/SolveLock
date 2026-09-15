# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the react native mobile application for SolveLock built with Expo 57 and TypeScript.
iOS only — the blocking layer is Apple's Screen Time API and has no Android equivalent here.

See @../docs/identity.md for what we're building and the platform constraints it
has to live inside, and @../docs/kid-experience.md before designing anything the
child sees.

## Coding Style Guide

### Component Structure

1. Each component has its own stylesheet and props type if it requires styles or/and props. The order of these definitions in code should be: stylesheet, props and then the component.

If we have component `<Week/>`, its stylesheet would be named `weekStyles` and its props type would be `WeekProps`. `weekStyles` is defined before `WeekProps` which is defined before `Week`.

```tsx
const weekStyles = StyleSheet.create({...});

type WeekProps = {...};

function Week({ ... }: WeekProps) {
  ...
}
```

2. Define the components or functions that are depended on by other components or functions above them.

If `<Week>` uses the `<Day>` component, define `dayStyles`, `DayProps` and `Day` before you define `weekStyles`, `WeekProps` and `Week`.

```tsx
const dayStyles = StyleSheet.create({...});

type DayProps = {...};

function Day({ ... }: DayProps) {
  ...
}

const weekStyles = StyleSheet.create({...});

type WeekProps = {...};

function Week({ ... }: WeekProps) {
  ...
}
```

### Import Conventions

3. Group imports in this order:
   - React / React Native / third-party imports
   - Theme imports (`@/theme`)
   - Store imports (`@/store`)
   - API / utility imports (`@/api`, `@/util`)
   - Other custom imports

### Styling

4. Prefer to use the predefined functions in `@/theme/style-utils` to define flex layouts:
   - `StyleUtils.flexRow(gap?)` — horizontal layout
   - `StyleUtils.flexColumn(gap?)` — vertical layout
   - `StyleUtils.flexRowCenterAll(gap?)` — centered horizontal layout
   - `StyleUtils.flexColumnCenterAll(gap?)` — centered vertical layout

5. Prefer to use `<View/>`, `<Text/>` and `<TextInput/>` from `@/theme` since they accept inline props, instead of importing from `react-native` directly.

6. Use inline props for customizing sizes, weights and colors when using `<Text/>` or `<TextInput/>` from `@/theme`:
   - Sizes: `micro`, `xtiny`, `tiny`, `smaller`, `small`, `sneutral`, `neutral`, `large`, `larger`, `big`, `bigger`, `huge`, `huger`, `superhuge`
   - Weights: `thin`, `extralight`, `light`, `regular`, `medium`, `semibold`, `bold`, `extrabold`, `black`
   - Colors: `background`, `primary`, `accent`, `surface`, `fill`, `muted`, `correct`, `wrong`
   - Style: `italic`, `serif` (system serif), `mono` (system monospace — fixed digit widths, so a countdown or a changing answer doesn't jiggle the layout)
   - Example: `<Text huge bold accent>4:30</Text>`

7. **Always use relative values for sizing and spacing** — this ensures the UI scales properly across all screen sizes:
   - Use percentile strings (`"5%"`, `"10%"`) for padding, margins, and dimensions in stylesheets
   - When percentiles aren't possible (e.g. computed values), use the `useWindowDimensions()` hook:
     ```tsx
     const { width, height } = useWindowDimensions();
     const size = width * 0.25;
     ```
   - Never use fixed pixel values like `16`, `24`, etc. for layout spacing
   - Exception: fixed values are acceptable for border radius, line heights, hairlines and shadow properties, where scaling would defeat the purpose. Prefer the `Radius` and `Spacing` scales in `@/theme/design-tokens` over bare numbers.

8. Make component stylesheets instead of defining inline styles when possible.

### Colors

9. Use the color utilities from `@/theme/color` — never write a raw hex at a call site:
   - `useColor(AppColor.accent)` — theme-aware color inside a component
   - `getColor(color, theme)` — when the color scheme is already known and hooks aren't available
   - `toRgba(color, alpha)` — add transparency
   - If a color doesn't exist yet, add it to `AppColor` with both a light and a dark value. Every color needs both.

### State Management

10. **Prefer local state.** Default to `useState` / `useReducer` when state is only consumed by a single component and its children.

11. Limit the state selected from Zustand to the minimum amount. Use `useShallow` if selecting an object or array.

12. **Always access Zustand store state via hooks, never via `.getState()`** — this ensures proper reactivity and follows React patterns:
    - Good: `const setFlag = useMyStore((state) => state.setFlag);` then call `setFlag(value)`
    - Bad: `useMyStore.getState().setFlag(value)` — this bypasses React's reactivity system
    - When selecting multiple values, wrap with `useShallow`:
      ```tsx
      const { value, setValue } = useMyStore(
        useShallow((state) => ({
          value: state.value,
          setValue: state.setValue,
        }))
      );
      ```

### Components

13. **Generic / utility components live in `@/components/util/`.** Anything reusable that isn't tied to a specific feature belongs there. Feature-specific components stay in their own feature directory. Don't create new top-level subdirectories like `ui/` for this — `util/` is the canonical location.

### Animations

14. Use React Native Reanimated for animations:
    - `useSharedValue()` for animated values
    - `useAnimatedStyle()` for animated styles
    - `withTiming()`, `withSpring()` for transitions

### Comments

15. **Do not overcomment.** Write code that explains itself through names and structure; comments are reserved for non-obvious *why* (a workaround for a known bug, a tradeoff the reader couldn't infer, a constant whose value matters). Do NOT add: section-header banners (`// ============ Foo ============`), JSDoc that restates the type signature, paragraph-long block comments at the top of a component, comments that narrate what the next line does, or annotations on stylesheet keys. If a chunk of logic feels like it needs an explanation, prefer extracting a well-named helper over describing it inline. When in doubt, delete the comment.

### Misc

- TypeScript configured with `@/*` mapping to the `mobile/` directory (e.g. `import { Text } from '@/theme'`)
- Use `pnpm` for installing packages
- `pnpm check` runs Biome (format + lint, writes fixes); `pnpm typecheck` runs `tsc --noEmit`. Both should be clean before you call work done.
