// =============================================================
// nexus.js — RAG terminal, calls /api/chat (Vercel + Groq)
// =============================================================

const SUGGESTIONS = [
  'WHO IS GOKUL?',
  'WHAT TECH DOES HE USE?',
  'TELL ME ABOUT HIS PROJECTS',
  'HOW TO REACH HIM?',
];

export function initNexus(root) {
  const chat = root.querySelector('#chat');
  const input = root.querySelector('#chat-input');
  const sendBtn = root.querySelector('#chat-send');
  const sgRow = root.querySelector('#chat-sugg');

  pushMsg(chat, 'sys', 'SYS', '◈ NEXUS_COGNITION.v3.1 // RAG INDEX LOADED');
  pushMsg(chat, 'sys', 'SYS', '◈ TYPE A QUERY OR TAP A SUGGESTION');

  SUGGESTIONS.forEach(s => {
    const b = document.createElement('button');
    b.className = 's';
    b.textContent = s;
    b.onclick = () => { input.value = s; submit(); };
    sgRow.appendChild(b);
  });

  let pending = false;
  async function submit() {
    if (pending) return;
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    pending = true;
    pushMsg(chat, 'user', 'YOU', escapeHtml(q));
    const thinking = pushMsg(chat, 'nexus', 'NEXUS', 'RETRIEVING<span class="blink">_</span>');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const data = await r.json();
      if (!r.ok || data.error) throw new Error(data.error || 'request failed');
      thinking.querySelector('.body').innerHTML = '';
      typeOut(thinking.querySelector('.body'), String(data.reply || '').trim());
    } catch (e) {
      thinking.querySelector('.body').textContent = '◈ ERR — neural link unreachable. retry.';
    } finally {
      pending = false;
    }
  }

  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  ['wheel', 'keydown'].forEach(ev =>
    root.addEventListener(ev, e => e.stopPropagation())
  );
}

function pushMsg(chat, kind, whoLabel, body) {
  const el = document.createElement('div');
  el.className = `msg ${kind}`;
  el.innerHTML = `<div class="who">${whoLabel}</div><div class="body">${body}</div>`;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function typeOut(el, text) {
  let i = 0;
  el.textContent = '';
  const tick = () => {
    if (i >= text.length) return;
    el.textContent += text[i++];
    const scroller = el.closest('#chat');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    setTimeout(tick, 10);
  };
  tick();
}
