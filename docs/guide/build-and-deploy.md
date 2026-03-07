# Build And Deploy

Native Lynx build now follows an explicit dual-thread entry model:

- background entry: `entry`
- main-thread entry: `entry__main-thread`
- final bundle: `entry.lynx.bundle`

## Native bundle

```bash
pnpm --filter @pgg/demo-showcase build
```

Output:

- `apps/demo-showcase/dist/main.lynx.bundle`
- `apps/demo-showcase/dist/static/js/*`

Embed `main.lynx.bundle` into a host app or serve it from a reachable development URL.

## Web bundle

```bash
pnpm --filter @pgg/demo-showcase build:web
```

Output:

- `apps/demo-showcase/dist/web`

## SSR output

```bash
pnpm --filter @pgg/demo-showcase build:ssr
```

Output:

- `apps/demo-showcase/dist/ssr`
- `apps/demo-showcase/dist/web`
