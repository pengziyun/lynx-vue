# 原计划差距清单

> 说明：本文档用于对照 [original-master-plan.md](./original-master-plan.md) 审查当前仓库状态。
> 审查口径：
> - `已完成`：已经落地，且实现方向与原计划基本一致。
> - `部分完成`：已有实现，但范围、深度或完成度不足。
> - `偏离计划`：代码能工作，但实现形态与原计划的技术路线不一致。
> - `未完成`：计划要求明确存在，但当前仓库未落地。

## 总结结论

- 当前项目已经具备 monorepo、`@pgg/*` 包命名、复杂 demo、Web Preview/SSR、原生 bundle 构建、Explorer 扫码链路、中文文档体系和一批自动化测试。
- 但如果严格对照原计划，项目仍然只是 `部分完成`，还不能判定为“完全符合原计划”。
- 最大偏差不在文档，而在原生技术路线：当前原生链路还没有完全落到“对齐 ReactLynx 官方双线程模型”的实现深度。

## 差距清单

### 1. 仓库与包结构

- 状态：`已完成`
- 现状：
  - `pnpm + turbo + changesets` 的 monorepo 已建立。
  - 原计划要求的核心包和应用都已存在：
    - `packages/vue-lynx`
    - `packages/vue-lynx-compiler`
    - `packages/vue-lynx-rsbuild-plugin`
    - `packages/vue-lynx-vite-plugin`
    - `packages/vue-lynx-testing`
    - `packages/create-vue-lynx`
    - `apps/demo-showcase`
    - `apps/host-ios`
    - `apps/host-android`

### 2. 文档先行与治理规则

- 状态：`部分完成`
- 现状：
  - 研究文档、技术方案、实施治理规则都已存在。
  - 中文文档体系和中英文双份 guide 也已存在。
- 差距：
  - 当前权威技术方案文档已经被明显简化，不再完整承载原计划中的“大一统首版”边界、线程模型、验收标准和分层职责。
  - 也就是说，文档治理框架存在，但“当前权威方案”与“原计划”并不一致。

### 3. 原生技术路线必须对齐官方双线程模型

- 状态：`偏离计划`
- 现状：
  - 当前原生运行时是“自定义 Vue renderer + Lynx API 适配层”。
  - 当前原生构建插件虽然已经能产出 `.lynx.bundle`，也修通了 Explorer 扫码链路，但仍然是把单入口交给 `LynxTemplatePlugin` 编码。
