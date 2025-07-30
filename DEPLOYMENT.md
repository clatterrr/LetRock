# Vercel 部署指南

## 项目结构说明

本项目已重构为 Vercel Serverless Functions 架构：

```
theme7/
├── api/               # Vercel API 路由（Serverless Functions）
│   ├── test-connection.js    # 测试腾讯云连接
│   ├── files.js              # 获取文件列表
│   ├── upload.js             # 文件上传（Vercel 限制）
│   ├── download-url.js       # 生成下载链接
│   ├── create_machine.js     # 生成用户码
│   ├── query_point.js        # 查询积分
│   ├── zl_policy.js          # zhaoli 上传策略
│   ├── process_zhaoli.js     # zhaoli 处理视频
│   └── status_zhaoli.js      # zhaoli 查询状态
├── public/            # 静态文件
│   ├── index.html     # 主页面
│   ├── style.css      # 样式文件
│   └── script.js      # 前端脚本
├── .env               # 环境变量（本地开发）
├── .env.example       # 环境变量模板
├── vercel.json        # Vercel 配置
└── package.json       # 项目配置
```

## 部署步骤

### 1. 准备环境变量

在项目根目录创建 `.env` 文件：

```env
# 腾讯云 COS 配置
COS_SECRET_ID=您的腾讯云SecretId
COS_SECRET_KEY=您的腾讯云SecretKey
COS_BUCKET=您的存储桶名称
COS_REGION=您的存储桶地域

# zhaoli API 配置
ZHAOLI_API_KEY=您的zhaoli API key
ZHAOLI_API_SECRET=您的zhaoli API secret
ZHAOLI_API_URL=https://api.zhaoli.com

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 2. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

### 4. 部署项目

```bash
vercel
```

### 5. 配置 Vercel 环境变量

在 Vercel 控制台中设置以下环境变量：

- `COS_SECRET_ID` - 腾讯云 SecretId
- `COS_SECRET_KEY` - 腾讯云 SecretKey
- `COS_BUCKET` - 腾讯云存储桶名称
- `COS_REGION` - 腾讯云存储桶地域
- `ZHAOLI_API_KEY` - zhaoli API key
- `ZHAOLI_API_SECRET` - zhaoli API secret

### 6. 重新部署

配置环境变量后，重新部署：

```bash
vercel --prod
```

## API 路由说明

### 腾讯云 COS 相关

- `GET /api/test-connection` - 测试腾讯云连接
- `GET /api/files` - 获取文件列表
- `POST /api/upload` - 文件上传（Vercel 限制）
- `POST /api/download-url` - 生成下载链接

### 用户码相关

- `POST /api/create_machine` - 生成用户码
- `POST /api/query_point` - 查询积分

### zhaoli 相关

- `POST /api/zl_policy` - 获取上传策略
- `POST /api/process_zhaoli` - 处理视频
- `POST /api/status_zhaoli` - 查询处理状态

## 注意事项

### Vercel 限制

1. **文件上传限制**：Vercel 对文件上传有严格限制，建议：
   - 使用客户端直接上传到腾讯云 COS
   - 或使用其他文件上传服务

2. **执行时间限制**：Serverless Functions 有执行时间限制（10秒），长时间操作需要异步处理

3. **内存限制**：每个函数有内存限制，大文件处理需要优化

### 本地开发

本地开发时，API 功能不可用，需要：
1. 部署到 Vercel 进行完整测试
2. 或实现本地 API 代理

### 环境变量

- 本地开发：使用 `.env` 文件
- Vercel 部署：在 Vercel 控制台设置环境变量

## 故障排除

### 常见错误

1. **404 Not Found**：检查 API 路由文件是否存在
2. **环境变量未定义**：确保在 Vercel 中设置了所有必需的环境变量
3. **CORS 错误**：检查前端请求路径是否正确

### 调试方法

1. 查看 Vercel 函数日志
2. 使用 `vercel logs` 命令查看部署日志
3. 在浏览器开发者工具中检查网络请求

## 更新部署

修改代码后，重新部署：

```bash
vercel --prod
```

或者推送到 Git 仓库，Vercel 会自动部署。 