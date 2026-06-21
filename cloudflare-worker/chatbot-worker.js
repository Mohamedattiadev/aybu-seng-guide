/**
 * AYBU SENG chatbot — Cloudflare Worker proxy.
 *
 * Providers tried in order (rotates on quota/rate-limit/5xx):
 *   1. Groq (llama-3.3-70b-versatile — fast, generous free tier)
 *   2. Gemini (gemini-2.0-flash — large free quota)
 *   3. Groq fallback model (llama-3.1-8b-instant)
 *
 * Secrets (wrangler secret put NAME):
 *   GROQ_API_KEY, GEMINI_API_KEY
 *
 * Plain vars:
 *   ALLOWED_ORIGIN  (e.g. https://mohamedattiadev.github.io)
 */

const SITE_KB = `
SITE: AYBU Software Engineering Student Guide
URL:  https://mohamedattiadev.github.io/aybu-seng-guide/
Sections (use these anchors in answers): #home #curriculum #internship #graduation #pathways #people (staff) #club #resources

=== GRADUATION REQUIREMENTS ===
- 240 ECTS total
- GPA ≥ 2.00 / 4.00
- SENG300 + SENG400 (two 20-day mandatory internships)
- SENG401 + SENG402 (graduation project)
- ≥ 50 ECTS department electives (SENG-prefix)
- ≥ 6 ECTS faculty/university electives
- Official page: https://aybu.edu.tr/yazilimmuh/tr/sayfa/10324

=== ALL COURSES (code · name · ects · category · prereq) ===
PHYS101 Physics I · 4 ECTS · mandatory
PHYS103 Physics Laboratory I · 2 ECTS · mandatory
TDL101 Türk Dili I · 2 ECTS · mandatory
MATH101 Calculus I · 6 ECTS · mandatory
CHEM101 General Chemistry · 5 ECTS · mandatory
ENG101 Academic English I · 2 ECTS · mandatory
SENG113 Computer Programming I · 5 ECTS · mandatory
SENG101 Introduction to Software Engineering · 2 ECTS · mandatory
ENG102 Academic English II · 2 ECTS · mandatory
PHYS102 Physics II · 4 ECTS · mandatory
PHYS104 Physics Laboratory II · 2 ECTS · mandatory
MATH104 Applied Linear Algebra · 6 ECTS · mandatory
MATH102 Calculus II · 6 ECTS · mandatory · prereq MATH101
TDL102 Türk Dili II · 2 ECTS · mandatory
SENG114 Computer Programming II · 6 ECTS · mandatory · prereq SENG113
SENG207 Probability and Statistics · 6 ECTS · mandatory
SENG201 Object Oriented Programming · 6 ECTS · mandatory · prereq SENG114
ENGR201 Differential Equations · 6 ECTS · mandatory
SENG209 Software Requirements Engineering · 6 ECTS · mandatory
ENGR265 Occupational Health and Safety I · 3 ECTS · mandatory
SENG211 Software Project Management · 6 ECTS · mandatory
ENGR202 Discrete Mathematics · 6 ECTS · mandatory
SENG206 Concepts of Programming Languages · 6 ECTS · mandatory · prereq SENG114
ENGR266 Occupational Health and Safety II · 3 ECTS · mandatory
SENG214 Software Testing & QA · 6 ECTS · mandatory
SENG204 Data Structures · 6 ECTS · mandatory · prereq SENG201
SENG303 Design & Analysis of Algorithms · 5 ECTS · mandatory · prereq SENG204
SENG301 Database Management Systems · 5 ECTS · mandatory · prereq SENG201
SENG319 Software Design Patterns · 6 ECTS · mandatory · prereq SENG201
SENG305 Operating Systems · 6 ECTS · mandatory · prereq SENG204
SENG304 Computer Networks · 6 ECTS · mandatory
SENG326 Software Architecture · 6 ECTS · mandatory
SENG302 Secure Software Development · 6 ECTS · mandatory
SENG306 Scientific Computing · 7 ECTS · mandatory · prereq SENG113
SENG300 Summer Practice I · 4 ECTS · internship (after semester 4, 20 working days)
SENG400 Summer Practice II · 4 ECTS · internship (after semester 6, 20 working days)
SENG401 Graduation Project I · 6 ECTS · semester 7 · prereq SENG204
SENG402 Graduation Project II · 7 ECTS · semester 8 · prereq SENG204
Dept electives (5 ECTS each): SENG317 Artificial Intelligence, SENG410 Data Mining, SENG420 Natural Language Processing, SENG425 Data Science, SENG427 Bioinformatics, SENG428 Neural Networks, SENG445 Introduction to Machine Learning, SENG311 Web Technologies, SENG318 Rapid Application Development, SENG411 Web Programming, SENG415 Internet Engineering, SENG429 Cyber Security, SENG430 Information Security, SENG316 Computer Architecture, SENG418 Parallel Computing, SENG419 System Administration, SENG422 Cloud Computing, SENG423 Internet of Things, SENG424 Embedded Systems, SENG315 Computer Graphics, SENG414 3D Modeling & Game Programming, SENG416 Digital Image Processing, SENG313 Compiler Design, SENG314 Formal Languages & Automata, SENG320 Numerical Analysis, SENG426 Optimization, SENG431 Simulation, SENG310 Human-Computer Interaction, SENG312 Robotics, SENG324 Advanced Databases, SENG413 Open Source Software, SENG417 ERP Systems, SENG432 Software Metrics, SENG433 Blockchain, SENG434 Green Software Engineering.

=== INTERNSHIP (STAJ) ===
- 2 mandatory internships: SENG300 (after 4th sem) + SENG400 (after 6th sem)
- 20 working days each
- Must be in software/IT-related work, approved by commission
- Report: A4, 2.5 cm margins, 11 pt sans-serif, 1.5 spacing, daily + general sections, company stamp on every page
- Output: LaTeX (Overleaf-ready) or DOCX template available on #internship
- Submission: print, spiral-bind, deliver to Internship Commission office
- Forms (Yönerge, Acceptance, GSS, Report, Evaluation) listed on #internship page

=== STAFF / DEPARTMENT CONTACTS ===
- Head: Doç. Dr. Hilal Arslan — hilalarslan@aybu.edu.tr
- Department Secretary: Hasancan Suer — +90 312 906 2828
- General email: seng@aybu.edu.tr
- Office: B421, Ayvalı Mh. Takdir Cad. 150 Sk. No:5, Etlik-Keçiören / Ankara
- Phone: (0312) 906 2202 / 2330
- Faculty Advisor for ASEC club: Doç. Dr. Yenal Arslan — yenalarslan@aybu.edu.tr (office B318)
- Full staff/faculty list at #people anchor

=== ASEC CLUB ===
- AYBU Software Engineering Club (aybuasec.org)
- 7 departments · 180+ members · 20+ projects
- Departments: Project Commission, Events, Internship/Job/Scholarship, Social Media, International
- Advisor: Doç. Dr. Yenal Arslan
- Club Head: Yunus Emre Ceran — +90 542 670 22 10
- Register: https://aybuasec.org/register
- Instagram @asecaybu · LinkedIn AYBU SE Club · YouTube @asecaybu

=== PATHWAYS BEYOND BACHELOR ===
- ÇAP (Double Major) with related departments
- Erasmus / exchange programs
- Graduate studies (MSc / PhD)
- See #pathways

=== RESOURCES (STUDENT DRIVE) ===
Shared Google Drive (student-maintained): lecture notes, past exams, project examples, cheat sheets.
Link: https://drive.google.com/drive/folders/1M2Rh4UWbNurDlxNEAvEupJCAmvis-cau?usp=sharing
Tab anchor: #resources
`.trim();

