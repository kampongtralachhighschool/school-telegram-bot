const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";
const ADMIN_GROUP_ID = "-1003828714540"; 

const DEFAULT_ACADEMIC_YEAR = "២០២៥-២០២៦"; 

const TRANSLATIONS = {
  "khmer": "ភាសាខ្មែរ", "math": "គណិតវិទ្យា", "mathematics": "គណិតវិទ្យា",
  "physics": "រូបវិទ្យា", "chemistry": "គីមីវិទ្យា", "biology": "ជីវវិទ្យា",
  "earth_science": "ផែនដីវិទ្យា", "earth": "ផែនដីវិទ្យា", "history": "ប្រវត្តិវិទ្យា",
  "geography": "ភូមិវិទ្យា", "morality": "សីលធម៌ ពលរដ្ឋ", "civics": "សីលធម៌ ពលរដ្ឋ",
  "english": "ភាសាអង់គ្លេស", "french": "ភាសាបារាំង", "sport": "អប់រំកាយ",
  "pe": "អប់រំកាយ", "ict": "ព័ត៌មានវិទ្យា", "computer": "កុំព្យូទ័រ",
  "technology": "បច្ចេកវិទ្យា", "health": "សុខភាព", "art": "សិល្បៈ", "agriculture": "កសិកម្ម",
  "skill": "បំណិន"
};

