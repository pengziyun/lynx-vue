# Android Host

This directory stages an Android host shell for loading `apps/demo-showcase/dist/main.lynx.bundle`.

## Files

- `settings.gradle.kts`, `build.gradle.kts`, `app/build.gradle.kts`
- `app/src/main/*`: application, activity, and bundle loader samples

## Usage

1. Open the directory in Android Studio.
2. Sync Gradle and align the Lynx SDK coordinates with your internal repository if needed.
3. Put `main.lynx.bundle` under `app/src/main/assets/` or set `BuildConfig.PGG_LYNX_BUNDLE_URL`.
4. Run the debug build, then attach Lynx DevTool.

The sample code is focused on DevTool initialization and bundle loading, not on app architecture.
