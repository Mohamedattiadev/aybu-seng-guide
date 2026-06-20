# AYBU Software Engineering — Student Guide

Unofficial student companion for **AYBU (Ankara Yıldırım Beyazıt University) Software Engineering**. Single-page static site covering full curriculum, internship process (SENG300 / SENG400), graduation requirements, faculty contacts, ASEC student club, and an in-browser GNO/grade tracker with localStorage progress.

**Live:** https://mohamedattiadev.github.io/aybu-seng-guide/

---

## Stack

- [Astro 4](https://astro.build/) — static site generator (`output: 'static'`)
- [Tailwind CSS 3](https://tailwindcss.com/) — utility CSS (via `@astrojs/tailwind`)
- Vanilla JS — i18n (EN/TR/AR/FR/DE), theme toggle, GPA tracker, search, modals
- GitHub Pages — hosting via GitHub Actions workflow

No server. No backend. All state in `localStorage`.

---

## Features

- 5 languages: English, Türkçe, العربية, Français, Deutsch
- Light / dark / auto theme
- Curriculum table with per-course checkbox + grade selector → live GNO calculation
- Internship checklists with progress counters
- Full downloadable internship forms (directive, acceptance, evaluation, GSS, report templates)
- ASEC club info + board + contacts
- Mobile responsive (hamburger drawer ≤820px, stacked grids ≤480px)

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # output → dist/
npm run preview    # serve dist/ locally
```

Node 20+ required.

---

## Project structure

```
.
├── astro.config.mjs           # base path, integrations
├── tailwind.config.mjs
├── public/
│   └── .nojekyll              # disable Jekyll on GH Pages
├── src/
│   ├── layouts/Base.astro     # html shell + theme bootstrap
│   ├── pages/index.astro      # single page entry
│   ├── _body.html             # all section markup (curriculum, club, etc.)
│   ├── scripts/main.js        # i18n dict + theme + tracker + search
│   └── styles/
│       ├── global.css         # tailwind + responsive overrides
│       └── _original.css      # original design tokens, components
└── .github/workflows/deploy.yml
```

---

## Deployment

Push to `main` → GitHub Actions builds + deploys to Pages.

`astro.config.mjs` reads `BASE_PATH` env var (workflow sets it to `/<repo-name>/` automatically).

First-time setup on a new repo:

1. Push the repo to GitHub.
2. Settings → Pages → **Source: GitHub Actions**.
3. Push to `main`.

Or via CLI:

```bash
gh api -X PUT repos/<owner>/<repo>/pages -f build_type=workflow
git push origin main
gh run watch --repo <owner>/<repo>
```

---

## Content sources

- Course catalog & curriculum: AYBU Software Engineering department pages
- Internship forms: https://aybu.edu.tr/yazilimMuh/tr/sayfa/4927
- ENGR450: https://aybu.edu.tr/yazilimmuh/tr/sayfa/10350
- Graduation project: https://aybu.edu.tr/yazilimmuh/tr/sayfa/11095
- ASEC club: https://aybuasec.org

---

## Contributing

Open an issue or PR. Content fixes especially welcome (faculty changes, broken links, curriculum updates).

---

## License

MIT. Unofficial guide — not affiliated with AYBU. Original AYBU forms and content remain property of their respective owners.
