// 加载环境变量
require('dotenv').config();

const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        let { machine_id } = req.body;
        try {
            const url = "https://1258718934-dtit2cjhaq.ap-shanghai.tencentscf.com/create_machine";
            const payload = machine_id ? { machine_id } : {};
            const response = await axios.post(url, payload);
            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ success: false, message: '生成或注册失败', error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 