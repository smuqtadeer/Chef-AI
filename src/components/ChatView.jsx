import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `You are AutoBot, a passionate and knowledgeable car expert chatbot. You know everything about:
- All car brands, models, trims, and years (domestic and international)
- Performance specs: horsepower, torque, 0-60 times, top speeds
- Car buying advice, pricing, and negotiation tips
- Maintenance schedules, DIY repairs, and mechanical explanations
- Electric vehicles, hybrids, and emerging automotive tech
- Motorsport: F1, NASCAR, WRC, drag racing, drifting
- Car culture, modifications, and tuning
- Comparisons between vehicles and personalized recommendations

Your tone is enthusiastic, direct, and a little like a gearhead friend who knows their stuff. Use car lingo naturally. Keep answers clear and helpful. When recommending cars, always consider the user's budget and needs if mentioned. Never be boring — cars are exciting!`

const CHIPS = [
  'Best sports cars under $50k?',
  'EV vs gas — which is better?',
  'How do I maintain my car?',
  "What's the fastest production car?",
  'Best cars for beginners?',
  'Explain turbochargers',
]

const WELCOME = {
  role: 'bot',
  text: 'Welcome to <strong>AutoBot</strong> — your personal car expert! 🚗💨<br><br>Ask me anything: buying advice, specs, maintenance tips, car comparisons, motorsport, EV tech, or just which car matches your vibe. I live and breathe cars. Let\'s ride.',
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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      })

      const data = await res.json()
      const reply = data.content?.[0]?.text || "Hmm, I stalled out there. Try again!"
      setHistory(prev => [...prev, { role: 'assistant', content: reply }])
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: '⚠️ Engine trouble — couldn\'t connect to the API. Check your connection and try again.' },
      ])
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      {/* Chips */}
      <div style={styles.chips}>
        {CHIPS.map(chip => (
          <button key={chip} style={styles.chip} onClick={() => sendMessage(chip)}>
            {chip}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
