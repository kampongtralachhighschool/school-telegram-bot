const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

// កូដ HTML ទាំងមូលត្រូវបានរក្សាទុកក្នុងអថេរនេះ
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

        <div class="tg-bg rounded-xl shadow-sm p-5 border border-gray-100">
            <div class="flex items-center space-x-2 mb-4"><span class="text-xl">📢</span><h2 class="text-lg font-bold">ផ្ញើសារជូនដំណឹងទូទៅ</h2></div>
            
            <textarea id="broadcastText" rows="3" class="tg-input w-full rounded-lg p-3 text-sm resize-none mb-3" placeholder="វាយបញ្ចូលខ្លឹមសារនៅទីនេះ..."></textarea>
            
            <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-blue-700 block mb-1">📎 ភ្ជាប់ឯកសារ (រូបភាព ឬ PDF)</label>
                    <input type="file" id="attachFile" accept="image/*,.pdf" class="tg-input w-full rounded p-2 text-xs bg-white">
                    <p class="text-[10px] text-gray-500 mt-1">* ទំហំឯកសារមិនត្រូវលើសពី 3MB ទេ (ការពារ Server គាំង)</p>
                </div>
                <div>
                    <label class="text-xs font-bold text-blue-700 block mb-1">🔗 ភ្ជាប់ប៊ូតុង Link ពីក្រោមសារ (បើមាន)</label>
                    <div class="flex space-x-2">
                        <input type="text" id="btnText" placeholder="ឈ្មោះប៊ូតុង..." class="tg-input w-1/3 rounded p-2 text-xs">
                        <input type="url" id="btnUrl" placeholder="https://..." class="tg-input w-2/3 rounded p-2 text-xs">
                    </div>
                </div>
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
                    <label class="text-xs font-bold opacity-70">ឆ្នាំសិក្សា (រើស ឬវាយបញ្ចូល)</label>
                    <input list="scoreYearOptions" id="scoreYear" class="tg-input w-full rounded-lg p-3 text-sm" placeholder="ឧ. ២០២៥-២០២៦">
                    <datalist id="scoreYearOptions"></datalist>
                </div>
            </div>
            <button id="btnBroadcastScore" onclick="sendScoreAlert()" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-sm shadow transition-transform active:scale-95 flex justify-center items-center">
                ប្រកាសដំណឹងពិន្ទុ
            </button>
        </div>
    </div>

    <script>
        const API_URL = window.location.href;
        let selectedFileData = null;

        document.addEventListener("DOMContentLoaded", () => {
            promptPassword();
            generateKhmerYears();
        });

        function promptPassword() {
            Swal.fire({
                title: '🔒 តម្រូវឲ្យមានពាក្យសម្ងាត់',
                input: 'password',
                inputPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់ទីនេះ...',
                allowOutsideClick: false, allowEscapeKey: false,
                confirmButtonText: 'ចូលប្រើប្រាស់', confirmButtonColor: '#3b82f6',
                inputValidator: (value) => {
                    if (!value) return 'សូមបញ្ចូលពាក្យសម្ងាត់!';
                    if (value !== 'H@nm@m64') return 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ!';
                }
            }).then((result) => {
                if (result.isConfirmed) document.getElementById('mainContent').style.display = 'block';
            });
        }

        // បម្លែងលេខធម្មតា ទៅលេខខ្មែរ
        function toKhmerNum(numStr) {
            const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
            return numStr.toString().replace(/[0-9]/g, function(d) { return khmerDigits[d]; });
        }

        // បង្កើតឆ្នាំសិក្សាដាក់ក្នុង Datalist (អាចរើសក៏បាន វាយក៏បាន)
        function generateKhmerYears() {
            const dataList = document.getElementById('scoreYearOptions');
            const yearInput = document.getElementById('scoreYear');
            const startYear = 2023; // ចាប់ផ្តើមពី 2023
            let currentYearAuto = new Date().getFullYear();
            
            for (let i = 0; i <= 15; i++) {
                let yearStr = (startYear + i) + '-' + (startYear + i + 1);
                let khmerYearStr = toKhmerNum(yearStr);
                
                let option = document.createElement('option');
                option.value = khmerYearStr;
                dataList.appendChild(option);
                
                // Set default value ឲ្យចំឆ្នាំបច្ចុប្បន្ន
                if ((startYear + i) === currentYearAuto) {
                    yearInput.value = khmerYearStr;
                }
            }
        }

        // ចាប់យក File ពេលមានការ Upload
        document.getElementById('attachFile').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) { selectedFileData = null; return; }
            
            // កំណត់ទំហំ File ត្រឹម 3MB ដើម្បីកុំឱ្យ Vercel លោត Error 500
            if (file.size > 3 * 1024 * 1024) {
                Swal.fire('ឯកសារធំពេក', 'សូមជ្រើសរើសឯកសារទំហំក្រោម 3MB', 'warning');
                this.value = ''; selectedFileData = null; return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                selectedFileData = {
                    name: file.name,
                    mime: file.type,
                    base64: event.target.result.split(',')[1] // កាត់យកតែទិន្នន័យកូដ
                };
            };
            reader.readAsDataURL(file);
        });

        async function sendBroadcastMessage() {
            let text = document.getElementById('broadcastText').value.trim();
            let btnText = document.getElementById('btnText').value.trim();
            let btnUrl = document.getElementById('btnUrl').value.trim();

            if (!text && !selectedFileData) {
                Swal.fire({ icon: 'warning', title: 'សូមបំពេញខ្លឹមសារ ឬភ្ជាប់ឯកសារ', confirmButtonText: 'យល់ព្រម' });
                return;
            }

            Swal.fire({
                title: 'បញ្ជាក់ការផ្ញើសារ', text: "សារនេះនឹងត្រូវបាញ់ទៅកាន់គ្រប់គណនីទាំងអស់។", icon: 'question',
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
                            body: JSON.stringify({ 
                                action: "broadcast_message", 
                                messageText: text,
                                fileData: selectedFileData,
                                btnText: btnText,
                                btnUrl: btnUrl
                            })
                        });
                        let data = await res.json();
                        if(data.success) {
                            Swal.fire('ជោគជ័យ', 'សារត្រូវបានបាញ់ទៅកាន់ ' + data.count + ' គណនីរួចរាល់។', 'success');
                            document.getElementById('broadcastText').value = '';
                            document.getElementById('attachFile').value = '';
                            document.getElementById('btnText').value = '';
                            document.getElementById('btnUrl').value = '';
                            selectedFileData = null;
                        } else { Swal.fire('មានបញ្ហា', data.message || 'មិនអាចបញ្ជូនបាន', 'error'); }
                    } catch(e) { Swal.fire('បរាជ័យ', 'មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ។', 'error'); }
                    btn.innerHTML = originalText; btn.disabled = false;
                }
            });
        }

        async function sendScoreAlert() {
            let month = document.getElementById('scoreMonth').value;
            let year = document.getElementById('scoreYear').value;
            if(!year) return Swal.fire('បំពេញឆ្នាំសិក្សា', 'សូមបញ្ចូលឆ្នាំសិក្សា', 'warning');

            Swal.fire({
                title: 'ប្រកាសដំណឹងពិន្ទុ?', html: 'តើលោកគ្រូពិតជាចង់ប្រកាសដំណឹងលទ្ធផលសិក្សាប្រចាំ <b>ខែ' + month + ' ឆ្នាំ' + year + '</b> មែនទេ?', icon: 'question',
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
                        if(data.success) { Swal.fire('ជោគជ័យ', 'ដំណឹងពិន្ទុត្រូវបានប្រកាសទៅកាន់ ' + data.count + ' គណនីរួចរាល់។', 'success'); } 
                        else { Swal.fire('មានបញ្ហា', data.message || 'មិនអាចបញ្ជូនបាន', 'error'); }
                    } catch(e) { Swal.fire('បរាជ័យ', 'មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ។', 'error'); }
                    btn.innerHTML = originalText; btn.disabled = false;
                }
            });
        }
    </script>
