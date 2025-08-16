# 版本管理系统

本项目使用 Husky + 自定义脚本实现自动版本管理。

## 🚀 自动版本递增

每次执行 `git commit` 时，版本号会自动递增补丁版本：

```bash
# 提交前: v0.1.3
git add .
git commit -m "修复按小时统计页面的零值显示问题"
# 提交后: v0.1.4
```

### 工作原理

1. **pre-commit hook** 在提交前自动执行
2. **bump-version.js** 脚本递增补丁版本号
3. 更新后的 `src/config/version.js` 自动添加到当前提交

## 🛠️ 手动版本管理

如果需要手动控制版本递增类型，可以使用以下命令：

### 查看当前版本
```bash
pnpm run version:current
# 或
node scripts/version.js current
```

### 递增补丁版本 (x.x.X)
```bash
pnpm run version:patch
# v0.1.3 → v0.1.4
```

### 递增次版本 (x.X.0)
```bash
pnpm run version:minor
# v0.1.3 → v0.2.0
```

### 递增主版本 (X.0.0)
```bash
pnpm run version:major
# v0.1.3 → v1.0.0
```

## 📁 相关文件

- `src/config/version.js` - 版本配置文件
- `scripts/bump-version.js` - 自动递增脚本
- `scripts/version.js` - 手动版本管理脚本
- `.husky/pre-commit` - Git pre-commit hook

## ⚙️ 配置说明

### 禁用自动递增

如果某次提交不想自动递增版本，可以使用：

```bash
git commit --no-verify -m "文档更新"
```

### 修改递增策略

编辑 `scripts/bump-version.js` 可以修改自动递增的策略：

- 当前：每次提交递增补丁版本
- 可选：根据 commit message 智能递增
- 可选：添加构建号递增

## 🔍 版本显示

版本号会显示在页面头部，格式为 `v0.1.3`，点击可查看详细信息。
