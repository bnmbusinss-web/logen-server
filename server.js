const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SAMURAI COMMANDER - Data Center</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                :root { --bg-base: #09090b; --bg-surface: #18181b; --bg-input: #000000; --border-light: #27272a; --border-focus: #52525b; --text-main: #fafafa; --text-muted: #a1a1aa; --accent: #ffffff; --accent-hover: #e4e4e7; }
                body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg-base); color: var(--text-main); padding: 30px 15px; margin: 0; }
                .container { max-width: 600px; margin: 0 auto; background: var(--bg-surface); padding: 30px; border-radius: 16px; border: 1px solid var(--border-light); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);}
                header { text-align: center; margin-bottom: 30px; }
                h1 { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 3px; }
                .subtitle { font-size: 11px; color: var(--text-muted); letter-spacing: 2px; margin-top: 5px; text-transform: uppercase; }
                .stats { text-align: center; margin-bottom: 25px; font-size: 13px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 12px; border-radius: 10px; border: 1px solid rgba(34, 197, 94, 0.2); font-weight: 600;}
                .form-group { margin-bottom: 16px; }
                label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 500; color: var(--text-muted); }
                select { width: 100%; padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border-light); background: var(--bg-input); color: var(--text-main); font-size: 14px; outline: none; transition: 0.2s; appearance: none; }
                select:focus { border-color: var(--border-focus); box-shadow: 0 0 0 1px var(--border-focus); }
                button { width: 100%; padding: 16px; margin-top: 20px; border-radius: 10px; border: none; background: var(--accent); color: #000; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                button:hover { background: var(--accent-hover); transform: translateY(-1px); }
                .log { background: var(--bg-input); padding: 15px; margin-top: 25px; height: 160px; overflow-y: auto; border-radius: 10px; font-family: monospace; font-size: 12px; color: #22c55e; border: 1px solid var(--border-light); line-height: 1.6;}
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>SAMURAI</h1>
                    <div class="subtitle">Cloud Command Center</div>
                </header>
                
                <div class="stats" id="stats">📡 جاري الاتصال بالمتصفحات...</div>

                <div class="form-group">
                    <label>💻 الحاسوب المستهدف (Target PC)</label>
                    <select id="targetPc" style="border-color: #38bdf8;">
                        <option value="ALL">🌐 إرسال إلى الجميع</option>
                        <option value="zakaria">💻 حاسوب Zakaria</option>
                        <option value="achraf">💻 حاسوب Achraf</option>
                        <option value="najwa">💻 حاسوب Najwa</option>
                        <option value="mohamed">💻 حاسوب Mohamed</option>
                        <option value="imane">💻 حاسوب Imane</option>
                        <option value="wasima">💻 حاسوب Wasima</option>
                        <option value="najlae">💻 حاسوب Najlae</option>
                        <option value="ismaile">💻 حاسوب Ismaile</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>المركز (Location)</label>
                    <select id="city"></select>
                </div>

                <div class="form-group">
                    <label>نوع التأشيرة (Visa Type)</label>
                    <select id="visaType"></select>
                </div>

                <div class="form-group">
                    <label>الفئة الفرعية (Visa Sub Type)</label>
                    <select id="subType"></select>
                </div>

                <div class="form-group">
                    <label>الفئة (Category)</label>
                    <select id="category"></select>
                </div>

                <button onclick="sendCommand()">إرسال الإشارة 🚀</button>

                <div class="log" id="log">
                    > نظام Samurai جاهز لتلقي الأوامر وتوزيعها...<br>
                </div>
            </div>

            <script>
                const N_LOCATIONS = ["Rabat","Casablanca","Tangier","Agadir","Tetouan","Nador"];
                const N_VISATYPES = ["National Visa","Schengen Visa"];
                const N_CATEGORIES = ["Normal","Premium","Prime Time"];
                const N_SUBTYPES = ["Schengen Visa", "Student Visa", "Family Reunification Visa", "National Visa", "Work Visa", "Casa 1", "Casa 2", "Students Less than 6 Months (SSU).", "Non-university students", "Schengen Visa – With Prior Schengen Visa 2023"];

                function fillSelect(id, items, selectedValue) {
                    const select = document.getElementById(id);
                    select.innerHTML = "";
                    items.forEach(v => {
                        const opt = document.createElement("option");
                        opt.value = v;
                        opt.textContent = v;
                        select.appendChild(opt);
                    });
                    if(selectedValue && items.includes(selectedValue)) select.value = selectedValue;
                }

                function getSubtypes(location, visatype) {
                    if (location === "Casablanca") {
                        if (visatype === "Schengen Visa") return ["Casa 1", "Casa 2"];
                        if (visatype === "National Visa") return ["Work Visa", "Student Visa", "Family Reunification Visa", "National Visa"];
                    }
                    if (visatype === "Schengen Visa") {
                        if (location === "Rabat") return ["Schengen Visa", "Schengen Visa – With Prior Schengen Visa 2023"];
                        return ["Schengen Visa"]; 
                    }
                    if (visatype === "National Visa") {
                        if (location === "Tangier") return ["Students Less than 6 Months (SSU)."];
                        if (location === "Agadir") return ["Non-university students"];
                        return ["National Visa", "Student Visa", "Family Reunification Visa", "Work Visa"]; 
                    }
                    return N_SUBTYPES; 
                }

                function updateSubTypes() {
                    const loc = document.getElementById("city").value;
                    const vType = document.getElementById("visaType").value;
                    const available = getSubtypes(loc, vType);
                    let target = available.includes("Schengen Visa") ? "Schengen Visa" : available[0];
                    fillSelect("subType", available, target);
                }

                function updateVisaTypes() {
                    const loc = document.getElementById("city").value;
                    const autoSchengen = ["Rabat", "Tangier", "Tetouan", "Agadir", "Nador"];
                    let targetVisa = autoSchengen.includes(loc) ? "Schengen Visa" : "Schengen Visa";
                    fillSelect("visaType", N_VISATYPES, targetVisa);
                    updateSubTypes();
                }

                fillSelect("city", N_LOCATIONS, "Casablanca");
                fillSelect("category", N_CATEGORIES, "Normal");
                updateVisaTypes();

                document.getElementById("city").addEventListener("change", updateVisaTypes);
                document.getElementById("visaType").addEventListener("change", updateSubTypes);

                function fetchStats() {
                    fetch('/api/stats').then(r => r.json()).then(data => {
                        document.getElementById('stats').innerText = '📡 المتصفحات المتصلة حالياً: ' + data.connections;
                    }).catch(e => {});
                }
                setInterval(fetchStats, 3000);
                fetchStats();

                function sendCommand() {
                    const payload = {
                        action: "CHANGE_PROFILE",
                        targetPc: document.getElementById('targetPc').value,
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
                        let targetText = document.getElementById('targetPc').options[document.getElementById('targetPc').selectedIndex].text;
                        log.innerHTML += '✅ [الهدف: '+ targetText +'] ('+ data.clients +' متصفح استلم الإشارة): ' + payload.city + ' - ' + payload.subType + '<br>';
                        log.scrollTop = log.scrollHeight; 
                        document.querySelector('button').innerText = 'إرسال الإشارة 🚀';
                    }).catch(err => {
                        alert('❌ خطأ في الاتصال بالسيرفر');
                        document.querySelector('button').innerText = 'إرسال الإشارة 🚀';
                    });
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/stats', (req, res) => { res.json({ connections: wss.clients.size }); });

app.post('/api/broadcast', (req, res) => {
    const payload = req.body;
    let count = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
            count++;
        }
    });
    console.log("Broadcast Command:", payload);
    res.json({ success: true, clients: count });
});

wss.on('connection', (ws) => { console.log("[+] متصفح جديد متصل الآن."); });

setInterval(() => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: "PING" }));
        }
    });
}, 20000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log('🚀 Samurai Commander is running on port ' + PORT);
});
