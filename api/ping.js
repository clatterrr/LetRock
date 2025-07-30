export default function handler(req, res) {
    res.status(200).json({ 
        pong: true,
        timestamp: new Date().toISOString()
    });
} 