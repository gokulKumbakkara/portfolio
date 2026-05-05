export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── INPUT VALIDATION ──────────────────────────────────
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (message.length > 600) {
    return res.status(400).json({ error: 'Message too long (max 600 chars)' });
  }

  // ── ENV VARS ──────────────────────────────────────────
  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'Service not configured' });
  }

  // Resume text is stored as a Vercel environment variable.
  // Set RESUME_TEXT in your Vercel dashboard → Settings → Environment Variables.
  // Paste the plain text of your resume there (copy from your PDF).
  const RESUME = process.env.RESUME_TEXT ||
    '[Resume not yet configured — add RESUME_TEXT env var in Vercel dashboard]';

  // ── SYSTEM PROMPT + GUARDRAILS ────────────────────────
  const systemPrompt = `You are Nexus, the AI assistant embedded in Gokul Kumbakkara's portfolio website. Your sole purpose is to answer questions about Gokul's professional background — skills, work experience, projects, education, and achievements.

STRICT RULES:
1. Only answer questions directly related to Gokul's professional profile.
2. If a question is off-topic (general knowledge, weather, coding tutorials, opinions about other people, anything personal not in the resume), respond with exactly this phrase: "I'm focused on Gokul's professional profile — ask me about his skills, projects, or experience."
3. Keep all responses to 2–3 sentences maximum. Be concise and professional.
4. Never invent or speculate beyond what is written in the resume below.
5. Always refer to Gokul in the third person.

GOKUL'S RESUME:
---
${RESUME}
---`;

  // ── GROQ API CALL ─────────────────────────────────────
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: message },
        ],
        max_tokens: 220,
        temperature: 0.35,
      }),
    });

    const data = await groqRes.json();

    if (data.error) {
      console.error('Groq API error:', data.error);
      throw new Error(data.error.message);
    }

    return res.status(200).json({
      reply: data.choices[0].message.content.trim(),
    });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({
      error: 'Could not reach AI service — please try again shortly.',
    });
  }
}
