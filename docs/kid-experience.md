# Designing for the kid

The kid did not choose to be here. They were interrupted, probably mid-game, by
software their parent installed. Every pattern borrowed from Duolingo, Khan
Academy, Elevate or Brilliant has to be re-tested against that, because all of
those apps have a structural advantage we don't: their user opened the app on
purpose.

The goal is not to make the interruption fun. It's to keep it from breeding
resentment — at the app, and more importantly at the parent who installed it.

Ordered by leverage, not by how nice they sound.

## 1. Never interrupt mid-match

This is the whole ballgame. A Roblox or Fortnite round runs 5–20 minutes, and
pulling a kid out mid-fight isn't an inconvenience — it's a loss, sometimes a
social one in front of friends. Adults systematically underestimate this.

Show the check coming and give a grace period: a visible "next check in 4:30",
then let them finish what they're in.

The API supports this directly and we should use it: `DeviceActivitySchedule`
accepts a `warningTime`, and the monitor extension fires an
`intervalWillEndWarning` callback ahead of the interval actually ending.

## 2. Make it beatable

A kid who can clear 3 problems in 12 seconds does not resent a 12-second toll.
Personal bests, speed records, a fastest-clear they own.

This is the only principle here that gets *better* over time instead of decaying,
and it happens to be identical to the actual product goal: friction that rewards
mastery stops being friction.

## 3. Never punish a wrong answer with more work

If missing one adds problems, the kid who is genuinely weak at math — our literal
target user — gets punished hardest and learns to hate it.

Wrong answer: show the right one, count it, move on. Difficulty adapts down
silently, never as a visible demotion.

## 4. Agency inside the constraint

They can't skip it, so let them choose something. Which topic. Or "3 easy vs
1 hard."

Best version: **let them bank ahead.** Solve 6 now, skip the next check. That
turns a punishment into a strategy, and a kid who chose to pre-pay is not a kid
being ambushed.

## 5. Get out of the way instantly on success

Every second of "Great job! 🎉" is a second of not playing. Celebration is a
reward for opting in; our kid didn't. A correct answer should feel like a door
opening, not a ceremony.

No unskippable animations. No dead time between questions. The delight budget is
spent on how fast and tight the interaction feels, not on decoration.

## 6. Don't let it read as the parent

If the app feels like mom and dad watching, the resentment transfers to them. A
neutral system the kid can be annoyed at is a feature — it gives the anger
somewhere to go that isn't the relationship.

Practically: no parent-facing language anywhere in the kid view. Nothing that
says who configured this or who is watching.

## 7. Progress the kid owns

Not "your parent set this." Instead: "you've gotten 40 multiplication problems
right this week."

Duolingo's streak works because losing it is *their* loss, not a punishment
someone administered. Any progress we show has to belong to the kid.

## Reference apps

Three categories, and the third is the one that matters most.

**Classroom game-show apps — Kahoot!, Blooket, Gimkit, Quizizz.** The closest
match to our problem. Exactly our age group, exactly our interaction (timed
multiple choice, four big color-coded tiles), and — uniquely — proven delight
with kids who *didn't choose to be there*. These run in classrooms. Kahoot for
the answer-tile layout; Blooket for how swappable game modes keep a
daily-repeated loop from going stale.

**Task-to-dismiss blockers — Alarmy, ScreenZen, one sec.** Alarmy is the closest
existing thing to this product: something you resent that makes you solve math to
get past it, iterated on for a decade. The other two are studies in how much
friction is enough before it flips to resentment.

**Drill loops — Elevate, Brilliant.** Elevate for pacing: short timed drills with
almost no dead time between questions. Brilliant for the multiple-choice card
interaction itself — tap targets, selection feedback, how right/wrong resolves.

For the V1 parent/child split, look at **Greenlight**, **GoHenry**, **BusyKid** —
not their visuals, their architecture. Parent configures, kid uses, kid view must
not feel like surveillance.
