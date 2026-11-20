// PK AI Tool - Frontend Controller & Backend Connector (app.js)

const API_BASE = window.PK_AI_API_BASE || "";

const state = {
  userId: localStorage.getItem("pk_ai_user_id") || "guest-user",
  sessionId: localStorage.getItem("pk_ai_session_id") || "default-session",
  language: localStorage.getItem("pk_ai_language") || "auto",
  category: "general",
  dailyPoints: 10,
  plan: "free",
  history: []
};

function saveClientPrefs() {
  localStorage.setItem("pk_ai_user_id", state.userId);
  localStorage.setItem("pk_ai_session_id", state.sessionId);
  localStorage.setItem("pk_ai_language", state.language);
}

function renderMessage(role, text, meta = {}) {
  const container =
    document.getElementById("chat-messages") ||
    document.querySelector(".chat-messages") ||
    document.body;

  const item = document.createElement("div");
  item.className = `chat-message chat-message--${role}`;
  item.dataset.category = meta.category || state.category;
  item.textContent = `${role === "user" ? "You" : "PK AI"}: ${text}`;
  container.appendChild(item);

  if (container === document.body) {
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    container.scrollTop = container.scrollHeight;
  }
}

function updateUserStatusUI(user) {
  if (!user) return;
  state.plan = user.plan || state.plan;
  state.dailyPoints = typeof user.dailyPoints === "number" ? user.dailyPoints : state.dailyPoints;

  const pointsEl = document.getElementById("daily-points-display");
  const planEl = document.getElementById("user-plan-display");
  if (pointsEl) pointsEl.textContent = String(state.dailyPoints);
  if (planEl) planEl.textContent = state.plan;
}

async function loadSessionHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/session/${encodeURIComponent(state.sessionId)}`, {
      headers: {
        "x-user-id": state.userId,
        "x-session-id": state.sessionId,
        "x-user-language": state.language
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.user) updateUserStatusUI(data.user);
    if (Array.isArray(data.history)) {
      state.history = data.history;
      data.history.forEach((msg) => renderMessage(msg.role, msg.content, msg.meta));
    }
  } catch (err) {
    console.warn("Session history load skipped:", err.message);
  }
}

async function sendPromptToRouter(promptText, options = {}) {
  const prompt = (promptText || "").trim();
  const attachments = options.attachments || [];
  const category = options.category || state.category || "general";

  if (!prompt && attachments.length === 0) return null;

  if (prompt) {
    renderMessage("user", prompt, { category });
  }

  try {
    const res = await fetch(`${API_BASE}/api/route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": state.userId,
        "x-session-id": state.sessionId,
        "x-user-language": state.language
      },
      body: JSON.stringify({
        prompt,
        category,
        language: state.language,
        sessionId: state.sessionId,
        userId: state.userId,
        attachments
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      const errMsg = data.error || "Unable to route request.";
      renderMessage("assistant", `Error: ${errMsg}`);
      return null;
    }

    if (typeof data.dailyPoints === "number") {
      updateUserStatusUI({ plan: data.userPlan, dailyPoints: data.dailyPoints });
    }

    const replyText = data.reply || "Response received.";
    renderMessage("assistant", replyText, {
      category: data.category,
      routedTo: data.routedTo
    });
    return data;
  } catch (err) {
    renderMessage("assistant", `Network error: ${err.message}`);
    return null;
  }
}

function bindUIEvents() {
  const form = document.getElementById("chat-form") || document.querySelector("form");
  const input =
    document.getElementById("prompt-input") ||
    document.querySelector("textarea, input[type='text']");

  if (form && input) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value;
      input.value = "";
      await sendPromptToRouter(text);
    });
  }

  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.getAttribute("data-category") || "general";
      saveClientPrefs();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  saveClientPrefs();
  bindUIEvents();
  loadSessionHistory();
});

window.PK_AI_CLIENT = {
  state,
  sendPromptToRouter,
  loadSessionHistory
};
