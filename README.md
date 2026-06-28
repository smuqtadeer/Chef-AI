# ChefAI — Meal Prep Agent (Phase 2: RAG)

A React + Vite frontend with a **.NET 10 RAG API** for recipe knowledge ingestion and retrieval. Chat uses Claude Sonnet 4.6 with **search_knowledge**, **web_search**, and **web_fetch** tools.

## Getting Started

### 1. Frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173 and enter your Anthropic API key when prompted.

### 2. PostgreSQL + pgvector (one-time)

```bash
# Install pgvector if needed
brew install pgvector

# Create database (adjust user if needed)
psql postgres -f backend/scripts/init-db.sql
```

### 3. RAG API secrets (never commit these)

```bash
cd backend/ChefAI.RagApi
cp .env.example .env
# Edit .env — paste your OpenRouter key (REPLACE_ME → sk-or-v1-...)
```

**`backend/ChefAI.RagApi/.env`** is gitignored and loaded automatically on `dotnet run`:

```
OPENROUTER_API_KEY=your-key-here
RAG_DB_PASSWORD=local-dev
```

Only **`.env.example`** (placeholders) is committed — never put real keys there.

Before pushing, run: `bash scripts/check-no-secrets.sh` (after `git add`).

Anthropic key stays in the browser UI only — do not add it to `.env`.

### 4. Run the RAG API

```bash
cd backend/ChefAI.RagApi
dotnet run
```

API listens on http://127.0.0.1:5280. Vite proxies `/api/rag/*` to it in dev.

## App Flow

1. **API Key Gate** — Anthropic key in React memory only (never sent to our backend)
2. **Onboarding** — Dietary profile setup
3. **Meal Plan** — Direct Claude API call
4. **Knowledge Base** — Upload `.txt`, `.md`, `.pdf` recipe docs (embedded via OpenRouter)
5. **Chat Agent** — `search_knowledge` first, then `web_search` / `web_fetch`

## Agent Tools

| Tool | Purpose |
|------|---------|
| `search_knowledge` | Vector search over uploaded docs (PostgreSQL + pgvector) |
| `web_search` | DuckDuckGo search for current recipes and trends |
| `web_fetch` | Read a recipe or food blog URL |

## Architecture

```
React (5173) ──► Vite proxy /api/rag ──► .NET RAG API (5280) ──► PostgreSQL + pgvector
                └──► Anthropic API (browser-direct, chat + meal plan)
                                      └──► OpenRouter embeddings (server-side only)
```

## Secret safety checklist (before git push)

1. Run `bash scripts/check-no-secrets.sh` after staging files
2. Confirm `.env` is **not** in `git status`
3. `git diff --staged` — no `sk-or`, `sk-ant`, real passwords
4. Confirm `appsettings.json` has empty `OpenRouter:ApiKey`

## File Structure

```
backend/ChefAI.RagApi/     .NET 10 RAG API
src/agent/tools/           Agent tools incl. knowledgeSearch.js
src/api/rag.js             Frontend client for RAG API
src/components/KnowledgeBaseTab.jsx
```
