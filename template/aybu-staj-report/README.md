# AYBU Software Engineering — Summer Practice (Staj) Report Template

A clean, reusable LaTeX template for the AYBU **SENG300 / SENG400** internship report. Matches the visual style of the original Word/Overleaf template (cover page, weekly daily-report tables with signature blocks, general report sections, table of contents).

> Unofficial, community-maintained. License: **MIT**.

## Files

```
main.tex          # all content + macros; this is what you edit
Makefile          # `make build` / `make clean`
images/
  aybu-logo.png   # AYBU emblem used on the cover
template-preview.pdf  # pre-built sample (if compile succeeded)
```

## Edit your data in ONE place

Open `main.tex` and change the seven `\newcommand` lines under
`STUDENT INFORMATION` (name, dept, ID, e-mail, phone, internship place,
start/end dates, supervisor). These propagate to the cover page and the
weekly tables automatically.

## Weekly daily reports

Each week is one page produced by the `weekreport` environment:

```latex
\begin{weekreport}{Week 1}{02/06/2025}{06/06/2025}
  \DailyRow{Monday}   {02/06/2025}{Set up Vue 3 dev env, cloned repo.}{8:00 - 17:00}
  \DailyRow{Tuesday}  {03/06/2025}{Implemented login form.}           {8:00 - 17:00}
  \DailyRow{Wednesday}{04/06/2025}{Unit tests + code review.}         {8:00 - 17:00}
  \DailyRow{Thursday} {05/06/2025}{API integration.}                  {8:00 - 17:00}
  \DailyRow{Friday}   {06/06/2025}{Bug fixes, doc.}                   {8:00 - 17:00}
\end{weekreport}
```

To **add a week**, copy any `weekreport` block and bump the label. To
**remove** a week, delete its block. The TOC updates automatically.

The signature / stamp block (Signature of trainee / Work place / Name and
title of the controlling superior / Signature and Stamp) is emitted at the
end of every week — this satisfies the directive's per-week stamp rule.

## Compile

### Local (Linux / macOS)

Requires a TeX Live installation (`texlive-latex-recommended`,
`texlive-latex-extra`).

```bash
make build         # runs pdflatex twice -> main.pdf
make clean         # removes aux/log files
```

Or directly:

```bash
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
```

### Overleaf

1. Download this folder as a ZIP (or use the GitHub-provided ZIP).
2. On Overleaf: **New Project → Upload Project → drop the ZIP**.
3. Set the main document to `main.tex` and the compiler to **pdfLaTeX**.
4. Compile.

## AYBU writing-rules compliance

The preamble already applies the formatting expected by the AYBU SENG
Internship Directive (and the rules listed on the project website):

- A4 paper, **2.5 cm margins** on all sides
- **Sans-serif body font** at **11pt** — uses **Helvetica** via
  `\usepackage{helvet}` (the closest free Arial-clone, ships with
  `texlive-fontsrecommended` / `psnfss`, present on Overleaf by default).
  Fallback: if your TeX Live install lacks `helvet.sty`, comment the
  `\usepackage{helvet}` line — the template will silently fall back to
  Computer Modern Sans Serif and still compile.
- **1.5 line spacing** (`\onehalfspacing`)
- Page numbers **bottom-center**, every page except the cover
- Numbered sections (1. DAILY REPORT, 2. GENERAL REPORT) with auto TOC
- Weekly tables include the **per-week signature + stamp** block
- English language by default (change `\usepackage[english]{babel}` if you
  prefer Turkish — Turkish version of the report is also accepted)

> The directive itself does not pin down font/margin numbers; the values
> above reflect common AYBU SENG practice. Verify with the Staj Yönergesi
> before final submission.

## License

MIT — do whatever you want, attribution appreciated.
