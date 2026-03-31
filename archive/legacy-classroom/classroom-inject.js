// ─────────────────────────────────────────────────────────────
// classroom-inject.js — MilEd.One
// Add this script to chat.html (before closing </body>)
// Adds: teacher broadcast banner + step submission + session sync
// Zero changes to existing chat.js or OpenRouter calls.
// ─────────────────────────────────────────────────────────────

(function() {

  // ── Read sessionId from URL params ──────────────────────────
  const params    = new URLSearchParams(location.search);
  const sessionId = params.get('sessionId');

  // If no sessionId — not a classroom session, do nothing
  if (!sessionId) return;

  const studentId = sessionStorage.getItem('studentId') ||
    ('s_' + Math.random().toString(36).slice(2, 10));
  sessionStorage.setItem('studentId', studentId);

  // ── Inject broadcast banner above chat ──────────────────────
  const banner = document.createElement('div');
  banner.id = 'classroomBanner';
  banner.style.cssText = `
    display:none;
    background:#e8f4fd;
    border-right:4px solid #2980b9;
    border-radius:10px;
    padding:14px 18px;
    margin-bottom:16px;
    font-family:'Segoe UI',Tahoma,sans-serif;
  `;
  banner.innerHTML = `
    <div style="font-size:.75rem;font-weight:700;color:#2980b9;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">
      📡 חומר מהמרצה
    </div>
    <div id="classroomBroadcastText" style="font-size:.95rem;color:#1a3a5c;line-height:1.6;white-space:pre-wrap;"></div>
    <div id="classroomStepLabel" style="font-size:.75rem;color:#7f8c8d;margin-top:6px;"></div>
  `;

  // ── Inject step locked overlay ───────────────────────────────
  const lockOverlay = document.createElement('div');
  lockOverlay.id = 'classroomLock';
  lockOverlay.style.cssText = `
    display:none;
    background:#fff5f5;
    border:2px solid #e74c3c;
    border-radius:10px;
    padding:16px;
    text-align:center;
    margin-top:12px;
    font-family:'Segoe UI',Tahoma,sans-serif;
    color:#c0392b;
    font-weight:600;
  `;
  lockOverlay.textContent = '🔒 שלב זה נעול — המרצה יפתח אותו בקרוב';

  // ── Inject submit button ─────────────────────────────────────
  const submitBtn = document.createElement('button');
  submitBtn.id = 'classroomSubmitBtn';
  submitBtn.textContent = '📤 שלח למרצה';
  submitBtn.style.cssText = `
    display:none;
    background:#27ae60;
    color:white;
    border:none;
    border-radius:8px;
    padding:10px 20px;
    font-size:.9rem;
    font-weight:700;
    cursor:pointer;
    margin-top:10px;
    font-family:'Segoe UI',Tahoma,sans-serif;
  `;

  // ── Find chat container and inject ──────────────────────────
  // Works with existing chat.html layout (finds first scrollable div or body)
  function inject() {
    const chatBox =
      document.querySelector('.chat-container') ||
      document.querySelector('.chat-box') ||
      document.querySelector('main') ||
      document.body;

    chatBox.insertBefore(banner,     chatBox.firstChild);
    chatBox.insertBefore(lockOverlay, chatBox.firstChild);
    chatBox.appendChild(submitBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // ── State ────────────────────────────────────────────────────
  let currentBroadcast = null;
  let currentStep      = 1;
  let isLocked         = false;
  let lastSubmittedStep = 0;

  // ── Poll classroom function every 4 seconds ──────────────────
  async function poll() {
    try {
      const res = await fetch(
        `/.netlify/functions/classroom?sessionId=${sessionId}&studentId=${studentId}`
      );
      const data = await res.json();

      // Update broadcast banner
      if (data.broadcast && data.broadcast !== currentBroadcast) {
        currentBroadcast = data.broadcast;
        currentStep      = data.currentStep || 1;

        document.getElementById('classroomBroadcastText').textContent = data.broadcast;
        document.getElementById('classroomStepLabel').textContent =
          `שלב ${currentStep}`;
        document.getElementById('classroomBanner').style.display = 'block';
        submitBtn.style.display = 'block';
      }

      // Update lock state
      const newLocked = data.stepLocked === true;
      if (newLocked !== isLocked) {
        isLocked = newLocked;
        lockOverlay.style.display = isLocked ? 'block' : 'none';

        // Disable chat input when locked
        const input = document.querySelector('input[type=text], textarea');
        if (input) input.disabled = isLocked;

        const sendBtn = document.querySelector('button[type=submit], #sendBtn, .send-btn');
        if (sendBtn) sendBtn.disabled = isLocked;
      }

      // Session ended
      if (!data.sessionActive) {
        clearInterval(pollTimer);
        banner.style.background = '#f8f8f8';
        document.querySelector('#classroomBroadcastText').textContent +=
          '\n\n[השיעור הסתיים]';
      }

    } catch(e) {
      console.warn('[classroom] poll error:', e);
    }
  }

  // announce student joined
fetch('/.netlify/functions/classroom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'join', sessionId, studentId }),
});

const pollTimer = setInterval(poll, 4000);
poll();

  // ── Submit button: send last bot reply as answer ─────────────
  submitBtn.addEventListener('click', async () => {
    if (lastSubmittedStep === currentStep) {
      alert('כבר שלחת את התשובה לשלב זה ✅');
      return;
    }

    // Get last assistant message from chat history
    const msgs = document.querySelectorAll(
      '.assistant-msg, .bot-message, [data-role="assistant"], .message.ai'
    );
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].textContent.trim() : '';

    if (!lastMsg) {
      alert('שוחח תחילה עם הבוט ואז שלח את התשובה');
      return;
    }

    try {
      await fetch('/.netlify/functions/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          sessionId,
          studentId,
          step: currentStep,
          content: lastMsg.slice(0, 800), // cap at 800 chars
        }),
      });

      lastSubmittedStep = currentStep;
      submitBtn.textContent = '✅ נשלח למרצה!';
      submitBtn.style.background = '#a0c4a0';
      setTimeout(() => {
        submitBtn.textContent = '📤 שלח למרצה';
        submitBtn.style.background = '#27ae60';
      }, 3000);

    } catch(e) {
      alert('שגיאה בשליחה — נסה שוב');
    }
  });

})();
