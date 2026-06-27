# ChefAI — Meal Prep Agent

A React + Vite **AI agent** meal prep planner powered by Claude Sonnet 4.6. Users complete onboarding, receive a personalized 7-day meal plan, then chat with ChefAI — an agent with **web search** and **web fetch** tools.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and enter your Anthropic API key when prompted.

## App Flow

1. **API Key Gate** — Enter `sk-ant-` key (React state only, never persisted)
2. **Onboarding** — 7-step dietary profile setup
3. **Meal Plan** — Auto-generated via direct API call
4. **Chat Agent** — Tool-calling loop with `web_search` and `web_fetch`

## Agent vs Chatbot

| Chatbot | Agent (chat) |
|---------|--------------|
| System prompt only | System prompt + tools |
| Single API call | Multi-step agent loop |
| Training data only | Can search web and fetch recipe pages |

## File Structure

```
src/
  agent/
    agentPrompt.js       — Agent personality + tool instructions
    runAgent.js          — Agent loop (tool-calling)
    tools/
      webSearch.js       — Web search tool
      webFetch.js        — Web fetch tool
      proxyFetch.js      — CORS proxy helper
      index.js           — Tool registry
  api/
    claude.js            — Direct API (meal plan generation only)
  prompts.js             — Profile formatting + buildAgentSystem()
  components/
    ChatView.jsx         — Agent chat with tool activity UI
    MealPlan.jsx
    Onboarding.jsx
    KeyGate.jsx
    Header.jsx
```

## Tools

- **web_search** — DuckDuckGo search for recipes, nutrition, techniques
- **web_fetch** — Read content from recipe blog URLs

## Notes

- No backend, no database, no localStorage
- Web tools use Vite dev proxy (`/api/search`, `/api/fetch`) in development
- Uses `anthropic-dangerous-direct-browser-access: true` for browser-direct calls
