// api/webhook.js

const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; // ដាក់ Token របស់លោកគ្រូ
const ADMIN_GROUP_ID = "-1003828714540"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

const DEFAULT_ACADEMIC_YEAR = "2025-2026";

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

const EXCLUDE_COLUMNS =[
  "id", "student_id", "student_name", "gender", "dob", "grade", "month_name", 
  "semester_name", "class_rank", "rank", "average", "avg", "grade_result", "result", 
  "academic_year", "created_at", "updated_at", "date_solar", "date_lunar"
];

const SUMMARY_COLUMNS =[
  "total_score", "school_rank", "exam_total_score", "exam_average", 
  "exam_rank", "monthly_average", "semester_average"
];

// --------------------------------------------------------------------------------

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            
            // ប្រសិនបើជាការបញ្ជា Broadcast ពិន្ទុពី System
            if (update.action === 'broadcast_score') {
                await handleBroadcastAllScores(update.month, update.year);
                return res.status(200).json({ success: true });
            }

            if (update.message) {
                await handleMessage(update.message);
            } else if (update.callback_query) {
                const chatId = update.callback_query.message.chat.id;
                const actionData = update.callback_query.data;
                await handleCallbackQuery(chatId, actionData);
            }
            
            res.status(200).send('OK');
        } catch (error) {
            console.error("🔥 Webhook Error:", error);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('🟢 Bot កំពុងដំណើរការយ៉ាងរលូន! (ES Module Active)');
    }
}

// --------------------------------------------------------------------------------

async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text;
    const isGroup = message.chat.type === 'group' || message.chat.type === 'supergroup';

    if (isGroup && String(chatId) === ADMIN_GROUP_ID) {
        if (message.reply_to_message && message.reply_to_message.from.id.toString() === BOT_TOKEN.split(':')[0]) {
            const botText = message.reply_to_message.text || "";
            const match = botText.match(/ID:\s*(\d+)/); 
            if (match && match[1] && text) {
                const originalUserId = match[1];
                await sendMessage(originalUserId, `👨‍🏫 <b>ការឆ្លើយតបពីសាលា៖</b>\n\n${text}`);
            }
        }
        return; 
    }

    if (!text || isGroup) return;

    if (message.reply_to_message && message.reply_to_message.text && message.reply_to_message.text.includes('សូមសរសេរសាររាយការណ៍')) {
        const userName = message.from.first_name || "សិស្ស/អាណាព្យាបាល";
        const forwardText = `📩 <b>មានសាររាយការណ៍ថ្មី</b>\n👤 ឈ្មោះ: ${userName}\n🆔 ID: ${chatId}\n\n📝 <b>ខ្លឹមសារ៖</b>\n${text}\n\n<i>(📌 របៀបតប៖ លោកគ្រូអ្នកគ្រូ សូមចុច Reply លើសារមួយនេះ)</i>`;
        
        await sendMessage(ADMIN_GROUP_ID, forwardText);
        await sendMessage(chatId, "✅ សាររបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់គណៈគ្រប់គ្រងសាលារួចរាល់។");
        return;
    }

    // 🌟 ការភ្ជាប់ Telegram ពី Link
    if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const payload = parts[1].split('_'); 
            if (payload.length === 2) {
                const role = payload[0];
                const studentId = payload[1];
                await saveTelegramIdToSupabase(chatId, studentId, role);
                await sendMessage(chatId, `🎉 ការភ្ជាប់គណនីទទួលបានជោគជ័យ!\nអត្តលេខ៖ <b>${studentId}</b>`, getMainKeyboard());
                await sendScoreMenu(chatId, studentId);
                return;
            }
        }
        await sendMessage(chatId, "សួស្ដី! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធតេឡេក្រាមរបស់សាលា។\nសូមជ្រើសរើសម៉ឺនុយខាងក្រោម៖", getMainKeyboard());
    } 
    else if (text === '📊 មើលលទ្ធផលសិក្សា') {
        const linkedIds = await getLinkedStudentIds(chatId);
        if (linkedIds.length === 0) {
            await sendMessage(chatId, "⚠️ លោកអ្នកមិនទាន់បានភ្ជាប់គណនីសិស្សទេ។ សូមចូលទៅកាន់គេហទំព័រ ដើម្បីភ្ជាប់។");
        } else if (linkedIds.length === 1) {
            await sendScoreMenu(chatId, linkedIds[0]);
        } else {
            let buttons =[];
            for(let sid of linkedIds) {
                const profile = await getStudentProfile(sid);
                const name = profile ? profile.student_name : sid;
                buttons.push([{"text": `👤 ${name} (${sid})`, "callback_data": `SELECTSTU_${sid}`}]);
            }
            await sendMessage(chatId, "👥 លោកអ្នកមានសិស្សភ្ជាប់ច្រើននាក់ សូមជ្រើសរើស៖", { "inline_keyboard": buttons });
        }
    } 
    else if (text === '🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ') {
        await sendLinksMenu(chatId);
    } 
    else if (text === '📩 រាយការណ៍ ឬប្ដឹងតវ៉ា') {
        const payload = {
            chat_id: chatId,
            text: "✍️ សូមសរសេរសាររាយការណ៍របស់អ្នកនៅទីនេះ ហើយចុច Send មកសាលានឹងទទួលបាន (រក្សាការសម្ងាត់)៖",
            reply_markup: { force_reply: true, selective: true }
        };
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN.trim()}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } 
    else {
        if (!isNaN(text.trim())) {
            const studentId = text.trim();
            await sendScoreMenu(chatId, studentId);
        } else {
            await sendMessage(chatId, "សូមជ្រើសរើសម៉ឺនុយខាងក្រោម ឬវាយបញ្ចូលអត្តលេខសិស្សដើម្បីមើលពិន្ទុ។", getMainKeyboard());
        }
    }
}

