# VueLynx Official Dual-Thread Plan

## Status

This document supersedes `docs/architecture/vue-lynx-technical-plan.md` for the native Lynx architecture.

## Non-negotiable constraint

- VueLynx native must follow the official Lynx dual-thread bundle model.
- Every native entry must build into:
  - one background-thread JavaScript entry
  - one main-thread JavaScript entry
  - one final `.lynx.bundle`
- Any implementation that collapses native execution back into a single runtime entry is invalid, even if Explorer can still open the bundle.

## Target architecture

### Native

- Build system: `@lynx-js/rspeedy`
- Bundle plugins:
  - `@lynx-js/runtime-wrapper-webpack-plugin`
  - `@lynx-js/template-webpack-plugin`
- Entry model:
  - `entry`
  - `entry__main-thread`
- Template composition:
  - `entry` is treated as background thread content
  - `entry__main-thread` is marked as main-thread content and becomes `lepusCode.root`
- Output contract:
  - `.rspeedy/<entry>/tasm.json`
  - `.rspeedy/<entry>/debug-info.json`
  - `<entry>.lynx.bundle`

### Web Preview

- Web Preview remains a separate browser runtime for local development and SSR validation.
- Web Preview must not simplify or redefine the native bundle architecture.

### SSR

- SSR remains web-only for this phase.
- Native design should reserve extension points for future SSR, but native SSR is not in scope for the current implementation line.

## Runtime model

### Background thread

- The background thread loads the user entry with thread mode preset to `background`.
- The background bootstrap may only initialize the environment. It must never clear already-installed main-thread lifecycle hooks; even if a debug environment shares one global object, the background side may not run any `delete processData/renderPage/updatePage` logic.
- `defineLynxEntry()` in background mode registers the page entry metadata and data processors, but must not directly expose native page lifecycle globals such as `processData`, `renderPage`, or `updatePage`.

### Main thread

- The main thread loads the same user entry with thread mode preset to `main-thread`.
- The main-thread bootstrap must run before the user entry and match the official ReactLynx runtime shape:
  - install called-by-native wrappers for `renderPage`, `updatePage`, `getPageData`, and `removeComponents`
  - install `processData` through `lynx.registerDataProcessors()`
  - guarantee that `processData` exists even before business data processors are registered
- `defineLynxEntry()` in main-thread mode should register delegates and business data processors, then let the global `processData`, `renderPage`, `updatePage`, and `getPageData` stay callable by the Lynx runtime.
- Main-thread output is the only thread allowed to be tagged with `lynx:main-thread`.

### Authoring contract

- The business entry remains a single `src/main.ts`.
- The rsbuild plugin is responsible for splitting it into dual entrypoints by prepending internal thread bootstrap modules.
- Developers must not hand-maintain separate `background.ts` and `main-thread.ts` files for ordinary pages.

## Compiler and build responsibilities

### `@pgg/vue-lynx-compiler`

- Owns thread model naming and entry topology helpers.
- Exposes stable helpers for:
  - main-thread suffix detection
  - background/main-thread entry mapping
  - source entry normalization
  - template entry pairing

### `@pgg/vue-lynx-rsbuild-plugin`

- Converts each source entry into dual entries.
- Applies `RuntimeWrapperWebpackPlugin` with:
  - `script` banner for background assets
  - `bundle` banner for main-thread assets
- Applies `LynxTemplatePlugin` per background entry pair, not per raw entrypoint.
- Marks only `__main-thread` entry assets with `lynx:main-thread`.

### `@pgg/vue-lynx`

- Provides thread bootstrap modules:
  - `@pgg/vue-lynx/internal/thread-background`
  - `@pgg/vue-lynx/internal/thread-main`
- The main-thread bootstrap is responsible for:
  - installing `lynx.registerDataProcessors`
  - installing the called-by-native wrappers
  - synchronizing lifecycle hooks to global names that Lynx can resolve directly when needed
- The background bootstrap is responsible for:
  - initializing `lynx.__initData`
  - providing a no-op `lynx.registerDataProcessors` only when it is missing
  - never clearing main-thread lifecycle hooks
- `defineLynxEntry()` must branch by active thread mode.

## Migration rules from the previous implementation

- The previous single-entry native renderer path is no longer authoritative.
- Existing code that relied on “one entry produces one bundle directly” must migrate to the dual-entry plugin pipeline.
- Any future work on Teleport, Transition, Suspense, directives, or SSR must be layered on top of the dual-thread entry model instead of bypassing it.

## Verification requirements

- Unit tests must verify entry splitting and main-thread detection.
- Runtime tests must verify background mode does not register native lifecycle globals.
- Build validation must confirm:
  - two JavaScript entry assets are generated before template encoding
  - the final bundle still resolves through Explorer

## Current implementation scope of this revision

- Replaced single native entry expansion with explicit `background + main-thread` entries.
- Added thread-mode bootstrap modules and runtime branching in `defineLynxEntry()`.
- Updated plugin behavior to generate bundle templates from entry pairs rather than raw entries.

## Remaining follow-up work

- Move more component/runtime logic out of the main-thread path so the native split becomes semantically stricter, not only structurally correct.
- Extend demo and host-level validation to cover multi-entry pages and real-device DevTool attachment.
