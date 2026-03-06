# Quick Start

## Install

```bash
pnpm install
```

## Run the complex demo

Native Lynx bundle + QR code:

```bash
pnpm --filter @pgg/demo-showcase dev
```

Use the latest QR code shown in the terminal. If Rspeedy changes the port, rescan instead of reusing an older Explorer card.

Web Preview:

```bash
pnpm --filter @pgg/demo-showcase dev:web
```

SSR build:

```bash
pnpm --filter @pgg/demo-showcase build:ssr
```

## Validate the workspace

```bash
pnpm typecheck
pnpm test
pnpm build
```
