# 原生调试

当前原生调试链路建立在双线程 bundle 之上：

- 一份 background JavaScript entry
- 一份 main-thread JavaScript entry
- 一份编码后的 `.lynx.bundle`

## Lynx Explorer

```bash
pnpm --filter @pgg/demo-showcase dev
```

使用 Lynx Explorer 扫描终端二维码。如果手机无法访问二维码里的地址，先设置 `LYNX_DEV_HOST`，再重启开发服务。

双线程开发服务会同时打印 `main` 和 `main__main-thread` 两个 entry。给 Lynx Explorer 使用时，始终只用基础 entry 的 bundle，比如 `main.lynx.bundle`；不要直接打开 `main__main-thread.lynx.bundle`。

如果 `3000` 端口被占用，Rspeedy 会自动切到下一个可用端口。一定要扫描终端里最新的二维码，或者手动粘贴最新的 `main.lynx.bundle` 地址。原生构建配置改动后，先删除 Lynx Explorer 里的旧卡片，再重新扫码。

可以先在本机校验开发 bundle：

```bash
curl -I http://127.0.0.1:<port>/main.lynx.bundle
curl -s http://127.0.0.1:<port>/main.lynx.bundle | strings | rg 'document\\.|module\\.hot|runtime-dom|querySelectorAll'
```

第一条命令应该返回 `200 OK`，第二条命令应该没有任何匹配。

## 原生 bundle 必须满足的约束

- 原生构建会把 `vue` 强制别名到 `@pgg/vue-lynx/native-vue`，native bundle 里不能再混入 `@vue/runtime-dom`。
- 原生 JS 产物里不能包含浏览器侧 CSS 或 HMR runtime，例如 `document`、`module.hot`、`querySelectorAll`。
- Lynx `input` 上的 `v-model` 走原生 `onUpdate:modelValue` 桥接，不走通用事件桥。
- main-thread 入口必须先完成官方风格 bootstrap：
  - 先安装 `renderPage/updatePage/getPageData/removeComponents` wrapper
  - 再通过 `lynx.registerDataProcessors()` 装配 `processData`
- background 入口不得清理这些全局钩子；如果在产物里看到 `delete processData`、`delete renderPage`、`delete updatePage`，说明实现已经偏离官方双线程模型。

## Lynx DevTool

1. 构建或启动一个能加载 `main.lynx.bundle` 的宿主应用。
2. 打开 `Lynx Debug`、`DevTool` 和 `LogBox`。
3. 保证目标页面在前台。
4. 用 USB 连接设备，再打开桌面版 Lynx DevTool。

宿主参考骨架：

- `apps/host-ios`
- `apps/host-android`

## 故障排查

- `10203`：Lynx Explorer 拉不到 bundle。优先检查手机和开发机是否在同一局域网、`LYNX_DEV_HOST` 是否指向可访问 IP、以及扫码的是否是最新二维码。
- `10204`：Lynx Explorer 解码到的不是合法 Lynx bundle。常见原因是扫了旧二维码、服务返回了旧内容，或者 bundle 里仍然混入了浏览器 runtime。
- `processData is not a function` / `renderPage is not a function`：主线程脚本没有正确完成 bootstrap。优先检查：
  - `main__main-thread.js` 里是否先执行了 main-thread bootstrap
  - `lynx.registerDataProcessors` 是否存在并已至少被调用一次
  - background 产物里是否错误地清理了主线程全局钩子
  - 删除 Lynx Explorer 里的旧卡片后再重新扫码最新 bundle
