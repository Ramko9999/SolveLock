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

1. **The shield cannot launch the app through Apple's API.**
   `ShieldActionResponse` is only `none` / `close` / `defer`; there is no public
   "open the parent app".

   `react-native-device-activity` works around this with an `openApp` action
   that calls `NSExtensionContext().open(...)`. Tested on device 2026-09-25: it
   did nothing — because **the library hardcodes `device-activity://`** (its
   own TODO admits this), and our scheme was `solvelock`. We now register
   `device-activity` as a second scheme so that URL points at us. Whether the
   detached-context trick itself works is still unverified.

   Assume the fallback regardless: a local notification the child taps. It
   needs notification permission, which the library posts without ever
   requesting — so we request it during setup.
2. **Unlock windows have a 15-minute floor.** `DeviceActivitySchedule` intervals
   can't be shorter, so "solve 3, get back in" can't hand back less than 15
   minutes of access.
3. **We never learn which apps are blocked.** Selections are opaque tokens — no
   names, no bundle ids, no icons. We can render, count, and act on a selection
   and nothing else.
4. **The shield and monitor extensions can't be debugged live.** They run in
   separate processes and fail silently. They report back by writing to the
   shared App Group, which the app reads from JS.
