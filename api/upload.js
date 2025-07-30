// 加载环境变量
require('dotenv').config();

const COS = require('cos-nodejs-sdk-v5');
const multer = require('multer');
const fs = require('fs');

// 腾讯云COS配置
const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
});
const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;

// 配置 multer 用于处理文件上传
const upload = multer({ dest: '/tmp/' });

// 由于 Vercel 的限制，我们需要手动处理文件上传
export default function handler(req, res) {
    if (req.method === 'POST') {
        // 注意：在 Vercel 中，文件上传需要特殊处理
        // 这里我们返回一个提示，建议使用客户端直接上传到 COS
        res.status(200).json({ 
            success: false, 
            message: '在 Vercel 环境中，建议使用客户端直接上传到腾讯云 COS' 
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 