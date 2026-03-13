const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; // ដាក់ Token របស់លោកគ្រូ
const ADMIN_GROUP_ID = "-1003828714540"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

const DEFAULT_ACADEMIC_YEAR = "2025-2026";

// បកប្រែមុខវិជ្ជា និងចំណុចផ្សេងៗ
const TRANSLATIONS = {
  "khmer": "ភាសាខ្មែរ", "math": "គណិតវិទ្យា", "mathematics": "គណិតវិទ្យា",
  "physics": "រូបវិទ្យា", "chemistry": "គីមីវិទ្យា", "biology": "ជីវវិទ្យា",
  "earth_science": "ផែនដីវិទ្យា", "earth": "ផែនដីវិទ្យា", "history": "ប្រវត្តិវិទ្យា",
  "geography": "ភូមិវិទ្យា", "morality": "សីលធម៌ ពលរដ្ឋ", "civics": "សីលធម៌ ពលរដ្ឋ",
  "english": "ភាសាអង់គ្លេស", "french": "ភាសាបារាំង", "sport": "អប់រំកាយ",
  "pe": "អប់រំកាយ", "ict": "ព័ត៌មានវិទ្យា", "computer": "កុំព្យូទ័រ",
  "technology": "បច្ចេកវិទ្យា", "health": "សុខភាព", "art": "សិល្បៈ", "agriculture": "កសិកម្ម",
  "skill": "បំណិន",
  
  "total_score": "ពិន្ទុសរុប", "school_rank": "ចំណាត់ថ្នាក់សាលា",
  "exam_total_score": "ពិន្ទុប្រឡងសរុប", "exam_average": "មធ្យមភាគប្រឡង", 
  "exam_rank": "ចំណាត់ថ្នាក់ប្រឡង", "monthly_average": "មធ្យមភាគប្រចាំខែ", 
  "semester_average": "មធ្យមភាគឆមាស"
};

// លាក់ Column មិនចាំបាច់ (បន្ថែម result និង avg ដើម្បីកុំឲ្យជាន់គ្នា)
const EXCLUDE_COLUMNS = [
  "id", "student_id", "student_name", "gender", "dob", "grade", "month_name", 
  "semester_name", "class_rank", "rank", "average", "avg", "grade_result", "result", 
  "academic_year", "created_at", "updated_at", "date_solar", "date_lunar"
];

const SUMMARY_COLUMNS = [
  "total_score", "school_rank", "exam_total_score", "exam_average", 
  "exam_rank", "monthly_average", "semester_average"
];

// កែ Function handler នេះវិញ
export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const update = req.body;
            
            if (update.message) {
                // ដំណើរការពេលគេឆាតធម្មតា ឬចុច /start
                await handleMessage(update.message);
            } else if (update.callback_query) {
                // ដំណើរការពេលគេចុចប៊ូតុង (Inline Keyboard)
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

// ==========================================
// បន្ថែម Function ថ្មីមួយនេះសម្រាប់អោយ Bot អាចឆ្លើយតបសារបាន
// (លោកគ្រូអាចយកវាទៅដាក់ពីក្រោម Function handler ខាងលើបាន)
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text;

    if (!text) return; // បើមិនមែនជាអក្សរ មិនបាច់ខ្វល់

    if (text === '/start') {
        // បង្ហាញម៉ឺនុយពេលសិស្សចូលដំបូង
        await sendMessage(chatId, "សួស្ដី! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធតេឡេក្រាមរបស់សាលា។\nសូមជ្រើសរើសម៉ឺនុយខាងក្រោម៖", getMainKeyboard());
    } 
    else if (text === '📊 មើលលទ្ធផលសិក្សា') {
        await sendMessage(chatId, "សូមវាយបញ្ចូល **អត្តលេខសិស្ស** របស់អ្នក (ឧទាហរណ៍៖ 12345)៖", {"reply_markup": {"remove_keyboard": true}});
    } 
    else if (text === '🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ') {
        await sendLinksMenu(chatId);
    } 
    else if (text === '📩 រាយការណ៍ ឬប្ដឹងតវ៉ា') {
        await sendMessage(chatId, "សូមសរសេរសាររាយការណ៍របស់អ្នកនៅទីនេះ។ យើងនឹងរក្សាការសម្ងាត់ជូន។");
    } 
    else {
        // បើគេវាយជាលេខ សន្មតថាគេវាយបញ្ចូលអត្តលេខសិស្ស
        if (!isNaN(text.trim())) {
            const studentId = text.trim();
            await sendScoreMenu(chatId, studentId);
        } else {
            await sendMessage(chatId, "សូមជ្រើសរើសម៉ឺនុយខាងក្រោម ឬវាយបញ្ចូលអត្តលេខសិស្សដើម្បីមើលពិន្ទុ។", getMainKeyboard());
        }
    }
}
// ==========================================

