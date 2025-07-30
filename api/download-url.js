// 加载环境变量
require('dotenv').config();

const COS = require('cos-nodejs-sdk-v5');

// 腾讯云COS配置
const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
});
const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;

export default function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { objectKey } = req.body;
            
            if (!objectKey) {
                return res.status(400).json({ success: false, message: '缺少 objectKey 参数' });
            }

            // 生成带签名的临时下载链接（10分钟有效期）
            const url = cos.getObjectUrl({
                Bucket: bucket,
                Region: region,
                Key: objectKey,
                Sign: true,
                Expires: 600 // 10分钟
            });

            res.status(200).json({ 
                success: true, 
                url: url,
                message: '下载链接生成成功'
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: '生成下载链接失败: ' + error.message 
            });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 