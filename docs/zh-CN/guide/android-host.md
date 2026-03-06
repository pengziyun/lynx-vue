# Android 宿主接入

参考目录：`apps/host-android`

## 依赖基线

```kotlin
implementation("org.lynxsdk.lynx:lynx:3.6.0")
implementation("org.lynxsdk.lynx:lynx-devtool:3.6.0")
implementation("org.lynxsdk.lynx:lynx-service-devtool:3.6.0")
```

## Bundle 加载方式

- 本地 bundle：将 `main.lynx.bundle` 放到 `app/src/main/assets/`
- 远端 bundle：设置 `BuildConfig.PGG_LYNX_BUNDLE_URL`

## 调试开关

- 在 `LynxEnv` 初始化前先注册 DevTool service
- 打开 Lynx Debug
- 打开 DevTool
- 打开 LogBox

当前仓库提供的是宿主骨架和接线代码，没有在当前环境里实际运行 Android Studio / Gradle 构建。
