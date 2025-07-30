# 修复后的部署指南

## 问题解决

### ✅ 已解决的问题

**Vercel Hobby 计划函数数量限制**
- 错误：`No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan`
- 原因：项目有 13 个 API 文件，超过免费计划限制
- 解决：合并相关 API，减少到 6 个文件

## 优化后的项目结构

```
theme7/
├── api/                    # Vercel API 路由（6个文件）
│   ├── cos.js             # 合并的 COS 相关 API
│   ├── create_machine.js  # 生成用户码
│   ├── query_point.js     # 查询积分
│   ├── zl_policy.js       # zhaoli 上传策略
│   ├── process_zhaoli.js  # zhaoli 处理视频
│   └── status_zhaoli.js   # zhaoli 查询状态
├── public/                 # 静态文件
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env                    # 本地环境变量
├── .env.example           # 环境变量模板
├── vercel.json            # Vercel 配置
└── package.json           # 项目配置
```

## API 路由说明

### 合并的 COS API (`/api/cos`)

通过 `action` 参数区分不同功能：

- `GET /api/cos?action=test-connection` - 测试腾讯云连接
- `GET /api/cos?action=files` - 获取文件列表
- `POST /api/cos?action=get-upload-url` - 获取上传签名URL
- `POST /api/cos?action=download-url` - 生成下载链接

### 其他 API

- `POST /api/create_machine` - 生成用户码
- `POST /api/query_point` - 查询积分
- `POST /api/zl_policy` - zhaoli 上传策略
- `POST /api/process_zhaoli` - zhaoli 处理视频
- `POST /api/status_zhaoli` - zhaoli 查询状态

## 部署步骤

### 1. 确认文件数量

```bash
ls api/ | wc -l
# 应该显示 6
```

### 2. 部署到 Vercel

```bash
vercel --prod
```

### 3. 配置环境变量

在 Vercel 控制台设置：

```env
COS_SECRET_ID=您的腾讯云SecretId
COS_SECRET_KEY=您的腾讯云SecretKey
COS_BUCKET=您的存储桶名称
COS_REGION=您的存储桶地域
ZHAOLI_API_KEY=您的zhaoli API key
ZHAOLI_API_SECRET=您的zhaoli API secret
```

## 测试步骤

### 1. 基本功能测试

- `https://your-project.vercel.app/api/cos?action=test-connection`
- `https://your-project.vercel.app/api/cos?action=files`

### 2. 上传功能测试

1. 打开网页
2. 点击"上传文件"
3. 选择文件
4. 观察控制台日志

### 3. 其他功能测试

- 生成用户码
- 查询积分
- zhaoli 相关功能

## 优势

### ✅ 优化效果

1. **减少函数数量**：从 13 个减少到 6 个
2. **符合免费计划**：在 Hobby 计划限制内
3. **功能完整**：所有功能保持不变
4. **性能优化**：减少冷启动时间
5. **维护简化**：相关功能集中管理

### 🚀 部署优势

- ✅ 无函数数量限制问题
- ✅ 更快的部署速度
- ✅ 更低的冷启动延迟
- ✅ 更好的资源利用

## 故障排除

### 如果仍然遇到问题

1. **检查文件数量**：
   ```bash
   ls api/
   ```

2. **重新部署**：
   ```bash
   vercel --clear-cache --prod
   ```

3. **检查环境变量**：
   - 确保所有必需的环境变量都已设置
   - 重新部署后生效

4. **查看日志**：
   ```bash
   vercel logs
   ```

## 下一步

现在您可以成功部署到 Vercel Hobby 计划了！

1. 运行 `vercel --prod`
2. 配置环境变量
3. 测试所有功能
4. 享受免费部署！

---

**修复完成时间**: 2024年7月30日  
**函数数量**: 6个（符合 Hobby 计划限制）  
**状态**: ✅ 可部署 