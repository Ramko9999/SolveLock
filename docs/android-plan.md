# Android plan

Written in ASD-STE100 Simplified Technical English.

Android has no Screen Time API for third-party apps. The operating system does
not block apps for us. **Our app must see which app is open and cover it.**

Most platform constraints in [identity.md](identity.md) are iOS-only. Do not
copy them here.

## The decision: accessibility service, not a foreground service

ScreenZen asks for four permissions: app usage access, display over other apps,
**accessibility service**, and ignore battery optimisation.

An accessibility service is not a foreground service. The system binds it and
keeps it alive. So ScreenZen needs no foreground service type, no `specialUse`
justification, and no permanent notification. It also needs no polling: the
service receives a window-change event the instant the foreground app changes.

We take the same path.

| | Foreground service | Accessibility service |
| --- | --- | --- |
| Detection | Poll, with a delay | Instant event |
| Battery | We pay for the polling | Nearly free |
| Permanent notification | Yes | No |
| Play Console hurdle | `specialUse` justification | Accessibility declaration |

Neither path is free. Both need a Play Console form. We are choosing which
review to face, not avoiding one. The accessibility path is less code, and it
is the path a shipping app already walks.

None of this applies to a development build on our own phone. Decide the review
question when we ship, with a working app to argue from.

## What each platform calls

| Stage | iOS | Android |
| --- | --- | --- |
| Pick apps | `FamilyActivityPicker` | query the launcher intent |
| Watch | `startMonitoring` + threshold | accessibility events |
| Detect | iOS wakes the extension | our own code compares |
| Block | `store.shield.applications` | start an Activity over the app |
| Open our app | notification, the child taps it | start the Activity directly |
| Return to the game | not possible | launch the package by name |

The last two rows are why Android is better. On iOS the child taps a
notification, then finds the game by hand. On Android both seams disappear.

## Do not unify the two

The two chains share almost nothing. A shared abstraction would be mostly
`Platform.OS` wearing a costume.

The screens need two answers only: **is the child blocked**, and **the child
solved, let them back in**. Everything else can live in two files that do not
resemble each other.

`Enforcement` is larger than that because it grew around iOS limits.
`isShielded` and `lastReachedAt` exist because iOS holds the truth and we must
ask it. On Android we hold the truth. `pointShieldAt` is a pure iOS diagnostic.

Write `android.ts` to fit Android. Let it diverge. Shrink the shared part
afterwards, once we know what both use.

## The child's experience does not change

`app/solve.tsx` and `app/blocked.tsx` are plain React Native. They already work.
**We are building the plumbing, not the product.**

## Building for the emulator

Pass the one CPU type the emulator uses:

```
./gradlew :app:assembleDebug -PreactNativeArchitectures=x86_64
```

`gradle.properties` lists four. Without the flag Gradle compiles C++ for all of
them, in six projects, and the build takes about eight minutes instead of
eleven seconds. `npx expo run:android` sets the flag for you; a direct Gradle
command does not.

`mobile/android/` is not in git, so this note is the only record.

## Milestones

### A1 — The parent grants permissions

The parent opens SolveLock on the child's phone. The app lists what it needs.
The parent taps one item. Android opens its own settings page. The parent
grants it and comes back. The app notices and moves to the next item.

**Test:** do it once by hand from a clean install. Count the taps.

**Why it matters:** [identity.md](identity.md) says setup is where parents give
up. Four trips into Android settings is a lot.

### A2 — The parent picks apps

The parent sees the apps on the phone, with real icons and real names. They
tick Roblox. They set the quota.

**Test:** tick an app. Close the app. Reopen it. The tick is still there.

Use a `<queries>` entry for the launcher intent. **Do not** use
`QUERY_ALL_PACKAGES`; it has its own Play review form.

### A3 — The phone knows which app is open

Nothing is visible. This is the first native step and the riskiest. **Do it
before anything else.**

**Test:** show the current package name on the settings screen. Open Roblox.
The name changes within a second.

**Why first:** everything below depends on it.

