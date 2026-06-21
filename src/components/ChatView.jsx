import { useState, useRef, useEffect } from 'react'
import { runAgent } from '../agent/runAgent.js'
import { TOOL_LABELS, formatToolInput, formatToolResultSummary } from '../agent/tools/index.js'

const CHIPS = [
  'Best sports cars under $50k?',
  'Compare Civic vs Corolla',
  'EV vs gas — which is better?',
  'What maintenance at 30k miles?',
  "What's the fastest production car?",
  'Calculate payment on a $35k car',
]

const WELCOME = {
  role: 'bot',
  text: 'Welcome to <strong>AutoBot</strong> — your AI car expert agent! 🚗💨<br><br>I\'m not just a chatbot — I\'m an <strong>agent</strong> with real tools. I can search the web, fetch pages, compare vehicles, calculate payments, and check maintenance schedules.<br><br>Ask me anything about cars. Let\'s ride.',
}

export default function ChatView({ apiKey }) {
  const [messages, setMessages] = useState([WELCOME])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleInput(e) {
    setInput(e.target.value)
    const ta = textareaRef.current
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function addToolCall({ id, name, input: toolInput }) {
    setMessages(prev => [
      ...prev,
      { role: 'tool', id, name, input: toolInput, status: 'running' },
    ])
  }

  function completeToolCall({ id, name, input: toolInput, result }) {
    setMessages(prev =>
      prev.map(msg =>
        msg.role === 'tool' && msg.id === id
          ? { ...msg, name, input: toolInput, result, status: 'done' }
          : msg
      )
    )
  }

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const newHistory = [...history, { role: 'user', content: trimmed }]
    setHistory(newHistory)
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const reply = await runAgent(apiKey, newHistory, {
        onToolStart: addToolCall,
        onToolComplete: completeToolCall,
      })

      setHistory(prev => [...prev, { role: 'assistant', content: reply }])
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: `⚠️ Engine trouble — ${err.message}` },
      ])
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.chips}>
        {CHIPS.map(chip => (
          <button key={chip} style={styles.chip} onClick={() => sendMessage(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <Message key={msg.id || i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask me anything about cars…"
          style={styles.textarea}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{ ...styles.sendBtn, ...(loading || !input.trim() ? styles.sendBtnDisabled : {}) }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function Message({ msg }) {
  if (msg.role === 'tool') return <ToolCallMessage msg={msg} />

  const isBot = msg.role === 'bot'
  return (
    <div style={{ ...styles.message, ...(isBot ? {} : styles.messageUser) }}>
      <div style={{ ...styles.avatar, ...(isBot ? styles.botAvatar : styles.userAvatar) }}>
        {isBot ? '🏎️' : '👤'}
      </div>
      <div
        style={{ ...styles.bubble, ...(isBot ? styles.botBubble : styles.userBubble) }}
        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br>') }}
      />
    </div>
  )
}

function ToolCallMessage({ msg }) {
  const [expanded, setExpanded] = useState(false)
  const label = TOOL_LABELS[msg.name] || msg.name
  const isRunning = msg.status === 'running'
  const summary = msg.result ? formatToolResultSummary(msg.name, msg.result) : null

  return (
    <div style={styles.toolCall}>
      <div style={styles.toolCallHeader}>
        <span style={styles.toolCallIcon}>🔧</span>
        <div style={styles.toolCallMeta}>
          <span style={styles.toolCallName}>{label}</span>
          <span style={styles.toolCallInput}>{formatToolInput(msg.name, msg.input)}</span>
        </div>
        <span style={{
          ...styles.toolCallStatus,
          ...(isRunning ? styles.toolCallRunning : styles.toolCallDone),
        }}>
          {isRunning ? 'Running…' : summary || 'Done'}
        </span>
      </div>

      {!isRunning && msg.result && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={styles.toolCallToggle}
        >
          {expanded ? 'Hide result' : 'Show result'}
        </button>
      )}

      {expanded && msg.result && (
        <pre style={styles.toolCallResult}>
          {JSON.stringify(msg.result, null, 2)}
        </pre>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={styles.message}>
      <div style={{ ...styles.avatar, ...styles.botAvatar }}>🏎️</div>
      <div style={{ ...styles.bubble, ...styles.botBubble, ...styles.typing }}>
        <span style={{ ...styles.dot, animationDelay: '0s' }} />
        <span style={{ ...styles.dot, animationDelay: '.15s' }} />
        <span style={{ ...styles.dot, animationDelay: '.3s' }} />
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  chips: {
    background: 'var(--dark)', padding: '10px 20px',
    display: 'flex', gap: 8, flexWrap: 'wrap',
    borderBottom: '1px solid var(--border)', flexShrink: 0,
  },
  chip: {
    background: 'var(--panel)', border: '1px solid var(--border)',
    color: 'var(--gray)', fontSize: 12, padding: '5px 12px',
    borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
    fontFamily: "'Inter', sans-serif", transition: 'all .2s',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '24px 20px',
    display: 'flex', flexDirection: 'column', gap: 16,
    scrollBehavior: 'smooth',
  },
  message: {
    display: 'flex', gap: 12, maxWidth: 780,
    animation: 'fadeUp .25s ease',
  },
  messageUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
  },
  botAvatar: { background: 'var(--red)' },
  userAvatar: { background: '#2d2d6b' },
  bubble: {
    padding: '12px 16px', borderRadius: 12,
    fontSize: 14, lineHeight: 1.65, maxWidth: 640,
  },
  botBubble: {
    background: 'var(--panel)', border: '1px solid var(--border)',
    borderTopLeftRadius: 2,
  },
  userBubble: {
    background: 'var(--user-bg)', border: '1px solid #3a3a7c',
    borderTopRightRadius: 2, color: '#d0d0ff',
  },
  toolCall: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
    background: '#111',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--red)',
    borderRadius: 8,
    padding: '10px 14px',
    animation: 'fadeUp .25s ease',
  },
  toolCallHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  toolCallIcon: { fontSize: 14, flexShrink: 0 },
  toolCallMeta: { flex: 1, minWidth: 0 },
  toolCallName: {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--white)', letterSpacing: 0.3,
  },
  toolCallInput: {
    display: 'block', fontSize: 11, color: 'var(--gray)',
    marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  toolCallStatus: {
    fontSize: 11, fontWeight: 500, flexShrink: 0,
    padding: '3px 8px', borderRadius: 10,
  },
  toolCallRunning: {
    color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)',
  },
  toolCallDone: {
    color: '#86efac', background: 'rgba(34, 197, 94, 0.1)',
  },
  toolCallToggle: {
    background: 'none', border: 'none', color: 'var(--gray)',
    fontSize: 11, cursor: 'pointer', padding: '6px 0 0',
    fontFamily: "'Inter', sans-serif",
  },
  toolCallResult: {
    marginTop: 8, padding: '10px 12px',
    background: '#0a0a0a', borderRadius: 6,
    fontSize: 11, lineHeight: 1.5, color: '#aaa',
    overflowX: 'auto', maxHeight: 200, overflowY: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
  typing: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '14px 16px',
  },
  dot: {
    display: 'inline-block',
    width: 7, height: 7, background: 'var(--red)',
    borderRadius: '50%',
    animation: 'bounce .9s infinite',
  },
  inputArea: {
    background: 'var(--dark)', borderTop: '1px solid var(--border)',
    padding: '14px 20px', display: 'flex', gap: 10,
    alignItems: 'flex-end', flexShrink: 0,
  },
  textarea: {
    flex: 1, background: 'var(--panel)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--white)',
    fontFamily: "'Inter', sans-serif", fontSize: 14,
    padding: '12px 16px', resize: 'none', outline: 'none',
    maxHeight: 120, transition: 'border-color .2s',
  },
  sendBtn: {
    background: 'var(--red)', border: 'none', borderRadius: 10,
    color: '#fff', width: 46, height: 46,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  sendBtnDisabled: { background: 'var(--border)', cursor: 'not-allowed' },
}
