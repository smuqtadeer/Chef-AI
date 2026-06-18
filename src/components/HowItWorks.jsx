export default function HowItWorks() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>HOW IT <span style={{ color: 'var(--red)' }}>WORKS</span></h1>
      <p style={styles.tagline}>AutoBot — AI car expert chatbot powered by Claude Sonnet 4.6</p>

      <hr style={styles.hr} />

      <Section title="What It Is">
        <p style={styles.p}>
          A React app with no backend. JavaScript calls the Anthropic API directly from the
          browser, using a key you provide at runtime — it's never stored or hardcoded.
        </p>
      </Section>

      <hr style={styles.hr} />

      <Section title="How a Message Works">
        <ol style={styles.steps}>
          {[
            'User types a message → it appears as a chat bubble',
            'Message is added to a history[] array in React state',
            'Full history + system prompt sent to Claude API',
            'Claude replies → response shown, saved to history',
          ].map((step, i) => (
            <li key={i} style={styles.stepItem}>
              <span style={styles.stepNum}>{i + 1}</span>
              <span style={styles.p}>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <hr style={styles.hr} />

      <Section title="System Prompt">
        <p style={styles.p}>Sent with every request to give Claude its personality.</p>
        <div style={styles.prompt}>
          You are AutoBot, a passionate car expert. You know specs, buying advice,
          maintenance, EVs, motorsport, and modifications. Be enthusiastic, direct, and
          helpful — like a gearhead friend who really knows their stuff.
        </div>
      </Section>

      <hr style={styles.hr} />

      <Section title="API Call">
        <pre style={styles.code}>{`// Key entered at runtime — never hardcoded
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': apiKey, ... },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history   // full conversation each time
  })
})`}</pre>
      </Section>

      <hr style={styles.hr} />

      <Section title="Features">
        <ul style={styles.list}>
          {[
            ['🚗', 'Quick-start suggestion chips'],
            ['💬', 'Conversation memory (full history per request)'],
            ['⌨️', 'Enter to send, Shift+Enter for new line'],
            ['🔴', 'Typing indicator while waiting'],
            ['🔑', 'Runtime API key entry — key gate on load'],
            ['📄', 'How It Works page built into the app'],
          ].map(([icon, text]) => (
            <li key={text} style={styles.listItem}>
              <span>{icon}</span>
              <span style={styles.p}>{text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <hr style={styles.hr} />

      <Section title="Limitations">
        <ul style={styles.list}>
          {[
            ['🔄', 'Memory resets on page refresh (key must be re-entered)'],
            ['📈', 'No streaming — full response loads at once'],
            ['🌐', 'Requires CORS support via anthropic-dangerous-direct-browser-access header'],
          ].map(([icon, text]) => (
            <li key={text} style={styles.listItem}>
              <span>{icon}</span>
              <span style={styles.p}>{text}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <h2 style={styles.h2}>{title}</h2>
      {children}
    </div>
  )
}

const styles = {
  page: {
    flex: 1, overflowY: 'auto',
    padding: '40px 32px 60px',
    maxWidth: 720, margin: '0 auto', width: '100%',
    lineHeight: 1.7,
  },
  h1: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 42, letterSpacing: 2, marginBottom: 4,
  },
  tagline: { color: 'var(--gray)', fontSize: 14, marginBottom: 32 },
  h2: {
    fontSize: 12, fontWeight: 600, letterSpacing: 2,
    textTransform: 'uppercase', color: 'var(--red)',
    margin: '28px 0 10px',
  },
  p: { color: '#bbb', fontSize: 14 },
  hr: { border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' },
  steps: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 },
  stepItem: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '6px 0' },
  stepNum: {
    background: 'var(--red)', color: '#fff', fontWeight: 700,
    fontSize: 12, width: 22, height: 22, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  code: {
    background: '#111', borderLeft: '3px solid var(--red)',
    borderRadius: 8, padding: 16,
    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
    color: '#c3e88d', overflowX: 'auto', whiteSpace: 'pre',
    marginTop: 10,
  },
  prompt: {
    background: '#0a1a0a', borderLeft: '3px solid #22c55e',
    borderRadius: 8, padding: '14px 16px',
    fontSize: 13, color: '#86efac', marginTop: 10, lineHeight: 1.8,
  },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column' },
  listItem: {
    display: 'flex', gap: 12,
    padding: '7px 0', borderBottom: '1px solid var(--border)',
    fontSize: 14, color: '#bbb',
  },
}
