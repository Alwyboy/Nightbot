import express from "express";
import fetch from "node-fetch";

const app = express();

// Endpoint utama, dipanggil Nightbot via !ai
app.get("/", async (req, res) => {
  const userInput = req.query.q; // Nightbot kirim query di sini
  if (!userInput) return res.send("❌ Masukkan pertanyaan setelah !ai");

  try {
    // Panggil Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userInput }] }]
        })
      }
    );

    const data = await response.json();

    // Ambil jawaban dari Gemini
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Tidak ada jawaban.";

    // Nightbot ada limit karakter, potong max 400
    res.send(reply.substring(0, 400));
  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

// Jalankan di lokal (saat testing)
// Di Vercel port di-handle otomatis
app.listen(3000, () => {
  console.log("✅ Server jalan di http://localhost:3000");
});
