let latestMessage = {
    text: "等待 Telegram 消息...",
    time: "暂无更新"
};

export default function handler(req, res) {
    // 1. 接收 Telegram 消息
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

    // 2. 看板大屏页面 (GET)
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="30"> <!-- 每30秒自动刷新 -->
    <title>Kindle 专属看板</title>
    <style>
        body {
            background-color: #ffffff;
            color: #000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 90vh;
            box-sizing: border-box;
        }
        .header {
            font-size: 28px;
            font-weight: bold;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .content {
            font-size: 64px;
            font-weight: bold;
            line-height: 1.4;
            word-break: break-all;
            margin: auto 0;
        }
        .footer {
            font-size: 22px;
            text-align: right;
            color: #333;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <span>📌 智能提醒看板</span>
        <span>⚡ 实时在线</span>
    </div>
    <div class="content">
        ${latestMessage.text}
    </div>
    <div class="footer">
        最后更新时间：${latestMessage.time}
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
}