**Result, 2026-09-26, Pixel emulator, Android 16.** The service saw Chrome in
the same second that the launch command ran (17:58:35.0 to 17:58:35). The delay
is below one second, so we do not need a poll, and a check on each window change
is fast enough for A5.

Two things cost time and will cost it again:

- A local Expo module needs a **native rebuild**. A JS reload cannot add it, and
  the app shows a blank screen if `requireNativeModule` throws at module scope.
  Use `requireOptionalNativeModule` and let the screen say the module is missing.
- `adb shell am force-stop` **unbinds the accessibility service**, and Android
  clears `enabled_accessibility_services`. Grant it after the last restart, not
  before.

### A4 — The phone counts the minutes

**Test:** set the quota to two minutes. Play. Watch the count rise.

The count is usage, not wall-clock. Unlike iOS, we can show this number to the
child, because we own it.

**Done, 2026-09-26.** Chrome was in front from 18:12:51 to 18:13:28, and the
count read 0:37 of 2:00. It did not move in the next 20 seconds outside Chrome.

The count lives in the accessibility service, not in the screens, because the
service outlives them. It is written to SharedPreferences, so a reboot does not
hand the child a free hour. A screen-off broadcast stops the clock, so a phone
in a pocket does not burn the quota.

### A5 — The block screen appears

**Test:** spend the quota, then open the app.

**What can go wrong:** the screen appears late, or Android refuses to start it
from the background. The second is what "display over other apps" is for.

**Done, 2026-09-26.** Android allowed the start with `BAL_ALLOW_SAW_PERMISSION`,
so the overlay permission is what makes it work. Two things cost a cycle:

- **An app with a splash screen takes the screen back.** Chrome fires a second
  window event for the same package, so a handler that only acts on a *change*
  covers the first screen and loses the second. Act on every event for a gated
  package and rate-limit instead.
- **The development client swallows our URL scheme.** `solvelock://blocked`
  brought the app forward but never reached the router. The service now sets a
  flag the app reads when it becomes active, which works whether the app was
  running or not.

### A6 — The child solves and goes back to the game

The child answers three problems. The block clears. **We relaunch the game.**

**Test:** solve, and watch the game reopen by itself.

This is the step iOS cannot do. It removes the seam that
[kid-experience.md](kid-experience.md) principle 5 complains about.

**Done, 2026-09-26.** Three correct answers, and Chrome opened by itself. The
child taps nothing after the last answer. The count resets first, so the game
does not block again the moment it opens.

### A7 — It survives the day

**Test:** leave the phone alone for an hour. Lock it. Let it sleep. Then open
the game.

Samsung and Xiaomi stop services more aggressively than Pixel. Test on the
phone the child actually uses.

### A8 — The child cannot remove it

Device Admin blocks uninstall until it is turned off in *Settings → Security →
Device admin apps*. Ask for **no policies**, so the dialog stays short.

**Test:** try to uninstall. Then try `adb uninstall`. Both must fail.

**Warning:** this blocks our own `adb uninstall` too. Turn the admin off first.

## What to measure

1. **The delay** in A3, from opening the game to our code knowing. This number
   decides whether the design works.
2. **The taps** in A1. How long does the parent spend in Android settings?
3. **Survival** in A7. One hour, then a full day.

## What we are not doing

No foreground service. No polling loop. No `specialUse` justification.

No Play Console work yet.

No shared abstraction with iOS yet.

## Rules

- Do not change the iOS path. iOS must still build and work.
- No parent-facing language in the child's screens, including the block screen
  ([kid-experience.md](kid-experience.md), principle 6).
- After the last correct answer, go straight back to the game (principle 5).

## Before we ship (not now)

- Accessibility declaration in the Play Console, with a video.
- Data safety form.
- The Families policy probably applies, because the child uses the app. It
  limits ads and third-party SDKs. Read it early.
- A new personal developer account must run a closed test, about 12 testers for
  14 days, before production.
- Check the current Play policy for each point. It changes often.
