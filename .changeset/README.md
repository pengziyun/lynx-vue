# Changesets

本项目使用[changesets](https://github.com/changesets/changesets)管理版本和变更日志。

## 添加changeset

当你完成一个功能或修复后,运行:

```bash
pnpm changeset
```

按照提示选择:
1. 哪些包需要发布
2. 版本类型(major/minor/patch)
3. 变更说明

## 发布流程

1. 合并PR到main分支
2. GitHub Actions自动创建Release PR
3. Review并合并Release PR
4. 自动发布到npm
