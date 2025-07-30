# 腾讯云COS文件管理器

一个基于Node.js和Express的腾讯云COS文件管理网页应用，提供美观的用户界面和完整的文件管理功能。

## 功能特性

- 🔌 **测试连接**: 验证与腾讯云COS的连接状态
- 📤 **批量上传**: 支持多文件同时上传，带进度显示
- 📥 **文件下载**: 生成带签名的下载链接
- 📋 **文件列表**: 显示存储桶中的所有文件
- 🎨 **美观界面**: 现代化的响应式设计
- 📱 **移动适配**: 支持手机和平板设备

## 技术栈

- **后端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **云存储**: 腾讯云COS SDK
- **文件处理**: Multer
- **样式**: Font Awesome 图标

## 安装和运行

### 本地开发

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入您的配置：

```bash
cp .env.example .env
```

#### 3. 启动开发服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

#### 4. 访问应用

打开浏览器访问: http://localhost:3000

### Vercel 部署

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
vercel
```

#### 4. 配置环境变量

在 Vercel 控制台中设置以下环境变量：
- `COS_SECRET_ID`
- `COS_SECRET_KEY`
- `COS_BUCKET`
- `COS_REGION`
- `ZHAOLI_API_KEY`
- `ZHAOLI_API_SECRET`

## 配置说明

在 `server.js` 中配置您的腾讯云COS信息：

```javascript
const cos = new COS({
    SecretId: '您的SecretId',
    SecretKey: '您的SecretKey',
});

const bucket = '您的存储桶名称';
const region = '您的存储桶地域';
```

## API接口

### 测试连接
- **GET** `/api/test-connection`
- 返回连接状态和示例文件信息

### 上传文件
- **POST** `/api/upload`
- 支持多文件上传，最大100MB

### 获取文件列表
- **GET** `/api/files`
- 返回存储桶中的文件列表

### 生成下载链接
- **POST** `/api/download-url`
- 生成带签名的临时下载链接（10分钟有效期）

## 项目结构

```
theme7/
├── api/               # Vercel API 路由
│   ├── test-connection.js
│   ├── files.js
│   ├── upload.js
│   ├── create_machine.js
│   ├── query_point.js
│   ├── zl_policy.js
│   ├── process_zhaoli.js
│   └── status_zhaoli.js
├── public/            # 静态文件
│   ├── index.html     # 主页面
│   ├── style.css      # 样式文件
│   └── script.js      # 前端脚本
├── .env               # 环境变量配置
├── .gitignore         # Git 忽略文件
├── vercel.json        # Vercel 配置
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## 使用说明

1. **测试连接**: 点击"测试连接"按钮验证COS配置是否正确
2. **上传文件**: 点击"上传文件"按钮选择要上传的文件（支持多选）
3. **查看文件**: 页面会自动显示存储桶中的文件列表
4. **下载文件**: 点击文件旁的"下载"按钮获取下载链接

## 注意事项

- 确保腾讯云COS的SecretId和SecretKey有足够的权限
- 上传文件大小限制为100MB
- 下载链接有效期为10分钟
- 临时文件会自动清理

## 许可证

MIT License 