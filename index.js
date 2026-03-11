require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// IMPORTANT: define public directory properly
const publicPath = path.join(__dirname, "public");

// serve frontend files
app.use(express.static(publicPath));

// homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// API key
const API_KEY = process.env.GOOGLE_API_KEY;
console.log("API KEY PRESENT:", API_KEY ? "YES" : "NO");

// API route
app.post("/simplify", async (req, res) => {

  const input = req.body.text || "";
  const mode = req.body.mode || "academic";
  const language = req.body.language || "english";

  let prompt = `Rewrite this text clearly:\n${input}`;

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

   if (data.candidates && data.candidates.length > 0) {
  res.json({ result: data.candidates[0].content.parts[0].text });
} else {
  console.log("Gemini response:", data);
  res.json({ error: "Gemini API returned unexpected response", data });
}

  } catch (err) {
    res.json({ error: err.message });
  }

});

// server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});