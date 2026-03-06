# `new-vue-lynx`

`new-vue-lynx` is a fresh workspace for building a Vue-first Lynx framework under the `@pgg/*` scope.

Chinese documentation is available at `README.zh-CN.md` and `docs/zh-CN/index.md`.

Authoritative project references:

- `docs/research/react-lynx-gap-analysis.md`
- `docs/architecture/vue-lynx-technical-plan.md`
- `docs/architecture/implementation-governance.md`

Core workspaces:

- `packages/vue-lynx`: native runtime and public API
- `packages/vue-lynx-compiler`: compiler-side transforms
- `packages/vue-lynx-rsbuild-plugin`: Lynx native build integration
- `packages/vue-lynx-vite-plugin`: web preview and SSR integration
- `packages/vue-lynx-testing`: test helpers
- `packages/create-vue-lynx`: starter project scaffold
- `apps/demo-showcase`: integration demo covering template, Options API, JSX, Suspense, Teleport, custom directives

Quick start:

```bash
pnpm install
pnpm --filter @pgg/demo-showcase dev
pnpm --filter @pgg/demo-showcase dev:web
pnpm --filter @pgg/demo-showcase build:ssr
pnpm typecheck
pnpm test
```

Guide index:

- `docs/guide/quick-start.md`
- `docs/guide/local-development.md`
- `docs/guide/native-debugging.md`
- `docs/guide/web-preview.md`
- `docs/guide/build-and-deploy.md`
- `docs/guide/ios-host.md`
- `docs/guide/android-host.md`
- `docs/guide/testing-and-ci.md`
- `docs/guide/syntax-support-matrix.md`

Chinese guide index:

- `README.zh-CN.md`
- `docs/zh-CN/index.md`
