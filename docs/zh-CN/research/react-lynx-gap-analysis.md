# ReactLynx 差距分析

日期基线：`2026-03-07`

已调研的官方包版本：

- `@lynx-js/react@0.116.4`
- `@lynx-js/react-rsbuild-plugin@0.12.9`
- `@lynx-js/react-webpack-plugin@0.7.4`
- `@lynx-js/template-webpack-plugin@0.10.4`

## ReactLynx 已经完成的能力

1. 每个入口会拆成 `main-thread` 和 `background` 两条执行链。
2. 在 transform 阶段注入线程相关常量：
   - `__MAIN_THREAD__`
   - `__BACKGROUND__`
   - `__LEPUS__`
3. 运行时采用两段式启动：
   - `setupLynxEnv()`
   - `injectCalledByNative()`
4. `main-thread.js` 会被明确标记并参与模板编码，最终生成 `.lynx.bundle`。
5. 官方测试环境会分别注入 main-thread 与 background 所需的全局对象。

## 旧实验仓库的不足

1. 旧运行时基本还是单渲染器路径，只做了有限的主线程桥接。
2. 旧 Rspeedy 集成虽然能编码 bundle，但没有完整对齐 ReactLynx 的双入口编译模型。
3. Web Preview 只是开发期适配层，没有形成完整的 SSR / hydration 路径。
4. 仓库治理不足，研究、方案、实现和发布规则没有被结构化约束。

## `new-vue-lynx` 的落地决策

1. 原生构建继续严格依赖官方 Lynx bundle 协议和 Rspeedy 工具链。
2. Web Preview 和 Web SSR 是一等能力，但运行时表面与原生链路分开实现。
3. 文档是权威来源，任何不兼容实现变更都必须先更新研究与方案文档。
4. 可发布包统一使用 `@pgg/*` 命名空间。
