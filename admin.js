const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

// កូដ HTML ទាំងមូលត្រូវបានរក្សាទុកក្នុងអថេរនេះ (មានចាក់សោរ និងឆ្នាំស្វ័យប្រវត្តិ)
const ADMIN_HTML = `
<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ផ្ទាំងបញ្ជា Admin - Telegram Bot</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        body { font-family: 'Battambang', sans-serif; background-color: #f3f4f6; color: #1f2937; }
        .tg-bg { background-color: #ffffff; }
        .tg-button { background-color: #3b82f6; color: #ffffff; }
        .tg-input { background-color: #ffffff; color: #1f2937; border: 1px solid #d1d5db; }
        .tg-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        #mainContent { display: none; }
    </style>
</head>
<body class="p-4 md:p-6 pb-20">

    <div id="mainContent" class="max-w-md mx-auto space-y-6">
        <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold text-blue-600">គ្រប់គ្រងប្រព័ន្ធតេឡេក្រាម</h1>
            <p class="text-sm opacity-80">ផ្ទាំងគ្រប់គ្រងសម្រាប់តែអ្នកគ្រប់គ្រង (Admin) ប៉ុណ្ណោះ</p>
        </div>

        <div class="tg-bg rounded-xl shadow-sm p-5 space-y-4 border border-gray-100">
            <div class="flex items-center space-x-2"><span class="text-xl">📢</span><h2 class="text-lg font-bold">ផ្ញើសារជូនដំណឹងទូទៅ</h2></div>
            <div>
                <textarea id="broadcastText" rows="4" class="tg-input w-full rounded-lg p-3 text-sm resize-none" placeholder="វាយបញ្ចូលខ្លឹមសារនៅទីនេះ..."></textarea>
            </div>
            <button id="btnBroadcastMsg" onclick="sendBroadcastMessage()" class="tg-button w-full py-3 rounded-lg font-bold text-sm shadow transition-transform active:scale-95 flex justify-center items-center">
                បញ្ជូនសារឥឡូវនេះ
            </button>
        </div>

        <div class="tg-bg rounded-xl shadow-sm p-5 space-y-4 border border-gray-100">
            <div class="flex items-center space-x-2"><span class="text-xl">🔔</span><h2 class="text-lg font-bold">ផ្ញើដំណឹងប្រកាសពិន្ទុថ្មី</h2></div>
            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="text-xs font-bold opacity-70">ខែ</label>
                    <select id="scoreMonth" class="tg-input w-full rounded-lg p-3 text-sm">
                        <option value="មករា">មករា</option><option value="កុម្ភៈ">កុម្ភៈ</option><option value="មីនា">មីនា</option>
                        <option value="មេសា">មេសា</option><option value="ឧសភា">ឧសភា</option><option value="មិថុនា">មិថុនា</option>
                        <option value="កក្កដា">កក្កដា</option><option value="សីហា">សីហា</option><option value="កញ្ញា">កញ្ញា</option>
                        <option value="តុលា">តុលា</option><option value="វិច្ឆិកា">វិច្ឆិកា</option><option value="ធ្នូ">ធ្នូ</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold opacity-70">ឆ្នាំសិក្សា</label>
                    <select id="scoreYear" class="tg-input w-full rounded-lg p-3 text-sm"></select>
                </div>
            </div>
            <button id="btnBroadcastScore" onclick="sendScoreAlert()" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-sm shadow transition-transform active:scale-95 flex justify-center items-center">
                ប្រកាសដំណឹងពិន្ទុ
            </button>
        </div>
    </div>

    <script>
        // ដោយសារវានៅក្នុង File តែមួយ យើងអាចប្រើ URL បច្ចុប្បន្នបានតែម្ដង
        const API_URL = window.location.href;

        document.addEventListener("DOMContentLoaded", () => {
            promptPassword();
            generateYears();
        });

        function promptPassword() {
            Swal.fire({
                title: '🔒 តម្រូវឲ្យមានពាក្យសម្ងាត់',
                text: 'សូមបញ្ចូលពាក្យសម្ងាត់ដើម្បីចូលទៅកាន់ផ្ទាំង Admin',
                input: 'password',
                inputPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់ទីនេះ...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'ចូលប្រើប្រាស់',
                confirmButtonColor: '#3b82f6',
                inputValidator: (value) => {
                    if (!value) return 'សូមបញ្ចូលពាក្យសម្ងាត់!';
                    if (value !== 'H@nm@m64') return 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ!';
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('mainContent').style.display = 'block';
                }
            });
        }

        function generateYears() {
            const yearSelect = document.getElementById('scoreYear');
            yearSelect.innerHTML = ''; 
            const startYear = 2025;
            for (let i = 0; i <= 15; i++) {
                let currentYear = startYear + i;
                let yearString = currentYear + '-' + (currentYear + 1);
                let option = document.createElement('option');
                option.value = yearString; option.text = yearString;
                yearSelect.appendChild(option);
            }
        }

        async function sendBroadcastMessage() {
            let text = document.getElementById('broadcastText').value.trim();
            if (!text) {
                Swal.fire({ icon: 'warning', title: 'សូមបំពេញខ្លឹមសារ', confirmButtonText: 'យល់ព្រម' });
                return;
            }

            Swal.fire({
                title: 'បញ្ជាក់ការផ្ញើសារ',
                text: "សារនេះនឹងត្រូវបាញ់ទៅកាន់គ្រប់គណនីទាំងអស់ក្នុងប្រព័ន្ធ។",
                icon: 'question',
                showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#d33',
                confirmButtonText: 'បាទ/ចាស ផ្ញើ', cancelButtonText: 'បោះបង់'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let btn = document.getElementById('btnBroadcastMsg');
                    let originalText = btn.innerHTML;
                    btn.innerHTML = "កំពុងបញ្ជូន... ⏳"; btn.disabled = true;

                    try {
                        let res = await fetch(API_URL, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "broadcast_message", messageText: text })
                        });
                        let data = await res.json();
                        if(data.success) {
                            Swal.fire('ជោគជ័យ', 'សារត្រូវបានបាញ់ទៅកាន់ ' + data.count + ' គណនីរួចរាល់។', 'success');
                            document.getElementById('broadcastText').value = '';
                        } else {
                            Swal.fire('មានបញ្ហា', data.message || 'មិនអាចបញ្ជូនបាន', 'error');
                        }
                    } catch(e) { 
                        Swal.fire('បរាជ័យ', 'មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ។', 'error'); 
                    }
                    btn.innerHTML = originalText; btn.disabled = false;
                }
            });
        }

        async function sendScoreAlert() {
            let month = document.getElementById('scoreMonth').value;
            let year = document.getElementById('scoreYear').value;

            Swal.fire({
                title: 'ប្រកាសដំណឹងពិន្ទុ?',
                html: 'តើលោកគ្រូពិតជាចង់ប្រកាសដំណឹងលទ្ធផលសិក្សាប្រចាំ <b>ខែ' + month + ' ឆ្នាំ' + year + '</b> មែនទេ?',
                icon: 'question',
                showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#d33',
                confirmButtonText: 'បាទ/ចាស ប្រកាស', cancelButtonText: 'បោះបង់'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let btn = document.getElementById('btnBroadcastScore');
                    let originalText = btn.innerHTML;
                    btn.innerHTML = "កំពុងបញ្ជូន... ⏳"; btn.disabled = true;

                    try {
                        let res = await fetch(API_URL, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "broadcast_score", month: month, year: year })
                        });
                        let data = await res.json();
                        if(data.success) {
                            Swal.fire('ជោគជ័យ', 'ដំណឹងពិន្ទុត្រូវបានប្រកាសទៅកាន់ ' + data.count + ' គណនីរួចរាល់។', 'success');
                        } else {
                            Swal.fire('មានបញ្ហា', data.message || 'មិនអាចបញ្ជូនបាន', 'error');
                        }
                    } catch(e) { 
                        Swal.fire('បរាជ័យ', 'មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ។', 'error'); 
                    }
                    btn.innerHTML = originalText; btn.disabled = false;
                }
            });
        }
    </script>
</body>
</html>
`;

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ១. បើលោកគ្រូចុចបើក Link វានឹងបង្ហាញផ្ទាំង HTML
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(ADMIN_HTML);
  }

  // ២. បើលោកគ្រូចុចប៊ូតុង "ផ្ញើ" ពីក្នុង HTML វានឹងដំណើរការកូដបាញ់សារនេះ
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const action = body.action;

      const telegramUsers = await getAllTelegramIds();
      if (telegramUsers.length === 0) return res.status(200).json({ success: false, message: "មិនទាន់មានគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធទេ" });

      let successCount = 0;

      if (action === "broadcast_message") {
        const finalMessage = `📢 <b>សេចក្ដីជូនដំណឹងពីសាលារៀន៖</b>\n\n${body.messageText}`;
        const promises = telegramUsers.map(chatId => sendMessage(chatId, finalMessage));
        const results = await Promise.all(promises);
        return res.status(200).json({ success: true, count: results.filter(Boolean).length });
      }

      if (action === "broadcast_score") {
        const finalMessage = `🔔 <b>ជូនដំណឹងពិន្ទុថ្មីចេញហើយ!</b>\n\nសាលារៀនបានបញ្ចេញលទ្ធផលសិក្សាប្រចាំ <b>ខែ${body.month}</b> ឆ្នាំសិក្សា <b>${body.year}</b> រួចរាល់ហើយ។\n\n👉 សូមចុចប៊ូតុង <b>📊 មើលលទ្ធផលសិក្សា</b> នៅលើ Keyboard ដើម្បីពិនិត្យមើលពិន្ទុ។`;
        const promises = telegramUsers.map(chatId => sendMessage(chatId, finalMessage));
        const results = await Promise.all(promises);
        return res.status(200).json({ success: true, count: results.filter(Boolean).length });
      }

      return res.status(400).json({ success: false, message: "ការបញ្ជាមិនត្រឹមត្រូវ" });

    } catch (error) {
      return res.status(500).json({ success: false, message: "មានបញ្ហានៅលើ Server" });
    }
  }
};

async function getAllTelegramIds() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=telegram_parent,telegram_student`, {
      method: "GET",
      headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" }
    });
    const data = await res.json() || [];
    let allIds = new Set();
    data.forEach(row => {
      if (row.telegram_parent) row.telegram_parent.split(",").forEach(id => { if (id.trim()) allIds.add(id.trim()); });
      if (row.telegram_student) row.telegram_student.split(",").forEach(id => { if (id.trim()) allIds.add(id.trim()); });
    });
    return Array.from(allIds);
  } catch (error) { return []; }
}

async function sendMessage(chatId, text) {
  try { 
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
      method: "POST", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "HTML", disable_web_page_preview: true }) 
    }); 
    const result = await res.json();
    return result.ok;
  } catch (err) { return false; }
}
