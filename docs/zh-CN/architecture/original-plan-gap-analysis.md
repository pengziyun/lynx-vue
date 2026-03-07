# 原计划差距清单

> 更新时间：2026-03-07
>
> 本文档用于对照 [original-master-plan.md](./original-master-plan.md) 审查当前仓库状态。
> 本轮审查额外纳入一条人工验收事实：
> - `pnpm --filter @pgg/demo-showcase dev` 已经可以在 iOS 真机上通过 Lynx Explorer 打开并进行开发调试。
>
> 审查口径：
> - `已完成`：已经落地，且与原计划要求基本一致。
> - `部分完成`：已有实现，但范围、深度或验收还不足。
> - `未完成`：原计划明确要求存在，但当前仓库尚未交付。

## 总结结论

- 当前项目已经不再属于“路线明显偏离原计划”的状态。
- 截至 2026-03-07，原生双线程 bundle、iOS 真机 Lynx Explorer 开发调试、中文文档体系、复杂 demo 基础、Web Preview / SSR 和一批自动化测试都已经建立起来。
- 但如果严格对照原计划，项目整体仍然是 `部分完成`，还不能判定为“完全符合原计划”。
- 当前剩余差距主要集中在三类：
  - compiler 还没有成长为原计划里的完整编译层
  - Native 能力覆盖和宿主交付还没有达到原计划的完整深度
  - 测试矩阵与最终验收还没有闭环到“达到完美状态”

## 已对齐或不再构成主要差距的项

### 1. 仓库与包结构

- 状态：`已完成`
- 现状：
  - `pnpm + turbo + changesets` monorepo 已建立。
  - 原计划中的核心包和应用都已具备：
    - `packages/vue-lynx`
    - `packages/vue-lynx-compiler`
    - `packages/vue-lynx-rsbuild-plugin`
    - `packages/vue-lynx-vite-plugin`
    - `packages/vue-lynx-testing`
    - `packages/create-vue-lynx`
    - `apps/demo-showcase`
    - `apps/host-ios`
    - `apps/host-android`

### 2. 官方双线程模型方向

- 状态：`部分完成`
- 现状：
  - 当前权威方案已经明确把“官方双线程模型”设为不可妥协约束。
  - 原生构建链已经收敛到 `background + main-thread + .lynx.bundle` 这一目标形态。
  - iOS 真机上的 Lynx Explorer 开发调试已经验证通过，说明这条链路至少在一个真实设备环境中可用。
- 结论：
  - 这项已经不应再写成“偏离计划”。
  - 但距离“完整等价于官方 ReactLynx pipeline”仍有差距，因此还不能标记为 `已完成`。

## 当前剩余差距

### 3. 文档先行与治理规则

- 状态：`部分完成`
- 已完成：
  - 研究文档、官方双线程方案文档、实施治理规则都已存在。
  - 中英文文档和中文索引已建立。
- 差距：
  - 当前权威方案文档是围绕“官方双线程原生链路”收紧后的可执行方案，不再完全等价于原计划里那个“大一统首版”的完整交付边界。
  - 因此，当前文档治理体系是存在的，但仍需要依靠这份“差距清单”来显式记录与原计划之间的剩余落差。

### 4. `@pgg/vue-lynx-compiler`

- 状态：`未完成`
- 当前现状：
  - compiler 目前仍主要是转换工具和线程模型辅助层。
  - 当前导出仍集中在 `transformCSS`、`transformTemplate`、`splitThreadCode` 和线程 entry 拓扑能力。
- 与原计划的差距：
  - 原计划要求 compiler 成为核心编译层，承担：
    - `.vue` / JSX / render function 统一编译
    - Options API / Composition API 统一归一
    - 共享 IR
    - 线程敏感转换
    - Web / Native 的统一编译抽象
  - 当前实现还达不到这个深度。

### 5. Vue 能力范围

- 状态：`部分完成`
- 已具备或基本具备：
  - Composition API
  - Options API
  - SFC 模板
  - JSX / render function
  - 自定义指令基础能力
  - Web Preview
  - Web SSR / hydration