// --------------------------------------------------------------------------------

async function getStudentProfile(studentId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&order=id.desc&limit=1`, { headers: getHeaders() });
    const data = await res.json();
    if (data && data.length > 0) return data[0];
  } catch (err) {}
  return null;
}

async function handleCallbackQuery(chatId, actionData) {
  const parts = actionData.split("_");
  const action = parts[0]; 
  const studentId = parts[1];

  const profile = await getStudentProfile(studentId);
  const activeYear = (profile && profile.academic_year) ? profile.academic_year : DEFAULT_ACADEMIC_YEAR;

  if (action === "SELECTSTU") {
      await sendScoreMenu(chatId, studentId);
  }
  else if (action === "LISTMONTHS") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(activeYear)}&select=month_name&order=id.desc`, { headers: getHeaders() });
    const data = await res.json() || [];
    const months =[...new Set(data.map(r => r.month_name))].filter(Boolean);
    
    if (months.length === 0) return sendMessage(chatId, `📌 មិនទាន់មានពិន្ទុខែសម្រាប់ឆ្នាំសិក្សា <b>${activeYear}</b> ទេ។`);
    
    let buttons =[];
    months.forEach(m => buttons.push([{"text": `📅 ខែ ${m}`, "callback_data": `SHOWMONTH_${studentId}_${m}`}]));
    await sendMessage(chatId, `👇 <b>សូមជ្រើសរើសខែ៖</b>`, { "inline_keyboard": buttons });
  } 
  else if (action === "SHOWMONTH") {
    const monthName = parts[2];
    await displayScore(chatId, studentId, "student_scores", "ពិន្ទុប្រចាំខែ", "month_name", monthName, profile, activeYear);
  }
  else if (action === "LISTSEMS") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/semester_scores?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(activeYear)}&select=semester_name&order=id.desc`, { headers: getHeaders() });
    const data = await res.json() || [];
    const sems =[...new Set(data.map(r => r.semester_name))].filter(Boolean);
    
    if (sems.length === 0) return sendMessage(chatId, `📌 មិនទាន់មានពិន្ទុឆមាសសម្រាប់ឆ្នាំសិក្សា <b>${activeYear}</b> ទេ។`);
    
    let buttons =[];
    sems.forEach(s => buttons.push([{"text": `🌓 ${s}`, "callback_data": `SHOWSEM_${studentId}_${s}`}]));
    await sendMessage(chatId, `👇 <b>សូមជ្រើសរើសឆមាស៖</b>`, { "inline_keyboard": buttons });
  }
  else if (action === "SHOWSEM") {
    const semName = parts[2];
    await displayScore(chatId, studentId, "semester_scores", "លទ្ធផលឆមាស", "semester_name", semName, profile, activeYear);
  }
  else if (action === "YEAR") {
    await displayScore(chatId, studentId, "annual_scores", "លទ្ធផលប្រចាំឆ្នាំ", null, null, profile, activeYear);
  }
}

async function displayScore(chatId, studentId, tableName, title, periodCol, periodName, profile, activeYear) {
  let queryUrl = `${SUPABASE_URL}/rest/v1/${tableName}?student_id=eq.${studentId}&academic_year=eq.${encodeURIComponent(activeYear)}`;
  if (periodCol && periodName) queryUrl += `&${periodCol}=eq.${encodeURIComponent(periodName)}`;
  queryUrl += `&order=id.desc&limit=1`;

  try {
      const res = await fetch(queryUrl, { headers: getHeaders() });
      const data = await res.json() ||[];

      if (data.length === 0) {
        await sendMessage(chatId, `📌 មិនទាន់មានទិន្នន័យនៅឡើយទេ។`); return;
      }

      const latestData = data[0]; 
      const actualPeriodName = periodName || 'ប្រចាំឆ្នាំ';
      
      let msgText = formatDetailedScoreMessage(latestData, actualPeriodName, activeYear);

      const webUrl = `https://www.kp-tralach.org/student.html?id=${studentId}&month=${encodeURIComponent(actualPeriodName)}`;
      const inlineBtn = { "inline_keyboard": [[{"text": "📄 មើលរបាយការណ៍លម្អិតជា PDF", "url": webUrl}]] };

      await sendMessage(chatId, msgText, inlineBtn);

  } catch (err) {
      await sendMessage(chatId, "❌ មានបញ្ហាក្នុងការទាញយកពិន្ទុពីប្រព័ន្ធ។");
  }
}

