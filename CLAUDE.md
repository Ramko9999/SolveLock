# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SolveLock gates distracting apps behind math problems. Consult @docs/identity.md to
understand what we are trying to do, and @docs/kid-experience.md before designing
anything the child sees — the kid did not opt in, which invalidates most patterns
borrowed from apps people open on purpose.

The mobile app lives in /mobile. iOS only for now — the blocking layer is Apple's
Screen Time API (FamilyControls / ManagedSettings / DeviceActivity) and has no
Android equivalent in this codebase yet.

## Layout

- `mobile/` — the Expo app
- `docs/` — product identity and platform notes
- `prototypes/` — throwaway spikes, not app code

[docs/research.md](docs/research.md) holds the problem-generation research — schema
design, diagram rendering options, question banks and licences, and the M0-M7
evaluation ladder. It is deliberately not `@`-referenced; read it on demand when
working on problem generation.