// ==========================================
// Utils Functions
// ==========================================
const KHMER_DIGITS =['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
function toKhmerNum(numStr) { return String(numStr).replace(/[0-9]/g, d => KHMER_DIGITS[d]); }
function toArabicNum(str) {
    let res = "";
    for(let char of str) {
        let idx = KHMER_DIGITS.indexOf(char);
        res += idx !== -1 ? idx : char;
    }
    return res;
}
// បង្រួមឆ្នាំសិក្សាសម្រាប់ដាក់ក្នុង Callback Data ជៀសវាង Telegram Error ទំហំលើស 64 bytes
function compressYear(khmerYear) {
    let arabic = toArabicNum(khmerYear);
    let parts = arabic.split('-');
    if (parts.length === 2) return parts[0].slice(-2) + parts[1].slice(-2);
    return "2526"; 
}
function expandYear(compressed) {
    if (compressed.length === 4) return toKhmerNum(`20${compressed.slice(0, 2)}-20${compressed.slice(2, 4)}`);
    return DEFAULT_ACADEMIC_YEAR;
}

// ==========================================
// 1. កូដ HTML សម្រាប់ផ្ទាំង Admin Panel
// ==========================================
const ADMIN_HTML = `<!DOCTYPE html><html lang="km"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><title>ផ្ទាំងបញ្ជា Admin - Telegram Bot</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&display=swap" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script><style>body { font-family: 'Battambang', sans-serif; background-color: #f3f4f6; color: #1f2937; } .tg-bg { background-color: #ffffff; } .tg-button { background-color: #3b82f6; color: #ffffff; } .tg-input { background-color: #ffffff; color: #1f2937; border: 1px solid #d1d5db; } .tg-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); } #mainContent { display: none; }</style></head><body class="p-4 md:p-6 pb-20"><div id="mainContent" class="max-w-md mx-auto space-y-6"><div class="text-center space-y-2"><h1 class="text-2xl font-bold text-blue-600">គ្រប់គ្រងប្រព័ន្ធតេឡេក្រាម</h1><p class="text-sm opacity-80">ផ្ទាំងគ្រប់គ្រងសម្រាប់តែអ្នកគ្រប់គ្រង (Admin) ប៉ុណ្ណោះ</p></div><div class="tg-bg rounded-xl shadow-sm p-5 border border-gray-100"><div class="flex items-center space-x-2 mb-4"><span class="text-xl">📢</span><h2 class="text-lg font-bold">ផ្ញើសារជូនដំណឹងទូទៅ</h2></div><textarea id="broadcastText" rows="3" class="tg-input w-full rounded-lg p-3 text-sm resize-none mb-3" placeholder="វាយបញ្ចូលខ្លឹមសារនៅទីនេះ..."></textarea><div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 space-y-3"><div><label class="text-xs font-bold text-blue-700 block mb-1">📎 ភ្ជាប់ឯកសារ (រូបភាព ឬ PDF)</label><input type="file" id="attachFile" accept="image/*,.pdf" class="tg-input w-full rounded p-2 text-xs bg-white"></div><div><label class="text-xs font-bold text-blue-700 block mb-1">🔗 ភ្ជាប់ប៊ូតុង Link ពីក្រោមសារ (បើមាន)</label><div class="flex space-x-2"><input type="text" id="btnText" placeholder="ឈ្មោះប៊ូតុង..." class="tg-input w-1/3 rounded p-2 text-xs"><input type="url" id="btnUrl" placeholder="https://..." class="tg-input w-2/3 rounded p-2 text-xs"></div></div></div><button id="btnBroadcastMsg" onclick="sendBroadcastMessage()" class="tg-button w-full py-3 rounded-lg font-bold text-sm shadow transition-transform active:scale-95 flex justify-center items-center">បញ្ជូនសារឥឡូវនេះ</button></div><div class="tg-bg rounded-xl shadow-sm p-5 space-y-4 border border-gray-100"><div class="flex items-center space-x-2"><span class="text-xl">🔔</span><h2 class="text-lg font-bold">ប្រកាសលទ្ធផលសិក្សាសរុប</h2></div><div class="grid grid-cols-2 gap-3"><div class="space-y-1"><label class="text-xs font-bold opacity-70">ខែ ឬ ឆមាស</label><select id="scoreMonth" class="tg-input w-full rounded-lg p-3 text-sm"><option value="វិច្ឆិកា">វិច្ឆិកា</option><option value="ធ្នូ">ធ្នូ</option><option value="មករា">មករា</option><option value="កុម្ភៈ">កុម្ភៈ</option><option value="មីនា">មីនា</option><option value="មេសា">មេសា</option><option value="ប្រឡងឆមាសទី១">ប្រឡងឆមាសទី១</option><option value="ប្រចាំឆមាសទី១">ប្រចាំឆមាសទី១</option></select></div><div class="space-y-1"><label class="text-xs font-bold opacity-70">ឆ្នាំសិក្សា</label><input id="scoreYear" class="tg-input w-full rounded-lg p-3 text-sm" value="២០២៥-២០២៦" readonly></div></div><button id="btnBroadcastScore" onclick="sendScoreAlert()" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-sm shadow transition-transform active:scale-95 flex justify-center items-center">🚀 ទាញទិន្នន័យពី DB ហើយបាញ់ពិន្ទុ</button></div></div><script>const API_URL = window.location.href; let selectedFileData = null; document.addEventListener("DOMContentLoaded", () => { promptPassword(); }); function promptPassword() { Swal.fire({ title: '🔒 ចូលផ្ទាំង Admin', input: 'password', inputPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់ទីនេះ...', allowOutsideClick: false, allowEscapeKey: false, confirmButtonText: 'ចូលប្រើប្រាស់', confirmButtonColor: '#3b82f6', inputValidator: (value) => { if (!value) return 'សូមបញ្ចូលពាក្យសម្ងាត់!'; if (value !== 'H@nm@m64') return 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ!'; } }).then((result) => { if (result.isConfirmed) document.getElementById('mainContent').style.display = 'block'; }); } document.getElementById('attachFile').addEventListener('change', function(e) { const file = e.target.files[0]; if (!file) { selectedFileData = null; return; } if (file.size > 3 * 1024 * 1024) { Swal.fire('ឯកសារធំពេក', 'សូមជ្រើសរើសឯកសារទំហំក្រោម 3MB', 'warning'); this.value = ''; selectedFileData = null; return; } const reader = new FileReader(); reader.onload = function(event) { selectedFileData = { name: file.name, mime: file.type, base64: event.target.result.split(',')[1] }; }; reader.readAsDataURL(file); }); async function sendBroadcastMessage() { let text = document.getElementById('broadcastText').value.trim(); let btnText = document.getElementById('btnText').value.trim(); let btnUrl = document.getElementById('btnUrl').value.trim(); if (!text && !selectedFileData) return Swal.fire({ icon: 'warning', title: 'សូមបំពេញខ្លឹមសារ' }); Swal.fire({ title: 'បញ្ជាក់ការផ្ញើសារ', icon: 'question', showCancelButton: true, confirmButtonText: 'បាទ/ចាស ផ្ញើ', cancelButtonText: 'បោះបង់' }).then(async (result) => { if (result.isConfirmed) { let btn = document.getElementById('btnBroadcastMsg'); btn.innerHTML = "កំពុងបញ្ជូន... ⏳"; btn.disabled = true; try { let res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "broadcast_message", messageText: text, fileData: selectedFileData, btnText, btnUrl }) }); let data = await res.json(); if(data.success) { Swal.fire('ជោគជ័យ', 'សារបានបាញ់ទៅកាន់ ' + data.count + ' គណនីរួចរាល់។', 'success'); document.getElementById('broadcastText').value = ''; } } catch(e) { Swal.fire('បរាជ័យ', 'មិនអាចភ្ជាប់ទៅកាន់ Server', 'error'); } btn.innerHTML = "បញ្ជូនសារឥឡូវនេះ"; btn.disabled = false; } }); } async function sendScoreAlert() { let month = document.getElementById('scoreMonth').value; let year = document.getElementById('scoreYear').value; Swal.fire({ title: 'ប្រកាសដំណឹងពិន្ទុ?', html: 'តើចង់បាញ់លទ្ធផលសិក្សាប្រចាំ <b>ខែ' + month + '</b> មែនទេ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: '🚀 បាញ់ឥឡូវនេះ' }).then(async (result) => { if (result.isConfirmed) { let btn = document.getElementById('btnBroadcastScore'); btn.innerHTML = "កំពុងបញ្ជូន... ⏳"; btn.disabled = true; try { let res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "broadcast_score", month: month, year: year }) }); let data = await res.json(); if(data.success) { Swal.fire('ជោគជ័យ', 'ពិន្ទុត្រូវបានបាញ់ទៅកាន់ ' + data.count + ' គណនីរួចរាល់។', 'success'); } else { Swal.fire('មានបញ្ហា', data.message, 'error'); } } catch(e) { Swal.fire('បរាជ័យ', 'បញ្ហា Server Timeout', 'error'); } btn.innerHTML = "🚀 ទាញទិន្នន័យពី DB ហើយបាញ់ពិន្ទុ"; btn.disabled = false; } }); }</script></body></html>`;

// ==========================================
// 2. Vercel API Handler (Main Entry Point)
// ==========================================
export default async function handler(req, res) {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(ADMIN_HTML);
    }

    if (req.method === 'POST') {
        try {
            const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

            // 🌟 ទទួល Request ពី Admin UI
            if (update.action) {
                const telegramUsers = await getAllTelegramUsers();
                if (telegramUsers.length === 0) return res.status(200).json({ success: false, message: "គ្មានអ្នកភ្ជាប់គណនីទេ" });

                if (update.action === "broadcast_message") {
                    const { messageText, fileData, btnText, btnUrl } = update;
                    let finalMessage = messageText ? `📢 <b>សេចក្ដីជូនដំណឹងពីសាលារៀន៖</b>\n\n${messageText}` : `📢 <b>សេចក្ដីជូនដំណឹងពីសាលារៀន</b>`;
                    let replyMarkup = (btnText && btnUrl) ? { inline_keyboard: [[{ text: btnText, url: btnUrl }]] } : null;

                    const uniqueChatIds = [...new Set(telegramUsers.map(u => u.chatId))];
                    const promises = uniqueChatIds.map(chatId => sendTelegramMessage(chatId, finalMessage, fileData, replyMarkup));
                    await Promise.all(promises);
                    return res.status(200).json({ success: true, count: uniqueChatIds.length });
                }

                if (update.action === "broadcast_score") {
                    let count = 0;
                    const maxRes = await fetch(`${SUPABASE_URL}/rest/v1/max_scores`, { headers: getHeaders() });
                    const allMaxScores = await maxRes.json() ||[];

                    for (const user of telegramUsers) {
                        const scoreMsg = await buildScoreMessage(user.studentId, update.month, update.year, null, null, allMaxScores);
                        if (scoreMsg) {
                            const inlineBtn = { inline_keyboard: [[{ text: "📄 មើលរបាយការណ៍លម្អិតជា PDF", url: `https://www.kp-tralach.org/student.html?id=${user.studentId}&month=${encodeURIComponent(update.month)}` }]] };
                            const ok = await sendTelegramMessage(user.chatId, scoreMsg, null, inlineBtn);
                            if (ok) count++;
                        }
                    }
                    return res.status(200).json({ success: true, count: count });
                }
            }

            // 🌟 ទទួល Webhook ពី Telegram
            if (update.message) {
                await handleMessage(update.message);
            } else if (update.callback_query) {
                await handleCallbackQuery(update.callback_query.message.chat.id, update.callback_query.data);
            }
            
            return res.status(200).send('OK');

        } catch (error) {
            console.error("🔥 Server Error:", error);
            return res.status(500).send('Error');
        }
    }
}

