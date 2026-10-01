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
                header { text-align: center; margin-bottom: 20px; }
                h1 { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 3px; }
                .subtitle { font-size: 11px; color: var(--text-muted); letter-spacing: 2px; margin-top: 5px; text-transform: uppercase; }
                
                /* ستايل الأزرار الجديدة (إسبانيا والبرتغال) */
                .tabs-container { display: flex; gap: 10px; margin-bottom: 25px; }
                .tab-btn { flex: 1; padding: 14px; text-align: center; font-size: 15px; font-weight: 800; border-radius: 10px; cursor: pointer; transition: all 0.3s; color: #fff; border: 2px solid transparent; background: #1e293b; border-color: #334155; }
                .tab-pt.active { background: #046b46; border-color: #ffc400; box-shadow: 0 0 15px rgba(4,107,70,0.5); }
                .tab-es.active { background: #da291c; border-color: #ffc400; box-shadow: 0 0 15px rgba(218,41,28,0.5); }
                
                .stats { text-align: center; margin-bottom: 25px; font-size: 13px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 12px; border-radius: 10px; border: 1px solid rgba(34, 197, 94, 0.2); font-weight: 600; transition: all 0.3s;}
                .form-group { margin-bottom: 16px; }
                label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 500; color: var(--text-muted); }
                select { width: 100%; padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border-light); background: var(--bg-input); color: var(--text-main); font-size: 14px; outline: none; transition: 0.2s; appearance: none; }
                select:focus { border-color: var(--border-focus); box-shadow: 0 0 0 1px var(--border-focus); }
                button { width: 100%; padding: 16px; margin-top: 20px; border-radius: 10px; border: none; background: var(--accent); color: #000; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                button:hover { background: var(--accent-hover); transform: translateY(-1px); }
                .btn-outline { background: transparent; color: #38bdf8; border: 1px solid #38bdf8; margin-top: 5px; }
                .btn-outline:hover { background: rgba(56, 189, 248, 0.1); }
                .btn-green { background: #22c55e; color: #000; }
                .btn-green:hover { background: #16a34a; }
                .log { background: var(--bg-input); padding: 15px; margin-top: 25px; height: 160px; overflow-y: auto; border-radius: 10px; font-family: monospace; font-size: 12px; color: #22c55e; border: 1px solid var(--border-light); line-height: 1.6;}
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>SAMURAI</h1>
                    <div class="subtitle" id="country-subtitle">Cloud Command Center - ES</div>
                </header>

                <!-- أزرار التبديل بين الدول -->
                <div class="tabs-container">
                    <div id="tab-pt" class="tab-btn tab-pt" onclick="switchCountry('PT')">🇵🇹 البرتغال PT</div>
                    <div id="tab-es" class="tab-btn tab-es active" onclick="switchCountry('ES')">🇪🇸 إسبانيا ES</div>
                </div>
                
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

                <button onclick="sendCommand()" id="btn-send">إرسال أمر التشغيل (العميل النشط) 🚀</button>

                <div class="form-group" style="margin-top: 25px; border-top: 1px solid var(--border-light); padding-top: 20px;">
                    <label style="color: #38bdf8; font-weight: 700; font-size: 14px;">📦 نظام التوزيع الصارم (إيميل واحد لكل نافذة)</label>
                    <input type="file" id="bulkUpload" accept=".txt,.csv" style="display: none;" onchange="handleFileUpload(event)">
                    <button class="btn-outline" onclick="document.getElementById('bulkUpload').click()">
                        📂 اختيار ملف الحسابات (TXT/CSV)
                    </button>
                    <button class="btn-green" id="distributeBtn" style="display: none;" onclick="distributeAccounts()">
                        🎯 توزيع الحسابات الصارم (1 حساب / لكل نافذة)
                    </button>
                </div>

                <div class="log" id="log">
                    > نظام Samurai السحابي جاهز...<br>
                </div>
            </div>

            <script>
                // متغير يحدد الدولة النشطة في لوحة التحكم
                let CURRENT_COUNTRY = 'ES';

                // ======================================
                // بيانات إسبانيا (ES)
                // ======================================
                const ES_LOCATIONS = ["Rabat","Casablanca","Tangier","Agadir","Tetouan","Nador"];
                const ES_VISATYPES = ["National Visa","Schengen Visa"];
                const SHARED_CATEGORIES = ["Normal","Premium","Prime Time"];
                
                function getSubtypesES(location, visatype) {
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
                    return ["Schengen Visa"]; 
                }

                // ======================================
                // بيانات البرتغال (PT)
                // ======================================
                const PT_LOCATIONS = ["Casablanca", "Rabat"];
                const PT_VISATYPES = ["Long Stay Visa", "Short Stay Visa"];

                function getSubtypesPT(location, visatype) {
                    if (visatype === "Long Stay Visa") {
                        return [
                            "Academic or Professional Training Course",
                            "Any other category of Long-Stay visa",
                            "Family Member of Portuguese Citizen for family reunification ",
                            "Family Reunification  ",
                            "Higher Education Studies",
                            "Highly Qualified Activity",
                            "Work"
                        ];
                    }
                    if (visatype === "Short Stay Visa") {
                        return [
                            "Business or other professional reason ",
                            "Family Member of EU Citizen - Directive 2004/38/EC",
                            "Spouse of Portuguese citizen for a short visit to Portugal  ",
                            "Short Stay Visa"
                        ];
                    }
                    return [];
                }

                // ======================================
                // وظائف تحديث القوائم المنسدلة
                // ======================================
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

                function updateSubTypes() {
                    const loc = document.getElementById("city").value;
                    const vType = document.getElementById("visaType").value;
                    let available = [];

                    if (CURRENT_COUNTRY === 'ES') {
                        available = getSubtypesES(loc, vType);
                    } else {
                        available = getSubtypesPT(loc, vType);
                    }

                    fillSelect("subType", available, available[0]);
                }

                function updateVisaTypes() {
                    const loc = document.getElementById("city").value;
                    
                    if (CURRENT_COUNTRY === 'ES') {
                        const autoSchengen = ["Rabat", "Tangier", "Tetouan", "Agadir", "Nador"];
                        let targetVisa = autoSchengen.includes(loc) ? "Schengen Visa" : "Schengen Visa";
                        fillSelect("visaType", ES_VISATYPES, targetVisa);
                    } else {
                        fillSelect("visaType", PT_VISATYPES, PT_VISATYPES[1]); // Short Stay default
                    }
                    updateSubTypes();
                }

                // التبديل بين الدول
                function switchCountry(country) {
                    CURRENT_COUNTRY = country;
                    
                    // تغيير واجهة الأزرار
                    document.getElementById('tab-pt').classList.toggle('active', country === 'PT');
                    document.getElementById('tab-es').classList.toggle('active', country === 'ES');
                    document.getElementById('country-subtitle').innerText = "Cloud Command Center - " + country;
                    
                    // تغيير الألوان قليلاً للتمييز
                    document.getElementById('btn-send').style.background = country === 'PT' ? '#046b46' : '#ffffff';
                    document.getElementById('btn-send').style.color = country === 'PT' ? '#ffffff' : '#000000';

                    // تحديث القوائم
                    if (country === 'ES') {
                        fillSelect("city", ES_LOCATIONS, "Casablanca");
                    } else {
                        fillSelect("city", PT_LOCATIONS, "Casablanca");
                    }
                    fillSelect("category", SHARED_CATEGORIES, "Normal");
                    updateVisaTypes();
                }

                // الأحداث (Listeners)
                document.getElementById("city").addEventListener("change", updateVisaTypes);
                document.getElementById("visaType").addEventListener("change", updateSubTypes);

                // التهيئة الافتراضية عند فتح الصفحة
                switchCountry('ES');

                // ======================================
                // إحصائيات الاتصال
                // ======================================
                let currentStats = { total: 0, details: {} };
                function updateStatsUI() {
                    const selectedPc = document.getElementById('targetPc').value.toLowerCase();
                    const statsEl = document.getElementById('stats');
                    if (selectedPc === "all") {
                        statsEl.innerText = '📡 إجمالي المتصفحات المتصلة: ' + currentStats.total;
                    } else {
                        const count = currentStats.details[selectedPc] || 0;
                        const pcName = document.getElementById('targetPc').options[document.getElementById('targetPc').selectedIndex].text.replace('💻 حاسوب', '').trim();
                        statsEl.innerText = '📡 متصفحات (' + pcName + ') المتصلة حالياً: ' + count;
                    }
                }
                document.getElementById('targetPc').addEventListener('change', updateStatsUI);

                function fetchStats() {
                    fetch('/api/stats').then(r => r.json()).then(data => {
                        currentStats = data; updateStatsUI();
                    }).catch(e => {});
                }
                setInterval(fetchStats, 3000); fetchStats();

                // ======================================
                // رفع الملفات والتوزيع
                // ======================================
                window.uploadedAccounts = [];
                function handleFileUpload(event) {
                    const file = event.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        window.uploadedAccounts = [];
                        const lines = e.target.result.split(/\\r?\\n/).filter(line => line.trim() !== "");
                        lines.forEach(line => {
                            const parts = line.split(/[:,]/).map(s => s.trim());
                            if (parts.length >= 2) {
                                window.uploadedAccounts.push({
                                    email: parts[0],
                                    password: parts[1],
                                    appPassword: parts[2] || ""
                                });
                            }
                        });
                        alert('تم قراءة ' + window.uploadedAccounts.length + ' حساب من الملف بنجاح! جاهز للتوزيع.');
                        document.getElementById('distributeBtn').style.display = 'block';
                    };
                    reader.readAsText(file);
                }

                function distributeAccounts() {
                    if (window.uploadedAccounts.length === 0) return alert("الملف فارغ!");
                    
                    const payload = {
                        country: CURRENT_COUNTRY, // إضافة الدولة إلى الطلب
                        accounts: window.uploadedAccounts,
                        targetPc: document.getElementById('targetPc').value,
                        city: document.getElementById('city').value,
                        visaType: document.getElementById('visaType').value,
                        subType: document.getElementById('subType').value,
                        category: document.getElementById('category').value
                    };
                    
                    document.getElementById('distributeBtn').innerText = '⏳ جاري التقسيم والتوزيع...';
                    
                    fetch('/api/bulk-distribute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(res => res.json()).then(data => {
                        const log = document.getElementById('log');
                        if(data.success) {
                            log.innerHTML += '📦 [التوزيع لـ ' + CURRENT_COUNTRY + ']: تم إرسال ' + data.distributedTo + ' حساب لـ ' + data.distributedTo + ' متصفحات!<br>';
                            window.uploadedAccounts = [];
                            document.getElementById('distributeBtn').style.display = 'none';
                            document.getElementById('bulkUpload').value = '';
                        } else {
                            log.innerHTML += '❌ [خطأ]: ' + data.error + '<br>';
                        }
                        log.scrollTop = log.scrollHeight; 
                        document.getElementById('distributeBtn').innerText = '🎯 توزيع الحسابات الصارم (1 حساب / لكل نافذة)';
                    }).catch(err => { alert('❌ خطأ في الاتصال'); });
                }

                // ======================================
                // أمر تغيير وتفعيل العميل (التشغيل اليومي)
                // ======================================
                function sendCommand() {
                    const payload = {
                        action: "CHANGE_PROFILE", 
                        country: CURRENT_COUNTRY, // إضافة الدولة إلى الطلب
                        targetPc: document.getElementById('targetPc').value,
                        city: document.getElementById('city').value, 
                        visaType: document.getElementById('visaType').value,
                        subType: document.getElementById('subType').value, 
                        category: document.getElementById('category').value
                    };
                    
                    fetch('/api/broadcast', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(payload) 
                    }).then(res => res.json()).then(data => {
                        const log = document.getElementById('log');
                        log.innerHTML += '🚀 [أمر تشغيل ' + CURRENT_COUNTRY + ']: تم الإرسال لـ ' + data.clients + ' متصفح بنجاح!<br>';
                        log.scrollTop = log.scrollHeight;
                    }).catch(err => {
                        alert('❌ خطأ في الاتصال بالسيرفر');
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// ============================================
// الجزء الخاص بالـ Backend Server
// ============================================

app.get('/api/stats', (req, res) => {
    let stats = { total: 0, details: {} };
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            stats.total++;
            let pcId = client.pcId ? client.pcId.toLowerCase() : "unknown";
            stats.details[pcId] = (stats.details[pcId] || 0) + 1;
        }
    });
    res.json(stats);
});

app.post('/api/broadcast', (req, res) => {
    const payload = req.body;
    let count = 0;
    const target = payload.targetPc ? payload.targetPc.toLowerCase() : "all";
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && (target === "all" || client.pcId === target)) {
            client.send(JSON.stringify(payload)); 
            count++;
        }
    });
    res.json({ success: true, clients: count });
});

