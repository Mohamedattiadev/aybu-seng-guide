# SENG Chatbot Worker (Cloudflare)

Free LLM proxy for the static site. Required because GitHub Pages can't hold secrets.

## Deploy in 5 minutes

```bash
cd cloudflare-worker
npm i -g wrangler
wrangler login
wrangler secret put GROQ_API_KEY      # paste your Groq key
wrangler secret put GEMINI_API_KEY    # optional fallback
wrangler deploy
```

Copy the resulting URL, e.g. `https://aybu-seng-chatbot.<you>.workers.dev`.

## Wire into the site

In `src/layouts/Base.astro`, before the main script tag, add:

```html
<script is:inline define:vars={{ endpoint: import.meta.env.PUBLIC_CHAT_ENDPOINT || '' }}>
  window.__CHAT_ENDPOINT = endpoint;
</script>
```

Then in `.env.local` (gitignored) for dev, and in your build env (GitHub Actions / Pages settings):

```
PUBLIC_CHAT_ENDPOINT=https://aybu-seng-chatbot.<you>.workers.dev
```

## Limits

- Cloudflare free: 100k requests/day per worker
- Groq free: generous; check console.groq.com for current limits
- Gemini free: 15 req/min, 1500/day on flash

## Rotate keys

The keys you put in chat earlier are compromised. Rotate before deploying:
- Groq: https://console.groq.com/keys
- Gemini: https://aistudio.google.com/apikey
