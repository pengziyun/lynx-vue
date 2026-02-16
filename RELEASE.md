# 发布流程文档

本文档描述了如何发布 Vue Lynx 项目到 npm。

## 目录

- [准备工作](#准备工作)
- [发布流程](#发布流程)
- [自动化发布](#自动化发布)
- [手动发布](#手动发布)
- [发布检查清单](#发布检查清单)
- [常见问题](#常见问题)

---

## 准备工作

### 1. 确保已登录 npm

```bash
# 登录 npm（如果还没登录）
npm login

# 验证登录状态
npm whoami
```

### 2. 确保所有包都已构建

```bash
cd /path/to/lynx-vue
pnpm install
pnpm build
```

### 3. 运行所有检查

```bash
# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 运行测试
pnpm test
```

---

## 发布流程

### 方式一：使用 Changeset（推荐）

#### 步骤 1：添加变更记录

```bash
pnpm changeset
```

这会启动交互式命令行，引导你：

1. **选择要发布的包**（使用空格选择，回车确认）：
   - `@lynx-vue/runtime`
   - `@lynx-vue/components`
   - `vue-lynx`

2. **选择版本类型**：
   - `major` (1.0.0) - 重大更新，不兼容的 API 变更
   - `minor` (0.1.0) - 新功能，向后兼容
   - `patch` (0.0.1) - Bug 修复

3. **输入变更说明**（支持中文）：
   ```
   初始版本发布，包含 Vue 3 Lynx 集成的核心功能
   ```

这会在 `.changeset` 目录下创建一个变更文件。

#### 步骤 2：更新版本号

```bash
pnpm changeset version
```

这个命令会：
- 更新所有相关包的版本号
- 生成或更新 CHANGELOG.md
- 删除已处理的 changeset 文件

#### 步骤 3：提交变更

```bash
git add .
git commit -m "chore: release packages"
```

#### 步骤 4：发布到 npm

```bash
pnpm release
```

这个命令会：
1. 重新构建所有包
2. 发布到 npm
3. 自动创建 git tag

#### 步骤 5：推送到 GitHub

```bash
git push
git push --tags
```

---

## 自动化发布

如果你的代码托管在 GitHub 上，可以使用 GitHub Actions 自动化发布流程。

### 1. 设置 npm token

1. 访问 https://www.npmjs.com/settings/tokens
2. 创建一个新的 Access Token（选择 "Automation" 类型）
3. 复制生成的 token

在 GitHub 仓库中添加 Secret：
1. 进入仓库的 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 名称：`NPM_TOKEN`
4. 值：粘贴你的 npm token

### 2. 推送代码触发自动发布

```bash
# 添加 changeset
pnpm changeset

# 提交并推送
git add .
git commit -m "feat: add new feature"
git push origin main
```

### 3. GitHub Actions 自动处理

GitHub Actions 会自动：
1. 运行 CI 检查（lint、typecheck、test、build）
2. 创建一个 Release PR
3. 当你合并 Release PR 后，自动发布到 npm

---

## 手动发布

如果需要手动发布单个包：

### 发布 runtime 包

```bash
cd packages/runtime
pnpm build
npm publish --access public
```

### 发布 components 包

```bash
cd packages/components
pnpm build
npm publish --access public
```

### 发布 vue-lynx 主包

```bash
cd packages/vue-lynx
pnpm build
npm publish --access public
```

**注意**：Scoped 包（`@lynx-vue/*`）需要使用 `--access public` 参数。

---

## 发布检查清单

在发布前，请确保：

- [ ] 所有测试通过：`pnpm test`
- [ ] 类型检查通过：`pnpm typecheck`
- [ ] 代码检查通过：`pnpm lint`
- [ ] 构建成功：`pnpm build`
- [ ] 版本号正确且符合语义化版本规范
- [ ] CHANGELOG.md 已更新
- [ ] README.md 内容完整准确
- [ ] LICENSE 文件存在
- [ ] package.json 中的 repository、homepage 等信息正确
- [ ] 所有示例应用可以正常运行
- [ ] 文档站可以正常访问

---

## 发布后验证

### 1. 检查包是否发布成功

```bash
npm view vue-lynx
npm view @lynx-vue/runtime
npm view @lynx-vue/components
```

### 2. 测试安装

```bash
mkdir test-install
cd test-install
npm init -y
npm install vue-lynx
```

### 3. 验证包内容

```bash
cd node_modules/vue-lynx
ls -la
cat package.json
```

---

## 常见问题

### Q: 发布时提示权限错误

**A**: 确保你已登录 npm 并且有权限发布这些包：

```bash
npm whoami
npm owner ls vue-lynx
```

### Q: Scoped 包发布失败

**A**: Scoped 包（`@lynx-vue/*`）默认是私有的，需要添加 `--access public`：

```bash
npm publish --access public
```

或在 package.json 中添加：

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### Q: 如何撤销已发布的版本

**A**: 使用 npm unpublish（仅限发布后 72 小时内）：

```bash
npm unpublish vue-lynx@0.0.1
```

或使用 deprecate 标记为废弃：

```bash
npm deprecate vue-lynx@0.0.1 "This version has critical bugs, please upgrade"
```

### Q: 如何发布 beta 版本

**A**: 使用 prerelease 版本号：

```bash
# 添加 changeset 时选择 prerelease
pnpm changeset --snapshot beta

# 或手动修改版本号为 0.1.0-beta.0
# 然后发布时指定 tag
npm publish --tag beta
```

### Q: 如何查看发布历史

**A**: 使用 npm view：

```bash
npm view vue-lynx versions
npm view vue-lynx time
```

### Q: 发布失败如何回滚

**A**: 
1. 如果还没推送到 GitHub，使用 `git reset`
2. 如果已推送，创建新版本修复问题
3. 不要删除已发布的版本（会影响依赖它的用户）

---

## 版本号规范

遵循语义化版本规范（Semver）：

- **Major (X.0.0)**: 不兼容的 API 变更
- **Minor (0.X.0)**: 向后兼容的新功能
- **Patch (0.0.X)**: 向后兼容的 Bug 修复

### 示例

- `0.1.0` → `0.1.1`: 修复 Bug
- `0.1.0` → `0.2.0`: 添加新功能
- `0.9.0` → `1.0.0`: 首个稳定版本
- `1.0.0` → `2.0.0`: 重大 API 变更

---

## 发布时间建议

- **工作日发布**：避免周末发布，以便及时处理问题
- **避开节假日**：确保团队成员可以快速响应
- **预留时间**：发布后预留时间监控和处理反馈
- **提前通知**：重大版本发布前提前通知用户

---

## 相关链接

- [npm 文档](https://docs.npmjs.com/)
- [Changesets 文档](https://github.com/changesets/changesets)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 联系方式

如有问题，请：
- 提交 Issue：https://github.com/your-org/lynx-vue/issues
- 发送邮件：your-email@example.com
- 加入讨论：https://discord.gg/your-discord
