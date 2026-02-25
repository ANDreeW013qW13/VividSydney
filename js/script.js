/* =========================
   Vivid Sydney 2026 — JS
   File: script.js
   - Calm toast notification
   - Saves reminder preference in localStorage
   ========================= */

(function () {
  "use strict";

  const REMINDER_KEY = "vividSydney2026_reminder";

  const reminderBtn = document.getElementById("reminderBtn");

  // ---- Toast (created dynamically so we don't need extra HTML) ----
  function createToastContainer() {
    let container = document.getElementById("toastContainer");
    if (container) return container;

    container = document.createElement("div");
    container.id = "toastContainer";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");

    // minimal inline styling (so it works even if you change CSS later)
    container.style.position = "fixed";
    container.style.right = "16px";
    container.style.bottom = "16px";
    container.style.zIndex = "9999";
    container.style.display = "grid";
    container.style.gap = "10px";
    container.style.maxWidth = "320px";

    document.body.appendChild(container);
    return container;
  }

  function toast(message, options = {}) {
    const container = createToastContainer();

    const el = document.createElement("div");
    el.setAttribute("role", "status");
    el.tabIndex = -1;

    // calm, not-too-vibrant style
    el.style.padding = "12px 14px";
    el.style.borderRadius = "14px";
    el.style.border = "1px solid rgba(255,255,255,0.14)";
    el.style.background = "rgba(11, 18, 32, 0.85)";
    el.style.backdropFilter = "blur(10px)";
    el.style.color = "rgba(255,255,255,0.92)";
    el.style.boxShadow = "0 10px 25px rgba(0,0,0,0.35)";
    el.style.fontWeight = "600";
    el.style.lineHeight = "1.35";

    // animation
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    el.style.transition = "opacity 180ms ease, transform 180ms ease";

    el.textContent = message;

    // optional action button
    if (options.actionText && typeof options.onAction === "function") {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.gap = "10px";
      row.style.marginTop = "10px";

      const msg = document.createElement("span");
      msg.textContent = message;

      // replace text content with structured row
      el.textContent = "";
      el.appendChild(row);
      row.appendChild(msg);

      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.textContent = options.actionText;
      actionBtn.style.borderRadius = "999px";
      actionBtn.style.padding = "8px 12px";
      actionBtn.style.border = "1px solid rgba(255,255,255,0.16)";
      actionBtn.style.background = "rgba(255,255,255,0.06)";
      actionBtn.style.color = "rgba(255,255,255,0.92)";
      actionBtn.style.cursor = "pointer";
      actionBtn.style.fontWeight = "650";

      actionBtn.addEventListener("click", () => {
        options.onAction();
        removeToast(el);
      });

      row.appendChild(actionBtn);
    }

    // close on click anywhere
    el.addEventListener("click", () => removeToast(el));

    container.appendChild(el);

    // trigger animation
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });

    const duration = Number.isFinite(options.duration) ? options.duration : 3200;
    const timer = window.setTimeout(() => removeToast(el), duration);

    // if removed early, clear timer
    el._toastTimer = timer;

    return el;
  }

  function removeToast(el) {
    if (!el) return;
    if (el._toastTimer) window.clearTimeout(el._toastTimer);

    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";

    window.setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }

  // ---- Reminder logic ----
  function saveReminder() {
    const payload = {
      enabled: true,
      savedAt: new Date().toISOString(),
      event: "Vivid Sydney 2026",
      dates: "22 May – 13 June 2026"
    };
    localStorage.setItem(REMINDER_KEY, JSON.stringify(payload));
  }

  function clearReminder() {
    localStorage.removeItem(REMINDER_KEY);
  }

  function getReminder() {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      // corrupted value -> clean up
      clearReminder();
      return null;
    }
  }

  function updateReminderBtnState() {
    if (!reminderBtn) return;

    const existing = getReminder();
    if (existing?.enabled) {
      reminderBtn.textContent = "Reminder saved ✓";
      reminderBtn.setAttribute("aria-pressed", "true");
      reminderBtn.dataset.state = "saved";
    } else {
      reminderBtn.textContent = "Remind me";
      reminderBtn.setAttribute("aria-pressed", "false");
      reminderBtn.dataset.state = "idle";
    }
  }

  function handleReminderClick() {
    const existing = getReminder();

    if (existing?.enabled) {
      toast("Reminder is already saved.", {
        actionText: "Remove",
        onAction: () => {
          clearReminder();
          updateReminderBtnState();
          toast("Reminder removed.", { duration: 2200 });
        }
      });
      return;
    }

    saveReminder();
    updateReminderBtnState();
    toast("Done! We saved a reminder on this device.", { duration: 3200 });
  }

  // ---- Init ----
  document.addEventListener("DOMContentLoaded", () => {
    updateReminderBtnState();

    if (reminderBtn) {
      reminderBtn.addEventListener("click", handleReminderClick);
    }

    // Optional: subtle welcome toast if reminder exists
    const existing = getReminder();
    if (existing?.enabled) {
      toast("Welcome back! Your reminder is still saved ✓", { duration: 2400 });
    }
  });
})();