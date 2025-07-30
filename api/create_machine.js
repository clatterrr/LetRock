// 加载环境变量
require('dotenv').config();

const https = require('https');
const http = require('http');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        let { machine_id } = req.body;
        try {
            const url = "https://1258718934-dtit2cjhaq.ap-shanghai.tencentscf.com/create_machine";
            const payload = machine_id ? { machine_id } : {};
            
            // 使用内置的 fetch (Node.js 18+)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ success: false, message: '生成或注册失败', error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 