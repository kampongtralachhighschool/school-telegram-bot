const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; // Token ថ្មី
const ADMIN_GROUP_ID = "-1003828714540"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

// យើងលែង Hardcode ឆ្នាំសិក្សាទៀតហើយ តែដាក់ឆ្នាំ Default មួយក្រែងលោសិស្សអត់ទាន់មាន Profile
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
  
  // បកប្រែពាក្យខាងក្រោមរបាយការណ៍
  "total_score": "ពិន្ទុសរុប", "school_rank": "ចំណាត់ថ្នាក់សាលា",
  "exam_total_score": "ពិន្ទុប្រឡងសរុប", "exam_average": "មធ្យមភាគប្រឡង", 
  "exam_rank": "ចំណាត់ថ្នាក់ប្រឡង", "monthly_average": "មធ្យមភាគប្រចាំខែ", 
  "semester_average": "មធ្យមភាគឆមាស"
};

// អ្វីដែលត្រូវលាក់មិនឲ្យបង្ហាញ (កាលបរិច្ឆេទ និង ទិន្នន័យមិនចាំបាច់)
const EXCLUDE_COLUMNS = [
  "id", "student_id", "student_name", "gender", "dob", "grade", "month_name", 
  "semester_name", "class_rank", "average", "grade_result", "academic_year", 
  "created_at", "updated_at", "date_solar", "date_lunar" // លាក់កាលបរិច្ឆេទ
];

// ចំណុចដែលត្រូវបង្ហាញនៅខាងក្រោមគេ (Summary)
const SUMMARY_COLUMNS = [
  "total_score", "school_rank", "exam_total_score", "exam_average", 
  "exam_rank", "monthly_average", "semester_average"
];

module.exports = async function (req, res) {
  if (req.method === 'GET') return res.status(200).send('✅ School Telegram Bot V2 is Running!');

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!update) return res.status(200).json({ status: 'ok' });

    // ពេលចុចប៉ះប៊ូតុង Inline
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data; 

      await handleCallbackQuery(chatId, data);
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cb.id })
      });
      return res.status(200).json({ status: 'ok' });
    }

    // ពេលផ្ញើសារធម្មតា
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || "";

      if (String(chatId) === String(ADMIN_GROUP_ID)) {
        if (msg.reply_to_message && msg.reply_to_message.from.is_bot) {
          const match = msg.reply_to_message.text.match(/ID:\s*(\d+)/);
          if (match && match[1]) await sendMessage(match[1], `💬 <b>សារតបពីសាលារៀន៖</b>\n\n${text}`);
        }
        return res.status(200).json({ status: 'ok' }); 
      }

      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        if (parts.length > 1) {
          const payload = parts[1].split("_"); 
          if (payload.length === 2) {
            const role = payload[0];
            const studentId = payload[1];
            await saveTelegramIdToSupabase(chatId, studentId, role);
            
            // ទាញយកឈ្មោះពី Profile មកបង្ហាញពេលភ្ជាប់ជោគជ័យ
            const profile = await getStudentProfile(studentId);
            const stuName = profile ? profile.student_name : studentId;
            
            await sendMessage(chatId, `✅ គណនីរបស់អ្នកបានភ្ជាប់ជាមួយសិស្សឈ្មោះ <b>${stuName}</b> (អត្តលេខ៖ ${studentId}) រួចរាល់។`, getMainKeyboard());
            await sendScoreMenu(chatId, studentId);
          }
        } else {
          await sendMessage(chatId, "👋 <b>សូមស្វាគមន៍មកកាន់ប្រព័ន្ធព័ត៌មានវិទ្យាល័យ ហ៊ុន សែន កំពង់ត្រឡាច។</b>\n\nសូមប្រើប្រាស់ម៉ឺនុយខាងក្រោមដើម្បីស្វែងរកព័ត៌មាន។", getMainKeyboard());
        }
        return res.status(200).json({ status: 'ok' });
      }

      if (text === "📊 មើលលទ្ធផលសិក្សា") {
        const studentIds = await getLinkedStudentIds(chatId);
        if (studentIds.length > 0) {
          for (const sid of studentIds) await sendScoreMenu(chatId, sid);
        } else {
          await sendMessage(chatId, "⚠️ លោកអ្នកមិនទាន់បានភ្ជាប់អត្តលេខសិស្សនៅឡើយទេ។");
        }
        return res.status(200).json({ status: 'ok' });
      }

      if (text === "🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ") {
        await sendLinksMenu(chatId);
        return res.status(200).json({ status: 'ok' });
      }
      
      if (text === "📩 រាយការណ៍ ឬប្ដឹងតវ៉ា") {
        await sendMessage(chatId, "✍️ <b>សូមសរសេរសាររបស់អ្នកនៅខាងក្រោម៖</b>\n\nរាល់សារដែលអ្នកផ្ញើមកបន្ទាប់ពីនេះ នឹងត្រូវបញ្ជូនទៅគណៈគ្រប់គ្រងសាលាដោយផ្ទាល់។");
        return res.status(200).json({ status: 'ok' });
      }

      if(text !== "" && !text.startsWith("/")) {
          const userName = msg.from.first_name || 'មិនស្គាល់ឈ្មោះ';
          const userMessage = `📩 <b>សាររាយការណ៍ថ្មី!</b>\n👤 ពីអ្នក: ${userName}\n🆔 ID: ${chatId}\n\n📝 <b>ខ្លឹមសារ៖</b>\n${text}\n\n<i>(សូម Reply លើសារនេះ ដើម្បីតប)</i>`;
          await sendMessage(ADMIN_GROUP_ID, userMessage);
          await sendMessage(chatId, "✅ សាររបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់សាលារៀនរួចរាល់។");
      }
    }
    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    return res.status(200).json({ status: 'error' });
  }
};

