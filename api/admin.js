const BOT_TOKEN = "8698376263:AAFZrgpSJ81LeiyBCDK6K_OKN2ZvwCqyzbg"; 
const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

module.exports = async function (req, res) {
  // អនុញ្ញាតឲ្យ Request អាចឆ្លងកាត់បាន
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const action = body.action;

    // ទាញយកអត្តលេខ Telegram ទាំងអស់ពី Supabase (តារាង telegram_db)
    const telegramUsers = await getAllTelegramIds();
    
    if (telegramUsers.length === 0) {
      return res.status(200).json({ success: false, message: "មិនទាន់មានគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធទេ" });
    }

    let successCount = 0;

    // ១. ប្រសិនបើបញ្ជាផ្ញើសារទូទៅ (Broadcast Message)
    if (action === "broadcast_message") {
      const messageText = body.messageText;
      if (!messageText) return res.status(400).json({ success: false, message: "គ្មានខ្លឹមសារសារ" });

      const finalMessage = `📢 <b>សេចក្ដីជូនដំណឹងពីសាលារៀន៖</b>\n\n${messageText}`;

      // បាញ់សារទៅកាន់គ្រប់គណនីស្របពេលគ្នា
      const promises = telegramUsers.map(chatId => sendMessage(chatId, finalMessage));
      const results = await Promise.all(promises);
      successCount = results.filter(Boolean).length;

      return res.status(200).json({ success: true, count: successCount });
    }

    // ២. ប្រសិនបើបញ្ជាផ្ញើពិន្ទុ (Broadcast Score Notification)
    if (action === "broadcast_score") {
      const month = body.month;
      const year = body.year;
      if (!month || !year) return res.status(400).json({ success: false, message: "ខ្វះទិន្នន័យខែ ឬឆ្នាំ" });

      // យើងគ្រាន់តែផ្ញើសាររំលឹក នោះសិស្សនឹងចុចប៊ូតុងទៅមើលដោយខ្លួនឯងដើម្បីកុំឲ្យធ្ងន់ប្រព័ន្ធ
      const finalMessage = `🔔 <b>ជូនដំណឹងពិន្ទុថ្មីចេញហើយ!</b>\n\nសាលារៀនបានបញ្ចេញលទ្ធផលសិក្សាប្រចាំ <b>ខែ${month}</b> ឆ្នាំសិក្សា <b>${year}</b> រួចរាល់ហើយ។\n\n👉 សូមចុចប៊ូតុង <b>📊 មើលលទ្ធផលសិក្សា</b> នៅលើ Keyboard ខាងក្រោមដើម្បីពិនិត្យមើលពិន្ទុ។`;

      const promises = telegramUsers.map(chatId => sendMessage(chatId, finalMessage));
      const results = await Promise.all(promises);
      successCount = results.filter(Boolean).length;

      return res.status(200).json({ success: true, count: successCount });
    }

    return res.status(400).json({ success: false, message: "ការបញ្ជាមិនត្រឹមត្រូវ" });

  } catch (error) {
    console.error("Admin API Error:", error);
    return res.status(500).json({ success: false, message: "មានបញ្ហានៅលើ Server" });
  }
};

// អនុគមន៍សម្រាប់ទាញ Chat ID អ្នកប្រើប្រាស់ទាំងអស់ពី Supabase
async function getAllTelegramIds() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?select=telegram_parent,telegram_student`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await res.json() || [];
    let allIds = new Set();
    
    data.forEach(row => {
      // យកលេខពីផ្នែកមាតាបិតា
      if (row.telegram_parent) {
        row.telegram_parent.split(",").forEach(id => {
          if (id.trim()) allIds.add(id.trim());
        });
      }
      // យកលេខពីផ្នែកសិស្ស
      if (row.telegram_student) {
        row.telegram_student.split(",").forEach(id => {
          if (id.trim()) allIds.add(id.trim());
        });
      }
    });
    
    return Array.from(allIds);
  } catch (error) {
    console.error("Supabase Error:", error);
    return [];
  }
}

// អនុគមន៍សម្រាប់ផ្ញើសារ
async function sendMessage(chatId, text) {
  const payload = { 
    chat_id: chatId, 
    text: text, 
    parse_mode: "HTML", 
    disable_web_page_preview: true 
  };
  
  try { 
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(payload) 
    }); 
    const result = await res.json();
    return result.ok;
  } catch (err) { 
    return false;
  }
}