// --------------------------------------------------------------------------------
// 🌟 មុខងារ Broadcast ជូនគ្រប់គ្នា
// --------------------------------------------------------------------------------
async function handleBroadcastAllScores(month, year) {
    const isSemester = month.includes('ឆមាស');
    const table = isSemester ? 'semester_scores' : 'student_scores';
    const col = isSemester ? 'semester_name' : 'month_name';

    const tgRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, { headers: getHeaders() });
    const tgData = await tgRes.json() ||[];

    const scoreRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}?academic_year=eq.${encodeURIComponent(year)}&${col}=eq.${encodeURIComponent(month)}&limit=3000`, { headers: getHeaders() });
    const scoreData = await scoreRes.json() ||[];

    const scoreMap = {};
    scoreData.forEach(s => { scoreMap[s.student_id] = s; });

    let promises =[];
    
    tgData.forEach(tgRecord => {
        const sid = tgRecord.student_id;
        const score = scoreMap[sid];

        if (score) {
            let chatIds =[];
            if (tgRecord.telegram_parent) chatIds.push(...tgRecord.telegram_parent.split(',').map(id => id.trim()).filter(Boolean));
            if (tgRecord.telegram_student) chatIds.push(...tgRecord.telegram_student.split(',').map(id => id.trim()).filter(Boolean));
            chatIds = [...new Set(chatIds)]; 

            if (chatIds.length > 0) {
                const msgText = formatDetailedScoreMessage(score, month, year);
                const inlineBtn = { 
                    "inline_keyboard": [[{"text": "📄 មើលរបាយការណ៍លម្អិតជា PDF", "url": `https://www.kp-tralach.org/student.html?id=${sid}&month=${encodeURIComponent(month)}`}]] 
                };

                chatIds.forEach(chatId => {
                    promises.push(sendMessage(chatId, msgText, inlineBtn));
                });
            }
        }
    });

    await Promise.all(promises);
}

