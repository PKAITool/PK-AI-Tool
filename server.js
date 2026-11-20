const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Privacy & Identity Abstraction Middleware
app.use((req, res, next) => {
  req.clientContext = {
    sessionId: req.headers["x-session-id"] || "anonymous-session",
    language: req.headers["x-user-language"] || "auto",
    timestamp: new Date().toISOString()
  };
  // Strip raw IP / identifying headers before downstream tool routing
  delete req.headers["x-forwarded-for"];
  next();
});

// Health & Router Status Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    platform: "PK AI Tool",
    routerMode: "master-hub",
    supportedCategoriesCount: 50000
  });
});

// Master Hub / Tool Router Endpoint
app.post("/api/route", async (req, res) => {
  try {
    const { prompt, category = "general", language = "auto", attachments = [] } = req.body;

    if (!prompt && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        ok: false,
        error: "Prompt or attachment is required."
      });
    }

    // Route selection based on category / task type
    let targetEngine = "GENERAL_TEXT_ENGINE";
    if (["image", "photo", "thumbnail", "face-edit"].includes(category.toLowerCase())) {
      targetEngine = "MEDIA_IMAGE_ENGINE";
    } else if (["audio", "music", "song", "voice"].includes(category.toLowerCase())) {
      targetEngine = "AUDIO_VOICE_ENGINE";
    } else if (["video", "edit", "reel"].includes(category.toLowerCase())) {
      targetEngine = "VIDEO_MEDIA_ENGINE";
    } else if (["app", "code", "software", "web"].includes(category.toLowerCase())) {
      targetEngine = "CODE_APP_BUILDER_ENGINE";
    }

    // Placeholder for connecting your configured API keys and persistent DB storage
    const apiKeyConfigured = Boolean(process.env.MASTER_PROVIDER_API_KEY);

    return res.json({
      ok: true,
      router: "PK-AI-MASTER-HUB",
      routedTo: targetEngine,
      category,
      language,
      attachmentsCount: attachments.length,
      providerReady: apiKeyConfigured,
      reply: `Routed to ${targetEngine} for category "${category}". Connect provider handler and database persistence to return live output.`
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
  const { planName, network, txHash } = req.body;
  if (!planName || !network || !txHash) {
    return res.status(400).json({
      ok: false,
      error: "planName, network, and txHash are required."
    });
  }

  return res.json({
    ok: true,
    status: "pending_blockchain_verification",
    planName,
    network,
    txHash
  });
});

// KYC & Security Settings Endpoint
app.post("/api/security/kyc", (req, res) => {
  const { country, idNumber, hasTwoFactor, hasAppPin } = req.body;
  if (!country || !idNumber) {
    return res.status(400).json({
      ok: false,
      error: "Country and official ID number are required."
    });
  }

  return res.json({
    ok: true,
    status: "kyc_submitted_for_review",
    hasTwoFactor: Boolean(hasTwoFactor),
    hasAppPin: Boolean(hasAppPin)
  });
});

app.listen(PORT, () => {
  console.log(`PK AI Tool backend server running on port ${PORT}`);
});
