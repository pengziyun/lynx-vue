# iOS Host

This directory stages an iOS host shell for loading `apps/demo-showcase/dist/main.lynx.bundle`.

## Files

- `Podfile`: Lynx SDK + DevTool dependencies
- `project.yml`: XcodeGen project definition
- `VueLynxHost/*`: Objective-C sample host sources

## Usage

1. Install Ruby dependencies and CocoaPods.
2. Run `xcodegen generate` in this directory if you use XcodeGen.
3. Run `pod install`.
4. Open the generated workspace.
5. Copy `apps/demo-showcase/dist/main.lynx.bundle` into the app target resources.
6. Launch the app and attach Lynx DevTool over USB.

The source files are intentionally small and focus on bundle loading and DevTool enablement.