const SYSTEM_PROMPT = `You are the AYBU Software Engineering Student Guide assistant on the website https://mohamedattiadev.github.io/aybu-seng-guide/.

Rules:
- Answer ONLY using the FACTS block. If something isn't there, say you don't know and point to the relevant section.
- Be concise: max ~70 words, 3–4 short sentences, or a tight bullet list.
- Use plain HTML (no markdown): <strong>, <em>, <br>, <a href="#anchor">. NO markdown stars, NO code fences.
- Cite sections with anchor links: <a href="#curriculum">Curriculum</a>, <a href="#internship">Internship</a>, <a href="#graduation">Graduation</a>, <a href="#pathways">Pathways</a>, <a href="#people">Staff</a>, <a href="#club">Club</a>, <a href="#resources">Resources</a>.
- When user asks "what is SENGxxx", give the course name, ECTS, category, prerequisite (if any), 1 short note if known.
- Don't invent course names, prerequisites, dates, contacts, or links. If unsure, say "check the official department page".

FACTS:
${SITE_KB}`;

const PROVIDERS = [
  {
    id: 'groq-70b',
    keyEnv: 'GROQ_API_KEY',
    call: groqCall('llama-3.3-70b-versatile'),
  },
  {
    id: 'gemini-2.0',
    keyEnv: 'GEMINI_API_KEY',
    call: geminiCall('gemini-2.0-flash'),
  },
  {
    id: 'groq-8b',
    keyEnv: 'GROQ_API_KEY',
    call: groqCall('llama-3.1-8b-instant'),
  },
  {
    id: 'gemini-1.5',
    keyEnv: 'GEMINI_API_KEY',
    call: geminiCall('gemini-1.5-flash'),
  },
];

