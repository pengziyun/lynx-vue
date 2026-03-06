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

## 当前未在本环境中执行的项目

- iOS 宿主编译
- Android 宿主编译
- 真机 Lynx Explorer / Lynx DevTool 联调

这些部分目前已经提供源码骨架和文档，但没有在当前环境里跑完整原生工具链。
