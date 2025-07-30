// 加载环境变量
require('dotenv').config();

const crypto = require('crypto');

// zhaoli 配置
const APP_KEY = process.env.ZHAOLI_API_KEY;
const APP_SECRET = process.env.ZHAOLI_API_SECRET;

function calculateSign(body, appSecret) {
    const md5_1 = crypto.createHash('md5').update(body, 'utf8').digest('hex');
    const md5_2 = crypto.createHash('md5').update(md5_1 + appSecret, 'utf8').digest('hex');
    return md5_2;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const bodyObj = {
                nonce: "iY2FsbGJhY2tVcmwiOiaodH",
                materialFileType: "video"
            };
            const body = JSON.stringify(bodyObj);
            const sign = calculateSign(body, APP_SECRET);
            const headers = {
                "Content-Type": "application/json",
                "AppKey": APP_KEY,
                "AppSign": sign
            };
            // 使用内置的 fetch (Node.js 18+)
            const zlRes = await fetch(
                "https://api.zhaoli.com/v-w-c/gateway/ve/file/upload/policy/apply",
                {
                    method: 'POST',
                    headers: headers,
                    body: body
                }
            );
            const data = await zlRes.json();
            res.status(200).json(data);
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 