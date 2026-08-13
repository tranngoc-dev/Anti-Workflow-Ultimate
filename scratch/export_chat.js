const fs = require('fs');
const readline = require('readline');

const inputPath = 'C:\\Users\\Trong\\.gemini\\antigravity\\brain\\02c22885-f794-4bda-bee2-d6da731393ec\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = 'C:\\Users\\Trong\\Desktop\\tulanh-simple-Tulanh\\chat_history.html';

const htmlTop = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat History</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #333; }
        .chat-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        h1 { text-align: center; color: #1f2937; margin-bottom: 30px; }
        .message { margin-bottom: 20px; display: flex; flex-direction: column; }
        .message.user { align-items: flex-end; }
        .message.model { align-items: flex-start; }
        .bubble { max-width: 80%; padding: 12px 16px; border-radius: 16px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }
        .user .bubble { background-color: #2563eb; color: white; border-bottom-right-radius: 4px; }
        .model .bubble { background-color: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }
        .time { font-size: 0.75rem; color: #64748b; margin-top: 4px; }
        pre { background: #1e293b; color: #f8fafc; padding: 10px; border-radius: 6px; overflow-x: auto; font-family: monospace; white-space: pre-wrap; }
        code { font-family: monospace; }
    </style>
</head>
<body>
    <div class="chat-container">
        <h1>Lịch sử trò chuyện</h1>
`;

const htmlBottom = `
    </div>
</body>
</html>
`;

function escapeHtml(text) {
    if (!text) return '';
    return text
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function cleanUserContent(text) {
    let t = text;
    // Basic regex using RegExp constructor to avoid escaping issues
    t = t.replace(new RegExp('<USER_REQUEST>[\\\\s\\\\S]*?</USER_REQUEST>'), (match) => {
        return match.replace('<USER_REQUEST>\\n', '').replace('\\n</USER_REQUEST>', '').replace('<USER_REQUEST>', '').replace('</USER_REQUEST>', '');
    });
    t = t.replace(new RegExp('<ADDITIONAL_METADATA>[\\\\s\\\\S]*?</ADDITIONAL_METADATA>', 'g'), '');
    t = t.replace(new RegExp('<USER_SETTINGS_CHANGE>[\\\\s\\\\S]*?</USER_SETTINGS_CHANGE>', 'g'), '');
    return t.trim();
}

async function processLineByLine() {
    const fileStream = fs.createReadStream(inputPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let htmlContent = htmlTop;

    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            
            if (data.type === 'USER_INPUT' && data.source === 'USER_EXPLICIT') {
                const cleanedText = cleanUserContent(data.content);
                if (cleanedText) {
                    htmlContent += '<div class="message user"><div class="bubble">' + escapeHtml(cleanedText) + '</div><div class="time">' + new Date(data.created_at).toLocaleString('vi-VN') + '</div></div>';
                }
            } else if (data.type === 'PLANNER_RESPONSE' && data.source === 'MODEL') {
                if (data.content && data.content.trim() !== '') {
                    htmlContent += '<div class="message model"><div class="bubble">' + escapeHtml(data.content) + '</div><div class="time">' + new Date(data.created_at).toLocaleString('vi-VN') + '</div></div>';
                }
            }
        } catch (e) {
            console.error('Error parsing line:', e);
        }
    }

    htmlContent += htmlBottom;
    fs.writeFileSync(outputPath, htmlContent, 'utf8');
    console.log('Chat history exported to', outputPath);
}

processLineByLine();
