# ADR-001：ReactLynx 对标调研与 Vue 渲染器技术基线冻结

- **状态**：Accepted（冻结）
- **日期**：2026-02-16
- **作者**：T01 调研任务
- **调研范围**：
  - ReactLynx 官方实现：`lynx-stack/packages/react/**`
  - 社区 Vue 原型：`lynx-stack-vue-prototype/packages/vue/runtime-lynx/**`
  - Vue Custom Renderer API：<https://vuejs.org/api/custom-renderer.html>
  - Lynx 官方文档：<https://lynxjs.org>

---

## 0. 结论摘要（先看）

1. **ReactLynx 并非经典 `react-reconciler HostConfig` 形态**，而是“编译期 Snapshot + 运行期 Patch Opcode（CreateElement/InsertBefore/RemoveChild/SetAttribute）”模式。对 Vue 的落地，应把这套能力抽象成 `createRenderer` 的 `nodeOps + patchProp`。
2. **事件命名必须以 Lynx 前缀为中心**：`bind/catch/capture-bind/capture-catch/global-bind`，主线程事件再叠加 `main-thread:` 前缀。
3. **样式走原生通道，不走字符串拼接**：类名优先 `__SetClasses`，行内样式优先 `__SetInlineStyles`，并在 renderer 侧做最小 diff。
4. **双线程是第一约束**：Vue 响应式更新默认落后台（BTS）为主，主线程仅处理强实时交互（MTS / worklet）。
5. **组件基线先覆盖 10 个内置元素**（view/text/image/scroll-view/list/page/frame/input/textarea/overlay），其中 `list` 必须按虚拟化/复用模型单独处理。

---

## 1. HostConfig 分析

## 1.1 ReactLynx 如何定义“HostConfig 等价物”

ReactLynx 官方实现核心不在 `HostConfig.ts` 这类文件，而在以下组合：

- **Patch 操作定义**：`packages/react/runtime/src/lifecycle/patch/snapshotPatch.ts`
  - `CreateElement`
  - `InsertBefore`
  - `RemoveChild`
  - `SetAttribute`
  - `SetAttributes`
- **Patch 应用执行**：`packages/react/runtime/src/lifecycle/patch/snapshotPatchApply.ts`
  - 在主线程顺序执行上述操作，完成树更新与属性更新。
- **后台树与增量生成**：`packages/react/runtime/src/backgroundSnapshot.ts`
  - `insertBefore/removeChild` 时把操作写入 `__globalSnapshotPatch`。

这等价于：

> 编译器生成“动态槽位更新函数”，运行时只做最小操作码回放，而不是 React DOM 那种通用 HostConfig 回调驱动。

关键片段（官方）：

```ts
// packages/react/runtime/src/lifecycle/patch/snapshotPatch.ts
export const SnapshotOperation = {
  CreateElement: 0,
  InsertBefore: 1,
  RemoveChild: 2,
  SetAttribute: 3,
  SetAttributes: 4,
} as const;
```

```ts
// packages/react/runtime/src/lifecycle/patch/snapshotPatchApply.ts
case SnapshotOperation.CreateElement:
  new SnapshotInstance(type, id)
case SnapshotOperation.InsertBefore:
  parent.insertBefore(child, existingNode)
case SnapshotOperation.RemoveChild:
  parent.removeChild(child)
case SnapshotOperation.SetAttribute:
  si.setAttribute(dynamicPartIndex, value)
```

## 1.2 需要实现的核心方法（Vue 侧）

按 Vue `createRenderer` 规范，最小核心应覆盖：

- `createElement`
- `insert`
- `remove`
- `patchProp`
- `createText`
- `setText`
- `setElementText`
- `parentNode`
- `nextSibling`

社区原型已给出雏形：

```ts
// packages/vue/runtime-lynx/src/index.ts
const renderer = createRenderer<LynxNode, LynxElement>({
  ...nodeOps,
  patchProp,
})
```

```ts
// packages/vue/runtime-lynx/src/nodeOps.ts
createElement(tag) { return lynxApi.createElement(mapVueTagToLynx(tag)) }
insert(child, parent, anchor?) { this.insertBefore(parent, child, anchor || null) }
remove(child) { lynxApi.removeChild(childElement.parentElement, childElement) }
```

## 1.3 与 Vue `createRenderer` API 对应关系

