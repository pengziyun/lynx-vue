# Web Preview

`@pgg/vue-lynx/web` 提供同一套组件树的浏览器预览层。

## 启动方式

```bash
pnpm --filter @pgg/demo-showcase dev:web
```

## 当前 demo 已覆盖的能力

- 模板语法
- Options API 组件
- JSX 组件
- 自定义指令
- Suspense
- Teleport
- Transition 样式过渡

预览层会注入 Lynx 风格元素默认样式，并在浏览器里补 `tap`、`confirm` 等事件桥接。
