# 本地开发

## 工作区健康检查

```bash
pnpm typecheck
pnpm test
pnpm build
```

## 原生 Lynx 开发

```bash
pnpm --filter @pgg/demo-showcase dev
```

命令会启动 Rspeedy，并输出 Lynx Explorer 可扫的二维码。手机要和开发机处于同一局域网；如果终端从 `3000` 切换到其他端口，只使用最新二维码，不要复用旧地址。

## Web Preview 开发

```bash
pnpm --filter @pgg/demo-showcase dev:web
```

浏览器预览用于校验模板、指令、Teleport、Suspense 与 SSR 兼容渲染。

## SSR 构建

```bash
pnpm --filter @pgg/demo-showcase build:ssr
```
