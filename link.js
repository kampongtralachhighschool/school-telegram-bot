const SUPABASE_URL = "https://bcezphbxnimyhtylkvrx.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZXpwaGJ4bmlteWh0eWxrdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA2ODYsImV4cCI6MjA4ODQ2NjY4Nn0.lFzwMvdmyRXfWq1ZbJVoM6EwkLeJXXuoVGoHGjukRQc";

const LINK_HTML = `
<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ភ្ជាប់គណនីសិស្ស</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>body { font-family: 'Battambang', sans-serif; }</style>
</head>
<body class="bg-gray-100 p-5 flex flex-col items-center justify-center min-h-screen">

    <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <h2 class="text-xl font-bold text-center text-blue-600 mb-2">🔗 ភ្ជាប់អត្តលេខសិស្ស</h2>
        <p class="text-sm text-gray-500 text-center mb-6">សូមបញ្ចូលអត្តលេខសិស្ស ដើម្បីទទួលបានពិន្ទុស្វ័យប្រវត្តិ។</p>
        
        <input type="number" id="studentId" placeholder="ឧទាហរណ៍៖ 12345" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500 text-center text-lg">
        
        <select id="userRole" class="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-blue-500">
            <option value="student">ខ្ញុំជា សិស្ស</option>
            <option value="parent">ខ្ញុំជា អាណាព្យាបាល</option>
        </select>

        <button onclick="linkAccount()" id="btnSubmit" class="w-full bg-blue-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-600 active:scale-95 transition-transform">
            បញ្ជាក់ការភ្ជាប់គណនី
        </button>
    </div>

    <script>
        const tg = window.Telegram.WebApp;
        tg.expand();

        async function linkAccount() {
            const studentId = document.getElementById('studentId').value.trim();
            const role = document.getElementById('userRole').value;
            const telegramId = tg.initDataUnsafe?.user?.id; // ចាប់យក ID ពី Telegram អូតូ

            if (!studentId) return Swal.fire('បញ្ជាក់', 'សូមវាយបញ្ចូលអត្តលេខសិស្ស!', 'warning');
            if (!telegramId) return Swal.fire('Error', 'មិនអាចចាប់យក Telegram ID បានទេ។ សូមបើកតាមរយៈ Telegram App។', 'error');

            const btn = document.getElementById('btnSubmit');
            btn.innerHTML = "កំពុងភ្ជាប់... ⏳"; btn.disabled = true;

            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id: studentId, telegram_id: telegramId, role: role })
                });
                
                const result = await response.json();
                
                if(result.success) {
                    Swal.fire('ជោគជ័យ', 'គណនីរបស់អ្នកបានភ្ជាប់រួចរាល់!', 'success').then(() => {
                        tg.close(); // បិទផ្ទាំងអូតូពេលជោគជ័យ
                    });
                } else {
                    Swal.fire('បរាជ័យ', result.message, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'មានបញ្ហាក្នុងការភ្ជាប់ទៅ Server', 'error');
            }
            btn.innerHTML = "បញ្ជាក់ការភ្ជាប់គណនី"; btn.disabled = false;
        }
    </script>
</body>
</html>
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // បើគេបើក Link នេះ នោះវាបង្ហាញផ្ទាំង HTML
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(LINK_HTML);
  }

  // បើផ្ទាំង HTML បាញ់ Data មកដើម្បី Save ចូល Supabase
  if (req.method === 'POST') {
    try {
      const { student_id, telegram_id, role } = req.body;
      if (!student_id || !telegram_id) return res.status(400).json({ success: false, message: "ទិន្នន័យមិនគ្រប់គ្រាន់" });

      const targetColumn = role === "parent" ? "telegram_parent" : "telegram_student";

      // ១. ឆែកមើលថាតើអត្តលេខនេះមានក្នុង telegram_db ហើយឬនៅ?
      const getRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?student_id=eq.${student_id}`, {
          method: "GET",
          headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` }
      });
      const data = await getRes.json();

      if (data && data.length > 0) {
          // បើមានហើយ ទាញលេខចាស់មកមើល រួចថែមលេខថ្មីចូល (បំបែកដោយសញ្ញាក្បៀស)
          const existingIds = data[0][targetColumn] || "";
          const idArray = existingIds ? existingIds.split(",") :[];
          
          if (!idArray.includes(String(telegram_id))) {
              idArray.push(String(telegram_id));
              await fetch(`${SUPABASE_URL}/rest/v1/telegram_db?student_id=eq.${student_id}`, {
                  method: "PATCH",
                  headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ [targetColumn]: idArray.join(",") })
              });
          }
      } else {
          // បើអត្តលេខនេះថ្មីសន្លាង បង្កើត Record ថ្មីតែម្តង
          await fetch(`${SUPABASE_URL}/rest/v1/telegram_db`, {
              method: "POST",
              headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({ student_id: student_id, [targetColumn]: String(telegram_id) })
          });
      }

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}
