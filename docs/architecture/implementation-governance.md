# Implementation Governance

## Source of truth

The following files are authoritative:

- `docs/research/react-lynx-gap-analysis.md`
- `docs/architecture/vue-lynx-technical-plan.md`
- `docs/architecture/implementation-governance.md`

## Rules

1. Research first, then architecture, then code.
2. If implementation reveals a flaw in the current plan, update research and architecture before changing the code path.
3. No package is considered releasable without automated tests and a documented usage path.
4. Native and web behaviors may differ, but the difference must be intentional and documented.

## Acceptance bar

- The demo must build for Lynx native and web.
- Web SSR must render and hydrate.
- Public APIs under `@pgg/*` must have package-level tests or demo coverage.
