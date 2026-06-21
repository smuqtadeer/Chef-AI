# AutoBot — Automotive AI Agent

A React + Vite **AI agent** (not just a chatbot) powered by Claude Sonnet 4.6. AutoBot has real tools for web search, web fetch, vehicle comparison, payment calculation, and maintenance schedules.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and enter your Anthropic API key when prompted.

## Build for Production

```bash
npm run build
```

Serve the `dist/` folder with any static host (Netlify, Vercel, GitHub Pages, etc).

## Project Structure

```
src/
  agent/
    agentPrompt.js          — Agent system prompt (personality + tool instructions)
    runAgent.js             — Agent loop with Anthropic tool-calling
    tools/
      webSearch.js          — Search the web for current automotive info
      webFetch.js           — Fetch and read a URL
      compareVehicles.js    — Side-by-side vehicle spec comparison
      estimateCarPayment.js — Monthly loan payment calculator
      getMaintenanceSchedule.js — Maintenance intervals by type & mileage
      index.js              — Tool registry
  App.jsx                   — Root, manages API key state and active view
  components/
    KeyGate.jsx             — API key entry screen
    Header.jsx              — Top bar with navigation
    ChatView.jsx            — Chat UI (uses agent loop)
    HowItWorks.jsx          — Explainer page
  index.css                 — Global CSS variables and keyframes
.cursor/rules/
  autobot-agent.mdc         — Cursor rule for agent development
```

## Agent vs Chatbot

| Chatbot (before) | Agent (now) |
|---|---|
| System prompt only | System prompt + tools |
| Single API call | Multi-step agent loop |
| Knowledge from training data | Can search web, fetch pages, run calculations |
| No actions | Calls tools, synthesizes results |

## Tools

- **web_search** — DuckDuckGo search for current prices, news, recalls
- **web_fetch** — Read content from any URL
- **compare_vehicles** — Compare specs for 18+ popular models
- **estimate_car_payment** — Loan payment calculator
- **get_maintenance_schedule** — Service intervals for sedan, SUV, truck, sports, EV

## Notes

- Your API key lives only in React state — it's never stored or hardcoded.
- Conversation history resets on page refresh.
- Uses `anthropic-dangerous-direct-browser-access: true` header for direct browser API calls.
- Web tools use a local Vite dev proxy (`/api/search`, `/api/fetch`) during development, with public proxy fallbacks for production builds.
- Genre: **Automotive** — all tools and prompts stay in the car domain.
