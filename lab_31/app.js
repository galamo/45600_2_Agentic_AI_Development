// USED*SKILL*(axios-http-enforcer)
(() => {
  const WEBHOOK_URL =
    "http://localhost:5678/webhook/c9bd1962-3d4f-43e4-8b34-514036c97e9b";

  const form = document.getElementById("chat-form");
  const input = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");
  const messagesEl = document.getElementById("chat-messages");
  const progressWrap = document.getElementById("progress-wrap");
  const progressFill = document.getElementById("progress-fill");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const progressPct = document.getElementById("progress-pct");

  const PROGRESS_STEPS = [
    "Checking the fleet…",
    "Looking up cars & owners…",
    "Gathering rental details…",
    "Preparing your answer…",
  ];

  let progressTimer = null;
  let progressValue = 0;

  function appendMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = `msg ${role}`;

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.textContent =
      role === "user"
        ? "You"
        : role === "error"
          ? "Channel error"
          : "Cars Rental Agent";

    const body = document.createElement("p");
    body.textContent = text;

    wrap.append(meta, body);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function extractReply(data) {
    if (data == null) return "No response from the agent.";
    if (typeof data === "string") return data;

    if (Array.isArray(data)) {
      const parts = data
        .map((item) => extractReply(item))
        .filter((part) => part && part !== "No response from the agent.");
      return parts.join("\n\n") || "No response from the agent.";
    }

    if (typeof data === "object") {
      const candidates = [
        data.output,
        data.text,
        data.message,
        data.response,
        data.answer,
        data.result,
        data.data,
      ];

      for (const value of candidates) {
        if (value == null) continue;
        if (typeof value === "string" && value.trim()) return value;
        if (typeof value === "object") {
          const nested = extractReply(value);
          if (nested && nested !== "No response from the agent.") return nested;
        }
      }

      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return "Received a response that could not be displayed.";
      }
    }

    return String(data);
  }

  function setBusy(busy) {
    input.disabled = busy;
    sendBtn.disabled = busy;
  }

  function setProgress(value, label) {
    progressValue = Math.max(0, Math.min(100, value));
    progressFill.style.width = `${progressValue}%`;
    progressBar.setAttribute("aria-valuenow", String(Math.round(progressValue)));
    progressPct.textContent = `${Math.round(progressValue)}%`;
    if (label) progressText.textContent = label;
  }

  function startProgress() {
    progressWrap.hidden = false;
    setProgress(8, PROGRESS_STEPS[0]);

    let stepIndex = 0;
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      if (progressValue >= 90) return;

      const next = progressValue + (progressValue < 40 ? 7 : progressValue < 70 ? 4 : 2);
      if (next > 28 && stepIndex < 1) stepIndex = 1;
      if (next > 55 && stepIndex < 2) stepIndex = 2;
      if (next > 75 && stepIndex < 3) stepIndex = 3;
      setProgress(Math.min(next, 90), PROGRESS_STEPS[stepIndex]);
    }, 450);
  }

  function finishProgress(success) {
    clearInterval(progressTimer);
    progressTimer = null;
    setProgress(100, success ? "Reply received" : "Request finished");

    window.setTimeout(() => {
      progressWrap.hidden = true;
      setProgress(0, PROGRESS_STEPS[0]);
    }, 450);
  }

  async function sendMessage(question) {
    appendMessage("user", question);
    setBusy(true);
    startProgress();

    try {
      const { data } = await axios.get(WEBHOOK_URL, {
        params: { message: question },
        timeout: 120000,
      });

      finishProgress(true);
      appendMessage("bot", extractReply(data));
    } catch (err) {
      finishProgress(false);
      const status = err.response?.status;
      const detail =
        (typeof err.response?.data === "string" && err.response.data) ||
        err.response?.data?.message ||
        err.message ||
        "Unknown error";
      const hint = status
        ? `Request failed (${status}): ${detail}`
        : `Could not reach the agent: ${detail}. Is n8n running on localhost:5678?`;
      appendMessage("error", hint);
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || sendBtn.disabled) return;
    input.value = "";
    sendMessage(question);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  input.focus();
})();
