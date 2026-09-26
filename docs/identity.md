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

1. **The shield reaches our app by notification. Ship that.** The child taps
   the shield button, a local notification arrives, and the child taps it. That
   works today. It needs notification permission, which the library posts
   without ever requesting, so we request it during setup.

   A direct open is possible for somebody. ScreenZen does it, observed
   2026-09-26, and it leaves the iOS back breadcrumb — which only appears on a
   real app-to-app open, never on a notification tap. **We do not know how.**

   What we tried and what it cost:

   - `{ type: "openApp" }` hardcodes `device-activity://` (its own TODO admits
     this), so it opened a URL nothing handles. Pass our own `url` instead.
   - `type: "openUrlWithDispatch"` with a `delay`, on the theory that
     `NSExtensionContext.open` fails off the main thread and that answering
     `.close` at once lets iOS stop the extension first. Both blocks in
     `handleShieldAction` do run — there is no early return between them — so
     the branch executed. Nothing opened.

   So `NSExtensionContext().open` on a detached context does nothing, and the
   library builds a detached one because `ShieldActionDelegate` has no
   `extensionContext` to borrow. Apple documents no supported route. Some apps
   use private APIs and accept the review risk.

   Settings keeps a diagnostic that points the shield at `https://apple.com`.
   If Safari opens, the mechanism works and our scheme is at fault. If nothing
   opens, the mechanism is dead. That test is unrun.

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
