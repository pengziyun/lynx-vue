# VueLynx 官方双线程技术方案

## 状态

这份文档在原生 Lynx 架构上取代 `docs/zh-CN/architecture/vue-lynx-technical-plan.md`，成为新的权威技术方案。

## 不可妥协约束

- VueLynx 原生链路必须遵循官方 Lynx 双线程 bundle 模型。
- 每一个原生页面入口最终都必须形成：
  - 一个 background-thread JavaScript entry
  - 一个 main-thread JavaScript entry
  - 一个最终 `.lynx.bundle`
- 任何把原生执行重新收缩成单入口运行时的实现，都视为不符合方案，即使 Lynx Explorer 还能打开页面也不算通过。

## 目标架构

### Native

- 构建系统：`@lynx-js/rspeedy`
- 核心 bundle 插件：
  - `@lynx-js/runtime-wrapper-webpack-plugin`
  - `@lynx-js/template-webpack-plugin`
- entry 形态：
  - `entry`
  - `entry__main-thread`
- 模板拼装规则：
  - `entry` 作为 background thread 内容
  - `entry__main-thread` 标记为 main-thread 内容，并作为 `lepusCode.root`
- 产物约定：
  - `.rspeedy/<entry>/tasm.json`
  - `.rspeedy/<entry>/debug-info.json`
  - `<entry>.lynx.bundle`

### Web Preview

- Web Preview 仍然保留，用于本地开发和 SSR 验证。
- 但 Web Preview 不能反向决定或简化原生 bundle 架构。

### SSR

- 本期 SSR 仍限定为 Web SSR。
- 原生方案需要预留未来扩展点，但当前实现线不做 Native SSR。

## 运行时模型

### Background thread

- background thread 会在预先写入 `background` 线程模式后加载业务入口。
- background bootstrap 只能做环境初始化，不得清理已经存在的 main-thread 生命周期钩子；即便某些调试环境共享同一个全局对象，也不能执行任何 `delete processData/renderPage/updatePage` 一类的逻辑。
- `defineLynxEntry()` 运行在 background 模式时，只负责登记页面入口元信息和数据处理器，不得直接暴露 `processData`、`renderPage`、`updatePage` 这类原生页面生命周期全局函数。

### Main thread

- main thread 会在预先写入 `main-thread` 线程模式后加载同一个业务入口。
- main-thread bootstrap 必须先于业务入口执行，并对齐 ReactLynx 官方 runtime：
  - 先安装 called-by-native wrapper，把 `renderPage`、`updatePage`、`getPageData`、`removeComponents` 暴露到全局
  - 再通过 `lynx.registerDataProcessors()` 注册 `processData`
  - 必须保证在业务 data processor 尚未注册时，`processData` 也至少有空实现
- `defineLynxEntry()` 运行在 main-thread 模式时，不应直接依赖 background 分支共享的状态，而应：
  - 注册 main-thread delegate
  - 通过 `lynx.registerDataProcessors()` 注入业务 data processor
  - 最终让全局 `processData`、`renderPage`、`updatePage`、`getPageData` 可被 Lynx 运行时调用
- 只有 main-thread 产物允许被标记为 `lynx:main-thread`。

### 业务开发契约

- 业务侧仍然只维护一个 `src/main.ts`。
- 双线程拆分由 rsbuild 插件自动完成，通过在入口前注入内部 thread bootstrap 模块实现。
- 普通页面开发者不应手工维护独立的 `background.ts` 和 `main-thread.ts`。

## 编译与构建职责

### `@pgg/vue-lynx-compiler`

- 负责双线程模型的命名和 entry 拓扑辅助能力。
- 对外提供稳定能力：
  - main-thread 后缀识别
  - background/main-thread entry 映射
  - source entry 归一化
  - 模板 entry 配对

### `@pgg/vue-lynx-rsbuild-plugin`

- 把每个业务 source entry 扩展成双 entry。
- 应用 `RuntimeWrapperWebpackPlugin`：
  - background 资产使用 `script` banner
  - main-thread 资产使用 `bundle` banner
- `LynxTemplatePlugin` 以 entry pair 为单位工作，而不是对每个原始 entry 单独生成 bundle。
- 只有 `__main-thread` entry 对应的资产允许被标记为 `lynx:main-thread`。

### `@pgg/vue-lynx`

- 提供内部线程 bootstrap 模块：
  - `@pgg/vue-lynx/internal/thread-background`
  - `@pgg/vue-lynx/internal/thread-main`
- main-thread bootstrap 的职责固定为：
  - 安装 `lynx.registerDataProcessors`
  - 安装 called-by-native wrapper
  - 在需要时把生命周期函数同步为 Lynx 可直接解析的全局名
- background bootstrap 的职责固定为：
  - 初始化 `lynx.__initData`
  - 在缺失时补上 no-op `lynx.registerDataProcessors`
  - 永不清理 main-thread 已安装的全局钩子
- `defineLynxEntry()` 必须根据当前线程模式做分流。

## 对旧实现的迁移规则

- 之前“单入口 native renderer 直接产出 bundle”的路线不再是权威实现。
- 任何仍然依赖“一个业务入口直接变成一个 bundle”的代码，都要迁移到新的双 entry 插件链路。
- 后续 Teleport、Transition、Suspense、自定义指令、SSR 等能力，只能叠加在双线程 entry 模型之上，不能绕过它另起一套原生链路。

## 验证要求

- 单元测试必须覆盖 entry 拆分和 main-thread 识别。
- runtime 测试必须覆盖 background 模式下不注册原生生命周期全局函数。
- 构建验证必须确认：
  - 模板编码前实际生成两份 JavaScript entry 资产
  - 最终 bundle 仍可被 Explorer 正常访问

## 本轮修订已落地的实现范围

- 把原生单 entry 扩展改成显式 `background + main-thread` 双 entry。
- 增加线程 bootstrap 模块，并让 `defineLynxEntry()` 按线程模式分流。
- 更新 plugin 行为，让 bundle 模板按 entry pair 生成，而不是按原始 entry 逐个生成。

## 后续仍需继续收紧的工作

- 继续把更多组件/runtime 逻辑从 main-thread 路径剥离，让双线程不仅“结构正确”，还要逐步做到“语义正确”。
- 扩大 demo 和宿主验证，覆盖多页面 entry 与真机 DevTool 附着链路。