// ទម្រង់សារលម្អិតដែលមានមុខវិជ្ជា និងនិទ្ទេស
function formatDetailedScoreMessage(s, month, year) {
    const subjects =[
        "khmer", "math", "physics", "chemistry", "biology", "history", "geography", "morality", "earth_science", "english", "sport", "agriculture", "technology", "skill", "health"
    ];

    let msg = `🎓 <b>លទ្ធផលសិក្សា ${month}</b>\n`;
    msg += `👤 ឈ្មោះសិស្ស៖ <b>${s.student_name}</b>\n`;
    msg += `🏫 ថ្នាក់ទី៖ <b>${s.grade}</b>\n`;
    msg += `📅 ឆ្នាំសិក្សា៖ <b>${year}</b>\n`;
    msg += `➖➖➖➖➖➖➖➖➖➖\n`;

    subjects.forEach(sub => {
        if (s[sub] !== null && s[sub] !== undefined && String(s[sub]).trim() !== "") {
            let scoreVal = parseFloat(s[sub]);
            let gradeStr = "";
            if (!isNaN(scoreVal)) {
                let p = (scoreVal / 50) * 100; 
                gradeStr = (p>=90?'A':p>=80?'B':p>=70?'C':p>=60?'D':p>=50?'E':'F');
                msg += `▪️ ${TRANSLATIONS[sub] || sub} ៖ <b>${scoreVal}</b> (${gradeStr})\n`;
            } else {
                 msg += `▪️ ${TRANSLATIONS[sub] || sub} ៖ <b>${s[sub]}</b>\n`;
            }
        }
    });

    const total = Math.round(s.total_score || s.exam_total_score || 0);
    const average = parseFloat(s.average || s.exam_average || s.semester_average || 0).toFixed(2);
    const cRank = s.class_rank || '-';
    const sRank = s.school_rank || '-';
    const fGrade = s.grade_result || s.final_result || '-';

    msg += `➖➖➖➖➖➖➖➖➖➖\n`;
    
    // បើជាប្រចាំឆមាស ត្រូវបង្ហាញ ៦ ប្រអប់ដូច Web ដែរ
    if (month.includes('ប្រចាំឆមាស')) {
        const examAvg = parseFloat(s.exam_average || 0).toFixed(2);
        const monthlyAvg = parseFloat(s.monthly_average || 0).toFixed(2);
        
        msg += `📈 ម.ភ ប្រឡងឆមាស៖ <b>${examAvg}</b>\n`;
        msg += `📈 ម.ភ ខែក្នុងឆមាស៖ <b>${monthlyAvg}</b>\n`;
        msg += `🌟 មធ្យមភាគប្រចាំឆមាស៖ <b>${average}</b>\n`;
    } else {
        msg += `📊 ពិន្ទុសរុប៖ <b>${total}</b>\n`;
        msg += `📈 មធ្យមភាគ៖ <b>${average}</b>\n`;
    }
    
    msg += `🏆 ចំណាត់ថ្នាក់ថ្នាក់៖ <b>${cRank}</b>\n`;
    msg += `🏆 ចំណាត់ថ្នាក់សាលា៖ <b>${sRank}</b>\n`;
    msg += `🏅 និទ្ទេសរួម៖ <b>${fGrade}</b>\n\n`;
    msg += `<i>សូមចុចប៊ូតុងខាងក្រោម ដើម្បីមើលការវិភាគដោយ AI។</i>`;

    return msg;
}