// ==========================================
// អនុគមន៍ជំនួយ (Helper Functions)
// ==========================================

// ថ្មី៖ ទាញយកប្រវត្តិរូបសិស្សពី Table: student_profile
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

  // ទាញយកឆ្នាំសិក្សាបច្ចុប្បន្នរបស់សិស្សពី Profile
  const profile = await getStudentProfile(studentId);
  const activeYear = (profile && profile.academic_year) ? profile.academic_year : DEFAULT_ACADEMIC_YEAR;

  // បង្ហាញបញ្ជីខែទាំងអស់
  if (action === "LISTMONTHS") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/student_scores?student_id=eq.${studentId}&academic_year=eq.${activeYear}&select=month_name&order=id.desc`, { headers: getHeaders() });
    const data = await res.json() || [];
    const months = [...new Set(data.map(r => r.month_name))].filter(Boolean);
    
    if (months.length === 0) return sendMessage(chatId, `📌 មិនទាន់មានពិន្ទុសម្រាប់ឆ្នាំសិក្សា <b>${activeYear}</b> ទេ។`);
    
    let buttons = [];
    months.forEach(m => buttons.push([{"text": `📅 ខែ ${m}`, "callback_data": `SHOWMONTH_${studentId}_${m}`}]));
    await sendMessage(chatId, `👇 <b>សូមជ្រើសរើសខែ៖</b>`, { "inline_keyboard": buttons });
  } 
  
  // បង្ហាញពិន្ទុខែណាមួយ
  else if (action === "SHOWMONTH") {
    const monthName = parts[2];
    await displayScore(chatId, studentId, "student_scores", "ពិន្ទុប្រចាំខែ", "month_name", monthName, profile, activeYear);
  }

  // បង្ហាញបញ្ជីឆមាសទាំងអស់
  else if (action === "LISTSEMS") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/semester_scores?student_id=eq.${studentId}&academic_year=eq.${activeYear}&select=semester_name&order=id.desc`, { headers: getHeaders() });
    const data = await res.json() || [];
    const sems = [...new Set(data.map(r => r.semester_name))].filter(Boolean);
    
    if (sems.length === 0) return sendMessage(chatId, `📌 មិនទាន់មានពិន្ទុឆមាសសម្រាប់ឆ្នាំសិក្សា <b>${activeYear}</b> ទេ។`);
    
    let buttons = [];
    sems.forEach(s => buttons.push([{"text": `🌓 ${s}`, "callback_data": `SHOWSEM_${studentId}_${s}`}]));
    await sendMessage(chatId, `👇 <b>សូមជ្រើសរើសឆមាស៖</b>`, { "inline_keyboard": buttons });
  }

  // បង្ហាញពិន្ទុឆមាសណាមួយ
  else if (action === "SHOWSEM") {
    const semName = parts[2];
    await displayScore(chatId, studentId, "semester_scores", "ពិន្ទុប្រចាំឆមាស", "semester_name", semName, profile, activeYear);
  }

  // បង្ហាញពិន្ទុប្រចាំឆ្នាំ
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
      
      // ទាញយកពិន្ទុអតិបរមា (Max Scores) ដោយប្រើប្រាស់ Grade Level និង Class Type ពី Profile ផ្ទាល់
      let maxScores = {};
      try {
        let gradeLvl = profile ? profile.grade_level : 10;
        let classType = profile ? profile.class_type : 'General';
        
        // បើអត់មាន Profile, ព្យាយាមស្មានពីទិន្នន័យចាស់ (Fallback)
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
      
      // ប្រើប្រាស់ទិន្នន័យពី Profile ដើម្បីបង្ហាញឲ្យច្បាស់លាស់
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

      for (const [key, value] of Object.entries(latestData)) {
        const normalizedKey = key.toLowerCase();
        
        // បើជាមុខវិជ្ជា
        if (!EXCLUDE_COLUMNS.includes(normalizedKey) && !SUMMARY_COLUMNS.includes(normalizedKey) && value !== null && value !== "") {
          let subjectNameInKhmer = TRANSLATIONS[normalizedKey] || (key.charAt(0).toUpperCase() + key.slice(1));
          
          // គិតនិទ្ទេស
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

        // បើជាទិន្នន័យសរុប (Total Score, Rank...)
        if (SUMMARY_COLUMNS.includes(normalizedKey) && value !== null && value !== "") {
            let labelKhmer = TRANSLATIONS[normalizedKey] || key;
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
      msg += `• មធ្យមភាគ៖ <b>${latestData.average || '-'}</b>\n`;
      msg += `• ចំណាត់ថ្នាក់ទី៖ <b>${latestData.class_rank || '-'}</b>\n`;
      msg += `• និទ្ទេស/លទ្ធផល៖ <b>${latestData.grade_result || '-'}</b>\n`;

      // ប៊ូតុង Link ទៅវិបសាយផ្ទាល់
      const webUrl = `https://www.kp-tralach.org/student.html?id=${studentId}&period=${encodeURIComponent(actualPeriodName)}`;
      const inlineBtn = { "inline_keyboard": [[{"text": "🌐 មើលរបាយការណ៍លើវិបសាយ", "url": webUrl}]] };

      await sendMessage(chatId, msg, inlineBtn);
  } catch (err) {
      await sendMessage(chatId, "❌ មានបញ្ហាក្នុងការទាញយកពិន្ទុពីប្រព័ន្ធ។");
  }
}

// ទាញយក ID សិស្សដែលបានភ្ជាប់
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

// រក្សាទុក ID Telegram
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

// ម៉ឺនុយជ្រើសរើសប្រភេទពិន្ទុ
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

// ម៉ឺនុយ Link សំខាន់ៗ (ថ្មី)
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

// ក្តារចុចគោល
function getMainKeyboard() {
  return { 
    "keyboard": [[{"text": "📊 មើលលទ្ធផលសិក្សា"}], [{"text": "🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ"}], [{"text": "📩 រាយការណ៍ ឬប្ដឹងតវ៉ា"}]], 
    "resize_keyboard": true, "persistent": true 
  };
}

// ផ្ញើសារទូទៅ
async function sendMessage(chatId, text, customKeyboard) {
  const payload = { chat_id: chatId, text: text, parse_mode: "HTML", disable_web_page_preview: true };
  if (customKeyboard) payload.reply_markup = customKeyboard; 
  try { 
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) 
    }); 
  } catch (err) { }
}

// ក្បាល API (Headers)
function getHeaders() {
  return { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" };
}
