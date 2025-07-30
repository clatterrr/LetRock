// 加载环境变量
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');
const COS = require('cos-nodejs-sdk-v5');
const tmp = require('tmp');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const upload = multer({ dest: 'uploads/' });

// zhaoli 配置
const APP_KEY = process.env.ZHAOLI_API_KEY ;
const APP_SECRET = process.env.ZHAOLI_API_SECRET ;

function calculateSign(body, appSecret) {
    const md5_1 = crypto.createHash('md5').update(body, 'utf8').digest('hex');
    const md5_2 = crypto.createHash('md5').update(md5_1 + appSecret, 'utf8').digest('hex');
    return md5_2;
}

// 1. 上传策略申请
app.post('/api/zl_policy', async (req, res) => {
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
        const zlRes = await axios.post(
            "https://api.zhaoli.com/v-w-c/gateway/ve/file/upload/policy/apply",
            body,
            { headers }
        );
        res.json(zlRes.data);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 2. 上传视频到zhaoli
app.post('/api/upload_zhaoli', upload.single('file'), async (req, res) => {
    try {
        const { policy } = req.body; // 前端传的策略对象字符串
        const file = req.file;
        const thebody = JSON.parse(policy).body;

        const formData = new FormData();
        formData.append('key', thebody.dir + file.originalname);
        formData.append('OSSAccessKeyId', thebody.accessid);
        formData.append('policy', thebody.policy);
        formData.append('signature', thebody.signature);
        formData.append('callback', thebody.base64CallbackBody);
        formData.append('success_action_status', 200);
        formData.append('file', fs.createReadStream(file.path), file.originalname);

        const zlRes = await axios.post(thebody.host, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const fullpath = thebody.urlPrefix + file.originalname;
        res.json({ success: true, fullpath });
        fs.unlinkSync(file.path);
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 3. 发起处理
app.post('/api/process_zhaoli', async (req, res) => {
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
        res.json({ success: true, taskId });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 4. 查询状态
app.post('/api/status_zhaoli', async (req, res) => {
    try {
        const { taskIds } = req.body;
        const bodyObj = { idWorks: taskIds };
        const body = JSON.stringify(bodyObj);
        const sign = calculateSign(body, APP_SECRET);
        const headers = {
            "Content-Type": "application/json",
            "AppKey": APP_KEY,
            "AppSign": sign
        };
        const zlRes = await axios.post(
            "https://api.zhaoli.com/v-w-c/gateway/ve/work/status",
            body,
            { headers }
        );
        const result = {};
        (zlRes.data.body.content || []).forEach(item => {
            result[item.id] = {
                status: item.processStatusEnum?.description || '未知',
                downloadUrl: item.videoUrl || ''
            };
        });
        res.json(result);
    } catch (e) {
        res.json({});
    }
});

// 5. 下载（前端直接用downloadUrl下载即可，无需后端代理）

// 生成用户码（SCF云函数）
app.post('/api/create_machine', async (req, res) => {
    let { machine_id } = req.body;
    try {
        const url = "https://1258718934-dtit2cjhaq.ap-shanghai.tencentscf.com/create_machine";
        const payload = machine_id ? { machine_id } : {};
        const response = await axios.post(url, payload);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: '生成或注册失败', error: error.message });
    }
});

// 查询积分（SCF云函数）
app.post('/api/query_point', async (req, res) => {
    const { machine_id } = req.body;
    try {
        const url = "https://1258718934-dtit2cjhaq.ap-shanghai.tencentscf.com/query_point2";
        const response = await axios.post(url, { machine_id });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: '查询失败', error: error.message });
    }
});

// 腾讯云COS配置
const cos = new COS({
    SecretId: process.env.COS_SECRET_ID ,
    SecretKey: process.env.COS_SECRET_KEY ,
});
const bucket = process.env.COS_BUCKET ;
const region = process.env.COS_REGION ;

// 下载腾讯云文件到本地
function downloadFromCOS(key, localPath) {
    return new Promise((resolve, reject) => {
        cos.getObject({
            Bucket: bucket,
            Region: region,
            Key: key
        }, (err, data) => {
            if (err) return reject(err);
            fs.writeFileSync(localPath, data.Body);
            resolve();
        });
    });
}

// 上传到zhaoli
async function uploadToZhaoli(localPath, filename) {
    // 1. 获取策略
    const policyRes = await axios.post('http://localhost:3000/api/zl_policy');
    const thebody = policyRes.data.body;
    const formData = new FormData();
    formData.append('key', thebody.dir + filename);
    formData.append('OSSAccessKeyId', thebody.accessid);
    formData.append('policy', thebody.policy);
    formData.append('signature', thebody.signature);
    formData.append('callback', thebody.base64CallbackBody);
    formData.append('success_action_status', 200);
    formData.append('file', fs.createReadStream(localPath), filename);

    await axios.post(thebody.host, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    return thebody.urlPrefix + filename;
}

// API：腾讯云转zhaoli
app.post('/api/cos_to_zhaoli', async (req, res) => {
    const { key } = req.body;
    const filename = path.basename(key);
    const tmpFile = tmp.tmpNameSync();
    try {
        await downloadFromCOS(key, tmpFile);
        const fullpath = await uploadToZhaoli(tmpFile, filename);
        fs.unlinkSync(tmpFile);
        res.json({ success: true, fullpath });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// API：zhaoli处理
app.post('/api/process_zhaoli', async (req, res) => {
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
        res.json({ success: true, taskId });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// API：zhaoli下载（直接返回videoUrl即可，前端用a标签下载）
app.post('/api/download_zhaoli', async (req, res) => {
    const { videoUrl, filename } = req.body;
    if (!videoUrl) return res.status(400).json({ success: false, message: '缺少videoUrl' });
    res.json({ success: true, downloadUrl: videoUrl, filename: filename || 'video.mp4' });
});

// 1. 测试连接
app.get('/api/test-connection', async (req, res) => {
    try {
        cos.getBucket({
            Bucket: bucket,
            Region: region,
            MaxKeys: 1
        }, (err, data) => {
            if (err) {
                res.json({ success: false, message: '❌ 连接失败: ' + err.message });
            } else {
                res.json({
                    success: true,
                    message: '✅ 连接成功，已连接到存储桶: ' + bucket,
                    files: data.Contents || []
                });
            }
        });
    } catch (error) {
        res.json({ success: false, message: '❌ 连接失败: ' + error.message });
    }
});

// 2. 上传文件到腾讯云
app.post('/api/upload', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const results = [];
        for (const file of files) {
            // 只允许上传视频文件
            if (!file.mimetype.startsWith('video/')) {
                fs.unlinkSync(file.path);
                results.push({ originalName: file.originalname, success: false, error: '只允许上传视频文件' });
                continue;
            }
            // 处理文件名编码，防止乱码
            let objectKey = file.originalname;
            try {
                objectKey = Buffer.from(objectKey, 'latin1').toString('utf8');
            } catch (e) {}
            // 只保留安全字符
            objectKey = encodeURIComponent(objectKey);
            const fileStream = fs.createReadStream(file.path);
            await new Promise((resolve, reject) => {
                cos.putObject({
                    Bucket: bucket,
                    Region: region,
                    Key: objectKey,
                    Body: fileStream,
                    ContentType: file.mimetype
                }, (err, data) => {
                    fs.unlinkSync(file.path);
                    if (err) {
                        results.push({ originalName: file.originalname, success: false, error: err.message });
                        reject(err);
                    } else {
                        results.push({ originalName: file.originalname, success: true, url: `https://${bucket}.cos.${region}.myqcloud.com/${objectKey}` });
                        resolve();
                    }
                });
            });
        }
        res.json({ success: true, message: `成功上传 ${results.length} 个文件`, files: results });
    } catch (error) {
        res.json({ success: false, message: '上传失败: ' + error.message });
    }
});

// 3. 刷新文件列表
app.get('/api/files', async (req, res) => {
    try {
        cos.getBucket({
            Bucket: bucket,
            Region: region,
            MaxKeys: 100
        }, (err, data) => {
            if (err) {
                res.json({ success: false, message: '获取文件列表失败: ' + err.message });
            } else {
                const files = (data.Contents || []).map(file => ({
                    key: file.Key,
                    size: file.Size,
                    lastModified: file.LastModified,
                    url: `https://${bucket}.cos.${region}.myqcloud.com/${file.Key}`
                }));
                res.json({ success: true, files });
            }
        });
    } catch (error) {
        res.json({ success: false, message: '获取文件列表失败: ' + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 