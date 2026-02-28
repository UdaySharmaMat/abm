require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.static("public"));

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_API_KEY;

app.post("/simplify", async (req, res) => {

  const input = req.body.text || "";
  const mode = req.body.mode || "academic";
  const language = req.body.language || "english";

  let corePrompt = "";

  // =========================
  // MODE LOGIC
  // =========================

  if (mode === "academic") {
    corePrompt = `
You are a university-level academic writer.

Rewrite the following text into refined academic prose.

Rules:
- Single analytical paragraph
- No headings
- No bullet points
- Maintain conceptual depth
- Preserve theoretical nuance
- Avoid oversimplification

Text:
${input}
`;
  }

  else if (mode === "upsc") {
    corePrompt = `
You are a UPSC Mains examination mentor.

Rewrite the following text strictly in UPSC answer format.

Structure:
1. Introduction (define issue in 2-3 lines)
2. Main Analysis (clear cause-effect reasoning, governance relevance)
3. Implications (administrative / societal / constitutional)
4. Conclusion (forward-looking or reform-oriented)

Tone:
- Formal
- Structured
- Analytical
- India-relevant where applicable

Text:
${input}
`;
  }

  else if (mode === "administrative") {
    corePrompt = `
You are drafting an internal government file note.

Convert the following text into administrative note style.

Rules:
- Objective and impersonal
- Short, precise sentences
- No theoretical discussion
- Focus on implementation and governance relevance
- Suitable for bureaucratic documentation

Text:
${input}
`;
  }

  else if (mode === "policy") {
    corePrompt = `
You are a public policy analyst.

Analyze the following text using a structured policy framework.

Structure:
1. Problem Definition
2. Institutional Context
3. Policy Implications
4. Risks and Trade-offs
5. Reform Options

Tone:
- Analytical
- Framework-driven
- Governance focused
- No casual summarizing

Text:
${input}
`;
  }

  else if (mode === "plain") {
    corePrompt = `
Rewrite the following text in very simple language.

Rules:
- Very short sentences
- No academic jargon
- No complex clauses
- Easy for a 14-year-old student
- Keep meaning accurate

Text:
${input}
`;
  }

  // =========================
  // LANGUAGE ENFORCEMENT (STRONG)
  // =========================

  let finalPrompt = "";

  if (language === "hindi") {
    finalPrompt = `
IMPORTANT:
Respond ONLY in Hindi.
Use full Devanagari script.
Do NOT use English words.
Maintain the required structure exactly as instructed.

${corePrompt}
`;
  } else {
    finalPrompt = `
IMPORTANT:
Respond ONLY in English.
Follow the structure exactly as instructed.

${corePrompt}
`;
  }

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
              parts: [
                { text: finalPrompt }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      res.json({
        result: data.candidates[0].content.parts[0].text
      });
    } else {
      res.json({ error: data });
    }

  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});