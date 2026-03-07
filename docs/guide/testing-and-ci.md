# Testing And CI

## Local verification

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Current automated coverage

- renderer and patching behavior in `@pgg/vue-lynx`
- scaffold creation in `@pgg/create-vue-lynx`
- demo composable logic and SSR rendering in `apps/demo-showcase`
- workspace build and typecheck through Turborepo

## Confirmed manual validation

- 2026-03-07: `pnpm --filter @pgg/demo-showcase dev` was verified on a real iOS device through Lynx Explorer for local development and debugging.

## Items still not fully validated in this environment

- Android host compilation
- full iOS / Android host compilation acceptance
- full Lynx DevTool validation on real devices
- Android real-device Lynx Explorer development flow

These areas already have source scaffolds, build paths, and documentation, but they are not all part of the stable acceptance baseline yet.
