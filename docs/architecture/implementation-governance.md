# Implementation Governance

## Source of truth

The following files are authoritative:

- `docs/research/react-lynx-gap-analysis.md`
- `docs/architecture/vue-lynx-official-dual-thread-plan.md`
- `docs/architecture/implementation-governance.md`

## Rules

1. Research first, then architecture, then code.
2. If implementation reveals a flaw in the current plan, update research and architecture before changing the code path.
3. No package is considered releasable without automated tests and a documented usage path.
4. Native and web behaviors may differ, but the difference must be intentional and documented.
5. Native implementation must preserve the official dual-thread model. Regressing to a single native runtime entry is not allowed.

## Acceptance bar

- The demo must build for Lynx native and web.
- Web SSR must render and hydrate.
- Public APIs under `@pgg/*` must have package-level tests or demo coverage.
