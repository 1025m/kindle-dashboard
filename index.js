let latestMessage = {
    text: "暂无新提醒，快去TG发消息吧",
    time: "等待接收..."
};

export default function handler(req, res) {
    // 1. 接收来自 Telegram 的 Webhook 消息 (POST)
    if (req.method === 'POST') {
        const msg = req.body?.message || req.body?.edited_message;
        if (msg && msg.text) {
            latestMessage = {
                text: msg.text,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai' })
            };
        }
        return res.status(200).json({ ok: true });
    }

    // 2. 供 Kindle 或浏览器直接访问的极简大字版网页 (GET)
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="60">
    <title>Kindle 提醒</title>
    <style>
        body { background-color: #ffffff; color: #000000; font-family: sans-serif; padding: 40px; margin: 0; }
        .time { font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; }
        .content { font-size: 48px; line-height: 1.5; font-weight: bold; word-break: break-all; }
    </style>
</head>
<body>
    <div class="time">更新时间: ${latestMessage.time}</div>
    <div class="content">${latestMessage.text}</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
}
