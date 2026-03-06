# Android Host Integration

See `apps/host-android` for the staged host shell.

## Dependency baseline

```kotlin
implementation("org.lynxsdk.lynx:lynx:3.6.0")
implementation("org.lynxsdk.lynx:lynx-devtool:3.6.0")
implementation("org.lynxsdk.lynx:lynx-service-devtool:3.6.0")
```

## Bundle loading

- local bundle: put `main.lynx.bundle` into `app/src/main/assets/`
- remote bundle: set `BuildConfig.PGG_LYNX_BUNDLE_URL`

## Debug switches

- register DevTool service before `LynxEnv` init
- enable Lynx debug
- enable DevTool
- enable LogBox
