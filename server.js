const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// لوحة التحكم السحابية (Web Dashboard)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>لوحة التحكم - NINJA COMMANDER</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); border: 1px solid #334155;}
                h1 { color: #38bdf8; text-align: center; font-size: 24px; border-bottom: 1px solid #334155; padding-bottom: 15px; margin-top: 0; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; color: #94a3b8; font-size: 14px;}
                select, input { width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: white; font-size: 15px; box-sizing: border-box; }
                select:focus, input:focus { outline: none; border-color: #38bdf8; }
                button { width: 100%; padding: 14px; margin-top: 15px; border-radius: 6px; border: none; background: #2563eb; color: white; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
                button:hover { background: #1d4ed8; }
                .log { background: #000; padding: 15px; margin-top: 20px; height: 180px; overflow-y: auto; border-radius: 6px; font-family: monospace; font-size: 13px; color: #10b981; border: 1px solid #334155;}
                .stats { text-align: center; margin-bottom: 20px; font-size: 14px; color: #cbd5e1; background: rgba(56, 189, 248, 0.1); padding: 10px; border-radius: 6px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔥 NINJA SYSTEM CORE - COMMANDER 🔥</h1>
                <div class="stats" id="stats">📡 عدد المتصفحات المتصلة حالياً: جاري التحميل...</div>
                
                <div class="form-group">
                    <label>📍 اختر المدينة:</label>
                    <select id="city">
                        <option value="Casablanca">الدار البيضاء (Casablanca)</option>
                        <option value="Rabat">الرباط (Rabat)</option>
                        <option value="Tangier">طنجة (Tangier)</option>
                        <option value="Agadir">أكادير (Agadir)</option>
                        <option value="Tetouan">تطوان (Tetouan)</option>
                        <option value="Nador">الناظور (Nador)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>📑 نوع الفيزا الأساسي (Visa Type):</label>
                    <select id="visaType">
                        <option value="Schengen Visa">Schengen Visa</option>
                        <option value="National Visa">National Visa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>📝 النوع الفرعي (Sub Type):</label>
                    <input type="text" id="subType" value="Schengen Visa" placeholder="مثال: Casa 1 أو Work Visa">
                </div>

                <div class="form-group">
                    <label>⭐ الفئة (Category):</label>
                    <select id="category">
                        <option value="Normal">Normal</option>
                        <option value="Premium">Premium</option>
                        <option value="Prime Time">Prime Time</option>
                    </select>
                </div>

                <button onclick="sendCommand()">🚀 إرسال الإشارة لجميع المتصفحات</button>

                <div class="log" id="log">
                    > النظام جاهز بانتظار أوامرك...<br>
                </div>
            </div>

            <script>
                // جلب عدد المتصفحات المتصلة كل 3 ثواني
                function fetchStats() {
                    fetch('/api/stats').then(r => r.json()).then(data => {
                        document.getElementById('stats').innerText = '📡 عدد المتصفحات المتصلة للإطلاق: ' + data.connections;
                    }).catch(e => console.log(e));
                }
                setInterval(fetchStats, 3000);
                fetchStats();

                // دالة إرسال الأمر
                function sendCommand() {
                    const payload = {
                        action: "CHANGE_PROFILE",
                        city: document.getElementById('city').value,
                        visaType: document.getElementById('visaType').value,
                        subType: document.getElementById('subType').value,
                        category: document.getElementById('category').value
                    };
                    
                    document.querySelector('button').innerText = '⏳ جاري الإرسال...';
                    
                    fetch('/api/broadcast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(res => res.json()).then(data => {
                        const log = document.getElementById('log');
                        log.innerHTML += '✅ [تم الإرسال لـ '+ data.clients +' متصفح]: ' + payload.city + ' - ' + payload.visaType + '<br>';
                        log.scrollTop = log.scrollHeight; // النزول لأسفل السجل
                        document.querySelector('button').innerText = '🚀 إرسال الإشارة لجميع المتصفحات';
                    }).catch(err => {
                        alert('❌ خطأ في الاتصال بالسيرفر');
                        document.querySelector('button').innerText = '🚀 إرسال الإشارة لجميع المتصفحات';
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// مسار للحصول على إحصائيات الاتصال
app.get('/api/stats', (req, res) => {
    res.json({ connections: wss.clients.size });
});

// مسار لاستقبال الأوامر من لوحة التحكم وإذاعتها للجميع
app.post('/api/broadcast', (req, res) => {
    const payload = req.body;
    let count = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
            count++;
        }
    });
    console.log("Broadcast sent to", count, "clients:", payload);
    res.json({ success: true, clients: count });
});

// إشعار عند اتصال متصفح جديد
wss.on('connection', (ws) => {
    console.log("[+] متصفح جديد اتصل بنظام WebSocket.");
});

// إبقاء الاتصال حياً (Keep-Alive) لمنع الفصل
setInterval(() => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: "PING" }));
        }
    });
}, 20000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log('🚀 Commander Server is running on port ' + PORT);
});
