# ReactLynx Gap Analysis

Date baseline: `2026-03-07`

Official packages inspected:

- `@lynx-js/react@0.116.4`
- `@lynx-js/react-rsbuild-plugin@0.12.9`
- `@lynx-js/react-webpack-plugin@0.7.4`
- `@lynx-js/template-webpack-plugin@0.10.4`

## What ReactLynx already does

1. Splits every entry into `main-thread` and `background`.
2. Applies transform-time defines for thread-sensitive branches:
   - `__MAIN_THREAD__`
   - `__BACKGROUND__`
   - `__LEPUS__`
3. Boots the runtime in two stages:
   - `setupLynxEnv()`
   - `injectCalledByNative()`
4. Marks `main-thread.js` assets for template encoding.
5. Ships a dedicated testing environment that injects separate globals for background and main-thread execution.

## Gaps in the previous experimental workspace

1. The previous runtime only implemented a single renderer path and a best-effort main-thread bridge.
2. The previous Rspeedy integration encoded bundles but did not fully model the ReactLynx dual-entry transform pipeline.
3. Web preview existed only as a development adapter; there was no SSR or hydration-friendly web runtime.
4. Governance was weak: architecture, implementation, and release rules were not enforced by repository structure.

## Decisions for `new-vue-lynx`

1. Native remains aligned to the official Lynx bundle protocol and Rspeedy toolchain.
2. Web preview and web SSR are first-class but use a distinct web runtime surface.
3. Documentation is authoritative: research and architecture files must be updated before any incompatible implementation change.
4. `@pgg/*` is the only publishable scope.
