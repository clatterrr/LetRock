export default function handler(req, res) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    res.status(200).json({ 
        message: 'Hello from Vercel!',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
} 