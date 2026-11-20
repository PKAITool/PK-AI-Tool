const translations = {
  en: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  },
  ur: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  },
  hi: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  },
  ar: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  },
  es: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  },
  fr: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  },
  zh: {
    newChat: "+ New Chat",
    recentChats: "Recent Chats",
    defaultWorkspace: "Main Workspace",
    languageLabel: "Language",
    guides: "Guides & Help",
    settings: "Account Settings",
    welcomeTitle: "Welcome to PK AI Tool",
    welcomeSubtitle: "Universal AI workspace supporting global languages, media, and tools.",
    inputPlaceholder: "Ask anything in any language...",
    send: "Send",
    like: "Like",
    dislike: "Dislike",
    refresh: "Refresh",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    more: "•••",
    deleteMsg: "Delete message",
    exportMsg: "Save as text"
  }
};

const promptInput = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const chatContainer = document.getElementById("chatContainer");
const welcomeCard = document.getElementById("welcomeCard");
const newChatBtn = document.getElementById("newChatBtn");
const plusBtn = document.getElementById("plusBtn");
const fileInput = document.getElementById("fileInput");
const micBtn = document.getElementById("micBtn");
const guidesBtn = document.getElementById("guidesBtn");
const settingsBtn = document.getElementById("settingsBtn");
const toggleMenuBtn = document.getElementById("toggleMenuBtn");
const sidebar = document.getElementById("sidebar");
const languageSelect = document.getElementById("languageSelect");

let currentLang = "en";

function resolveLanguage(selectedValue) {
  if (selectedValue !== "auto") {
    return selectedValue;
  }
  const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return translations[browserLang] ? browserLang : "en";
}

function applyLanguage(selectedValue) {
  localStorage.setItem("pk_ai_lang", selectedValue);
  currentLang = resolveLanguage(selectedValue);
  const dict = translations[currentLang] || translations.en;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
}

function hideWelcome() {
  if (welcomeCard) {
    welcomeCard.style.display = "none";
  }
}

function appendUserMessage(text) {
  hideWelcome();
  const block = document.createElement("div");
  block.className = "message-block user-block";

  const msg = document.createElement("div");
  msg.className = "message user-msg";
  msg.textContent = text;

  block.appendChild(msg);
  chatContainer.appendChild(block);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function generateResponseText(userPrompt, attempt = 1) {
  return `Request received (attempt ${attempt}): "${userPrompt}". Connected to PK AI Tool router.`;
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang;
  window.speechSynthesis.speak(utterance);
}

function appendBotMessage(userPrompt, attempt = 1) {
  hideWelcome();
  const dict = translations[currentLang] || translations.en;
  const responseText = generateResponseText(userPrompt, attempt);

  const block = document.createElement("div");
  block.className = "message-block bot-block";

  const msg = document.createElement("div");
  msg.className = "message bot-msg";
  msg.textContent = responseText;

  const actions = document.createElement("div");
  actions.className = "msg-actions";

  const likeBtn = document.createElement("button");
  likeBtn.className = "action-btn";
  likeBtn.textContent = dict.like;

  const dislikeBtn = document.createElement("button");
  dislikeBtn.className = "action-btn";
  dislikeBtn.textContent = dict.dislike;

  likeBtn.addEventListener("click", () => {
    likeBtn.classList.toggle("active");
    dislikeBtn.classList.remove("active");
  });

  dislikeBtn.addEventListener("click", () => {
    dislikeBtn.classList.toggle("active");
    likeBtn.classList.remove("active");
  });

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "action-btn";
  refreshBtn.textContent = dict.refresh;
  refreshBtn.addEventListener("click", () => {
    msg.textContent = generateResponseText(userPrompt, attempt + 1);
  });

  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn";
  copyBtn.textContent = dict.copy;
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(msg.textContent);
      copyBtn.textContent = dict.copied;
      setTimeout(() => {
        copyBtn.textContent = dict.copy;
      }, 1500);
    } catch (_) {}
  });

  const listenBtn = document.createElement("button");
  listenBtn.className = "action-btn";
  listenBtn.textContent = dict.listen;
  listenBtn.addEventListener("click", () => {
    speakText(msg.textContent);
  });

  const moreBtn = document.createElement("button");
  moreBtn.className = "action-btn";
  moreBtn.textContent = dict.more;

  const moreMenu = document.createElement("div");
  moreMenu.className = "more-menu";

  const deleteItem = document.createElement("button");
  deleteItem.className = "more-item";
  deleteItem.textContent = dict.deleteMsg;
  deleteItem.addEventListener("click", () => {
    block.remove();
  });

  const exportItem = document.createElement("button");
  exportItem.className = "more-item";
  exportItem.textContent = dict.exportMsg;
  exportItem.addEventListener("click", () => {
    const blob = new Blob([msg.textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pk-ai-response.txt";
    a.click();
    URL.revokeObjectURL(url);
    moreMenu.classList.remove("open");
  });

  moreMenu.appendChild(deleteItem);
  moreMenu.appendChild(exportItem);

  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".more-menu.open").forEach((menu) => {
      if (menu !== moreMenu) menu.classList.remove("open");
    });
    moreMenu.classList.toggle("open");
  });

  actions.appendChild(likeBtn);
  actions.appendChild(dislikeBtn);
  actions.appendChild(refreshBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(listenBtn);
  actions.appendChild(moreBtn);
  actions.appendChild(moreMenu);

  block.appendChild(msg);
  block.appendChild(actions);
  chatContainer.appendChild(block);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleSend() {
  const text = promptInput.value.trim();
  if (!text) return;
  appendUserMessage(text);
  promptInput.value = "";
  appendBotMessage(text, 1);
}

sendBtn.addEventListener("click", handleSend);

promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
});

newChatBtn.addEventListener("click", () => {
  chatContainer.innerHTML = "";
  appendBotMessage("New session started.", 1);
});

plusBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  if (!fileInput.files.length) return;
  const names = Array.from(fileInput.files).map((f) => f.name).join(", ");
  appendUserMessage(`Attached: ${names}`);
  appendBotMessage(`Files ready for processing: ${names}`, 1);
  fileInput.value = "";
});

micBtn.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    appendBotMessage("Voice recognition is not supported in this browser.", 1);
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = currentLang;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    promptInput.value = transcript;
    handleSend();
  };
  recognition.start();
});

guidesBtn.addEventListener("click", () => {
  appendBotMessage("Guides: Select language, attach files with (+), use Mic, or open Account Settings.", 1);
});

settingsBtn.addEventListener("click", () => {
  appendBotMessage("Account Settings: Profile, 10 daily free points, crypto plans, and security controls.", 1);
});

toggleMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

languageSelect.addEventListener("change", (e) => {
  applyLanguage(e.target.value);
});

document.addEventListener("click", () => {
  document.querySelectorAll(".more-menu.open").forEach((menu) => {
    menu.classList.remove("open");
  });
});

const savedLang = localStorage.getItem("pk_ai_lang") || "auto";
languageSelect.value = savedLang;
applyLanguage(savedLang);