- 证据：
  - 当前方案文档本身写的是“自定义 Vue renderer + Lynx API 适配层”，见 [vue-lynx-technical-plan.md](/Users/mac/Documents/workspace/new-vue-lynx/docs/zh-CN/architecture/vue-lynx-technical-plan.md#L20)。
  - 当前原生构建插件仍然只把 `chunks` 设为 `[entryName]`，见 [index.ts](/Users/mac/Documents/workspace/new-vue-lynx/packages/vue-lynx-rsbuild-plugin/src/index.ts#L103) 和 [index.ts](/Users/mac/Documents/workspace/new-vue-lynx/packages/vue-lynx-rsbuild-plugin/src/index.ts#L107)。
- 原计划要求：
  - entry 按 ReactLynx 方式拆为 `main-thread` 和 `background`
  - 生成 `background.js + main-thread.js + .lynx.bundle`
  - runtime bootstrap 对齐官方 main/background 双线程
- 差距结论：
  - 当前项目是“做通了原生 bundle 和调试链路”，但没有严格落到原计划要求的官方双线程实现深度。

### 4. `@pgg/vue-lynx-compiler`

- 状态：`未完成`
- 现状：
  - 当前 compiler 包只导出了 `transformCSS`、`transformTemplate`、`splitThreadCode` 等工具。
- 证据：
  - 见 [index.ts](/Users/mac/Documents/workspace/new-vue-lynx/packages/vue-lynx-compiler/src/index.ts#L8)。
- 原计划要求：
  - `.vue` / JSX / render function 统一编译
  - Options API / Composition API 统一归一
  - 共享 IR
  - 线程敏感转换
  - Web / Native 编译目标统一抽象
- 差距结论：
  - 当前 compiler 还只是辅助工具集，不是原计划中的核心编译层。

### 5. Vue 能力范围

- 状态：`部分完成`
- 已完成或基本具备：
  - Composition API
  - Options API
  - SFC 模板
  - JSX / render function
  - 自定义指令基础能力
  - Web Preview
  - Web SSR / hydration
- 差距：
  - `Teleport / Transition / Suspense` 主要在 Web 路径上具备可用演示，原生路径并未形成完整闭环。
  - `Transition` 在 native runtime 里当前只是降级包装，而不是原计划中“落到 Lynx 原生时间线能力”的实现。
- 证据：
  - native runtime 中 `Transition` / `TransitionGroup` 仍是简化实现，见 [native-vue.ts](/Users/mac/Documents/workspace/new-vue-lynx/packages/vue-lynx/src/native-vue.ts#L123)。
  - Web demo 覆盖了 `Suspense` 和 `Teleport`，见 [AppWeb.vue](/Users/mac/Documents/workspace/new-vue-lynx/apps/demo-showcase/src/AppWeb.vue#L53) 和 [AppWeb.vue](/Users/mac/Documents/workspace/new-vue-lynx/apps/demo-showcase/src/AppWeb.vue#L74)。
  - Native demo 当前没有覆盖这些能力，见 [AppNative.vue](/Users/mac/Documents/workspace/new-vue-lynx/apps/demo-showcase/src/AppNative.vue#L15)。

### 6. 复杂 demo 覆盖度

- 状态：`部分完成`
- 现状：
  - `apps/demo-showcase` 已经存在，并且同时覆盖了模板、Options API、JSX、Suspense、Teleport、自定义指令、SSR 等。
- 证据：
  - Web demo 覆盖面较广，见 [AppWeb.vue](/Users/mac/Documents/workspace/new-vue-lynx/apps/demo-showcase/src/AppWeb.vue#L20)。
  - JSX 页面存在，见 [JsxStory.tsx](/Users/mac/Documents/workspace/new-vue-lynx/apps/demo-showcase/src/components/JsxStory.tsx#L1)。
- 差距：
  - 原计划要求 demo 同时在 Native、Web Preview、Web SSR 三条链路验证复杂能力。
  - 当前复杂能力主要集中在 Web demo，Native demo 明显更窄，只验证了模板、Options API、列表、滚动和 `v-model` 等基础能力。

### 7. 宿主工程

- 状态：`部分完成`
- 现状：
  - iOS 宿主具备基本 bundle 加载路径。
  - Android 宿主仍是源码骨架，实际 LynxView 接线保留在注释里。
- 证据：
  - Android 主入口还是占位接线，见 [MainActivity.kt](/Users/mac/Documents/workspace/new-vue-lynx/apps/host-android/app/src/main/java/com/pgg/vuelynxhost/MainActivity.kt#L6)。
- 差距结论：
  - 原计划要求两个宿主都能承接本地 bundle、远端 bundle、DevTool 开关和 demo 实际加载。
  - 当前只能判定为“骨架已建成”，不能判定为“宿主能力已完整交付”。

### 8. 原生调试链路

- 状态：`部分完成`
- 已完成：
  - `demo-showcase` 已经可以生成真实 `.lynx.bundle`
  - Explorer 扫码开发链路已被修通
  - 针对 `10203`、`10204`、`processData/renderPage is not a function` 的排查文档已补齐
- 差距：
  - 原计划要求连同 Lynx DevTool、source map、宿主集成一起形成稳定闭环。
  - 当前 Explorer 链路已经有实进展，但 iOS/Android 真机宿主和 DevTool 仍未完成完整验收。

### 9. 测试矩阵与“达到完美状态”

- 状态：`部分完成`
- 已完成：
  - `@pgg/vue-lynx` 已有较完整的 renderer / patching / 回归测试
  - `create-vue-lynx` 有脚手架测试
  - demo 有一部分 SSR 和 smoke 覆盖
- 差距：
  - 原计划要求：
    - 编译测试
    - 原生 main/background 双线程测试
    - Web Preview 测试
    - SSR 测试
    - bundle 测试
    - demo E2E
    - iOS/Android 宿主编译
    - 真机 Explorer / DevTool 联调
  - 当前文档明确写了 iOS/Android 宿主编译和真机联调尚未在本环境执行。
- 证据：
  - 见 [testing-and-ci.md](/Users/mac/Documents/workspace/new-vue-lynx/docs/zh-CN/guide/testing-and-ci.md#L18)。

## 建议结论

- 如果目标是“项目是否还符合原计划”，答案是：`不完全符合`。
- 如果目标是“是否已经形成一个可继续推进的可用基础”，答案是：`是`。
- 真正需要补齐的核心缺口有三类：
  - 原生技术路线重新向 ReactLynx 官方双线程模型收拢
  - compiler 从工具集升级为完整编译层
  - 宿主与真机测试链路补齐到原计划验收线

## 后续建议顺序

1. 先决定是否坚持原计划中的“官方双线程模型”为不可妥协约束。
2. 如果坚持，就先修订当前权威技术方案文档，使其重新与原计划对齐。
3. 再按新方案重做 `@pgg/vue-lynx-rsbuild-plugin` 和 `@pgg/vue-lynx-compiler`。
4. 最后补宿主接线、真机验收和测试矩阵闭环。
