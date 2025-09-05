import express from "express";
import fetch from "node-fetch";

const app = express();

/**
 * Fungsi untuk meminta jawaban dari Gemini
 */
async function askGemini(prompt) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Kamu adalah asisten ramah yang berbicara dengan hangat, manusiawi, dan bisa diajak curhat. 
Gunakan nada seperti teman dekat yang peduli. Jawablah singkat tapi empatik. 
Pertanyaan atau curhatan user: ${prompt}`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Endpoint utama untuk Nightbot
 */
app.get("/", async (req, res) => {
  const userInput = req.query.q;
  if (!userInput) return res.send("❌ Masukkan pertanyaan setelah !ai");

  try {
    // Jawaban awal dari Gemini
    let reply = await askGemini(userInput);

    // Kalau terlalu panjang, ringkas jadi 1-2 kalimat
    if (reply.length > 400) {
      reply = await askGemini(
        `Ringkas jawaban berikut jadi 1-2 kalimat singkat, tetap dengan nada ramah dan manusiawi:\n\n${reply}`
      );
    }

    // Bersihkan Markdown/format aneh
    reply = reply
      .replace(/\*\*/g, "")  // hapus bold
      .replace(/`/g, "")     // hapus backtick
      .replace(/#+/g, "")    // hapus heading
      .replace(/\n+/g, " ")  // ganti newline jadi spasi
      .trim();

    // Tambahkan sentuhan ramah
    reply = reply + " 🙂";

    // Potong max 400 karakter agar aman untuk Nightbot
    res.send(reply.substring(0, 400));
  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

// Jalankan lokal
app.listen(3000, () => {
  console.log("✅ Server jalan di http://localhost:3000");
});
