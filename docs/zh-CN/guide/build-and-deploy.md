# 构建与部署

## 原生 bundle

```bash
pnpm --filter @pgg/demo-showcase build
```

输出目录：

- `apps/demo-showcase/dist/main.lynx.bundle`
- `apps/demo-showcase/dist/static/js/*`

`main.lynx.bundle` 可以嵌入宿主应用，也可以通过局域网或其他可访问地址提供给宿主加载。

## Web 构建

```bash
pnpm --filter @pgg/demo-showcase build:web
```

输出目录：

- `apps/demo-showcase/dist/web`

## SSR 构建

```bash
pnpm --filter @pgg/demo-showcase build:ssr
```

输出目录：

- `apps/demo-showcase/dist/ssr`
- `apps/demo-showcase/dist/web`