// ==========================================
// 3. Telegram Logic Methods
// ==========================================

async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text || "";
    const isGroup = message.chat.type === 'group' || message.chat.type === 'supergroup';

    // Admin Group Reply
    if (isGroup && String(chatId) === ADMIN_GROUP_ID) {
        if (message.reply_to_message && message.reply_to_message.from.id.toString() === BOT_TOKEN.split(':')[0]) {
            const match = (message.reply_to_message.text || "").match(/ID:\s*(\d+)/); 
            if (match && match[1] && text) await sendTelegramMessage(match[1], `👨‍🏫 <b>ការឆ្លើយតបពីសាលា៖</b>\n\n${text}`);
        }
        return; 
    }

    if (!text || isGroup) return;

    // User Replying to Report
    if (message.reply_to_message && message.reply_to_message.text && message.reply_to_message.text.includes('សរសេរសាររាយការណ៍')) {
        const userName = message.from.first_name || "សិស្ស/អាណាព្យាបាល";
        const forwardText = `📩 <b>មានសាររាយការណ៍ថ្មី</b>\n👤 ឈ្មោះ: ${userName}\n🆔 ID: ${chatId}\n\n📝 <b>ខ្លឹមសារ៖</b>\n${text}\n\n<i>(📌 លោកគ្រូអ្នកគ្រូ សូមចុច Reply លើសារនេះ)</i>`;
        await sendTelegramMessage(ADMIN_GROUP_ID, forwardText);
        await sendTelegramMessage(chatId, "✅ សារត្រូវបានបញ្ជូនរួចរាល់។");
        return;
    }

    // 🌟 Command /start (ប្តូរឲ្យចេញឈ្មោះ ភេទ ថ្នាក់)
    if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const payload = parts[1].split('_'); 
            if (payload.length === 2) {
                const role = payload[0];
                const studentId = payload[1];
                await saveTelegramIdToSupabase(chatId, studentId, role);
                
                const profile = await getStudentProfile(studentId);
                const stuName = profile ? (profile.student_name || "មិនស្គាល់ឈ្មោះ") : "មិនស្គាល់ឈ្មោះ";
                const stuGender = profile ? (profile.gender || "-") : "-";
                const stuDob = profile ? (profile.dob || "-") : "-";
                const stuGrade = profile ? (profile.grade || "-") : "-";
                const roleText = role === "parent" ? "អាណាព្យាបាល" : "សិស្ស";
                
                const welcomeText = `🎉 <b>ការភ្ជាប់គណនីទទួលបានជោគជ័យ!</b>\n\n` +
                                    `លោកអ្នកបានភ្ជាប់ជា <b>${roleText}</b> សម្រាប់សិស្ស៖\n` +
                                    `👤 ឈ្មោះ៖ <b>${stuName}</b>\n` +
                                    `👫 ភេទ៖ <b>${stuGender}</b>\n` +
                                    `📅 ថ្ងៃខែឆ្នាំកំណើត៖ <b>${stuDob}</b>\n` +
                                    `🏫 ថ្នាក់ទី៖ <b>${stuGrade}</b>\n\n` +
                                    `👇 សូមប្រើប្រាស់ប៊ូតុងម៉ឺនុយខាងក្រោម៖`;
                
                await sendTelegramMessage(chatId, welcomeText, null, getMainKeyboard());
                return;
            }
        }
        await sendTelegramMessage(chatId, "សូមស្វាគមន៍មកកាន់ប្រព័ន្ធវិទ្យាល័យ ហ៊ុន សែន កំពង់ត្រឡាច។", null, getMainKeyboard());
    } 
    // Button Clicks via Text
    else if (text === '📊 មើលលទ្ធផលសិក្សា') {
        const linkedIds = await getLinkedStudentIds(chatId);
        if (linkedIds.length === 0) {
            await sendTelegramMessage(chatId, "⚠️ លោកអ្នកមិនទាន់បានភ្ជាប់គណនីសិស្សទេ។ សូមចូលទៅកាន់គេហទំព័រ ដើម្បីភ្ជាប់។");
        } else if (linkedIds.length === 1) {
            await handleShowYears(chatId, linkedIds[0]);
        } else {
            let buttons =[];
            for (let sid of linkedIds) {
                const profile = await getStudentProfile(sid);
                const name = (profile && profile.student_name) ? profile.student_name : "មិនស្គាល់ឈ្មោះ";
                buttons.push([{"text": `👤 ${name} (${sid})`, "callback_data": `SELECTSTU_${sid}`}]);
            }
            await sendTelegramMessage(chatId, "👥 លោកអ្នកមានសិស្សភ្ជាប់ច្រើននាក់ សូមជ្រើសរើស៖", null, { inline_keyboard: buttons });
        }
    } 
    else if (text === '🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ') {
        await sendLinksMenu(chatId);
    } 
    else if (text === '📩 រាយការណ៍ ឬប្ដឹងតវ៉ា') {
        await sendTelegramMessage(chatId, "✍️ សូមសរសេរសាររាយការណ៍របស់អ្នកនៅទីនេះ ហើយចុច Send៖", null, { force_reply: true, selective: true });
    }
}

