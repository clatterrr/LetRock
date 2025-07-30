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
                MaxKeys: 100
            }, (err, data) => {
                if (err) {
                    res.status(500).json({ success: false, message: '获取文件列表失败: ' + err.message });
                } else {
                    const files = (data.Contents || []).map(file => ({
                        key: file.Key,
                        size: file.Size,
                        lastModified: file.LastModified,
                        url: `https://${bucket}.cos.${region}.myqcloud.com/${file.Key}`
                    }));
                    res.status(200).json({ success: true, files });
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: '获取文件列表失败: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 