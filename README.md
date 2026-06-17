# 🪞 Life Situation Advisor — Tier 2 Demo

> Tell your situation. Get pattern-matched advice — archetype, similar people, pitfalls, opportunities, and the next 3 small steps.

A **Tier 2 demo** from the **AI Build Workshop** by SafeScreens Initiative. Shows what happens when you take a Tier 1 idea (single HTML, no backend) and grow it into a real LLM-powered product.

---

## 🎯 What this demonstrates

**Tier 1** (workshop tonight): single HTML file, no backend, runs in your browser, uses Claude **separately** via copy-paste.

**Tier 2** (this demo): same idea, but the app calls Claude directly via the Anthropic API. Streaming response. Real product feel.

Same idea, two tiers, four weeks apart. **Studio Cohort 1** (starts Friday June 27) takes you from Tier 1 → Tier 2.

---

## 🏗 Architecture

```
Browser
  │
  │ POST /api/advise  { name, ageBand, lifeStage, domains, situation, dilemma }
  ▼
Cloudflare Pages Function (functions/api/advise.js)
  │
  │ POST https://api.anthropic.com/v1/messages  (stream=true, system+user)
  ▼
Anthropic Claude  (Sonnet)
  ▲
  │ SSE stream back
  │
Browser parses content_block_delta events → renders markdown live
```

The Anthropic API key is held **server-side** (Cloudflare env var). The browser never sees it.

---

## 🚀 Deploy your own copy

1. **Fork or "Use this template"** on GitHub
2. In Cloudflare Dashboard → **Pages** → **Create project** → **Connect to Git** → pick your fork
3. Build settings: leave empty (static + Functions)
4. **Settings → Environment variables → Production** → add:
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...` (your key from [console.anthropic.com](https://console.anthropic.com))
5. Save & deploy. URL: `https://your-project.pages.dev`

Each Claude response costs roughly $0.01–0.03 with Sonnet — pennies per consultation.

---

## 🛠 Local development

```bash
git clone https://github.com/profkemalaydin/life-advisor-demo.git
cd life-advisor-demo
npm install -g wrangler
ANTHROPIC_API_KEY=sk-ant-... wrangler pages dev public
```

Visit http://localhost:8788.

---

## 📦 What's in this repo

| File | Role |
|---|---|
| `public/index.html` | Frontend — Tailwind via CDN, marked.js for markdown render, streaming SSE parser |
| `functions/api/advise.js` | Cloudflare Pages Function — builds prompt, calls Anthropic, forwards SSE stream |
| `README.md` | This file |
| `LICENSE` | MIT |

No build step. No framework. Just two files of code.

---

## ✏️ The system prompt (where the magic lives)

In `functions/api/advise.js`, the `SYSTEM_PROMPT` defines the structure of every response:

1. **🪞 Your archetype** — pattern recognition, make them feel SEEN
2. **👥 People in similar situations** — concrete examples, what worked / didn't
3. **⚠️ Pitfalls to watch** — 3 specific traps for their exact context
4. **🌟 Opportunities to seize** — 3 openings they might not be seeing
5. **🎯 Next 3 small steps** — under 30 min each, do-able this week
6. **A single unlocking question** at the end

Tune the prompt to your audience. The structure is the product.

---

## 📝 License

MIT — fork it, remix it, build a coaching business with it. Yours to keep.
