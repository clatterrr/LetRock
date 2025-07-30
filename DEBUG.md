# 调试指南

## 当前问题

1. **JavaScript 错误**: `Cannot set properties of null (setting 'innerHTML')`
2. **API 404 错误**: `/api/test-connection` 返回 404

## 调试步骤

### 1. 测试简单 API

首先测试简单的 API 是否工作：

```bash
curl https://your-project.vercel.app/api/hello
```

或者直接在浏览器中访问：
`https://your-project.vercel.app/api/hello`

### 2. 检查 Vercel 函数日志

在 Vercel 控制台中：
1. 进入项目
2. 点击 "Functions" 标签
3. 查看 API 函数的日志

### 3. 检查环境变量

确保在 Vercel 控制台中设置了所有必需的环境变量：

- `COS_SECRET_ID`
- `COS_SECRET_KEY`
- `COS_BUCKET`
- `COS_REGION`
- `ZHAOLI_API_KEY`
- `ZHAOLI_API_SECRET`

### 4. 重新部署

```bash
vercel --prod
```

### 5. 检查文件结构

确保项目结构正确：

```
theme7/
├── api/
│   ├── hello.js          # 测试 API
│   ├── test-connection.js
│   ├── files.js
│   └── ...
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── vercel.json
```

## 常见解决方案

### 方案 1: 简化 vercel.json

如果 API 仍然不工作，尝试使用更简单的配置：

```json
{
  "version": 2
}
```

### 方案 2: 检查 Node.js 版本

确保 `package.json` 中有正确的 Node.js 版本：

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

### 方案 3: 添加构建脚本

在 `package.json` 中添加：

```json
{
  "scripts": {
    "vercel-build": "echo 'Build completed'"
  }
}
```

## 测试步骤

1. **部署简单 API**：
   ```bash
   vercel --prod
   ```

2. **测试 API 端点**：
   - `https://your-project.vercel.app/api/hello`
   - `https://your-project.vercel.app/api/test-connection`

3. **检查浏览器控制台**：
   - 打开开发者工具
   - 查看网络请求
   - 查看控制台错误

4. **检查 Vercel 日志**：
   - 在 Vercel 控制台查看函数日志
   - 检查是否有错误信息

## 如果问题仍然存在

1. **重新创建项目**：
   ```bash
   vercel --force
   ```

2. **检查依赖**：
   ```bash
   npm install
   ```

3. **清除缓存**：
   ```bash
   vercel --clear-cache
   ```

## 联系支持

如果问题仍然存在，请提供：
1. Vercel 项目 URL
2. 错误日志
3. 环境变量配置截图
4. 项目结构截图 