# Local Development

## Workspace health checks

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Native Lynx

```bash
pnpm --filter @pgg/demo-showcase dev
```

Use Lynx Explorer to scan the QR code from Rspeedy. Keep the phone on the same LAN as the development machine. If the terminal switches from `3000` to another port, discard the old QR code and use the latest URL only.

## Web Preview

```bash
pnpm --filter @pgg/demo-showcase dev:web
```

Open the Vite URL in a browser to validate layout, directives, Teleport, Suspense, and SSR-friendly rendering.

## SSR Build

```bash
pnpm --filter @pgg/demo-showcase build:ssr
```