| Vue RendererOptions | Lynx 等价能力 | 来源 |
|---|---|---|
| `createElement` | `__CreateElement` / `lynxApi.createElement` | 社区原型 `lynxApi.ts` |
| `insert` | `__InsertElementBefore` / `__AppendElement` | 社区原型 `nodeOps.ts` |
| `remove` | `__RemoveElement` / `removeChild` | 社区原型 `nodeOps.ts` |
| `patchProp` | `__SetAttribute` / `__SetClasses` / `__SetInlineStyles` / 事件注册 | 社区原型 `patchProp.ts` + 官方 `spread.ts` |
| `setElementText` | 以 `<text>` 容器替代 DOM TextNode | 社区原型 `nodeOps.ts` |
| `parentNode/nextSibling` | 依赖 Lynx 维护的 children/parentElement | 社区原型 `nodeOps.ts` |

---

## 2. 事件命名规范

## 2.1 Lynx 事件系统（bind/catch 前缀）

官方文档（Event Propagation）明确事件类型：

- `bind`：冒泡阶段监听，不拦截
- `catch`：冒泡阶段监听，拦截传播
- `capture-bind`：捕获阶段监听，不拦截
- `capture-catch`：捕获阶段监听并拦截
- `global-bind`：跨组件监听

并规定：**主线程脚本事件要加 `main-thread:` 前缀**。

运行时实现对应（官方）：

```ts
// packages/react/runtime/src/snapshot/spread.ts
const eventRegExp = /^(([A-Za-z-]*):)?(bind|catch|capture-bind|capture-catch|global-bind)([A-Za-z]+)$/
const eventTypeMap = {
  bind: 'bindEvent',
  catch: 'catchEvent',
  'capture-bind': 'capture-bind',
  'capture-catch': 'capture-catch',
  'global-bind': 'global-bindEvent',
}
```

## 2.2 React 事件 vs Vue 事件映射策略

ReactLynx 兼容转换（官方 swc plugin）已有明确策略：

```rust
// packages/react/transform/crates/swc_plugin_compat/lib.rs
// <View onClick={} /> => <View bindtap={} />
// <View onTouchStart={} /> => <View bindtouchstart={} />
if props_key.ends_with("Catch") { prefix = "catch" } else { prefix = "bind" }
if props_key.starts_with("onClick") { suffix = "tap" } else { suffix = lower(props_key[2..]) }
```

据此冻结 Vue 映射策略：

- `onClick` -> `bindtap`
- `onClickCatch` -> `catchtap`
- `onTouchStart` -> `bindtouchstart`
- `onTouchStartCatch` -> `catchtouchstart`
- 主线程版本：`main-thread:bindtap` 等

## 2.3 事件冒泡与捕获处理

- 背景线程：遵循前缀语义（`bind/catch/capture-*`）
- 主线程 worklet：允许 `stopPropagation/stopImmediatePropagation`

官方实现证据：

```ts
// packages/react/worklet-runtime/src/eventPropagation.ts
eventObj.stopPropagation = () => {
  eventCtx._eventReturnResult |= EventResult.kStopPropagationMask
}
eventObj.stopImmediatePropagation = () => {
  eventCtx._eventReturnResult |= EventResult.kStopImmediatePropagationMask
}
```

---

## 3. 样式映射机制

## 3.1 CSS 属性如何映射到 Lynx 样式

官方运行时在 spread 更新中明确分流：

- `className` -> `__SetClasses`
- `style` -> `__SetInlineStyles`
- 其他普通属性 -> `__SetAttribute`

```ts
// packages/react/runtime/src/snapshot/spread.ts
if (key === 'className') __SetClasses(el, v as string)
else if (key === 'style') __SetInlineStyles(el, v)
else __SetAttribute(el, key, v)
```

## 3.2 style 对象 diff 策略

ReactLynx 当前策略是：先比较，再整包设置。

```ts
if (key === 'style') {
  if (!isDirectOrDeepEqual(v, oldValue[key])) {
    __SetInlineStyles(el, v)
  }
}
```

冻结到 Vue 侧建议：

1. 先做 `prev/next` 快速等值判断；
2. 不等时优先一次性下发对象（减少桥调用）；
3. list 大规模更新场景再引入增量 style patch（后续优化项）。

## 3.3 class / className 处理

官方兼容层接受 `class` 与 `className`，最终统一到类名设置通道。

