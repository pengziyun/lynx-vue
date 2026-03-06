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

Native iOS and Android host compilation is staged in source form, but was not compiled in this environment because Xcode and Android SDK toolchains were not executed here.
