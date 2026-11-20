const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const {
  getOrCreateUser,
  saveChatMessage,
  getChatHistory,
  recordCryptoPayment,
  recordKycSubmission,
  getDatabaseStatus
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.static(__dirname));

app.use((req, res, next) => {
  req.clientContext = {
    sessionId: req.headers["x-session-id"] || "default-session",
    userId: req.headers["x-user-id"] || "guest-user",
    language: req.headers["x-user-language"] || "auto",
    timestamp: new Date().toISOString()
  };
  delete req.headers["x-forwarded-for"];
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/health", (req, res) => {
  const enginesConfigured = {
    groq: Boolean(process.env.GROQ_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    googleAiStudio: Boolean(process.env.GOOGLE_AI_STUDIO_API_KEY),
    replicate: Boolean(process.env.REPLICATE_API_TOKEN),
    huggingface: Boolean(process.env.HUGGINGFACE_API_TOKEN),
    elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
    noiz: Boolean(process.env.NOIZ_API_KEY),
    cloudflareR2: Boolean(process.env.CLOUDFLARE_R2_API_TOKEN)
  };

  res.json({
    status: "online",
    platform: "PK AI Tool",
    routerMode: "master-hub",
    supportedCategoriesCount: 50000,
    enginesConfigured,
    database: getDatabaseStatus()
  });
});

app.get("/api/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const user = getOrCreateUser(req.clientContext.userId);
  const history = getChatHistory(sessionId);

  res.json({
    ok: true,
    sessionId,
    user,
    history
  });
});

async function generateLiveReply(prompt, category) {
  const systemPrompt = `You are PK AI Tool, a helpful master AI assistant. Current category: ${category}. Reply clearly in the same language the user used.`;
  const errors = [];

  // 1. Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await resp.json();
      if (data?.choices?.[0]?.message?.content) {
        return { text: data.choices[0].message.content, provider: "Groq" };
      }
      errors.push(`Groq: ${data?.error?.message || resp.status}`);
    } catch (e) {
      errors.push(`Groq: ${e.message}`);
    }
  }

  // 2. Try Google AI Studio (Gemini)
  if (process.env.GOOGLE_AI_STUDIO_API_KEY) {
    try {
      const key = process.env.GOOGLE_AI_STUDIO_API_KEY.trim();
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }] }]
          })
        }
      );
      const data = await resp.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (replyText) {
        return { text: replyText, provider: "Google-Gemini" };
      }
      errors.push(`Gemini: ${data?.error?.message || resp.status}`);
    } catch (e) {
      errors.push(`Gemini: ${e.message}`);
    }
  }

  // 3. Try OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await resp.json();
      if (data?.choices?.[0]?.message?.content) {
        return { text: data.choices[0].message.content, provider: "OpenRouter" };
      }
      errors.push(`OpenRouter: ${data?.error?.message || resp.status}`);
    } catch (e) {
      errors.push(`OpenRouter: ${e.message}`);
    }
  }

  // 4. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await resp.json();
      if (data?.choices?.[0]?.message?.content) {
        return { text: data.choices[0].message.content, provider: "OpenAI" };
      }
      errors.push(`OpenAI: ${data?.error?.message || resp.status}`);
    } catch (e) {
      errors.push(`OpenAI: ${e.message}`);
    }
  }

  // 5. Try DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const resp = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await resp.json();
      if (data?.choices?.[0]?.message?.content) {
        return { text: data.choices[0].message.content, provider: "DeepSeek" };
      }
      errors.push(`DeepSeek: ${data?.error?.message || resp.status}`);
    } catch (e) {
      errors.push(`DeepSeek: ${e.message}`);
    }
  }

  return {
    text: `Live AI engines returned errors -> ${errors.join(" | ")}`,
    provider: "Diagnostics"
  };
}

app.post("/api/route", async (req, res) => {
  try {
    const {
      prompt,
      category = "general",
      language = "auto",
      sessionId = "default-session",
      userId = "guest-user",
      attachments = []
    } = req.body;

    if (!prompt && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        ok: false,
        error: "Prompt or attachment is required."
      });
    }

    const user = getOrCreateUser(userId);

    if (prompt) {
      saveChatMessage(sessionId, "user", prompt, { category, language, attachmentsCount: attachments.length });
    }

    const aiResult = await generateLiveReply(prompt || "Attachment received", category);
    const savedBot = saveChatMessage(sessionId, "assistant", aiResult.text, {
      routedTo: aiResult.provider,
      category,
      language
    });

    return res.json({
      ok: true,
      router: "PK-AI-MASTER-HUB",
      routedTo: aiResult.provider,
      category,
      language,
      userPlan: user.plan,
      dailyPoints: user.dailyPoints,
      reply: aiResult.text,
      messageId: savedBot.id
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Internal router error.",
      details: err.message
    });
  }
});

app.post("/api/payments/crypto", (req, res) => {
  const { planName, network, txHash, userId = "guest-user" } = req.body;
  if (!planName || !network || !txHash) {
    return res.status(400).json({
      ok: false,
      error: "planName, network, and txHash are required."
    });
  }

  const record = recordCryptoPayment({ userId, planName, network, txHash });
  return res.json({
    ok: true,
    status: "pending_blockchain_verification",
    payment: record
  });
});

app.post("/api/security/kyc", (req, res) => {
  const { country, idNumber, hasTwoFactor, hasAppPin, userId = "guest-user" } = req.body;
  if (!country || !idNumber) {
    return res.status(400).json({
      ok: false,
      error: "Country and official ID number are required."
    });
  }

  const record = recordKycSubmission({
    userId,
    country,
    idNumber,
    hasTwoFactor: Boolean(hasTwoFactor),
    hasAppPin: Boolean(hasAppPin)
  });

  return res.json({
    ok: true,
    status: "kyc_submitted_for_review",
    kyc: record
  });
});

app.listen(PORT, () => {
  console.log(`PK AI Tool backend server running on port ${PORT}`);
});
