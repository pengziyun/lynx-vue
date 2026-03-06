# 原始总计划存档

> 说明：本文档是 2026-03-06 会话中确认的“原始总计划”存档版本，用于后续审计、偏差分析和方案回溯。
> 它不是当前项目的唯一权威实施文档；当前实施仍以 `vue-lynx-technical-plan.md` 和 `implementation-governance.md` 为准。

# `new-vue-lynx` 全量方案更新版

## Summary

- 在 `/Users/mac/Documents/workspace/new-vue-lynx` 新建独立 monorepo，彻底不继承现有 `vue-lynx` 的实现与技术债。
- 目标升级为一个完整的 VueLynx 平台：既能走 Lynx 原生双线程 + Explorer/DevTool，也能走 Web Preview + Web SSR/Hydration，并覆盖全部既定 Vue 能力。
- 方案本身必须先作为新项目里的正式文档落盘，作为后续实现的唯一参考依据；实施开始前先创建并提交：
  - `/Users/mac/Documents/workspace/new-vue-lynx/docs/research/react-lynx-gap-analysis.md`
  - `/Users/mac/Documents/workspace/new-vue-lynx/docs/architecture/vue-lynx-technical-plan.md`
  - `/Users/mac/Documents/workspace/new-vue-lynx/docs/architecture/implementation-governance.md`
- 其中 `vue-lynx-technical-plan.md` 必须完整吸收这份 plan 的结论；`implementation-governance.md` 必须写明：
  - 后续代码实现必须严格按技术方案执行
  - 若实现中发现方案错误或无法达成目标，必须先重新调研并修订方案文档，再继续编码
  - 任何偏离方案的实现不得直接进入主线
- 官方实现基线固定为已验证版本：
  - `@lynx-js/react@0.116.4`
  - `@lynx-js/react-rsbuild-plugin@0.12.9`
  - `@lynx-js/rspeedy@0.13.4`
  - `@lynx-js/template-webpack-plugin@0.10.4`

## Key Changes

### 1. 仓库与包边界

- monorepo 采用 `pnpm + turbo + changesets`。
- 包与应用固定为：
  - `@pgg/vue-lynx`
  - `@pgg/vue-lynx-compiler`
  - `@pgg/vue-lynx-rsbuild-plugin`
  - `@pgg/vue-lynx-vite-plugin`
  - `@pgg/vue-lynx-testing`
  - `@pgg/create-vue-lynx`
  - `apps/demo-showcase`
  - `apps/host-ios`
  - `apps/host-android`
- `@pgg/vue-lynx` 作为唯一开发入口，提供共享 API、内置组件、平台抽象与 subpath exports：
  - `@pgg/vue-lynx`
  - `@pgg/vue-lynx/web`
  - `@pgg/vue-lynx/ssr`
- 原生链路与 Web 链路都基于同一份组件源码和同一份编译语义，不允许维护两套业务代码。

### 2. 实施前研究文档

- `react-lynx-gap-analysis.md` 必须拆清 ReactLynx 的 5 层：
  - 双线程 entry/layer 拆分
  - transform 与 loader 设计
  - main-thread / background runtime bootstrap
  - template/bundle 生成
  - testing env 与线程切换
- `vue-lynx-technical-plan.md` 必须明确：
  - Vue 语法支持矩阵
  - Lynx 原生与 Web Preview 的行为对齐策略
  - SSR 边界
  - Teleport / Transition / Suspense 的平台语义
  - 自定义指令兼容模型
  - demo、宿主、调试、测试、发布策略
- `implementation-governance.md` 必须明确实施纪律：
  - 文档先于代码
  - 方案变更先于实现变更
  - 研究结论、方案结论、实现状态分别记录
  - 每个里程碑都要回填文档验收结论
- 代码实现只能引用这三份文档中的结论，禁止边做边临时改架构。

### 3. 框架架构

- 架构基线不变：Lynx 原生仍严格遵循官方双线程模型。
- 统一编译链分两条目标：
  - Native Lynx：输出 `background.js + main-thread.js + .lynx.bundle`
  - Web Preview / SSR：输出浏览器运行包与 SSR server/client hydration 包
- `@pgg/vue-lynx-compiler` 负责：
  - `.vue`、JSX、render function 统一编译
  - Options API 与 Composition API 统一归一
  - 模板指令、插槽、自定义指令、内置组件编译
  - 线程敏感代码标记与事件分流
  - Web 与 Native 的共享 IR 生成
- `@pgg/vue-lynx-rsbuild-plugin` 负责：
  - 按 ReactLynx 方式拆分 entry 为 `main-thread` 与 `background`
  - 注入 runtime bootstrap
  - 对接 `LynxTemplatePlugin + LynxEncodePlugin`
  - 生成 Explorer 可扫码 bundle
  - 保持 DevTool 调试、source map、开发态 URL 可用
- `@pgg/vue-lynx-vite-plugin` 负责：
  - Web Preview 开发服务器
  - Web SSR 构建
  - client hydration
  - 将 Lynx 组件语义映射到浏览器预览运行时
- `@pgg/vue-lynx-testing` 负责：
  - main/background 双线程测试环境
  - Web Preview 测试环境
  - SSR render + hydrate 测试环境

### 4. Vue 能力范围

