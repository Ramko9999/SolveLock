# SolveLock — mobile

Expo 55 / React Native / TypeScript. iOS only.

See [../docs/identity.md](../docs/identity.md) for what we're building.

```bash
pnpm install
pnpm typecheck
pnpm check           # biome
pnpm start           # needs a dev client on a device
```

## Before the first build

These gate everything else, in order. Steps 1–3 need no Mac.

1. **Set the EAS project id.** `npx eas init`, then replace
   `extra.eas.projectId` in `app.json`.

2. **Enable the App Group** `group.com.ramko9999.solvelock` on
   developer.apple.com, for the main app bundle id **and each extension**:

   ```
   com.ramko9999.solvelock
   com.ramko9999.solvelock.ActivityMonitor
   com.ramko9999.solvelock.ShieldAction
   com.ramko9999.solvelock.ShieldConfiguration
   ```

3. **Request the Family Controls (Distribution) entitlement — four times**, once
   per bundle id above, via Apple's request form. Do this on day one: approval
   has run anywhere from a day to months, and EAS cannot sign an ad-hoc or
   TestFlight build without it.

4. **Register the test device** (`npx eas device:create`) and build:

   ```bash
   npx eas build --profile development --platform ios
   ```

   The `development` profile is deliberate. EAS's plain internal distribution
   produces an **ad-hoc** profile, and ad-hoc profiles do not support Family
   Controls (Development) — that combination fails with
   `Provisioning profile doesn't include the com.apple.developer.family-controls.development entitlement`.

5. Install the dev client on the device, then `pnpm start`.

## Current state

Skeleton only — expo-router with one placeholder screen, plus the `theme/`
primitives mirrored from Readloom (`Text`/`View` with inline size, weight and
color props; `StyleUtils` for flex layouts; design tokens).

`react-native-device-activity` is installed and its Expo plugin is configured in
`app.json`, but nothing calls it yet.
