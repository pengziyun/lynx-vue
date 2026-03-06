# 快速开始

## 安装依赖

```bash
pnpm install
```

## 启动复杂 demo

原生 Lynx bundle + 二维码：

```bash
pnpm --filter @pgg/demo-showcase dev
```

以终端里最新二维码为准。如果 Rspeedy 自动切换了端口，不要复用旧的 Explorer 卡片，直接重新扫码。

Web Preview：

```bash
pnpm --filter @pgg/demo-showcase dev:web
```

SSR 构建：

```bash
pnpm --filter @pgg/demo-showcase build:ssr
```

## 校验整个工作区

```bash
pnpm typecheck
pnpm test
pnpm build
```
