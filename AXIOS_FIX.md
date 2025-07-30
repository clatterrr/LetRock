# Vercel 部署问题修复指南

## 问题描述

### 问题 1: axios 模块找不到
```
Cannot find module '/var/task/node_modules/axios/dist/node/axios.cjs'
Did you forget to add it to "dependencies" in `package.json`?
Node.js process exited with exit status: 1
```

### 问题 2: 运行时版本错误
```
Function Runtimes must have a valid version, for example `now-php@1.0.0`
```

## 解决方案

### ✅ 已完成的修复

1. **清理了依赖缓存**
   - 删除了 `package-lock.json`
   - 删除了 `node_modules` 目录
   - 重新安装了依赖

2. **统一了模块语法**
   - 所有 API 文件使用 CommonJS 语法
   - 确保 `require()` 语句正确

3. **简化了 Vercel 配置**
   - 移除了有问题的运行时配置
   - 使用默认的自动检测

4. **创建了测试 API**
   - `api/test-simple.js` - 简单测试，无外部依赖

## 部署步骤

### 1. 运行修复脚本

```powershell
.\deploy-fix.ps1
```

### 2. 手动部署（如果脚本失败）

```powershell
vercel --clear-cache
vercel --prod --force
```

### 3. 测试部署

访问以下链接测试：

- `https://theme7-beta.vercel.app/api/test-simple`
- `https://theme7-beta.vercel.app/api/cos?action=test-connection`

## 故障排除

### 如果问题仍然存在

1. **检查 Vercel 控制台**
   - 进入项目 → Functions 标签
   - 查看函数状态和错误日志

2. **检查环境变量**
   - 确保所有必需的环境变量都已设置
   - 重新部署后生效

3. **查看详细日志**
   ```bash
   vercel logs
   ```

4. **重新创建项目**
   ```bash
   vercel --force
   ```

## 常见原因

### 1. 依赖安装问题
- Vercel 构建时没有正确安装依赖
- 模块路径不匹配

### 2. 模块语法问题
- ES6 模块和 CommonJS 混用
- 导入路径错误

### 3. 缓存问题
- Vercel 缓存了错误的依赖版本
- 需要清理缓存重新部署

### 4. 运行时配置问题
- `vercel.json` 中的运行时版本格式不正确
- 应该使用默认的自动检测

## 预防措施

### 1. 使用一致的模块语法
- 所有文件使用 CommonJS (`require`)
- 避免混用 ES6 和 CommonJS

### 2. 定期清理缓存
- 删除 `package-lock.json`
- 重新安装依赖

### 3. 测试简单 API
- 先部署简单的测试 API
- 确认基本功能正常后再部署复杂功能

### 4. 简化 Vercel 配置
- 使用 `{"version": 2}` 让 Vercel 自动检测
- 避免手动指定运行时版本

## 下一步

1. 运行 `.\deploy-fix.ps1`
2. 测试简单 API
3. 如果成功，测试完整功能
4. 如果失败，检查 Vercel 控制台日志

---

**修复时间**: 2024年7月30日  
**问题**: axios 模块找不到 + 运行时版本错误  
**状态**: 🔧 已修复 