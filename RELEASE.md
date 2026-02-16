# 发布流程文档

本文档描述了如何发布 Vue Lynx 项目到 npm。

## 目录

- [准备工作](#准备工作)
- [发布流程](#发布流程)
- [自动化发布](#自动化发布)
- [手动发布](#手动发布)
- [发布检查清单](#发布检查清单)
- [常见问题](#常见问题)
- [快速故障排除](#快速故障排除)

---

## 快速故障排除

如果发布时遇到错误，按以下顺序检查：

1. **404 - Scope not found**：
   - 需要创建 npm 组织 `lynx-vue`
   - 访问 https://www.npmjs.com/org/create

2. **403 - You do not have permission**：
   - 检查包名是否已被占用：`npm view @pgg/vue-lynx`
   - 检查包的所有者：`npm owner ls @pgg/vue-lynx`
   - 如果包已存在，联系所有者添加你为协作者，或使用不同的包名

3. **403 - Two-factor authentication required**：
   - 创建 Granular Access Token 并启用 "Bypass 2FA"
   - 访问 https://www.npmjs.com/settings/[username]/tokens

4. **Access token expired**：
   - 创建新的 token 并重新配置：`npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN`

---

## 准备工作

### 1. 创建 npm 组织（Scoped 包必需）

如果你要发布 scoped 包（如 `@pgg/*`），需要先创建 npm 组织：

1. 访问 https://www.npmjs.com/org/create
2. 输入组织名称：`pgg`（必须与包名中的 scope 一致）
3. 选择组织类型（免费或付费）
4. 完成创建

**注意**：
- 组织名称必须与包名中的 scope 完全匹配（区分大小写）
- 如果组织已存在，你需要加入该组织或使用不同的 scope
- 免费组织可以发布公开的 scoped 包

### 2. 检查包名可用性

在发布前，检查包名是否可用：

```bash
# 检查 scoped 包
npm view @pgg/runtime
npm view @pgg/components

# 检查主包
npm view @pgg/vue-lynx
```

如果返回 404，说明包名可用。如果返回包信息，说明：
- 包已存在，你需要是该包的所有者才能发布
- 或者需要选择不同的包名

**检查包的所有者**：
```bash
npm owner ls @pgg/vue-lynx
npm owner ls @pgg/runtime
```

### 3. 确保已登录 npm

#### 使用 npm login（交互式登录）

```bash
# 登录 npm（如果还没登录）
npm login

# 验证登录状态
npm whoami
```

#### 使用 Granular Access Token（推荐，用于 CI/CD）

npm 现在要求使用具有 bypass 2fa 权限的 granular access token 来发布包。创建步骤：

1. 访问 https://www.npmjs.com/settings/[username]/tokens（将 `[username]` 替换为你的 npm 用户名）
2. 点击 "Generate New Token" → "Granular Access Token"
3. 配置 token：
   - **Token name**: 输入一个有意义的名称（如 "lynx-vue-publish"）
   - **Expiration**: 选择过期时间（建议选择较长时间或 "Never expire"）
   - **Type**: 选择 "Automation"
   - **Packages**: 选择 "All packages" 或指定特定包
   - **Permissions**: 确保启用 "Publish" 权限
   - **Bypass 2FA**: **必须启用**（这是发布包的关键要求）
4. 点击 "Generate Token"
5. **重要**：立即复制生成的 token（只显示一次）

#### 配置 token

**方式一：使用 npm config（推荐）**

```bash
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN_HERE
```

**方式二：使用环境变量**

```bash
export NPM_TOKEN=YOUR_TOKEN_HERE
```

**方式三：使用 .npmrc 文件**

在项目根目录或用户主目录创建/编辑 `.npmrc` 文件：

```
//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

#### 验证 token 是否有效

```bash
# 检查当前登录用户
npm whoami

# 检查 token 权限（应该能看到你的包）
npm access ls-packages
```

### 4. 确保所有包都已构建

```bash
cd /path/to/lynx-vue
pnpm install
pnpm build
```

### 5. 运行所有检查

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
   - `@pgg/runtime`
   - `@pgg/components`
   - `@pgg/vue-lynx`

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

**注意**：Scoped 包（`@pgg/*`）需要使用 `--access public` 参数。

---

## 发布检查清单

在发布前，请确保：

- [ ] **npm 组织已创建**：如果发布 scoped 包（`@pgg/*`），确保 `pgg` 组织已存在
- [ ] **包名可用**：运行 `npm view [package-name]` 检查包名是否可用或你有权限发布
- [ ] **npm 登录状态正常**：运行 `npm whoami` 确认已登录
- [ ] **npm token 有效**：如果使用 token，确保未过期且有发布权限
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
npm view @pgg/vue-lynx
npm view @pgg/runtime
npm view @pgg/components
```

### 2. 测试安装

```bash
mkdir test-install
cd test-install
npm init -y
npm install @pgg/vue-lynx
```

### 3. 验证包内容

```bash
cd node_modules/@pgg/vue-lynx
ls -la
cat package.json
```

---

## 常见问题

### Q: 发布时提示权限错误（403 Forbidden）

**A**: 这通常是因为 npm 访问令牌过期或缺少必要的权限。按以下步骤解决：

1. **检查登录状态**：
   ```bash
   npm whoami
   ```
   如果显示 "Not logged in" 或用户名不正确，需要重新登录。

2. **检查 token 是否过期**：
   如果使用 token 登录，访问 https://www.npmjs.com/settings/[username]/tokens 检查 token 状态。

3. **创建新的 Granular Access Token**：
   - 访问 https://www.npmjs.com/settings/[username]/tokens
   - 创建新的 "Granular Access Token"
   - **必须启用 "Bypass 2FA" 权限**（这是发布包的关键要求）
   - 选择 "Automation" 类型
   - 确保有 "Publish" 权限

4. **重新配置 token**：
   ```bash
   # 方式一：使用 npm config
   npm config set //registry.npmjs.org/:_authToken YOUR_NEW_TOKEN
   
   # 方式二：重新登录
   npm logout
   npm login
   ```

5. **验证权限**：
   ```bash
   npm whoami
   npm access ls-packages
   ```

### Q: 提示 "Two-factor authentication or granular access token with bypass 2fa enabled is required"

**A**: 这是 npm 的安全要求。解决方案：

1. **创建 Granular Access Token**（不是 Classic Token）：
   - 访问 https://www.npmjs.com/settings/[username]/tokens
   - 点击 "Generate New Token" → **选择 "Granular Access Token"**（不是 "Classic Token"）
   - 在权限设置中，**必须启用 "Bypass 2FA"**

2. **使用 token 登录**：
   ```bash
   npm config set //registry.npmjs.org/:_authToken YOUR_GRANULAR_TOKEN
   ```

3. **验证**：
   ```bash
   npm whoami
   ```

### Q: 提示 "Access token expired or revoked"

**A**: Token 已过期或被撤销，需要创建新 token：

```bash
# 1. 创建新的 Granular Access Token（见上面的步骤）
# 2. 更新 token
npm config set //registry.npmjs.org/:_authToken YOUR_NEW_TOKEN

# 3. 或重新登录
npm logout
npm login
```

### Q: Scoped 包发布失败（404 - Scope not found）

**A**: 这个错误表示 `@pgg` 这个 scope（组织）不存在。解决方案：

1. **创建 npm 组织**：
   - 访问 https://www.npmjs.com/org/create
   - 创建名为 `pgg` 的组织（必须与包名中的 scope 完全匹配）
   - 完成创建后，确保你的账号是该组织的成员

2. **验证组织存在**：
   ```bash
   npm org ls pgg
   ```

3. **确保有发布权限**：
   - 确保你的账号是组织的成员
   - 确保你的 token 有发布权限

4. **如果不想创建组织**：
   - 可以使用你自己的用户名作为 scope，例如：`@your-username/runtime`
   - 修改 `package.json` 中的包名
   - 或者使用非 scoped 包名

### Q: 提示 "You do not have permission to publish [package-name]"

**A**: 这表示你没有权限发布该包名。可能的原因和解决方案：

1. **包名已被占用**：
   ```bash
   # 检查包是否存在
   npm view @pgg/vue-lynx
   
   # 检查包的所有者
   npm owner ls @pgg/vue-lynx
   ```
   
   如果包已存在且你不是所有者：
   - 联系当前所有者添加你为协作者：`npm owner add [your-username] @pgg/vue-lynx`
   - 或者选择不同的包名

2. **包名可用但需要先发布**：
   - 对于首次发布的包，确保你已登录且有正确的权限
   - 检查 token 是否有发布权限

3. **使用不同的包名**：
   如果包名冲突，可以：
   - 添加后缀：`@pgg/vue-lynx-core`、`@pgg/vue-lynx-lib` 等
   - 使用不同的 scope：`@your-username/vue-lynx`
   - 检查 npm 上是否有类似的包名可用

### Q: Scoped 包发布失败（其他原因）

**A**: Scoped 包（`@pgg/*`）默认是私有的，需要添加 `--access public`：

```bash
npm publish --access public
```

**注意**：本项目已经在各个包的 `package.json` 中添加了 `publishConfig` 配置，所以使用 `pnpm release` 时不需要手动添加 `--access public` 参数：

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

如果仍然失败，检查：
1. `package.json` 中是否包含 `publishConfig`
2. npm 登录状态和 token 权限
3. **npm 组织是否存在**（见上面的 "Scope not found" 问题）
4. 包名是否正确（确保有发布权限）

### Q: 如何撤销已发布的版本

**A**: 使用 npm unpublish（仅限发布后 72 小时内）：

```bash
npm unpublish @pgg/vue-lynx@0.0.1
```

或使用 deprecate 标记为废弃：

```bash
npm deprecate @pgg/vue-lynx@0.0.1 "This version has critical bugs, please upgrade"
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
npm view @pgg/vue-lynx versions
npm view @pgg/vue-lynx time
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