</body>
</html>
`;

// ដោះស្រាយបញ្ហា Error 500 ដោយប្តូរមកប្រើ export default (ដែលត្រូវនឹងប្រព័ន្ធ Vercel ថ្មី)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(ADMIN_HTML);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const action = body.action;

      const telegramUsers = await getAllTelegramIds();
      if (telegramUsers.length === 0) return res.status(200).json({ success: false, message: "មិនទាន់មានគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធទេ" });

      if (action === "broadcast_message") {
        const { messageText, fileData, btnText, btnUrl } = body;
        
        let finalMessage = "";
        if (messageText) {
            finalMessage = `📢 <b>សេចក្ដីជូនដំណឹងពីសាលារៀន៖</b>\n\n${messageText}`;
        } else {
            finalMessage = `📢 <b>សេចក្ដីជូនដំណឹងពីសាលារៀន៖</b>`; 
        }

        let replyMarkup = null;
        if (btnText && btnUrl) {
            replyMarkup = { inline_keyboard: [[{ text: btnText, url: btnUrl }]] };
        }

        const promises = telegramUsers.map(chatId => sendTelegramMessage(chatId, finalMessage, fileData, replyMarkup));
        const results = await Promise.all(promises);
        return res.status(200).json({ success: true, count: results.filter(Boolean).length });
      }

      if (action === "broadcast_score") {
        const finalMessage = `🔔 <b>ជូនដំណឹងពិន្ទុថ្មីចេញហើយ!</b>\n\nសាលារៀនបានបញ្ចេញលទ្ធផលសិក្សាប្រចាំ <b>ខែ${body.month}</b> ឆ្នាំសិក្សា <b>${body.year}</b> រួចរាល់ហើយ。\n\n👉 សូមចុចប៊ូតុង <b>📊 មើលលទ្ធផលសិក្សា</b> នៅលើ Keyboard ដើម្បីពិនិត្យមើលពិន្ទុ។`;
        const promises = telegramUsers.map(chatId => sendTelegramMessage(chatId, finalMessage, null, null));
        const results = await Promise.all(promises);
        return res.status(200).json({ success: true, count: results.filter(Boolean).length });
      }

      return res.status(400).json({ success: false, message: "ការបញ្ជាមិនត្រឹមត្រូវ" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "មានបញ្ហានៅលើ Server" });
    }
  }
}

// ... [រក្សាកូដចាស់ៗពីលើទុកដដែល] ...

      // ពេល Admin ចុចប្រកាសពិន្ទុ
      if (action === "broadcast_score") {
        const telegramUsers = await getAllTelegramUsers(); // ទាញយកទាំង Chat ID និង Student ID
        if (telegramUsers.length === 0) return res.status(200).json({ success: false, message: "គ្មានអ្នកប្រើប្រាស់" });

        let count = 0;
        // ប្រើ for...of ដើម្បីឲ្យវាទាញពិន្ទុសិស្សម្នាក់ៗ រួចផ្ញើ
        for (const user of telegramUsers) {
            // ទាញពិន្ទុផ្ទាល់ខ្លួនរបស់សិស្សម្នាក់ៗ
            const scoreMsg = await buildScoreMessage(user.studentId, body.month, body.year);
            
            if (scoreMsg) { // បើមានពិន្ទុ ទើបផ្ញើ
                const ok = await sendTelegramMessage(user.chatId, scoreMsg, null, null);
                if (ok) count++;
            }
        }
        return res.status(200).json({ success: true, count: count });
      }

      return res.status(400).json({ success: false, message: "ការបញ្ជាមិនត្រឹមត្រូវ" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "មានបញ្ហានៅលើ Server" });
    }
  }
} // បិទ Function handler

// ==========================================
// Function ថ្មីៗដែលត្រូវបន្ថែមពីក្រោម Handler
// ==========================================

// ១. ទាញយកទាំង Chat ID និង Student ID ផ្គូផ្គងគ្នា
async function getAllTelegramUsers() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, {
      method: "GET",
      headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" }
    });
    const data = await res.json() || [];
    let users =[];
    
    data.forEach(row => {
      const stuId = row.student_id;
      if (row.telegram_parent) {
          row.telegram_parent.split(",").forEach(id => { if (id.trim()) users.push({ chatId: id.trim(), studentId: stuId }); });
      }
      if (row.telegram_student) {
          row.telegram_student.split(",").forEach(id => { if (id.trim()) users.push({ chatId: id.trim(), studentId: stuId }); });
      }
    });
    return users; // លទ្ធផល:[{chatId: '123', studentId: '001'}, ...]
  } catch (error) { return[]; }
}

// ២. Function សម្រាប់ទាញយកពិន្ទុពី Supabase និងរៀបចំជាអត្ថបទ (Message)
async function buildScoreMessage(studentId, monthName, academicYear) {
    try {
        const queryUrl = `${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(academicYear)}&month_name=eq.${encodeURIComponent(monthName)}&limit=1`;
        const res = await fetch(queryUrl, {
            headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` }
        });
        const data = await res.json();
        
        if (!data || data.length === 0) return null; // បើអត់មានពិន្ទុខែហ្នឹងទេ រំលង
        
        const scoreData = data[0];
        let msg = `🔔 <b>លទ្ធផលសិក្សាប្រចាំ ខែ${monthName} ចេញហើយ!</b>\n`;
        msg += `-----------------------------------\n`;
        msg += `🎓 ឈ្មោះ៖ <b>${scoreData.student_name || '-'}</b>\n`;
        msg += `🆔 អត្តលេខ៖ <b>${studentId}</b>\n`;
        msg += `🏫 ថ្នាក់ទី៖ <b>${scoreData.grade || '-'}</b>\n\n`;
        
        msg += `📊 <b>ពិន្ទុមុខវិជ្ជា៖</b>\n`;
        // លាក់ column ដែលមិនមែនជាមុខវិជ្ជា
        const excludes =["id", "student_id", "student_name", "gender", "dob", "grade", "month_name", "semester_name", "class_rank", "rank", "average", "avg", "grade_result", "result", "academic_year", "total_score"];
        
        for (const [key, value] of Object.entries(scoreData)) {
            if (!excludes.includes(key.toLowerCase()) && value !== null && value !== "") {
                // ប្រែឈ្មោះអង់គ្លេសទៅខ្មែរ (លោកគ្រូអាចយក TRANSLATIONS ពី webhook មកដាក់បន្ថែមបាន)
                msg += `🔹 ${key.toUpperCase()} : <b>${value}</b>\n`;
            }
        }
        
        msg += `-----------------------------------\n`;
        msg += `📈 <b>សរុបលទ្ធផល៖</b>\n`;
        msg += `• ពិន្ទុសរុប៖ <b>${scoreData.total_score || '-'}</b>\n`;
        msg += `• មធ្យមភាគ៖ <b>${scoreData.average || scoreData.avg || '-'}</b>\n`;
        msg += `• ចំណាត់ថ្នាក់៖ <b>${scoreData.class_rank || scoreData.rank || '-'}</b>\n`;
        
        return msg;
    } catch (err) {
        return null;
    }
}

async function sendTelegramMessage(chatId, text, fileData, replyMarkup) {
  try { 
    let endpoint = 'sendMessage';
    
    if (fileData && fileData.base64) {
        const isPhoto = fileData.mime.startsWith('image/');
        endpoint = isPhoto ? 'sendPhoto' : 'sendDocument';
        
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('caption', text);
        form.append('parse_mode', 'HTML');
        if (replyMarkup) form.append('reply_markup', JSON.stringify(replyMarkup));
        
        // បម្លែង Base64 ដើម្បីប្រើជាមួយ Vercel Fetch API
        const buffer = Buffer.from(fileData.base64, 'base64');
        const blob = new Blob([buffer], { type: fileData.mime });
        form.append(isPhoto ? 'photo' : 'document', blob, fileData.name);
        
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
            method: "POST",
            body: form
        });
        return res.ok;
    } 
    else {
        const payload = { 
            chat_id: chatId, 
            text: text, 
            parse_mode: "HTML", 
            disable_web_page_preview: true 
        };
        if (replyMarkup) payload.reply_markup = replyMarkup;

        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
        }); 
        return res.ok;
    }
  } catch (err) { return false; }
}
