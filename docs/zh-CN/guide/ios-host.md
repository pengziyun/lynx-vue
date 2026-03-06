# iOS 宿主接入

参考目录：`apps/host-ios`

## 依赖基线

```ruby
pod 'Lynx', '3.6.0'
pod 'LynxService', '3.6.0', :subspecs => ['Devtool']
pod 'LynxDevtool', '3.6.0'
```

## Bundle 加载方式

- 本地 bundle：把 `main.lynx.bundle` 加到 app target 资源中
- 远端 bundle：在 Run Scheme 里设置 `PGG_LYNX_BUNDLE_URL`

## 调试开关

- `lynxDebugEnabled = YES`
- `devtoolEnabled = YES`
- `logBoxEnabled = YES`

当前仓库提供的是宿主骨架和加载示例，没有在当前环境里实际运行 Xcode 编译。