社区 Vue 原型已实现：

```ts
// packages/vue/runtime-lynx/src/patchProp.ts
if (key === 'class') patchClass(el, nextValue)
// patchClass 内部优先 api.__SetClasses(el, value)
```

冻结策略：Vue `class` 入参在 renderer 内归一化到 `className` 语义。

---

## 4. 双线程模型差异

## 4.1 ReactLynx 的 Main Thread / Background Thread

官方文档与实现一致：

- 主线程：首屏渲染、像素管线、主线程脚本
- 后台线程：完整 React 运行时、副作用、事件监听、数据更新

文档强调“代码会在双线程执行，不是所有 API 两边都可用”。

## 4.2 `runOnBackground` / `runOnMainThread` 使用场景

官方实现：

```ts
// runOnBackground: main -> background async
function runOnBackground(f) {
  return (...params) => new Promise(resolve => {
    dispatchEvent(WorkletEvents.runOnBackground, { fnId, execId, params, resolveId })
  })
}
```

```ts
// runOnMainThread: background -> main async
export function runOnMainThread(fn) {
  return (...params) => new Promise(resolve => {
    dispatchEvent(WorkletEvents.runWorkletCtx, { worklet: fn, params, resolveId })
  })
}
```

冻结准则：

- **强实时交互**（手势、逐帧动画、即时视觉反馈）走主线程
- **数据与副作用**（请求、状态计算、全局事件）走后台线程

## 4.3 Vue 响应式系统在双线程下的适配策略

冻结策略（关键）：

1. Vue 响应式状态以后台线程为源（Source of Truth）；
2. 主线程仅接收最小 UI patch（接近 ReactLynx SnapshotPatch 思路）；
3. 禁止在主线程直接做网络/全局模块调用；
4. 事件处理默认后台线程，必要时显式 `main-thread:`。

---

## 5. 组件映射表（第一阶段）

官方 API 导航可见内置元素：

- `view`, `text`, `image`, `scroll-view`, `list`, `page`, `frame`, `input`, `textarea`, `overlay`

## 5.1 组件与 props/events（基线表）

| Lynx 组件 | 关键 props（样例） | 关键 events（样例） | 说明 |
|---|---|---|---|
| `view` | `id`, `className`, `style`, `flatten` | `bindtap`, `catchtap` | 通用容器 |
| `text` | `text-maxline`, `style` | `bindtap` | 文本与行内混排核心 |
| `image` | `src`, `mode`, `auto-size`, `placeholder` | `bindload`, `binderror` | 空元素，无子节点 |
| `scroll-view` | `scroll-orientation`, `enable-scroll`, `sticky` | `bindscroll`, `bindscrolltoupper`, `bindscrolltolower` | 基础滚动容器 |
| `list` | `scroll-orientation`, `list-type`, `span-count` | `bindscroll` 族 + 列表生命周期事件 | 大数据高性能容器 |
| `input` | `value`, `placeholder`, `focus` | `bindinput`, `bindfocus`, `bindblur` | 表单输入 |
| `textarea` | `value`, `placeholder` | `bindinput`, `bindfocus`, `bindblur` | 多行输入 |
| `overlay` | `visible` 等 | 点击/关闭相关事件 | 浮层场景 |

> 注：具体属性全量以各组件 API 页面为准；本表用于渲染器第一阶段实现边界。

## 5.2 特殊组件：`list`（虚拟滚动/复用）

官方文档定义 `list` 为高性能容器，依赖“回收 + 按需渲染”。

官方运行时代码证据：

- `runtime/src/list.ts`：`gRecycleMap/gSignMap`、`componentAtIndex`、复用池
- `runtime/src/listUpdateInfo.ts`：`insertAction/removeAction/updateAction` 批量更新
- `components/src/DeferredListItem.tsx`：`defer` 延迟挂载策略

这意味着 Vue 渲染器不能把 `list` 当普通 `view` 处理。

---

## 6. 技术决策（冻结）

## D1：渲染核心采用“Vue createRenderer + Lynx NodeOps”

- **为什么**：与 Vue 官方扩展点一致；社区原型已验证可跑通。
- **与 ReactLynx 差异**：ReactLynx 是编译期 Snapshot 驱动；Vue 侧先走运行时 Renderer，再逐步靠近 Snapshot 化。
- **风险**：运行时 diff 开销更高。
- **缓解**：优先在 `patchProp/style/event` 做最小变更；后续引入编译期优化。

