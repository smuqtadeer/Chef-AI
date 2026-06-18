# AutoBot — React Car Expert Chatbot

A React + Vite chatbot powered by Claude Sonnet 4.6. No backend required.

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
  App.jsx              — root, manages API key state and active view
  components/
    KeyGate.jsx        — API key entry screen shown on first load
    Header.jsx         — top bar with navigation tabs
    ChatView.jsx       — chat interface with message history
    HowItWorks.jsx     — explainer page built into the app
  index.css            — global CSS variables and keyframes
```

## Notes

- Your API key lives only in React state — it's never stored or hardcoded.
- Conversation history resets on page refresh.
- Uses `anthropic-dangerous-direct-browser-access: true` header for direct browser API calls.