function groqCall(model) {
  return async (apiKey, query, lang) => {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        temperature: 0.2,
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\nReply in language: ${lang}.` },
          { role: 'user', content: query },
        ],
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      const err = new Error(`groq ${r.status}: ${t.slice(0, 120)}`);
      err.status = r.status;
      throw err;
    }
    const data = await r.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  };
}

function geminiCall(model) {
  return async (apiKey, query, lang) => {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nReply in language: ${lang}.\n\nQuestion: ${query}` }],
            },
          ],
          generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
        }),
      }
    );
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      const err = new Error(`gemini ${r.status}: ${t.slice(0, 120)}`);
      err.status = r.status;
      throw err;
    }
    const data = await r.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  };
}

function cleanAnswer(s) {
  if (!s) return s;
  return s
    // strip code fences
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/```/g, '')
    // strip markdown bold/italic to <strong>/<em>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    // strip leading "Answer:" garbage
    .replace(/^(Answer|A)\s*:\s*/i, '')
    .trim();
}

function cors(origin, allowed) {
  const ok = !allowed || allowed === '*' || origin === allowed;
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const rate = new Map();
function rateLimit(ip, limit = 30, windowMs = 60_000) {
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
    const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST')
      return new Response('method not allowed', { status: 405, headers });

    const ip = request.headers.get('CF-Connecting-IP') || 'anon';
    if (!rateLimit(ip))
      return new Response(JSON.stringify({ error: 'rate limit' }), { status: 429, headers: jsonHeaders });

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'bad json' }), { status: 400, headers: jsonHeaders });
    }
    const query = String(body.query || '').slice(0, 500).trim();
    const lang = String(body.lang || 'en').slice(0, 5);
    if (!query)
      return new Response(JSON.stringify({ error: 'empty query' }), { status: 400, headers: jsonHeaders });

    const errors = [];
    for (const p of PROVIDERS) {
      const key = env[p.keyEnv];
      if (!key) {
        errors.push(`${p.id}: no ${p.keyEnv}`);
        continue;
      }
      try {
        const raw = await p.call(key, query, lang);
        const answer = cleanAnswer(raw);
        if (answer)
          return new Response(JSON.stringify({ answer, provider: p.id }), { headers: jsonHeaders });
        errors.push(`${p.id}: empty response`);
      } catch (e) {
        errors.push(`${p.id}: ${e.message || e}`);
        // Only break out if a non-retryable error AND we still have providers; otherwise continue rotating.
      }
    }
    return new Response(
      JSON.stringify({ error: 'all providers failed', details: errors }),
      { status: 502, headers: jsonHeaders }
    );
  },
};
