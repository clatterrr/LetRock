// 本地开发服务器
const express = require('express');
const path = require('path');

const app = express();

// 静态文件服务
app.use(express.static('public'));

// 代理 API 请求到 Vercel 开发环境
app.use('/api/*', (req, res) => {
    // 在本地开发时，重定向到 Vercel 开发环境
    // 或者您可以在这里实现本地 API 逻辑
    res.status(404).json({ 
        error: 'API 路由在本地开发模式下不可用，请使用 Vercel 部署或本地 API 实现' 
    });
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`本地开发服务器运行在 http://localhost:${PORT}`);
    console.log('注意：API 功能需要部署到 Vercel 才能正常工作');
}); 