app.post('/api/bulk-distribute', (req, res) => {
    const { accounts, country, city, visaType, subType, category, targetPc } = req.body;
    const target = targetPc ? targetPc.toLowerCase() : "all";
    
    let eligibleClients = [];
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.pcId && client.pcId !== "unknown") {
            if (target === "all" || client.pcId === target) {
                eligibleClients.push(client); 
            }
        }
    });

    const numClients = eligibleClients.length;

    if (numClients === 0) {
        return res.json({ success: false, error: "لا يوجد متصفحات مستهدفة متصلة حالياً." });
    }

    let distributedCount = 0;
    
    for (let i = 0; i < numClients; i++) {
        if (accounts[i]) { 
            eligibleClients[i].send(JSON.stringify({
                action: "BULK_ADD_PROFILES",
                country: country, // إرسال الدولة كجزء من الأمر
                profiles: [ accounts[i] ], 
                city, visaType, subType, category
            }));
            distributedCount++;
        }
    }

    res.json({ success: true, distributedTo: distributedCount, totalAccounts: distributedCount });
});

wss.on('connection', (ws) => {
    ws.pcId = "unknown"; 
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.action === "REGISTER") ws.pcId = data.pcId.toLowerCase();
        } catch (e) {}
    });
});

setInterval(() => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify({ action: "PING" }));
    });
}, 20000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('🚀 Samurai Commander is running on port ' + PORT));
