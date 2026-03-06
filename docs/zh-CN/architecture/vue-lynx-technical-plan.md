# VueLynx 技术方案

## 目标

- 构建一个 Vue 优先的 Lynx 框架，同时支持原生、Web Preview 和 Web SSR 入口。
- 原生构建继续走官方 Lynx bundle 链路。
- 支持 Composition API、Options API、SFC 模板、JSX、Suspense、Teleport、Transition 和自定义指令。

## 包结构

- `@pgg/vue-lynx`：原生运行时和对外 API
- `@pgg/vue-lynx-compiler`：共享编译期转换
- `@pgg/vue-lynx-rsbuild-plugin`：原生构建集成
- `@pgg/vue-lynx-vite-plugin`：Web Preview 与 SSR 集成
- `@pgg/vue-lynx-testing`：运行时与集成测试辅助
- `@pgg/create-vue-lynx`：脚手架

## 运行时模型

- 原生链路使用自定义 Vue renderer 加 Lynx API 适配层。
- Web Preview 使用 Vue DOM，并补一层 Lynx 风格的平台桥接。
- Web SSR 使用 `createSSRApp` + `renderToString`，hydration 继续复用同一套 Web 平台桥接。

## 交付规则

- `apps/demo-showcase` 是模板语法、Options API、JSX、Teleport、Suspense、自定义指令与 SSR 的集成验证场。
- `apps/host-ios` 与 `apps/host-android` 负责承接宿主集成和 DevTool 接线示例。
- 测试必须覆盖编译转换、renderer 行为、Web Preview 和 smoke build。
