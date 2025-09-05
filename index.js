import express from "express";
import fetch from "node-fetch";

const app = express();

/**
 * Panggil Gemini API dengan gaya "teman curhat"
 */
async function askGemini(userInput) {
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
                text: `Kamu adalah teman yang ramah, hangat, dan empatik. 
Jawablah seolah sedang mendengarkan curhatan teman dekat. 
Gunakan bahasa singkat, manusiawi, penuh pengertian. 
Input user: ${userInput}`
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
 * Endpoint tunggal untuk Nightbot
 */
app.get("/", async (req, res) => {
  const userInput = req.query.q;
  if (!userInput) return res.send("❌ Ketik sesuatu setelah 'Nightbot'");

  try {
    let reply = await askGemini(userInput);

    // Kalau terlalu panjang → ringkas
    if (reply.length > 400) {
      reply = await askGemini(
        `Ringkas jawaban berikut jadi 1-2 kalimat, tetap dengan nada ramah dan manusiawi:\n\n${reply}`
      );
    }

    // Bersihkan format aneh (markdown, newline)
    reply = reply
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/#+/g, "")
      .replace(/\n+/g, " ")
      .trim();

    // Tambahkan sentuhan ramah
    reply = reply + " 🙂";

    res.send(reply.substring(0, 400));
  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

// Jalankan lokal
app.listen(3000, () => {
  console.log("✅ Server jalan di http://localhost:3000");
});
