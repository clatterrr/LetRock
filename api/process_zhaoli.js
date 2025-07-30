// 加载环境变量
require('dotenv').config();

const axios = require('axios');
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
            const { fullpath } = req.body;
            const bodyObj = {
                urls: [fullpath],
                videoInpaintLang: "zh",
                needChineseOcclude: 1
            };
            const body = JSON.stringify(bodyObj);
            const sign = calculateSign(body, APP_SECRET);
            const headers = {
                "Content-Type": "application/json",
                "AppKey": APP_KEY,
                "AppSign": sign
            };
            const zlRes = await axios.post(
                "https://api.zhaoli.com/v-w-c/gateway/ve/work/free",
                body,
                { headers }
            );
            const taskId = zlRes.data.body.dataList[0].id;
            res.status(200).json({ success: true, taskId });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 