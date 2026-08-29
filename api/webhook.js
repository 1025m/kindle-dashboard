const { createCanvas } = require('canvas');

// 内存临时存储最新消息（Vercel Serverless 偶尔会冷启动，正式生产建议存KV，这里为了最简演示）
let latestMessage = {
    text: "暂无新提醒",
    time: "请在TG发送消息"
};

// Kindle 分辨率（以 Paperwhite 为例：758x1024，可根据你的设备调整）
const WIDTH = 758;
const HEIGHT = 1024;

export default async function handler(req, res) {
    const { method, query, body } = req;

    // 1. 接收来自 Telegram 的 Webhook 推送
    if (method === 'POST') {
        const msg = body.message || body.edited_message;
        if (msg && msg.text) {
            latestMessage = {
                text: msg.text,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' })
            };
        }
        return res.status(200).json({ ok: true });
    }

    // 2. 供 Kindle 拉取生成的黑白公告图片 (GET /api/webhook?action=image)
    if (method === 'GET' && query.action === 'image') {
        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext('2d');

        // 纯白背景
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // 顶部标题栏
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, WIDTH, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText('Telegram 智能提醒', 40, 75);

        // 消息正文框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 180, WIDTH - 100, 600);

        // 渲染消息内容（支持自动换行处理）
        ctx.fillStyle = '#000000';
        ctx.font = '36px sans-serif';
        wrapText(ctx, latestMessage.text, 90, 260, WIDTH - 180, 50);

        // 底部时间戳
        ctx.font = '24px sans-serif';
        ctx.fillText(`更新时间: ${latestMessage.time}`, 50, HEIGHT - 80);

        // 输出为 PNG 图片流
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache');
        return res.send(canvas.toBuffer('image/png'));
    }

    return res.status(200).send('Kindle Cloud Server is running.');
}

// 辅助函数：文字自动换行
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = text.split('\n');
    let currentY = y;
    for (let i = 0; i < lines.length; i++) {
        let line = '';
        for (let n = 0; n < lines[i].length; n++) {
            let testLine = line + lines[i][n];
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = lines[i][n];
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
    }
}