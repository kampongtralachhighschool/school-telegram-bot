const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg";
const ADMIN_GROUP_ID = "-1003828714540"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

const CURRENT_ACADEMIC_YEAR = "២០២៥-២០២៦";

const SUBJECT_TRANSLATIONS = {
  "khmer": "ភាសាខ្មែរ", "math": "គណិតវិទ្យា", "mathematics": "គណិតវិទ្យា",
  "physics": "រូបវិទ្យា", "chemistry": "គីមីវិទ្យា", "biology": "ជីវវិទ្យា",
  "earth_science": "ផែនដីវិទ្យា", "earth": "ផែនដីវិទ្យា", "history": "ប្រវត្តិវិទ្យា",
  "geography": "ភូមិវិទ្យា", "morality": "សីលធម៌ ពលរដ្ឋ", "civics": "សីលធម៌ ពលរដ្ឋ",
  "english": "ភាសាអង់គ្លេស", "french": "ភាសាបារាំង", "sport": "អប់រំកាយ",
  "pe": "អប់រំកាយ", "ict": "ព័ត៌មានវិទ្យា", "computer": "កុំព្យូទ័រ",
  "art": "សិល្បៈ", "drawing": "គំនូរ", "agriculture": "កសិកម្ម",
  "home_ec": "គេហវិជ្ជា", "home_economics": "គេហវិជ្ជា", "literature": "អក្សរសិល្ប៍",
  "science": "វិទ្យាសាស្ត្រ", "social_study": "សិក្សាសង្គម"
};

// ប្រើ module.exports ជាស្តង់ដារសម្រាប់ Vercel ដែលអត់មាន package.json
module.exports = async function (req, res) {
  // បើកចូលមើលតាម Browser ធម្មតា
  if (req.method === 'GET') {
    return res.status(200).send('✅ School Telegram Bot API is Running!');
  }

  try {
    // ធានាថាទិន្នន័យត្រូវបាន Parse ត្រឹមត្រូវ
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!update) return res.status(200).json({ status: 'ok' });

    // ១. ពេលចុចលើប៊ូតុង Inline (រើសខែ ឬ ឆមាស)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data; 

      await handleScoreRequest(chatId, data);
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cb.id })
      });
      return res.status(200).json({ status: 'ok' });
    }

    // ២. ពេលមានសារធម្មតា ឬ ចុចម៉ឺនុយ
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || "";

      // មុខងារ Admin Reply
      if (String(chatId) === String(ADMIN_GROUP_ID)) {
        if (msg.reply_to_message && msg.reply_to_message.from.is_bot) {
          const match = msg.reply_to_message.text.match(/ID:\s*(\d+)/);
          if (match && match[1]) {
            await sendMessage(match[1], `💬 <b>សារតបពីសាលារៀន៖</b>\n\n${text}`);
          }
        }
        return res.status(200).json({ status: 'ok' }); 
      }

      // សារ /start
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        if (parts.length > 1) {
          const payload = parts[1].split("_"); 
          if (payload.length === 2) {
            const role = payload[0];
            const studentId = payload[1];
            const linkStatus = await saveTelegramIdToSupabase(chatId, studentId, role);
            if (linkStatus === "NEW_LINK" || linkStatus === "ALREADY_LINKED") {
              await sendMessage(chatId, `✅ គណនីរបស់អ្នកបានភ្ជាប់ជាមួយអត្តលេខ <b>${studentId}</b> រួចរាល់។`, getMainKeyboard());
              await sendScoreMenu(chatId, studentId);
            } else {
              await sendMessage(chatId, "❌ មានបញ្ហាក្នុងការភ្ជាប់ទិន្នន័យ។");
            }
          }
        } else {
          await sendMessage(chatId, "👋 <b>សូមស្វាគមន៍មកកាន់ប្រព័ន្ធព័ត៌មានវិទ្យាល័យ ហ៊ុន សែន កំពង់ត្រឡាច។</b>\n\nសូមប្រើប្រាស់ម៉ឺនុយខាងក្រោមដើម្បីស្វែងរកព័ត៌មានដែលអ្នកត្រូវការ។", getMainKeyboard());
        }
        return res.status(200).json({ status: 'ok' });
      }

      if (text === "📊 មើលលទ្ធផលសិក្សា") {
        const studentIds = await getLinkedStudentIds(chatId);
        if (studentIds.length > 0) {
          for (const sid of studentIds) {
            await sendScoreMenu(chatId, sid);
          }
        } else {
          await sendMessage(chatId, "⚠️ លោកអ្នកមិនទាន់បានភ្ជាប់អត្តលេខសិស្សនៅឡើយទេ។ សូមភ្ជាប់តាមរយៈគេហទំព័រជាមុនសិន។");
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

      // Forward ទៅ Admin (បើមិនមែនជាបញ្ជា)
      if(text !== "" && !text.startsWith("/")) {
          const userName = msg.from.first_name || 'មិនស្គាល់ឈ្មោះ';
          const userMessage = `📩 <b>សាររាយការណ៍ថ្មី!</b>\n👤 ពីអ្នក: ${userName}\n🆔 ID: ${chatId}\n\n📝 <b>ខ្លឹមសារ៖</b>\n${text}\n\n<i>(សូម Reply លើសារនេះ ដើម្បីតបទៅគាត់វិញ)</i>`;
          await sendMessage(ADMIN_GROUP_ID, userMessage);
          await sendMessage(chatId, "✅ សាររបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់សាលារៀនរួចរាល់។ សូមរង់ចាំការឆ្លើយតប... ⏳");
      }
    }
    
    // បញ្ចប់ប្រកបដោយសុវត្ថិភាព
    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error("❌ បញ្ហា Server:", error);
    // តែងតែតប 200 ទៅ Telegram វិញជានិច្ច ដើម្បីកុំឲ្យវាគាំង
    return res.status(200).json({ status: 'error', message: error.toString() });
  }
};

