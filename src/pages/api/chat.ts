export const prerender = false;

const SYSTEM_PROMPT = `You are the AYBU Software Engineering student assistant. Answer ONLY questions about: courses, prerequisites, internships (staj), graduation requirements, electives, the SE Club (ASEC), pathways (double major, exchange, graduate study), and contact info. Keep answers under 120 words. When you cite a section, use anchor links like <a href="#curriculum">Curriculum</a>, #internship, #graduation, #pathways, #club, #people. Use the provided context. If you don't know, say so and suggest where to look. Plain HTML allowed; no markdown.`;

interface ChatBody {
  query?: string;
  context?: string;
  lang?: string;
}

async function callGroq(apiKey: string, query: string, context: string, lang: string) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 350,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + `\n\nReply in language: ${lang}.` },
        { role: 'system', content: `Knowledge base:\n${context}` },
        { role: 'user', content: query },
      ],
    }),
  });
  if (!r.ok) throw new Error(`groq ${r.status}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(apiKey: string, query: string, context: string, lang: string) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nReply in language: ${lang}.\n\nKnowledge base:\n${context}\n\nQuestion: ${query}`,
              },
            ],
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

export async function POST({ request }: { request: Request }) {
  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad json' }), { status: 400 });
  }
  const query = (body.query || '').slice(0, 500).trim();
  const context = (body.context || '').slice(0, 6000);
  const lang = (body.lang || 'en').slice(0, 5);
  if (!query) return new Response(JSON.stringify({ error: 'empty query' }), { status: 400 });

  const groqKey = import.meta.env.GROQ_API_KEY || process.env.GROQ_API_KEY;
  const geminiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  try {
    let answer: string | null = null;
    if (groqKey) {
      answer = await callGroq(groqKey, query, context, lang);
    } else if (geminiKey) {
      answer = await callGemini(geminiKey, query, context, lang);
    } else {
      return new Response(JSON.stringify({ error: 'no api key configured' }), { status: 503 });
    }
    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    if (geminiKey && groqKey) {
      try {
        const answer = await callGemini(geminiKey, query, context, lang);
        return new Response(JSON.stringify({ answer }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {}
    }
    return new Response(JSON.stringify({ error: e?.message || 'upstream error' }), { status: 502 });
  }
}