// --------------------------------------------------------------------------------
// 4. Callback Query Logic (Inline Buttons Flow)
// --------------------------------------------------------------------------------
async function handleCallbackQuery(chatId, actionData) {
    const parts = actionData.split("_");
    const action = parts[0]; 

    // ជំហានទី១៖ រើសសិស្ស រួចបង្ហាញឆ្នាំសិក្សា
    if (action === "SELECTSTU") {
        const studentId = parts[1];
        await handleShowYears(chatId, studentId);
    }
    // ជំហានទី២៖ រើសឆ្នាំសិក្សា រួចបង្ហាញប្រភេទ (ខែ ឆមាស...)
    else if (action === "SYEAR") {
        const studentId = parts[1];
        const year = expandYear(parts[2]);
        await sendCategoryMenu(chatId, studentId, year);
    }
    // ជំហានទី៣៖ រើសប្រភេទ រួចបង្ហាញជម្រើសខែ/ឆមាសពិតប្រាកដ
    else if (action === "STYPE") {
        const studentId = parts[1];
        const year = expandYear(parts[2]);
        const type = parts[3];

        if (type === 'a') {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/annual_scores?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(year)}&select=id`, { headers: getHeaders() });
            const data = await res.json() ||[];
            if (data.length > 0) {
                await handleShowRecord(chatId, 'an', data[0].id, year);
            } else {
                await sendTelegramMessage(chatId, `📌 មិនទាន់មានលទ្ធផលប្រចាំឆ្នាំសម្រាប់ឆ្នាំ ${year} ទេ។`);
            }
            return;
        }

        let table = type === 'm' ? 'student_scores' : 'semester_scores';
        let col = type === 'm' ? 'month_name' : 'semester_name';

        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(year)}&select=id,${col}&order=id.desc`, { headers: getHeaders() });
        const data = await res.json() ||[];

        let records = data;
        if (type === 'm') {
            records = records.filter(r => r[col] && !r[col].includes('ឆមាស') && !r[col].includes('ឆ្នាំ'));
        } else if (type === 'es') {
            records = records.filter(r => r[col] && r[col].includes('ប្រឡង'));
        } else if (type === 's') {
            records = records.filter(r => r[col] && r[col].includes('ប្រចាំឆមាស') && !r[col].includes('ប្រឡង'));
        }

        if (records.length === 0) return sendTelegramMessage(chatId, `📌 មិនទាន់មានទិន្នន័យសម្រាប់ជម្រើសនេះទេ។`);

        let buttons =[];
        let tableCode = type === 'm' ? 'st' : 'sm';
        
        // លុបឈ្មោះខែស្ទួន ទុកតែចុងក្រោយ
        let uniqueRecords =[];
        let seenPeriods = new Set();
        records.forEach(r => {
            if (!seenPeriods.has(r[col])) {
                seenPeriods.add(r[col]);
                uniqueRecords.push(r);
            }
        });

        uniqueRecords.forEach(r => {
            buttons.push([{"text": `👉 ${r[col]}`, "callback_data": `SREC_${tableCode}_${r.id}` }]);
        });
        buttons.push([{"text": "🔙 ត្រឡប់ក្រោយ", "callback_data": `SELECTSTU_${studentId}`}]);

        await sendTelegramMessage(chatId, `👇 <b>សូមជ្រើសរើស៖</b>`, null, { "inline_keyboard": buttons });
    }
    // ជំហានទី៤៖ ទាញពិន្ទុបង្ហាញ
    else if (action === "SREC") {
        const tableCode = parts[1];
        const recordId = parts[2];
        await handleShowRecord(chatId, tableCode, recordId);
    }
}