// ==========================================
// អនុគមន៍ជំនួយ (Helper Functions)
// ==========================================

async function handleScoreRequest(chatId, actionData) {
  const parts = actionData.split("_");
  const type = parts[0]; 
  const studentId = parts[1];

  let tableName = "";
  let title = "";

  if (type === "MONTH") { tableName = "student_scores"; title = "ពិន្ទុប្រចាំខែ"; }
  else if (type === "SEMESTER") { tableName = "semester_scores"; title = "ពិន្ទុប្រចាំឆមាស"; }
  else if (type === "YEAR") { tableName = "year_scores"; title = "លទ្ធផលប្រចាំឆ្នាំ"; }

  const queryUrl = `${SUPABASE_URL}/rest/v1/${tableName}?student_id=eq.${studentId}&academic_year=eq.${CURRENT_ACADEMIC_YEAR}&order=id.desc`;
  
  try {
      const res = await fetch(queryUrl, { 
        headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` }
      });
      const data = await res.json() || [];

      if (data.length === 0) {
        await sendMessage(chatId, `📌 មិនទាន់មានលទ្ធផល <b>${title}</b> សម្រាប់អត្តលេខ <b>${studentId}</b> ក្នុងឆ្នាំសិក្សា ${CURRENT_ACADEMIC_YEAR} នៅឡើយទេ។`);
        return;
      }

      const latestData = data[0]; 
      
      let msg = `🎓 <b>ព័ត៌មានសិស្ស (${CURRENT_ACADEMIC_YEAR})</b>\n`;
      msg += `• អត្តលេខ៖ <b>${studentId}</b>\n`;
      msg += `• ឈ្មោះ៖ <b>${latestData.student_name || '-'}</b>\n`;
      msg += `• ភេទ៖ ${latestData.gender || '-'}\n`;
      if(latestData.dob) msg += `• ថ្ងៃខែឆ្នាំកំណើត៖ ${latestData.dob}\n`;
      msg += `• ថ្នាក់ទី៖ <b>${latestData.grade || '-'}</b>\n\n`;

      const periodName = latestData.month_name || latestData.semester_name || 'សរុប';
      msg += `📊 <b>${title} (${periodName})</b>\n`;
      msg += `-----------------------------------\n`;

      const excludeColumns = ["id", "student_id", "student_name", "gender", "dob", "grade", "month_name", "semester_name", "class_rank", "average", "grade_result", "academic_year", "created_at"];
      
      let hasSubjects = false;
      for (const [key, value] of Object.entries(latestData)) {
        const normalizedKey = key.toLowerCase();
        if (!excludeColumns.includes(normalizedKey) && value !== null && value !== "") {
          let subjectNameInKhmer = SUBJECT_TRANSLATIONS[normalizedKey] || (key.charAt(0).toUpperCase() + key.slice(1));
          msg += `🔹 ${subjectNameInKhmer} : <b>${value}</b>\n`;
          hasSubjects = true;
        }
      }

      if (!hasSubjects) msg += `<i>មិនទាន់មានពិន្ទុមុខវិជ្ជាលម្អិតទេ</i>\n`;
      msg += `-----------------------------------\n`;
      msg += `📈 <b>របាយការណ៍សរុប៖</b>\n`;
      msg += `• មធ្យមភាគ៖ <b>${latestData.average || '-'}</b>\n`;
      msg += `• ចំណាត់ថ្នាក់ទី៖ <b>${latestData.class_rank || '-'}</b>\n`;
      msg += `• និទ្ទេស/លទ្ធផល៖ <b>${latestData.grade_result || '-'}</b>\n`;

      await sendMessage(chatId, msg);
  } catch (err) {
      await sendMessage(chatId, "❌ មានបញ្ហាក្នុងការទាញយកពិន្ទុពីប្រព័ន្ធ។ សូមព្យាយាមម្តងទៀត។");
  }
}

async function getLinkedStudentIds(chatId) {
  const headers = { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` };
  const strId = String(chatId);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=student_id,telegram_parent,telegram_student`, { headers });
  const data = await res.json() || [];
  let linkedIds = [];
  data.forEach(row => {
    const parents = row.telegram_parent ? row.telegram_parent.split(",") : [];
    const students = row.telegram_student ? row.telegram_student.split(",") : [];
    if (parents.includes(strId) || students.includes(strId)) linkedIds.push(row.student_id);
  });
  return linkedIds;
}

async function saveTelegramIdToSupabase(chatId, studentId, role) {
  const headers = { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" };
  const targetColumn = (role === "parent") ? "telegram_parent" : "telegram_student";
  const getUrl = `${SUPABASE_URL}/rest/v1/telegram_db?student_id=eq.${studentId}`;

  try {
    const getRes = await fetch(getUrl, { method: "GET", headers });
    const data = await getRes.json();

    if (data && data.length > 0) {
      const existingIds = data[0][targetColumn] || "";
      const idArray = existingIds ? existingIds.split(",") : [];
      if (!idArray.includes(String(chatId))) {
        idArray.push(String(chatId));
        await fetch(getUrl, { method: "PATCH", headers, body: JSON.stringify({ [targetColumn]: idArray.join(",") }) });
        return "NEW_LINK";
      } else return "ALREADY_LINKED"; 
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/telegram_db`, { method: "POST", headers, body: JSON.stringify({ "student_id": studentId, [targetColumn]: String(chatId) }) });
      return "NEW_LINK";
    }
  } catch (err) { return "ERROR"; }
}

