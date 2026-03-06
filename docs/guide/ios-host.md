# iOS Host Integration

See `apps/host-ios` for the staged host shell.

## Dependency baseline

```ruby
pod 'Lynx', '3.6.0'
pod 'LynxService', '3.6.0', :subspecs => ['Devtool']
pod 'LynxDevtool', '3.6.0'
```

## Bundle loading

- local bundle: embed `main.lynx.bundle` in the app target resources
- remote bundle: set `PGG_LYNX_BUNDLE_URL` in the run scheme environment

## Debug switches

- `lynxDebugEnabled = YES`
- `devtoolEnabled = YES`
- `logBoxEnabled = YES`
