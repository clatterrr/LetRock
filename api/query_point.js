// 加载环境变量
require('dotenv').config();

const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { machine_id } = req.body;
        try {
            const url = "https://1258718934-dtit2cjhaq.ap-shanghai.tencentscf.com/query_point2";
            const response = await axios.post(url, { machine_id });
            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ success: false, message: '查询失败', error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
} 