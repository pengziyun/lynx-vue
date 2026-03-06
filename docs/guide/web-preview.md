# Web Preview

`@pgg/vue-lynx/web` provides a browser preview layer for the same component tree used by the native bundle.

## Start

```bash
pnpm --filter @pgg/demo-showcase dev:web
```

## Scope covered by the demo

- template syntax
- Options API component
- JSX component
- custom directive
- Suspense
- Teleport
- Transition styling

The preview layer injects Lynx-flavored element defaults and event bridges for `tap` and `confirm`.
