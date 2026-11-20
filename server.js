const express = require("express");
const cors = require("cors");
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

// Privacy & Identity Abstraction Middleware
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

// Health, Engines & Database Status Endpoint
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

// Get User & Chat History Endpoint
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

// Master Hub / Tool Router Endpoint with Persistent Storage
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

    let targetEngine = "TEXT_ROUTER_ENGINE";
    if (["image", "photo", "thumbnail", "face-edit", "video", "edit", "reel"].includes(category.toLowerCase())) {
      targetEngine = "MEDIA_REPLICATE_HF_ENGINE";
    } else if (["audio", "music", "song", "voice", "tts"].includes(category.toLowerCase())) {
      targetEngine = "VOICE_ELEVENLABS_NOIZ_ENGINE";
    } else if (["app", "code", "software", "web"].includes(category.toLowerCase())) {
      targetEngine = "CODE_BUILDER_ENGINE";
    }

    if (prompt) {
      saveChatMessage(sessionId, "user", prompt, { category, language, attachmentsCount: attachments.length });
    }

    const replyText = `Routed to ${targetEngine} for category "${category}". Connect live provider SDK/API calls on your dev server to return real generated output.`;
    const savedBot = saveChatMessage(sessionId, "assistant", replyText, {
      routedTo: targetEngine,
      category,
      language
    });

    return res.json({
      ok: true,
      router: "PK-AI-MASTER-HUB",
      routedTo: targetEngine,
      category,
      language,
      userPlan: user.plan,
      dailyPoints: user.dailyPoints,
      reply: replyText,
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

// Crypto Payment Verification Intake Endpoint
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

// KYC & Security Settings Endpoint
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
