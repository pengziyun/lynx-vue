# `new-vue-lynx`

`new-vue-lynx` 是一个使用 `@pgg/*` 命名空间的 Vue 优先 Lynx 框架工作区，目标是同时覆盖：

- Lynx 原生双线程 bundle 构建
- Lynx Explorer / Lynx DevTool 调试
- Web Preview
- Web SSR / Hydration

## 权威文档

以下文档是后续实现和演进的正式依据：

- `docs/research/react-lynx-gap-analysis.md`
- `docs/architecture/vue-lynx-official-dual-thread-plan.md`
- `docs/architecture/implementation-governance.md`

对应的中文参考版本位于：

- `docs/zh-CN/research/react-lynx-gap-analysis.md`
- `docs/zh-CN/architecture/vue-lynx-official-dual-thread-plan.md`
- `docs/zh-CN/architecture/implementation-governance.md`

原始总计划存档与偏差审查位于：

- `docs/zh-CN/architecture/original-master-plan.md`
- `docs/zh-CN/architecture/original-plan-gap-analysis.md`

## 核心工作区

- `packages/vue-lynx`：原生运行时与公开 API
- `packages/vue-lynx-compiler`：编译期转换
- `packages/vue-lynx-rsbuild-plugin`：Lynx 原生构建集成
- `packages/vue-lynx-vite-plugin`：Web Preview 与 SSR 集成
- `packages/vue-lynx-testing`：测试辅助
- `packages/create-vue-lynx`：项目脚手架
- `apps/demo-showcase`：复杂集成 demo
- `apps/host-ios`：iOS 宿主骨架
- `apps/host-android`：Android 宿主骨架

## 快速开始

```bash
pnpm install
pnpm --filter @pgg/demo-showcase dev
pnpm --filter @pgg/demo-showcase dev:web
pnpm --filter @pgg/demo-showcase build:ssr
pnpm typecheck
pnpm test
```

## 中文文档索引

- `docs/zh-CN/index.md`
- `docs/zh-CN/guide/quick-start.md`
- `docs/zh-CN/guide/local-development.md`
- `docs/zh-CN/guide/native-debugging.md`
- `docs/zh-CN/guide/web-preview.md`
- `docs/zh-CN/guide/build-and-deploy.md`
- `docs/zh-CN/guide/ios-host.md`
- `docs/zh-CN/guide/android-host.md`
- `docs/zh-CN/guide/testing-and-ci.md`
- `docs/zh-CN/guide/syntax-support-matrix.md`
