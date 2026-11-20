// PK AI Tool - Persistent Storage & History Module (db.js)
// Uses environment configuration on your dev system/server without hardcoded secrets.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "local-data");
const STORE_FILE = path.join(DATA_DIR, "pk-ai-store.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initialState = {
      users: {},
      chats: {},
      payments: [],
      kycRecords: []
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialState, null, 2), "utf8");
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(STORE_FILE, "utf8");
  return JSON.parse(raw);
}

function writeStore(data) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

function getOrCreateUser(userId = "guest-user") {
  const store = readStore();
  if (!store.users[userId]) {
    store.users[userId] = {
      userId,
      plan: "free",
      dailyPoints: 10,
      lastResetDate: new Date().toISOString().slice(0, 10),
      verifiedBadge: false,
      createdAt: new Date().toISOString()
    };
    writeStore(store);
  }
  return store.users[userId];
}

function saveChatMessage(sessionId, role, content, meta = {}) {
  const store = readStore();
  if (!store.chats[sessionId]) {
    store.chats[sessionId] = [];
  }
  const entry = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    meta,
    createdAt: new Date().toISOString()
  };
  store.chats[sessionId].push(entry);
  writeStore(store);
  return entry;
}

function getChatHistory(sessionId) {
  const store = readStore();
  return store.chats[sessionId] || [];
}

function recordCryptoPayment(paymentInfo) {
  const store = readStore();
  const record = {
    id: `pay_${Date.now()}`,
    ...paymentInfo,
    status: "pending_verification",
    createdAt: new Date().toISOString()
  };
  store.payments.push(record);
  writeStore(store);
  return record;
}

function recordKycSubmission(kycInfo) {
  const store = readStore();
  const record = {
    id: `kyc_${Date.now()}`,
    ...kycInfo,
    status: "submitted_for_review",
    createdAt: new Date().toISOString()
  };
  store.kycRecords.push(record);
  writeStore(store);
  return record;
}

function getDatabaseStatus() {
  const hasMongoUri = Boolean(process.env.MONGODB_URI);
  const hasFirebaseProject = Boolean(process.env.FIREBASE_PROJECT_ID);
  return {
    localFallbackStore: STORE_FILE,
    mongodbConfigured: hasMongoUri,
    firebaseConfigured: hasFirebaseProject
  };
}

module.exports = {
  getOrCreateUser,
  saveChatMessage,
  getChatHistory,
  recordCryptoPayment,
  recordKycSubmission,
  getDatabaseStatus
};
