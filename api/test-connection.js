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
    if (req.method === 'GET') {
        try {
            cos.getBucket({
                Bucket: bucket,
                Region: region,
                MaxKeys: 1
            }, (err, data) => {
                if (err) {
                    res.status(500).json({ success: false, message: '❌ 连接失败: ' + err.message });
                } else {
                    res.status(200).json({
                        success: true,
                        message: '✅ 连接成功，已连接到存储桶: ' + bucket,
                        files: data.Contents || []
                    });
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: '❌ 连接失败: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 