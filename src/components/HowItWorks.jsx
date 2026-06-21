export default function HowItWorks() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>HOW IT <span style={{ color: 'var(--red)' }}>WORKS</span></h1>
      <p style={styles.tagline}>AutoBot — AI automotive agent powered by Claude Sonnet 4.6</p>

      <hr style={styles.hr} />

      <Section title="What It Is">
        <p style={styles.p}>
          AutoBot is an <strong style={{ color: 'var(--white)' }}>AI agent</strong>, not just a
          chatbot. Instead of relying only on a system prompt, it has real tools it can call to
          search the web, fetch pages, compare vehicles, calculate payments, and check maintenance
          schedules — then synthesizes the results into an answer.
        </p>
      </Section>

      <hr style={styles.hr} />

      <Section title="Agent Loop">
        <ol style={styles.steps}>
          {[
            'User sends a message → added to conversation history',
            'Agent sends history + tools to Claude API',
            'Claude decides: reply directly, or call one or more tools',
            'If tools are called → executed in the browser → results sent back',
            'Loop continues until Claude produces a final text answer',
            'Answer displayed in the chat with tool activity shown while working',
          ].map((step, i) => (
            <li key={i} style={styles.stepItem}>
              <span style={styles.stepNum}>{i + 1}</span>
              <span style={styles.p}>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <hr style={styles.hr} />

      <Section title="Agent Tools">
        <p style={styles.p}>Five automotive tools + two web tools:</p>
        <ul style={styles.list}>
          {[
            ['🔍', 'web_search — Search the web for current prices, news, recalls'],
            ['🌐', 'web_fetch — Read content from a specific URL'],
            ['⚖️', 'compare_vehicles — Side-by-side spec comparison (18+ models in database)'],
            ['💰', 'estimate_car_payment — Monthly loan payment calculator'],
            ['🔧', 'get_maintenance_schedule — Service intervals by vehicle type & mileage'],
          ].map(([icon, text]) => (
            <li key={text} style={styles.listItem}>
              <span>{icon}</span>
              <span style={styles.p}>{text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <hr style={styles.hr} />

      <Section title="Agent Prompt">
        <p style={styles.p}>
          The agent prompt tells Claude its personality <em>and</em> when to use each tool.
          Located in <code style={styles.inlineCode}>src/agent/agentPrompt.js</code>.
        </p>
        <div style={styles.prompt}>
          You are AutoBot, an AI automotive agent with real tools. Use web_search for
          current info, compare_vehicles for spec comparisons, estimate_car_payment for
          budget questions, and get_maintenance_schedule for service intervals. Be enthusiastic
          and helpful — like a gearhead friend who really knows their stuff.
        </div>
      </Section>

      <hr style={styles.hr} />

      <Section title="Project Structure">
        <pre style={styles.code}>{`src/
  agent/
    agentPrompt.js       — Agent system prompt
    runAgent.js          — Agent loop (tool-calling)
    tools/
      webSearch.js       — Web search tool
      webFetch.js        — Web fetch tool
      compareVehicles.js — Vehicle comparison tool
      estimateCarPayment.js
      getMaintenanceSchedule.js
      index.js           — Tool registry
  components/
    ChatView.jsx         — Chat UI (uses runAgent)
    ...`}</pre>
      </Section>

      <hr style={styles.hr} />

      <Section title="Features">
        <ul style={styles.list}>
          {[
            ['🤖', 'AI agent with tool-calling (not just a system prompt)'],
            ['🔍', 'Web search & fetch for real-time automotive info'],
            ['🚗', 'Automotive-specific tools (compare, payment, maintenance)'],
            ['💬', 'Conversation memory (full history per request)'],
            ['🔴', 'Live tool activity indicator while agent works'],
            ['🔑', 'Runtime API key entry — key gate on load'],
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
            ['🌐', 'Web tools depend on third-party CORS proxies'],
            ['📊', 'Vehicle database covers ~18 popular models — web_search fills gaps'],
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
  inlineCode: {
    background: '#111', padding: '2px 6px', borderRadius: 4,
    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#c3e88d',
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
