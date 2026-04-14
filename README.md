# AdSync — AI Landing Page Personalizer
### Troopod AI PM Assignment

A Next.js application that takes an ad creative + landing page URL and outputs a personalized, CRO-optimized landing page using AI.

---

## ⚡ Deploy to Vercel (Free, 3 steps)

### Option A — Deploy via GitHub (recommended)

1. Push this folder to a GitHub repo:
```bash
git init
git add .
git commit -m "AdSync initial"
gh repo create adsync --public --push
```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo

3. Add environment variables in Vercel dashboard:
   - `GROQ_API_KEY` → your key from [console.groq.com](https://console.groq.com) (free)
   - `ANTHROPIC_API_KEY` → optional Claude fallback

4. Click **Deploy** → done ✓

---

### Option B — Deploy via Vercel CLI

```bash
npm install -g vercel
cd adsync
npm install
vercel
# Follow prompts → it deploys automatically
```

Then add env vars:
```bash
vercel env add GROQ_API_KEY
vercel env add ANTHROPIC_API_KEY   # optional
vercel --prod
```

---

## 🔑 API Keys

| Key | Where to get | Cost |
|-----|-------------|------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | **Free** |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Pay-per-use |

**The app works without any API key** — falls back to deterministic demo mode automatically.

---

## 🏃 Run Locally

```bash
cd adsync
npm install
cp .env.example .env.local
# Add your keys to .env.local
npm run dev
# Open http://localhost:3000
```

---

## 📁 Structure

```
adsync/
├── src/app/
│   ├── page.tsx              # Main UI
│   ├── page.module.css       # Styles
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Design system
│   └── api/
│       ├── analyze/route.ts  # CRO analysis (Groq → Claude → fallback)
│       └── generate/route.ts # Page generation (Groq → Claude → fallback)
├── .env.example              # Copy to .env.local and add keys
├── next.config.js
└── package.json
```

---

## 🧠 AI Provider Priority

```
Groq (fast, free) → Claude (quality fallback) → Demo mode (always works)
```

Change the Groq model via `GROQ_MODEL` env var (default: `llama-3.3-70b-versatile`).

---

Submission: nj@troopod.io | Subject: Assignment AI PM - Troopod