- 本期必须一起实现：
  - Composition API
  - Options API
  - SFC 模板
  - JSX / render function
  - slots
  - provide / inject
  - 自定义指令
  - Teleport
  - Transition
  - Suspense
  - 浏览器 Web Preview
  - Web SSR / hydration
- SSR 边界已锁定：
  - 本期只做 Web SSR + Web Hydration
  - Lynx 原生链路本期仍以 CSR 为准，但 runtime 数据接口要为未来 Lynx SSR 预留稳定扩展点
- Web Preview 目标已锁定：
  - 目标为“接近原生一致”，不是普通浏览器 fallback
  - 使用 Lynx 语义组件与样式映射层，不允许简单退化成 HTML demo

### 5. 关键行为定义

- Options API
  - 完整支持 Vue 3 Options API 组件定义、生命周期、`data/computed/methods/watch`
  - 与 Composition API 可混用
- 自定义指令
  - 兼容 Vue 3 directive hook 语义
  - Web 侧 `el` 为 `HTMLElement`
  - Native 侧 `el` 为 `LynxDirectiveElement` 代理对象，暴露稳定 DOM-like 子集：属性、样式、class、事件、focus/blur、测量接口
  - 明确文档化：依赖浏览器专属 DOM API 的第三方指令仅保证 Web 可用
- Teleport
  - Web 侧支持标准 `to`
  - Native 侧支持内建挂载点：`#app`、`#overlay`、`#modal`
  - 其他 selector 在 Native 构建时报 warning，不作为可移植能力承诺
- Transition
  - Web 侧对齐 Vue 3
  - Native 侧支持 class-based transition 与 JS hooks
  - 动画落到 Lynx 支持的样式与时间线能力；不承诺浏览器 CSS 全能力等价
- Suspense
  - Web 侧使用标准 Vue Suspense
  - Native 侧在 background 中驱动 async 依赖，main-thread 先渲染 fallback，再切换 resolved tree
- 事件线程模型
  - 默认业务事件走 background
  - 提供显式主线程能力：
    - 模板修饰符：`@tap.main`
    - JSX/runtime 帮助函数：`mainThread(handler)`
  - `background-only` 语义保留，主线程非法导入必须构建失败

### 6. Demo 与宿主

- `apps/demo-showcase` 作为复杂参考项目，必须同时验证 Native、Web Preview、Web SSR 三条链路。
- demo 功能固定包含：
  - feed 列表
  - 详情页
  - 表单页
  - 全局状态
  - 异步请求
  - 条件渲染
  - 插槽
  - 弹层
  - 动画
  - Teleport
  - Suspense
  - 自定义指令
  - Options API 页面
  - JSX 页面
  - SFC 页面
- `apps/host-ios` 与 `apps/host-android` 都必须包含：
  - 本地 bundle 加载
  - 开发态 URL 加载
  - Lynx Explorer / Lynx DevTool 接入与调试开关
  - 使用 demo 产物的实际加载示例

### 7. 文档交付

- 文档集合固定为：
  - 快速开始
  - 架构与技术方案
  - 语法支持矩阵
  - Native 开发与 Explorer 扫码
  - Lynx DevTool 调试
  - Web Preview 开发
  - Web SSR 使用方式
  - iOS host 集成
  - Android host 集成
  - 构建与部署
  - 测试与 CI
  - 常见问题与限制
- 文档必须区分三条运行链路：
  - Native Lynx
  - Web Preview
  - Web SSR
- 根文档还要明确写出“哪些文件是项目权威依据”，至少包括：
  - `docs/research/react-lynx-gap-analysis.md`
  - `docs/architecture/vue-lynx-technical-plan.md`
  - `docs/architecture/implementation-governance.md`

## Test Plan

- 研究校验
  - 每一项核心设计都要映射到官方 ReactLynx 对应实现或明确说明为何不能直接复用。
- 编译测试
  - SFC、JSX、render function、Options API、指令、插槽、Teleport、Transition、Suspense、线程切分。
- 运行时测试
  - Native main/background 双线程生命周期、事件、数据更新、页面刷新。
  - Web Preview 组件渲染、布局、事件、指令、Teleport、Transition、Suspense。
- SSR 测试
  - `renderToString`
  - hydration 成功
  - hydration 后交互恢复
  - 与 Web Preview 行为一致性校验
- bundle 测试
  - 断言存在 `main-thread.js`、`background.js`、`.lynx.bundle`
  - 断言 Explorer 可扫码 URL 与 DevTool source map 正常
- demo 测试
  - 页面级集成测试
  - E2E smoke test
  - Native 构建测试
  - Web SSR / hydration 测试
- 宿主测试
  - Android CI 编译通过
  - iOS CI 编译通过
  - 手工真机验收 iOS/Android 各一轮
- 发布门禁
  - 任何包发布前必须通过：单元测试、集成测试、构建测试、demo 测试、宿主构建测试、文档链接校验

## Assumptions

- 本期范围确认为“大一统首版”，不拆二期。
- Lynx 原生仍以官方 bundle 协议和官方调试链为准，不自造私有协议。
- Web SSR 仅承诺浏览器链路，不承诺 Lynx 原生 SSR。
- Web Preview 追求接近原生一致，但浏览器与 Lynx 引擎的物理差异会通过文档明确列出，不以“完全像素级一致”作为门槛。
