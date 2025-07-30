export default function handler(req, res) {
    res.status(200).json({ 
        message: 'Simple test API working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    });
} 