async function handleShowYears(chatId, studentId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&select=academic_year`, { headers: getHeaders() });
    const data = await res.json() || [];
    let years =[...new Set(data.map(r => r.academic_year))].filter(Boolean).sort().reverse();
    
    if (years.length === 0) years = [DEFAULT_ACADEMIC_YEAR];

    const profile = await getStudentProfile(studentId);
    const stuName = profile ? (profile.student_name || "មិនស្គាល់ឈ្មោះ") : "មិនស្គាល់ឈ្មោះ";

    if (years.length === 1) {
        await sendCategoryMenu(chatId, studentId, years[0], stuName);
    } else {
        let buttons =[];
        years.forEach(y => buttons.push([{"text": `📅 ឆ្នាំសិក្សា ${y}`, "callback_data": `SYEAR_${studentId}_${compressYear(y)}`}]));
        await sendTelegramMessage(chatId, `🎓 <b>សូមជ្រើសរើសឆ្នាំសិក្សា</b>\n👤 សិស្ស៖ ${stuName}`, null, { inline_keyboard: buttons });
    }
}

async function sendCategoryMenu(chatId, studentId, year, stuName) {
    const yearCode = compressYear(year);
    if (!stuName) {
        const profile = await getStudentProfile(studentId);
        stuName = profile ? (profile.student_name || "មិនស្គាល់ឈ្មោះ") : "មិនស្គាល់ឈ្មោះ";
    }

    const inlineKeyboard = {
        "inline_keyboard": [[{"text": "📅 លទ្ធផលប្រចាំខែ", "callback_data": `STYPE_${studentId}_${yearCode}_m`}],[{"text": "📝 លទ្ធផលប្រឡងឆមាស", "callback_data": `STYPE_${studentId}_${yearCode}_es`}],[{"text": "🌓 លទ្ធផលប្រចាំឆមាស", "callback_data": `STYPE_${studentId}_${yearCode}_s`}],[{"text": "🏆 លទ្ធផលប្រចាំឆ្នាំ", "callback_data": `STYPE_${studentId}_${yearCode}_a`}]
        ]
    };
    await sendTelegramMessage(chatId, `🎯 <b>សូមជ្រើសរើសប្រភេទពិន្ទុ</b>\n👤 សិស្ស៖ ${stuName}\n📅 ឆ្នាំសិក្សា៖ ${year}`, null, inlineKeyboard);
}

// --------------------------------------------------------------------------------
// 5. Supabase Helper Methods & Score Formatting
// --------------------------------------------------------------------------------

function getHeaders() {
    return { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" };
}

async function getStudentProfile(studentId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&order=id.desc&limit=1`, { headers: getHeaders() });
    const data = await res.json();
    if (data && data.length > 0) return data[0];
  } catch (err) {}
  return null;
}