- 剩余差距：
  - 原计划要求本期把 `Teleport / Transition / Suspense / 自定义指令生态兼容` 一起做完整。
  - 当前这些能力在 Web 路径上更完整，在 Native 路径上还没有达到“完整闭环 + 真机覆盖”的程度。
  - Native demo 当前覆盖的是基础业务能力，不是原计划中那种“复杂能力在 Native 侧也全部落地”的状态。

### 6. 复杂 demo 的 Native 覆盖深度

- 状态：`部分完成`
- 已完成：
  - `apps/demo-showcase` 已经存在，并覆盖了 Web Preview、SSR、Options API、模板、JSX、自定义指令等多种能力。
  - iOS 真机上已经验证了 `pnpm --filter @pgg/demo-showcase dev` 的 Explorer 开发调试链路。
- 剩余差距：
  - 原计划要求复杂 demo 同时成为 Native、Web Preview、Web SSR 三条链路的综合验证样板。
  - 当前复杂能力仍然主要集中在 Web demo，Native demo 的能力面更窄，尚未成为“原计划要求的复杂 Native 样板”。

### 7. 宿主工程交付

- 状态：`部分完成`
- 当前现状：
  - iOS 宿主已有基础 bundle 加载路径。
  - Android 宿主仍然是骨架状态，核心 LynxView 接线还没有形成完整交付。
- 与原计划的差距：
  - 原计划要求 iOS / Android 宿主都能承接：
    - 本地 bundle 加载
    - 开发态 URL 加载
    - DevTool 接线
    - demo 实际加载
  - 当前这条线只能说“iOS 有基础，Android 仍未完成”。

### 8. 原生调试与部署闭环

- 状态：`部分完成`
- 已完成：
  - 真实 `.lynx.bundle` 已能生成。
  - iOS 真机上的 Lynx Explorer 开发调试已验证通过。
  - 原生双线程方案和调试排障文档已存在。
- 剩余差距：
  - 原计划要求的不只是 Explorer，还包括：
    - Lynx DevTool 附着
    - source map 调试
    - 宿主集成加载
    - Android 真机链路
    - 构建部署链路的稳定验收
  - 这些项目前还没有全部收口。

### 9. 测试矩阵与“达到完美状态”

- 状态：`部分完成`
- 已完成：
  - `@pgg/vue-lynx` 已具备较完整的 renderer / patching / entry / 回归测试。
  - `create-vue-lynx` 和 `rsbuild-plugin` 也有基础测试。
  - demo 已有一部分 smoke / SSR 覆盖。
- 剩余差距：
  - 原计划要求的完整测试矩阵包括：
    - 编译测试
    - 原生 main/background 双线程测试
    - Web Preview 测试
    - SSR 测试
    - bundle 测试
    - demo E2E
    - iOS/Android 宿主编译
    - 真机 Explorer / DevTool 联调
  - 当前自动化覆盖虽然已明显增强，但距离“完整测试并达到完美状态”仍有差距。
  - 尤其是 Android 宿主、DevTool、跨端真机验收和 CI 门禁，仍未达到原计划标准。

## 结论更新

- 与旧版差距清单相比，需要明确撤销两条过时结论：
  - 不应再写“原生路线明显偏离官方双线程模型”
  - 不应再写“Explorer 真机开发链路尚未验证”
- 截至 2026-03-07，更准确的结论是：
  - `new-vue-lynx` 已经形成了一个可以继续推进的可用基础
  - 但还没有完成原计划中的“大一统首版”全部交付物

## 当前建议的收口顺序

1. 先把 compiler 从“工具集”升级到“原计划定义的核心编译层”。
2. 再把 Native 侧的复杂能力覆盖补齐到 demo 和真机验证层。
3. 补完 Android 宿主与 Android 真机链路。
4. 最后收口 DevTool、宿主编译、E2E 与 CI 门禁，接近原计划中的“完整测试”标准。
