# SolveLock

## Problem

Kids nowadays are doom scrolling and gaming without any controls, and are getting
weak at math. I saw this with my sisters — they go in their room, go on their
iPads, and they just doom scroll or game the entire time. When they do math they
are quite weak: on multi-step problems, they get the basics wrong.

## Solution

The natural place to reinforce and give them more practice is the moment they go
to doom scroll or game. Before they get in, they complete a few math problems.

## Target audience

Parents with kids in elementary and middle school. That's where it hits hardest.

## MVP scope

- Multiple choice problems — no free response.
- Every 30 minutes, they need to solve 3 problems.

## V1 scope

- Same app, but split into a parent view and a child view.
- Parent can add children and configure the problems each one gets:
  - type the problems in directly
  - scan the child's homework
  - use AI to generate the problems to ask
- Onboarding that makes it easy for parents to configure the app, add children,
  and set up the controls.

## Principles

- **Delightful for children.** Think Duolingo, not a punishment screen. The goal
  is that solving feels like a small game, not a toll booth. See
  [kid-experience.md](kid-experience.md) for what that means concretely — the
  kid didn't opt in, and that changes every pattern we'd borrow.
- **Simple for parents.** Setup is the most likely place to lose them. Every
  option we add is a chance for a parent to give up halfway.

## Platform constraints this has to live inside

These come from Apple's Screen Time API and are not negotiable — they shape the
product, so decide against them rather than around them.

1. **Opening our app from the shield is possible, but unofficial.** Apple
   documents no route. `ShieldActionResponse` is only `none` / `close` /
   `defer`, `UIApplication` is unavailable in an extension, and the forums say
   it cannot be done.

   It can. ScreenZen does it, tested 2026-09-26, and it leaves the iOS back
   breadcrumb — so it is a real app-to-app open, not a notification tap.

   Two details decide it, and we had neither at first:
   `openUrlWithDispatch` rather than `openUrl`, because
   `NSExtensionContext.open` fails silently off the main thread; and a `delay`,
   because answering `.close` at once lets iOS tear the extension down before
   the scheduled block runs. The library's newer `{ type: "openApp" }` action
   also hardcodes `device-activity://`, so it opens nothing — pass our own
   `url`. None of the three fields appear in its TypeScript types.

   Keep the local notification as a fallback until this is proven on device.

2. **Unlock windows have a 15-minute floor.** `DeviceActivitySchedule` intervals
   can't be shorter, so "solve 3, get back in" can't hand back less than 15
   minutes of access.
3. **We cannot read a selection, but we can display it.** Selections are opaque
   tokens: no bundle ids, and nothing our JS can inspect. Two things are still
   possible, and both were stated wrongly here before.

   SwiftUI's `Label(applicationToken)` draws the real app icon and name. The
   system renders it; our code never sees the values. The library exposes no
   such view, so it needs a small native view of our own.

   Inside the shield extension, `Application(token:).localizedDisplayName`
   gives the blocked app's name as a string. So the shield and its notification
   can say "Roblox".

   What remains impossible is *launching* an app from a token, and reading any
   of this from JavaScript.
4. **The shield and monitor extensions can't be debugged live.** They run in
   separate processes and fail silently. They report back by writing to the
   shared App Group, which the app reads from JS.