async function getAllTelegramUsers() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, { method: "GET", headers: getHeaders() });
      const data = await res.json() ||[];
      let users =[];
      data.forEach(row => {
        if (row.telegram_parent) row.telegram_parent.split(",").forEach(id => { if (id.trim()) users.push({ chatId: id.trim(), studentId: row.student_id }); });
        if (row.telegram_student) row.telegram_student.split(",").forEach(id => { if (id.trim()) users.push({ chatId: id.trim(), studentId: row.student_id }); });
      });
      return users; 
    } catch (error) { return[]; }
}

async function getLinkedStudentIds(chatId) {
    const strId = String(chatId);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, { headers: getHeaders() });
    const data = await res.json() ||[];
    let linkedIds =[];
    data.forEach(row => {
      if ((row.telegram_parent || "").includes(strId) || (row.telegram_student || "").includes(strId)) {
          if (row.student_id) linkedIds.push(row.student_id);
      }
    });
    return [...new Set(linkedIds)].filter(id => id.trim() !== "");
}

async function saveTelegramIdToSupabase(chatId, studentId, role) {
    const targetColumn = (role === "parent") ? "telegram_parent" : "telegram_student";
    const getUrl = `${SUPABASE_URL}/rest/v1/telegram_db?student_id=eq.${studentId}`;
    try {
      const getRes = await fetch(getUrl, { method: "GET", headers: getHeaders() });
      const data = await getRes.json();
      if (data && data.length > 0) {
        const existingIds = data[0][targetColumn] || "";
        const idArray = existingIds ? existingIds.split(",") :[];
        if (!idArray.includes(String(chatId))) {
          idArray.push(String(chatId));
          await fetch(getUrl, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({[targetColumn]: idArray.join(",") }) });
        }
      } else {
        await fetch(`${SUPABASE_URL}/rest/v1/telegram_db`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ "student_id": studentId, [targetColumn]: String(chatId) }) });
      }
    } catch (err) { console.error(err); }
}

function getGradeConfig(gradeStr) {
    let gradeLvl = 10;
    let classType = 'General';
    const gStr = String(gradeStr || "").toUpperCase();
    const m = gStr.match(/\d+/);
    if (m) gradeLvl = parseInt(m[0], 10);
    
    if (gradeLvl >= 11) {
        if (gStr.includes("SS") || gStr.includes("សង្គម") || gStr.includes("ស")) {
            classType = "SS";
        } else {
            classType = "SC";
        }
    }
    return { gradeLvl, classType };
}

// ទាញយកពិន្ទុ ដោយប្រើ Record ID (កុំឲ្យ Error Callback Query)
async function handleShowRecord(chatId, tableCode, recordId, forcedYear = null) {
    let table = tableCode === 'st' ? 'student_scores' : (tableCode === 'sm' ? 'semester_scores' : 'annual_scores');
    let periodCol = tableCode === 'st' ? 'month_name' : (tableCode === 'sm' ? 'semester_name' : 'academic_year');

    const maxRes = await fetch(`${SUPABASE_URL}/rest/v1/max_scores`, { headers: getHeaders() });
    const allMaxScores = await maxRes.json() ||[];

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${recordId}`, { headers: getHeaders() });
    const data = await res.json();

    if (!data || data.length === 0) return sendTelegramMessage(chatId, "រកមិនឃើញទិន្នន័យ។");

    const s = data[0];
    const periodName = s[periodCol] || 'ប្រចាំឆ្នាំ';
    const academicYear = forcedYear || s.academic_year;

    const msg = formatScoreMessage(s, periodName, academicYear, allMaxScores, tableCode);
    
    const inlineBtn = { inline_keyboard: [[{ text: "📄 មើលរបាយការណ៍លម្អិតជា PDF", url: `https://www.kp-tralach.org/student.html?id=${s.student_id}&month=${encodeURIComponent(periodName)}` }]] };
    
    await sendTelegramMessage(chatId, msg, null, inlineBtn);
}

