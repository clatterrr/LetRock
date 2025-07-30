# Vercel 部署故障排除指南

## 当前问题：Function Runtimes 错误

### 错误信息
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

### 解决方案

#### 1. 简化 vercel.json 配置 ✅

已修复：使用最简单的配置
```json
{
  "version": 2
}
```

#### 2. 使用正确的 ES6 模块语法 ✅

所有 API 文件现在使用：
```javascript
export default function handler(req, res) {
    // 函数内容
}
```

#### 3. 创建测试 API ✅

- `api/ping.js` - 最简单的测试
- `api/hello.js` - 带 CORS 的测试
- `api/test.js` - 基本功能测试

## 部署步骤

### 1. 运行部署脚本
```powershell
.\deploy.ps1
```

### 2. 手动部署（如果脚本失败）
```powershell
vercel --clear-cache
vercel --prod --force
```

### 3. 检查部署状态
```powershell
vercel ls
vercel logs
```

## 测试步骤

### 1. 基本功能测试
访问以下链接测试 API 是否工作：

- `https://theme7-beta.vercel.app/api/ping`
- `https://theme7-beta.vercel.app/api/hello`
- `https://theme7-beta.vercel.app/api/test`

### 2. 功能 API 测试
- `https://theme7-beta.vercel.app/api/test-connection`

## 常见问题

### 问题 1: 404 Not Found
**原因**：API 文件没有被正确识别
**解决**：
1. 检查文件语法是否正确
2. 确保使用 ES6 模块语法
3. 重新部署

### 问题 2: 环境变量错误
**原因**：Vercel 中没有设置环境变量
**解决**：
1. 在 Vercel 控制台设置环境变量
2. 重新部署

### 问题 3: 运行时错误
**原因**：Node.js 版本或依赖问题
**解决**：
1. 检查 package.json 中的依赖
2. 确保使用正确的 Node.js 版本

## 调试命令

### 查看项目列表
```powershell
vercel ls
```

### 查看部署日志
```powershell
vercel logs
```

### 查看函数列表
```powershell
vercel functions ls
```

### 重新创建项目
```powershell
vercel --force
```

## 项目结构检查

确保项目结构如下：
```
theme7/
├── api/
│   ├── ping.js          # 简单测试
│   ├── hello.js         # CORS 测试
│   ├── test.js          # 功能测试
│   ├── test-connection.js
│   └── ...
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── vercel.json          # 简化配置
└── package.json
```

## 下一步

1. 运行 `.\deploy.ps1`
2. 测试 `https://theme7-beta.vercel.app/api/ping`
3. 如果成功，测试其他 API
4. 如果失败，检查 Vercel 控制台日志

## 联系支持

如果问题仍然存在，请提供：
1. `vercel logs` 的输出
2. Vercel 控制台截图
3. 项目结构截图 