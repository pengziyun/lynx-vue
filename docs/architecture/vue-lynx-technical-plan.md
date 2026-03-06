# VueLynx Technical Plan

## Goals

- Build a Vue-first Lynx framework with native, web preview, and web SSR entrypoints.
- Keep native builds on the official Lynx bundle path.
- Support Composition API, Options API, SFC templates, JSX, Suspense, Teleport, Transition, and custom directives.

## Package layout

- `@pgg/vue-lynx`: native runtime plus public exports
- `@pgg/vue-lynx-compiler`: shared compiler transforms
- `@pgg/vue-lynx-rsbuild-plugin`: native build integration
- `@pgg/vue-lynx-vite-plugin`: web preview and SSR integration
- `@pgg/vue-lynx-testing`: helpers for runtime and integration tests
- `@pgg/create-vue-lynx`: starter scaffolding

## Runtime model

- Native uses a custom Vue renderer plus a Lynx API adapter.
- Web preview uses Vue DOM with a Lynx-flavored platform bridge.
- Web SSR uses `createSSRApp` and `renderToString`, paired with the same web platform bridge for hydration.

## Delivery rules

- `apps/demo-showcase` is the integration proving ground for template, Options API, JSX, Teleport, Suspense, directives, and SSR.
- Host application directories document and stage iOS/Android integration points.
- Tests must cover compiler transforms, renderer behavior, web preview, and smoke builds.