// 🌟 ប្រើសម្រាប់ Broadcast Score ពី Admin ផងដែរ
async function buildScoreMessage(studentId, periodName, academicYear, table = null, colName = null, allMaxScores =[]) {
    let t = table || (periodName.includes('ឆមាស') ? 'semester_scores' : 'student_scores');
    let c = colName || (periodName.includes('ឆមាស') ? 'semester_name' : 'month_name');

    try {
        const queryUrl = `${SUPABASE_URL}/rest/v1/${t}?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(academicYear)}&${c}=eq.${encodeURIComponent(periodName)}&limit=1`;
        const res = await fetch(queryUrl, { headers: getHeaders() });
        const data = await res.json();
        if (!data || data.length === 0) return null; 
        
        let tableCode = t === 'student_scores' ? 'st' : (t === 'semester_scores' ? 'sm' : 'an');
        return formatScoreMessage(data[0], periodName, academicYear, allMaxScores, tableCode);
    } catch (err) { return null; }
}

// 🌟 បំប្លែងទិន្នន័យឲ្យចេញជា Message យ៉ាងស្អាត តាមទម្រង់ (ខែ, ប្រឡងឆមាស, ប្រចាំឆមាស, ឆ្នាំ)
function formatScoreMessage(s, periodName, academicYear, allMaxScores, tableCode) {
    const config = getGradeConfig(s.grade);
    const studentMaxScores = allMaxScores.find(mx => mx.grade_level == config.gradeLvl && mx.class_type == config.classType) || {};

    let msg = `🎓 <b>លទ្ធផលសិក្សា ${periodName}</b>\n`;
    msg += `👤 ឈ្មោះសិស្ស៖ <b>${s.student_name || '-'}</b>\n`;
    msg += `🏫 ថ្នាក់ទី៖ <b>${s.grade || '-'}</b>\n`;
    msg += `📅 ឆ្នាំសិក្សា៖ <b>${academicYear}</b>\n`;
    msg += `➖➖➖➖➖➖➖➖➖➖\n`;
    
    const subjects =["khmer", "math", "physics", "chemistry", "biology", "history", "geography", "morality", "earth_science", "english", "sport", "agriculture", "technology", "skill", "health"];
    
    subjects.forEach(sub => {
        if (s[sub] !== null && s[sub] !== undefined && String(s[sub]).trim() !== "") {
            let scoreVal = parseFloat(s[sub]);
            let gradeStr = "";
            if (!isNaN(scoreVal)) {
                let maxVal = parseFloat(studentMaxScores[sub]);
                if (isNaN(maxVal) || maxVal <= 0) maxVal = 50; 
                let p = (scoreVal / maxVal) * 100; 
                gradeStr = (p>=90?'A':p>=80?'B':p>=70?'C':p>=60?'D':p>=50?'E':'F');
                msg += `▪️ ${TRANSLATIONS[sub] || sub} ៖ <b>${scoreVal}</b> (${gradeStr})\n`;
            } else {
                 msg += `▪️ ${TRANSLATIONS[sub] || sub} ៖ <b>${s[sub]}</b>\n`;
            }
        }
    });
    
    msg += `➖➖➖➖➖➖➖➖➖➖\n`;
    
    if (periodName.includes('ប្រចាំឆមាស')) {
        const examAvg = parseFloat(s.exam_average || 0).toFixed(2);
        const monthlyAvg = parseFloat(s.monthly_average || 0).toFixed(2);
        const semAvg = parseFloat(s.semester_average || s.average || 0).toFixed(2);
        
        msg += `📈 ម.ភ ប្រឡងឆមាស៖ <b>${examAvg}</b>\n`;
        msg += `📈 ម.ភ ខែក្នុងឆមាស៖ <b>${monthlyAvg}</b>\n`;
        msg += `🌟 មធ្យមភាគប្រចាំឆមាស៖ <b>${semAvg}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់ថ្នាក់៖ <b>${s.class_rank || '-'}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់សាលា៖ <b>${s.school_rank || '-'}</b>\n`;
        msg += `🏅 និទ្ទេសរួម៖ <b>${s.grade_result || s.final_result || '-'}</b>\n\n`;
    } else if (periodName.includes('ប្រឡងឆមាស')) {
        const total = Math.round(s.exam_total_score || s.total_score || 0);
        const examAvg = parseFloat(s.exam_average || s.average || 0).toFixed(2);
        msg += `📊 ពិន្ទុសរុប៖ <b>${total}</b>\n`;
        msg += `📈 មធ្យមភាគប្រឡង៖ <b>${examAvg}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់ថ្នាក់៖ <b>${s.class_rank || '-'}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់សាលា៖ <b>${s.school_rank || '-'}</b>\n`;
        msg += `🏅 និទ្ទេសរួម៖ <b>${s.grade_result || s.final_result || '-'}</b>\n\n`;
    } else if (periodName === 'ប្រចាំឆ្នាំ' || tableCode === 'an') {
        const s1Avg = parseFloat(s.sem1_average || 0).toFixed(2);
        const s2Avg = parseFloat(s.sem2_average || 0).toFixed(2);
        const annualAvg = parseFloat(s.annual_average || s.average || 0).toFixed(2);
        msg += `📈 ម.ភ ឆមាសទី១៖ <b>${s1Avg}</b>\n`;
        msg += `📈 ម.ភ ឆមាសទី២៖ <b>${s2Avg}</b>\n`;
        msg += `🌟 មធ្យមភាគប្រចាំឆ្នាំ៖ <b>${annualAvg}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់ថ្នាក់៖ <b>${s.class_rank || '-'}</b>\n`;
        msg += `🏅 និទ្ទេសរួម៖ <b>${s.grade_result || s.final_result || '-'}</b>\n\n`;
    } else {
        const total = Math.round(s.total_score || 0);
        const average = parseFloat(s.average || 0).toFixed(2);
        msg += `📊 ពិន្ទុសរុប៖ <b>${total}</b>\n`;
        msg += `📈 មធ្យមភាគ៖ <b>${average}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់ថ្នាក់៖ <b>${s.class_rank || '-'}</b>\n`;
        msg += `🏆 ចំណាត់ថ្នាក់សាលា៖ <b>${s.school_rank || '-'}</b>\n`;
        msg += `🏅 និទ្ទេសរួម៖ <b>${s.grade_result || s.final_result || '-'}</b>\n\n`;
    }
    
    msg += `<i>សូមចុចប៊ូតុងខាងក្រោម ដើម្បីមើលការវិភាគដោយ AI។</i>`;
    return msg;
}

