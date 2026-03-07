# 测试与 CI

## 本地验证命令

```bash
pnpm typecheck
pnpm test
pnpm build
```

## 当前自动化覆盖范围

- `@pgg/vue-lynx` 的 renderer、patching 和回归行为
- `@pgg/create-vue-lynx` 的脚手架创建流程
- `apps/demo-showcase` 的组合式状态逻辑与 SSR 渲染
- Turborepo 驱动的整仓 build / typecheck

## 当前已确认的人工验收

- 2026-03-07：`pnpm --filter @pgg/demo-showcase dev` 已可在 iOS 真机上通过 Lynx Explorer 打开并进行开发调试。

## 当前仍未在本环境中执行或未完成闭环的项目

- Android 宿主编译
- iOS / Android 宿主的完整编译验收
- Lynx DevTool 的完整真机联调
- Android 真机上的 Lynx Explorer 开发调试链路

这些部分目前已经提供了源码骨架、构建链和文档，但还没有全部纳入当前仓库的稳定验收基线。
