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

export default async function handler(req, res) {
    console.log('📥 收到 COS API 请求:', {
        method: req.method,
        url: req.url,
        query: req.query
    });

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'test-connection':
                await handleTestConnection(req, res);
                break;
            case 'files':
                await handleGetFiles(req, res);
                break;
            case 'get-upload-url':
                await handleGetUploadUrl(req, res);
                break;
            case 'download-url':
                await handleGetDownloadUrl(req, res);
                break;
            default:
                res.status(400).json({
                    success: false,
                    message: '缺少 action 参数',
                    availableActions: ['test-connection', 'files', 'get-upload-url', 'download-url']
                });
        }
    } catch (error) {
        console.error('❌ COS API 错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
}

// 测试连接
async function handleTestConnection(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

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
}

// 获取文件列表
async function handleGetFiles(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

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
}

// 获取上传URL
async function handleGetUploadUrl(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { fileName, fileType } = req.body;
    
    if (!fileName) {
        return res.status(400).json({
            success: false,
            message: '缺少 fileName 参数'
        });
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const key = `uploads/${timestamp}_${randomStr}_${fileName}`;

    // 生成预签名 URL（用于 PUT 上传）
    const url = cos.getObjectUrl({
        Bucket: bucket,
        Region: region,
        Key: key,
        Sign: true,
        Method: 'PUT',
        Expires: 3600, // 1小时有效期
        Headers: {
            'Content-Type': fileType || 'application/octet-stream'
        }
    });

    res.status(200).json({
        success: true,
        uploadUrl: url,
        key: key,
        bucket: bucket,
        region: region,
        expires: 3600,
        message: '上传URL生成成功'
    });
}

// 获取下载URL
async function handleGetDownloadUrl(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

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
} 