// --------------------------------------------------------------------------------
// 6. បណ្ដាញទំនាក់ទំនងសាលារៀន (ភ្ជាប់រូបភាព និង Button)
// --------------------------------------------------------------------------------
async function sendLinksMenu(chatId) {
    const photoUrl = "https://i.ibb.co/n8fZ33D6/photo-2025-12-25-15-56-18.jpg";
    const caption = "🌐 <b>បណ្ដាញទំនាក់ទំនង និង ឯកសារសាលារៀន</b>\n\nសូមជ្រើសរើសតំណភ្ជាប់ខាងក្រោមដើម្បីទទួលបានព័ត៌មាន និងសេវាកម្មបន្ថែម៖";
    
    const inlineKeyboard = {
        "inline_keyboard": [[{"text": "📄 ទាញយកឯកលទ្ធផលសិស្សទាំងអស់ជា PDF", "url": "https://www.kp-tralach.org/student.html"}],[{"text": "📈 មុខងារវិភាគបាក់ឌុប (ទី១១-១២)", "url": "https://www.kp-tralach.org/bac2.html"}],[{"text": "🌐 ចូលទស្សនាគេហទំព័រសាលារៀន", "url": "https://www.kp-tralach.org"}],[{"text": "👥 ភ្ជាប់ទំនាក់ទំនងក្រុមអ្នកអាណាព្យាបាល", "url": "https://t.me/+HgeqMiuiyy8yMDRl"}],[{"text": "📘 បណ្ដាញហ្វេសប៊ុកសាលារៀន", "url": "https://www.facebook.com/share/1aWBeaRLMM/"}],[{"text": "🎵 បណ្ដាញតិកតុកសាលារៀន", "url": "https://www.tiktok.com/@hunsenkampongtralach?_r=1&_t=ZS-94avuE7Osuz"}],[{"text": "▶️ បណ្ដាញយូធូបសាលារៀន", "url": "https://youtube.com/channel/UC_Ke8cGr0nMKqxsQfBpReFQ?si=JPxa0xq0INTzOdEo"}]
        ]
    };
    
    await sendTelegramMessage(chatId, caption, { url: photoUrl, mime: 'image/jpeg', name: 'school.jpg' }, inlineKeyboard);
}

function getMainKeyboard() {
    return { 
      keyboard: [[{"text": "📊 មើលលទ្ធផលសិក្សា"}],[{"text": "🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ"}],[{"text": "📩 រាយការណ៍ ឬប្ដឹងតវ៉ា"}]], 
      resize_keyboard: true, 
      is_persistent: true 
    };
}

async function sendTelegramMessage(chatId, text, fileData = null, replyMarkup = null) {
    try { 
      let endpoint = 'sendMessage';
      
      // បើមាន File ភ្ជាប់មកជាមួយ (ដូចជារូបភាព Menu)
      if (fileData && (fileData.base64 || fileData.url)) {
          endpoint = 'sendPhoto';
          const payload = {
              chat_id: chatId,
              photo: fileData.url || fileData.base64,
              caption: text,
              parse_mode: "HTML"
          };
          if (replyMarkup) payload.reply_markup = replyMarkup;
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, { 
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) 
          });
          return true;
      } 
      else {
          const payload = { chat_id: chatId, text: text, parse_mode: "HTML", disable_web_page_preview: true };
          if (replyMarkup) payload.reply_markup = replyMarkup;
  
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, { 
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) 
          }); 
          return true;
      }
    } catch (err) { return false; }
}
