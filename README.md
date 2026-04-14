# AdSync — AI Landing Page Personalizer

> Input an ad creative + landing page URL → get the existing page enhanced with CRO principles, personalized to match the ad.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange?style=flat-square)
![Claude](https://img.shields.io/badge/Claude-Haiku-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## What It Does

AdSync takes two inputs:
- An **ad creative** (image upload, URL, or headline copy)
- A **landing page URL**

And outputs the **real landing page surgically enhanced** with:
- ✅ Ad-matched H1 headline (replaces the existing one)
- ✅ Urgency banner injected at the top
- ✅ Social proof bubble positioned above the fold
- ✅ High-intent sticky CTA always visible on scroll
- ✅ Risk-reversal copy under the primary button
- ✅ Collapsible audit panel showing every change made

The original page structure, design, and navigation are fully preserved. Only conversion-critical elements are modified.

---

## How It Works

```
Ad Creative + Landing Page URL
        │
        ▼
┌─────────────────────────────────────────────────────┐
│                   6-Stage Pipeline                   │
│                                                     │
│  01 Ingest → 02 Scrape → 03 Analyze                 │
│                    ↓                                │
│  06 QA ← 05 Inject ← 04 Rewrite                    │
└─────────────────────────────────────────────────────┘
        │
        ▼
  Real page + CRO injections on top
```

| Stage | What Happens |
|-------|-------------|
| **01 Ingest** | Parse ad image (Claude Vision), URL, or copy text |
| **02 Scrape** | Server-side fetch of real landing page HTML — extract H1s, CTAs, meta |
| **03 Analyze** | AI returns structured CRO strategy JSON with match score and 6 changes |
| **04 Rewrite** | Strategy drives targeted changes — headline, CTA, urgency, social proof |
| **05 Inject** | Surgical HTML injection into the real page — no page replacement |
| **06 QA** | Validate H1, CTA, HTML integrity — retry or fallback if checks fail |

---

## AI Provider Cascade

```
Claude Vision (image) → Groq LLaMA-3.3-70B (text) → Claude Haiku (fallback) → Rule-based (always works)
```

- **Claude Vision** — used when an ad image is uploaded, reads visual design, colors, and copy
- **Groq** — primary text model, free tier, JSON mode enabled for reliable output
- **Claude Haiku** — fallback if Groq is unavailable
- **Rule-based** — deterministic fallback using inputs directly, no API required

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **AI** — Groq API (LLaMA 3.3 70B) + Anthropic Claude (Haiku + Vision)
- **Styling** — CSS Modules with custom design system
- **Deployment** — Vercel

---

## Project Structure

```
adsync/
├── src/
│   └── app/
│       ├── page.tsx                  # Main UI — sidebar inputs + pipeline + output
│       ├── page.module.css           # Component styles
│       ├── layout.tsx                # Root layout + fonts
│       ├── globals.css               # Design system (CSS variables, base styles)
│       └── api/
│           ├── analyze/
│           │   └── route.ts          # CRO analysis agent — Groq → Claude → fallback
│           ├── generate/
│           │   └── route.ts          # Injection agent — surgical HTML enhancement
│           └── scrape/
│               └── route.ts          # Landing page scraper — extracts H1s, CTAs, meta
├── .env.example                      # Environment variable template
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```env
# Primary AI — free at console.groq.com
GROQ_API_KEY=

# Fallback AI — console.anthropic.com
ANTHROPIC_API_KEY=

# Optional: change Groq model
GROQ_MODEL=llama-3.3-70b-versatile
```

The app works without any API key — falls back to demo mode automatically.

---

## Running Locally

```bash
# Install dependencies
npm install

# Add your API keys
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Design Decisions

**Why two AI agents?**
Separating analysis from injection gives auditability — the strategy JSON is always visible before the page is modified. If injection fails, only that stage retries.

**Why surgical injection instead of page generation?**
The assignment requires enhancing the existing page, not replacing it. Regex-based HTML manipulation preserves the original layout, styles, and navigation while adding CRO elements on top.

**Why Groq as primary?**
Groq's JSON mode (`response_format: { type: "json_object" }`) forces valid JSON at the API level — eliminating the most common LLM failure mode (truncated or malformed JSON).

**How are hallucinations handled?**
The prompt explicitly prohibits invented company names, statistics, or real person names. All specific claims come from the structured analysis JSON — not from free-form generation in the HTML output.

---

## Edge Case Handling

| Problem | Detection | Fix |
|---------|-----------|-----|
| API returns HTML error page | `res.ok` check before `JSON.parse` | Cascade to next provider |
| Page cannot be scraped (SPA) | Fetch timeout / empty body | Demo mode with clear label |
| AI returns truncated JSON | `JSON.parse` throws | Retry with Claude, then rule-based fallback |
| Missing CTA in output | QA regex check | Inject default from strategy |
| Links show 404 in preview | Relative URLs against localhost | `<base href="origin">` injected |

---

## License

MIT