async function getStudentProfile(studentId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_profile?student_id=eq.${studentId}&order=id.desc&limit=1`, { headers: getHeaders() });
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

  if (action === "LISTMONTHS") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&academic_year=eq.${activeYear}&select=month_name&order=id.desc`, { headers: getHeaders() });
    const data = await res.json() || [];
    const months = [...new Set(data.map(r => r.month_name))].filter(Boolean);
    
    if (months.length === 0) return sendMessage(chatId, `📌 មិនទាន់មានពិន្ទុសម្រាប់ឆ្នាំសិក្សា <b>${activeYear}</b> ទេ។`);
    
    let buttons = [];
    months.forEach(m => buttons.push([{"text": `📅 ខែ ${m}`, "callback_data": `SHOWMONTH_${studentId}_${m}`}]));
    await sendMessage(chatId, `👇 <b>សូមជ្រើសរើសខែ៖</b>`, { "inline_keyboard": buttons });
  } 
  else if (action === "SHOWMONTH") {
    const monthName = parts[2];
    await displayScore(chatId, studentId, "student_scores", "ពិន្ទុប្រចាំខែ", "month_name", monthName, profile, activeYear);
  }
  else if (action === "LISTSEMS") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/semester_scores?student_id=eq.${studentId}&academic_year=eq.${activeYear}&select=semester_name&order=id.desc`, { headers: getHeaders() });
    const data = await res.json() || [];
    const sems = [...new Set(data.map(r => r.semester_name))].filter(Boolean);
    
    if (sems.length === 0) return sendMessage(chatId, `📌 មិនទាន់មានពិន្ទុឆមាសសម្រាប់ឆ្នាំសិក្សា <b>${activeYear}</b> ទេ។`);
    
    let buttons = [];
    sems.forEach(s => buttons.push([{"text": `🌓 ${s}`, "callback_data": `SHOWSEM_${studentId}_${s}`}]));
    await sendMessage(chatId, `👇 <b>សូមជ្រើសរើសឆមាស៖</b>`, { "inline_keyboard": buttons });
  }
  else if (action === "SHOWSEM") {
    const semName = parts[2];
    await displayScore(chatId, studentId, "semester_scores", "ពិន្ទុប្រចាំឆមាស", "semester_name", semName, profile, activeYear);
  }
  else if (action === "YEAR") {
    await displayScore(chatId, studentId, "year_scores", "លទ្ធផលប្រចាំឆ្នាំ", null, null, profile, activeYear);
  }
}

async function displayScore(chatId, studentId, tableName, title, periodCol, periodName, profile, activeYear) {
  let queryUrl = `${SUPABASE_URL}/rest/v1/${tableName}?student_id=eq.${studentId}&academic_year=eq.${activeYear}`;
  if (periodCol && periodName) queryUrl += `&${periodCol}=eq.${encodeURIComponent(periodName)}`;
  queryUrl += `&order=id.desc&limit=1`;

  try {
      const res = await fetch(queryUrl, { headers: getHeaders() });
      const data = await res.json() || [];

      if (data.length === 0) {
        await sendMessage(chatId, `📌 មិនទាន់មានទិន្នន័យនៅឡើយទេ។`); return;
      }

      const latestData = data[0]; 
      let maxScores = {};
      try {
        let gradeLvl = profile ? profile.grade_level : 10;
        let classType = profile ? profile.class_type : 'General';
        
        if (!profile && latestData.grade) {
            const gStr = String(latestData.grade || "").toUpperCase();
            const m = gStr.match(/\d+/);
            if (m) gradeLvl = parseInt(m[0]);
            if (gradeLvl >= 11) {
                if (gStr.includes("SS") || gStr.includes("សង្គម")) classType = "SS";
                else classType = "SC";
            }
        }

        const maxRes = await fetch(`${SUPABASE_URL}/rest/v1/max_scores?grade_level=eq.${gradeLvl}&class_type=eq.${classType}`, { headers: getHeaders() });
        const maxData = await maxRes.json();
        if (maxData && maxData.length > 0) maxScores = maxData[0];
      } catch (err) { }

      const actualPeriodName = periodName || 'សរុប';
      
      let msg = `🎓 <b>ព័ត៌មានសិស្ស (${activeYear})</b>\n`;
      msg += `• អត្តលេខ៖ <b>${studentId}</b>\n`;
      msg += `• ឈ្មោះ៖ <b>${profile ? profile.student_name : (latestData.student_name || '-')}</b>\n`;
      msg += `• ភេទ៖ ${profile ? profile.gender : (latestData.gender || '-')}\n`;
      
      const pDob = profile ? profile.dob : latestData.dob;
      if(pDob) msg += `• ថ្ងៃខែឆ្នាំកំណើត៖ ${pDob}\n`;
      
      const pClass = profile ? profile.class_name : latestData.grade;
      msg += `• ថ្នាក់ទី៖ <b>${pClass || '-'}</b>\n\n`;

      msg += `📊 <b>${title} (${actualPeriodName})</b>\n`;
      msg += `-----------------------------------\n`;

      let hasSubjects = false;
      let summaryText = "";
      
      // អថេរសម្រាប់ចាប់យក មធ្យមភាគ, ចំណាត់ថ្នាក់ និង និទ្ទេស
      let finalAvg = '-', finalRank = '-', finalResult = '-';

      for (const [key, value] of Object.entries(latestData)) {
        const rawKey = key.trim();
        const normalizedKey = rawKey.toLowerCase();
        
        // ចាប់យកចំណាត់ថ្នាក់, មធ្យមភាគ និង និទ្ទេស ដោយមិនខ្វល់ពីអក្សរធំតូច
        if (normalizedKey === 'class_rank' || normalizedKey === 'rank') { finalRank = value; continue; }
        if (normalizedKey === 'average' || normalizedKey === 'avg') { finalAvg = value; continue; }
        if (normalizedKey === 'grade_result' || normalizedKey === 'result') { finalResult = value; continue; }
        
        // បើជាមុខវិជ្ជា
        if (!EXCLUDE_COLUMNS.includes(normalizedKey) && !SUMMARY_COLUMNS.includes(normalizedKey) && value !== null && value !== "") {
          let subjectNameInKhmer = TRANSLATIONS[normalizedKey] || (rawKey.charAt(0).toUpperCase() + rawKey.slice(1));
          
          let gradeLetter = "";
          if (maxScores[normalizedKey]) {
             const percent = (parseFloat(value) / parseFloat(maxScores[normalizedKey])) * 100;
             if(percent >= 85) gradeLetter = " (A)"; else if(percent >= 80) gradeLetter = " (B)";
             else if(percent >= 70) gradeLetter = " (C)"; else if(percent >= 65) gradeLetter = " (D)";
             else if(percent >= 50) gradeLetter = " (E)"; else gradeLetter = " (F)";
          }

          msg += `🔹 ${subjectNameInKhmer} : <b>${value}</b>${gradeLetter}\n`;
          hasSubjects = true;
        }

        // បើជាទិន្នន័យសរុប
        if (SUMMARY_COLUMNS.includes(normalizedKey) && value !== null && value !== "") {
            let labelKhmer = TRANSLATIONS[normalizedKey] || rawKey;
            summaryText += `🔹 ${labelKhmer} : <b>${value}</b>\n`;
        }
      }

      if (!hasSubjects) msg += `<i>មិនទាន់មានពិន្ទុមុខវិជ្ជាលម្អិតទេ</i>\n`;
      if (summaryText !== "") {
          msg += `-----------------------------------\n`;
          msg += summaryText;
      }

      msg += `-----------------------------------\n`;
      msg += `📈 <b>របាយការណ៍សរុប៖</b>\n`;
      msg += `• មធ្យមភាគ៖ <b>${finalAvg}</b>\n`;
      msg += `• ចំណាត់ថ្នាក់ទី៖ <b>${finalRank}</b>\n`;
      msg += `• និទ្ទេស/លទ្ធផល៖ <b>${finalResult}</b>\n`; // បង្ហាញនិទ្ទេសច្បាស់ៗនៅទីនេះ

      const webUrl = `https://www.kp-tralach.org/student.html?id=${studentId}&period=${encodeURIComponent(actualPeriodName)}`;
      const inlineBtn = { "inline_keyboard": [[{"text": "🌐 មើលរបាយការណ៍លើវិបសាយ", "url": webUrl}]] };

      await sendMessage(chatId, msg, inlineBtn);
  } catch (err) {
      await sendMessage(chatId, "❌ មានបញ្ហាក្នុងការទាញយកពិន្ទុពីប្រព័ន្ធ។");
  }
}