// --------------------------------------------------------------------------------

async function getLinkedStudentIds(chatId) {
  const strId = String(chatId);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, { headers: getHeaders() });
  const data = await res.json() ||[];
  let linkedIds =[];
  data.forEach(row => {
    if ((row.telegram_parent || "").includes(strId) || (row.telegram_student || "").includes(strId)) linkedIds.push(row.student_id);
  });
  return linkedIds;
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
        await fetch(getUrl, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ [targetColumn]: idArray.join(",") }) });
      }
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/telegram_db`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ "student_id": studentId, [targetColumn]: String(chatId) }) });
    }
  } catch (err) { console.error(err); }
}

async function sendScoreMenu(chatId, studentId) {
  const profile = await getStudentProfile(studentId);
  const stuName = profile ? profile.student_name : studentId;
  
  const inlineKeyboard = {
    "inline_keyboard": [[{"text": "📅 ប្រចាំខែ", "callback_data": `LISTMONTHS_${studentId}`}, {"text": "🌓 ប្រចាំឆមាស", "callback_data": `LISTSEMS_${studentId}`}],[{"text": "🏆 ប្រចាំឆ្នាំ", "callback_data": `YEAR_${studentId}`}]
    ]
  };
  await sendMessage(chatId, `🎯 <b>សូមជ្រើសរើសប្រភេទពិន្ទុ</b>\n(សិស្ស៖ ${stuName})`, inlineKeyboard);
}

async function sendLinksMenu(chatId) {
    const inlineKeyboard = { "inline_keyboard": [[{"text": "📄 ទាញយកឯកសារលម្អិតជា PDF", "url": "https://www.kp-tralach.org/student.html"}],[{"text": "📈 មុខងារវិភាគបាក់ឌុប (ទី១១-១២)", "url": "https://www.kp-tralach.org/bac2.html"}],[{"text": "🌐 ចូលទស្សនាគេហទំព័រសាលារៀន", "url": "https://www.kp-tralach.org"}],[{"text": "👥 ភ្ជាប់ទំនាក់ទំនងក្រុមអាណាព្យាបាល", "url": "https://t.me/+HgeqMiuiyy8yMDRl"}],[{"text": "📘 បណ្ដាញហ្វេសប៊ុកសាលារៀន", "url": "https://www.facebook.com/share/1aWBeaRLMM/"}],[{"text": "🎵 បណ្ដាញតិកតុកសាលារៀន", "url": "https://www.tiktok.com/@hunsenkampongtralach?_r=1&_t=ZS-94avuE7Osuz"}],[{"text": "▶️ បណ្ដាញយូធូបសាលារៀន", "url": "https://youtube.com/channel/UC_Ke8cGr0nMKqxsQfBpReFQ?si=JPxa0xq0INTzOdEo"}]
    ]};
    
    await sendMessage(chatId, "🌐 <b>បណ្ដាញទំនាក់ទំនង និង ឯកសារសាលារៀន</b>\nសូមជ្រើសរើសតំណភ្ជាប់ខាងក្រោម៖", inlineKeyboard);
}

function getMainKeyboard() {
  return { 
    "keyboard": [[{"text": "📊 មើលលទ្ធផលសិក្សា"}],[{"text": "🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ"}],[{"text": "📩 រាយការណ៍ ឬប្ដឹងតវ៉ា"}]], 
    "resize_keyboard": true, "persistent": true 
  };
}

async function sendMessage(chatId, text, replyMarkup = null) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN.trim()}/sendMessage`;
    try {
        const payload = { chat_id: chatId, text: text, parse_mode: "HTML", disable_web_page_preview: true };
        if (replyMarkup) { payload.reply_markup = replyMarkup; }

        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) { console.error(error); }
}

function getHeaders() {
  return { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" };
}