async function sendScoreMenu(chatId, studentId) {
  const inlineKeyboard = {
    "inline_keyboard": [
      [{"text": "📅 ប្រចាំខែ", "callback_data": `MONTH_${studentId}`}, {"text": "🌓 ប្រចាំឆមាស", "callback_data": `SEMESTER_${studentId}`}],
      [{"text": "🏆 ប្រចាំឆ្នាំ", "callback_data": `YEAR_${studentId}`}]
    ]
  };
  await sendMessage(chatId, `🎯 <b>សូមជ្រើសរើសប្រភេទពិន្ទុ</b>\n(អត្តលេខ៖ ${studentId})`, inlineKeyboard);
}

function getMainKeyboard() {
  return { 
    "keyboard": [[{"text": "📊 មើលលទ្ធផលសិក្សា"}], [{"text": "🔗 បណ្ដាញទំនាក់ទំនង និង ឯកសារ"}], [{"text": "📩 រាយការណ៍ ឬប្ដឹងតវ៉ា"}]], 
    "resize_keyboard": true, "persistent": true 
  };
}

async function sendLinksMenu(chatId) {
  const inlineKeyboard = { "inline_keyboard": [
      [{"text": "📄 ទាញយកឯកសារលម្អិតជា PDF", "url": "https://www.kp-tralach.org/student.html"}],
      [{"text": "📈 វិភាគបាក់ឌុប", "url": "https://www.kp-tralach.org/bac2.html"}],
      [{"text": "🌐 ចូលទស្សនាគេហទំព័រសាលារៀន", "url": "https://www.kp-tralach.org"}]
  ]};
  await sendMessage(chatId, "🌐 <b>សូមជ្រើសរើសតំណភ្ជាប់ខាងក្រោម៖</b>", inlineKeyboard);
}

async function sendMessage(chatId, text, customKeyboard) {
  const payload = { chat_id: chatId, text: text, parse_mode: "HTML", disable_web_page_preview: true };
  if (customKeyboard) payload.reply_markup = customKeyboard; 
  try { 
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) 
    }); 
  } catch (err) { console.error("Error sending message:", err); }
}