async function getLinkedStudentIds(chatId) {
  const strId = String(chatId);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, { headers: getHeaders() });
  const data = await res.json() || [];
  let linkedIds = [];
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
      const idArray = existingIds ? existingIds.split(",") : [];
      if (!idArray.includes(String(chatId))) {
        idArray.push(String(chatId));
        await fetch(getUrl, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ [targetColumn]: idArray.join(",") }) });
      }
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/telegram_db`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ "student_id": studentId, [targetColumn]: String(chatId) }) });
    }
  } catch (err) { }
}

async function sendScoreMenu(chatId, studentId) {
  const profile = await getStudentProfile(studentId);
  const stuName = profile ? profile.student_name : studentId;
  
  const inlineKeyboard = {
    "inline_keyboard": [
      [{"text": "📅 ប្រចាំខែ", "callback_data": `LISTMONTHS_${studentId}`}, {"text": "🌓 ប្រចាំឆមាស", "callback_data": `LISTSEMS_${studentId}`}],
      [{"text": "🏆 ប្រចាំឆ្នាំ", "callback_data": `YEAR_${studentId}`}]
    ]
  };
  await sendMessage(chatId, `🎯 <b>សូមជ្រើសរើសប្រភេទពិន្ទុ</b>\n(សិស្ស៖ ${stuName})`, inlineKeyboard);
}

async function sendLinksMenu(chatId) {
  const inlineKeyboard = { "inline_keyboard": [
      [{"text": "📄 ទាញយកឯកសារលម្អិតជា PDF", "url": "https://www.kp-tralach.org/student.html"}],
      [{"text": "📈 មុខងារវិភាគបាក់ឌុប (ទី១១-១២)", "url": "https://www.kp-tralach.org/bac2.html"}],
      [{"text": "🌐 ចូលទស្សនាគេហទំព័រសាលារៀន", "url": "https://www.kp-tralach.org"}],
      [{"text": "👥 ភ្ជាប់ទំនាក់ទំនងក្រុមអាណាព្យាបាល", "url": "https://t.me/+HgeqMiuiyy8yMDRl"}],
      [{"text": "📘 បណ្ដាញហ្វេសប៊ុកសាលារៀន", "url": "https://www.facebook.com/share/1aWBeaRLMM/"}],
      [{"text": "🎵 បណ្ដាញតិកតុកសាលារៀន", "url": "https://www.tiktok.com/@hunsenkampongtralach?_r=1&_t=ZS-94avuE7Osuz"}],
      [{"text": "▶️ បណ្ដាញយូធូបសាលារៀន", "url": "https://youtube.com/channel/UC_Ke8cGr0nMKqxsQfBpReFQ?si=JPxa0xq0INTzOdEo"}]
  ]};
  await sendMessage(chatId, "🌐 <b>សូមជ្រើសរើសតំណភ្ជាប់ខាងក្រោម៖</b>", inlineKeyboard);
}

function getMainKeyboard() {
  return { 
    "keyboard": [[{"text": "📊 មើលលទ្ធផលសិក្សា"}], [{"text": "🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ"}], [{"text": "📩 រាយការណ៍ ឬប្ដឹងតវ៉ា"}]], 
    "resize_keyboard": true, "persistent": true 
  };
}

async function sendMessage(chatId, text, replyMarkup = null) {
    // ប្រើ .trim() ដើម្បីការពារក្រែងលោមានជាប់ការដកឃ្លា (Space) លើ Token
    const url = `https://api.telegram.org/bot${BOT_TOKEN.trim()}/sendMessage`;
    
    try {
        const payload = {
            chat_id: chatId,
            text: text,
            parse_mode: "HTML"
        };
        
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("🔥 Telegram បដិសេធការផ្ញើសារ:", await response.text());
        }
    } catch (error) {
        console.error("🔥 បញ្ហាភ្ជាប់ទៅកាន់ Telegram API:", error);
    }
}

function getHeaders() {
  return { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" };
}