## D2：事件命名以 Lynx 前缀为唯一真相

- **为什么**：与 Lynx 引擎/文档/ReactLynx transform 完全一致。
- **差异**：Vue 原生 `onXxx` 语义需转换。
- **风险**：开发者心智冲突。
- **缓解**：提供映射层与 lint 规则（`onClick` -> `bindtap`）。

## D3：样式通道固定为 `class + inline style + attr`

- **为什么**：官方运行时就是这三路分流。
- **风险**：style 大对象频繁下发。
- **缓解**：列表场景加缓存与浅比较；必要时做增量 patch。

## D4：双线程策略“后台主导，主线程最小化”

- **为什么**：符合 Lynx 设计哲学与 ReactLynx 实践。
- **风险**：线程边界错误导致运行时异常。
- **缓解**：线程标注（`main-thread:` / background-only）与运行时告警。

## D5：`list` 单独建模

- **为什么**：其复用/回收机制与普通容器完全不同。
- **风险**：错误实现导致卡顿与内存飙升。
- **缓解**：第一阶段仅支持官方推荐能力子集（`list-item`、基础回收、defer）。

---

## 7. ReactLynx vs Vue 原型：差异清单

1. **渲染管线**
   - ReactLynx：编译产物驱动（Snapshot + Patch）
   - Vue 原型：运行时 `createRenderer` 直接驱动
2. **事件实现成熟度**
   - ReactLynx：从 transform 到 runtime 完整闭环
   - Vue 原型：`on*` -> `bindEvent` 的基础映射，尚未覆盖捕获/全局监听完整语义
3. **列表能力**
   - ReactLynx：具备复用池、延迟渲染、批量更新
   - Vue 原型：尚未内建 list 专项优化

---

## 8. 后续执行边界（给实现阶段）

1. 先落地 `view/text/image/scroll-view/list` + 基础表单元素。
2. 先实现 `bind/catch`，再补 `capture-* / global-bind`。
3. 线程策略默认后台，主线程仅白名单事件。
4. `list` 作为独立里程碑，不混入普通容器路径。

---

## 9. 主要证据索引

- ReactLynx Patch 操作定义：
  - `lynx-stack/packages/react/runtime/src/lifecycle/patch/snapshotPatch.ts`
- ReactLynx Patch 应用：
  - `lynx-stack/packages/react/runtime/src/lifecycle/patch/snapshotPatchApply.ts`
- ReactLynx 事件解析与样式更新：
  - `lynx-stack/packages/react/runtime/src/snapshot/spread.ts`
  - `lynx-stack/packages/react/runtime/src/snapshot/event.ts`
  - `lynx-stack/packages/react/worklet-runtime/src/eventPropagation.ts`
- ReactLynx 双线程调用：
  - `lynx-stack/packages/react/runtime/src/worklet/call/runOnBackground.ts`
  - `lynx-stack/packages/react/runtime/src/worklet/call/runOnMainThread.ts`
- ReactLynx 事件兼容转换：
  - `lynx-stack/packages/react/transform/crates/swc_plugin_compat/lib.rs`
- ReactLynx 列表机制：
  - `lynx-stack/packages/react/runtime/src/list.ts`
  - `lynx-stack/packages/react/runtime/src/listUpdateInfo.ts`
  - `lynx-stack/packages/react/components/src/DeferredListItem.tsx`
- 社区 Vue 原型：
  - `lynx-stack-vue-prototype/packages/vue/runtime-lynx/src/index.ts`
  - `lynx-stack-vue-prototype/packages/vue/runtime-lynx/src/nodeOps.ts`
  - `lynx-stack-vue-prototype/packages/vue/runtime-lynx/src/patchProp.ts`
  - `lynx-stack-vue-prototype/packages/vue/runtime-lynx/src/lynxApi.ts`
- 官方文档：
  - Vue createRenderer：<https://vuejs.org/api/custom-renderer.html>
  - Lynx 事件传播：<https://lynxjs.org/guide/interaction/event-handling/event-propagation>
  - Lynx 运行时：<https://lynxjs.org/guide/scripting-runtime/>
  - ReactLynx 双线程思维：<https://lynxjs.org/react/thinking-in-reactlynx>
  - Lynx 组件 API：<https://lynxjs.org/api/elements/built-in/list>
