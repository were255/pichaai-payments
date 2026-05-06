const express = require("express");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

const model = process.env.GROQ_MODEL || "llama3-8b-8192";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY is not set. /api/ai requests will fail.");
}

// Home route
app.get("/", (req, res) => {
  res.send("PichaAI backend is running 🚀");
});

// AI route (POST)
app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are PichaAI, a helpful and friendly assistant that answers user questions clearly.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion?.choices?.[0]?.message?.content || "No reply returned from AI.";

    res.json({ reply });
  } catch (error) {
    const errorMessage = error.response?.data || error.message || "AI failed";
    console.error("AI error:", errorMessage, error);
    res.status(500).json({ error: errorMessage });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});