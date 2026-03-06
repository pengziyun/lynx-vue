# Native Debugging

## Explorer

```bash
pnpm --filter @pgg/demo-showcase dev
```

Scan the terminal QR code with Lynx Explorer. If your phone cannot reach the QR URL, set `LYNX_DEV_HOST` before starting the dev server.

If port `3000` is occupied, Rspeedy will move to the next available port. Always scan the latest QR code or paste the latest `main.lynx.bundle` URL shown in the terminal. After changing native build configuration, delete the old card in Lynx Explorer before rescanning.

Verify the development bundle locally:

```bash
curl -I http://127.0.0.1:<port>/main.lynx.bundle
curl -s http://127.0.0.1:<port>/main.lynx.bundle | strings | rg 'document\\.|module\\.hot|runtime-dom|querySelectorAll'
```

The HTTP probe should return `200 OK`. The `strings | rg` command should return no matches.

## Native bundle invariants

- Native builds alias `vue` to `@pgg/vue-lynx/native-vue`; the native bundle must not pull in `@vue/runtime-dom`.
- Native JS assets must not include browser-side CSS or HMR runtime such as `document`, `module.hot`, or `querySelectorAll`.
- `v-model` on Lynx inputs uses the native `onUpdate:modelValue` bridge and is not wired through the generic event bridge.

## DevTool

1. Build or run a host app that loads `main.lynx.bundle`.
2. Enable `Lynx Debug`, `DevTool`, and `LogBox`.
3. Keep the page in the foreground.
4. Connect the device over USB and open Lynx DevTool.

Reference host shells:

- `apps/host-ios`
- `apps/host-android`

## Troubleshooting

- `10203`: Lynx Explorer could not fetch the bundle. Check that the phone and the development machine are on the same LAN, `LYNX_DEV_HOST` points to a reachable IP, and the latest QR code is being used.
- `10204`: Lynx Explorer decoded a non-Lynx payload. This usually means you scanned an old QR code, the server is returning stale content, or the bundle was built with browser runtime code still present.
- `processData is not a function` / `renderPage is not a function`: the main-thread script did not bootstrap correctly. Rebuild the native bundle, make sure the browser runtime markers above are absent, delete the stale card in Lynx Explorer, and rescan the latest URL.
