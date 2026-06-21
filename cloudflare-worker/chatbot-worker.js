/**
 * Cloudflare Worker — SENG chatbot proxy.
 * Deploy free at https://workers.cloudflare.com (100k req/day free tier).
 *
 * 1. Create a Worker, paste this file.
 * 2. Add secrets:
 *      wrangler secret put GROQ_API_KEY
 *      wrangler secret put GEMINI_API_KEY   (optional fallback)
 *    Or via dashboard → Settings → Variables → Encrypt.
 * 3. Set ALLOWED_ORIGIN env var (plain) to your site URL,
 *      e.g. https://mohamedattiadev.github.io
 * 4. Deploy. Copy the *.workers.dev URL.
 * 5. In the site, set window.__CHAT_ENDPOINT to that URL before main.js runs
 *    (see Base.astro snippet in the README).
 */

const SYSTEM_PROMPT = `You are the AYBU Software Engineering student assistant. Answer ONLY questions about: courses, prerequisites, internships (staj), graduation requirements, electives, the SE Club (ASEC), pathways (double major, exchange, graduate study), and contact info. Keep answers under 120 words. When you cite a section, use anchor links like <a href="#curriculum">Curriculum</a>, #internship, #graduation, #pathways, #club, #people. Use the provided context. If you don't know, say so and suggest where to look. Plain HTML allowed; no markdown.`;

async function callGroq(apiKey, query, context, lang) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 350,
      temperature: 0.3,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nReply in language: ${lang}.` },
        { role: 'system', content: `Knowledge base:\n${context}` },
        { role: 'user', content: query },
      ],
    }),
  });
  if (!r.ok) throw new Error(`groq ${r.status}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(apiKey, query, context, lang) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nReply in language: ${lang}.\n\nKnowledge base:\n${context}\n\nQuestion: ${query}` }],
          },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 350 },
      }),
    }
  );
  if (!r.ok) throw new Error(`gemini ${r.status}`);
  const data = await r.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

function cors(origin, allowed) {
  const ok = !allowed || allowed === '*' || origin === allowed;
  return {
    'Access-Control-Allow-Origin': ok ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// In-memory per-IP rate limit (best-effort, isolate-local).
const rate = new Map();
function rateLimit(ip, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = rate.get(ip) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }
  entry.count++;
  rate.set(ip, entry);
  return entry.count <= limit;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin, env.ALLOWED_ORIGIN);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST') return new Response('method not allowed', { status: 405, headers });

    const ip = request.headers.get('CF-Connecting-IP') || 'anon';
    if (!rateLimit(ip)) return new Response(JSON.stringify({ error: 'rate limit' }), { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } });

    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'bad json' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }); }
    const query = String(body.query || '').slice(0, 500).trim();
    const context = String(body.context || '').slice(0, 6000);
    const lang = String(body.lang || 'en').slice(0, 5);
    if (!query) return new Response(JSON.stringify({ error: 'empty query' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });

    try {
      let answer = null;
      if (env.GROQ_API_KEY) {
        try { answer = await callGroq(env.GROQ_API_KEY, query, context, lang); }
        catch (e) { if (env.GEMINI_API_KEY) answer = await callGemini(env.GEMINI_API_KEY, query, context, lang); else throw e; }
      } else if (env.GEMINI_API_KEY) {
        answer = await callGemini(env.GEMINI_API_KEY, query, context, lang);
      } else {
        return new Response(JSON.stringify({ error: 'no api key' }), { status: 503, headers: { ...headers, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ answer }), { headers: { ...headers, 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 502, headers: { ...headers, 'Content-Type': 'application/json' } });
    }
  },
};
