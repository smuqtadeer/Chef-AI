import { useState, useRef, useEffect } from 'react'
import { runAgent } from '../agent/runAgent.js'
import { buildChatSystem } from '../prompts.js'
import { TOOL_LABELS, formatToolInput, formatToolResultSummary } from '../agent/tools/index.js'

const CHIPS = [
  "I'm craving something spicy 🌶️",
  "Quick dinner under 30 mins ⚡",
  "Something cheap with chicken 🍗",
  "Comfort food, nothing fancy 🍲",
  "Impress someone tonight 🍷",
  "Vegetarian but actually filling 🥗",
]

// ── ingredient extraction ─────────────────────────────────────────────────────
function extractIngredients(text) {
  const ingSection = text.match(/###\s*Ingredients\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
  if (!ingSection) return null
  return ingSection[1]
    .split('\n')
    .filter(l => /^-\s+/.test(l))
    .map(l => l.replace(/^-\s+/, '').trim())
    .filter(Boolean)
}

function extractRecipeName(text) {
  const m = text.match(/\*\*([^*\n]{3,60})\*\*/)
  return m ? m[1] : 'Recipe'
}

// ── markdown render ───────────────────────────────────────────────────────────
function renderMd(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:13px;font-weight:700;margin:14px 0 6px;color:var(--accent)">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:16px 0 8px">$1</h3>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<div style="display:flex;gap:8px;margin-bottom:4px"><span style="color:var(--accent);font-weight:700;min-width:18px">$1.</span><span>$2</span></div>')
    .replace(/^-\s+(.+)$/gm, '<li style="margin-left:16px;margin-bottom:3px">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;text-underline-offset:2px">$1</a>')
    .replace(/\n/g, '<br>')
}

// ── components ────────────────────────────────────────────────────────────────
function BotMessage({ msg, onAddRecipe }) {
  const ingredients = extractIngredients(msg.text)
  const added = msg.added

  return (
    <div style={s.botRow}>
      <div style={s.avatar}>🍳</div>
      <div style={s.botWrap}>
        <div
          style={s.botBubble}
          dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }}
        />
        {ingredients && !added && (
          <button
            style={s.addBtn}
            onClick={() => onAddRecipe(extractRecipeName(msg.text), ingredients, msg.id)}
          >
            🛒 Add ingredients to grocery list
          </button>
        )}
        {added && (
          <span style={s.addedBadge}>✓ Added to grocery list</span>
        )}
      </div>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div style={s.userRow}>
      <div style={s.userBubble}>{text}</div>
    </div>
  )
}

function ToolCallMsg({ msg }) {
  const [open, setOpen] = useState(false)
  const label = TOOL_LABELS[msg.name] || msg.name
  const isRunning = msg.status === 'running'
  const summary = msg.result ? formatToolResultSummary(msg.name, msg.result) : null
  return (
    <div style={s.tool}>
      <div style={s.toolHeader}>
        <span style={s.toolIcon}>🔍</span>
        <div style={s.toolMeta}>
          <span style={s.toolName}>{label}</span>
          <span style={s.toolInput}>{formatToolInput(msg.name, msg.input)}</span>
        </div>
        <span style={{ ...s.toolStatus, ...(isRunning ? s.toolRunning : s.toolDone) }}>
          {isRunning ? 'Running…' : summary || 'Done'}
        </span>
      </div>
      {!isRunning && msg.result && (
        <button onClick={() => setOpen(o => !o)} style={s.toolToggle}>
          {open ? 'Hide' : 'Show result'}
        </button>
      )}
      {open && msg.result && (
        <pre style={s.toolResult}>{JSON.stringify(msg.result, null, 2)}</pre>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={s.botRow}>
      <div style={s.avatar}>🍳</div>
      <div style={{ ...s.botBubble, display: 'flex', gap: 5, padding: '13px 16px' }}>
        {[0, .15, .3].map(d => (
          <span key={d} style={{ ...s.dot, animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function ChatTab({ apiKey, profile, messages, setMessages, history, setHistory, onAddRecipe }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const taRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function resizeTa() {
    const ta = taRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px' }
  }

  function addToolCall(call) {
    setMessages(prev => [...prev, { role: 'tool', ...call, status: 'running' }])
  }

  function completeToolCall(call) {
    setMessages(prev => prev.map(m =>
      m.role === 'tool' && m.id === call.id ? { ...m, ...call, status: 'done' } : m
    ))
  }

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    if (taRef.current) taRef.current.style.height = 'auto'

    const msgId = Date.now()
    const newHistory = [...history, { role: 'user', content: trimmed }]
    setHistory(newHistory)
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const reply = await runAgent(apiKey, newHistory, {
        system: buildChatSystem(profile),
        onToolStart: addToolCall,
        onToolComplete: completeToolCall,
      })
      setHistory(prev => [...prev, { role: 'assistant', content: reply }])
      setMessages(prev => [...prev, { role: 'bot', text: reply, id: msgId + 1 }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: `⚠️ ${err.message}`, id: msgId + 2 }])
    }

    setLoading(false)
  }

  function handleAddRecipe(recipeName, items, msgId) {
    onAddRecipe(recipeName, items)
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, added: true } : m))
  }

  const isEmpty = messages.length === 1 && messages[0].role === 'bot' && !loading

  return (
    <div style={s.wrap}>
      <div style={s.messages}>
        {isEmpty && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🍳</div>
            <h2 style={s.emptyTitle}>What are you craving?</h2>
            <p style={s.emptySub}>I'll search the web for real recipes that match your mood.</p>
            <div style={s.chips}>
              {CHIPS.map(c => (
                <button key={c} style={s.chip} onClick={() => send(c)}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {!isEmpty && messages.map((msg, i) => {
          if (msg.role === 'tool') return <ToolCallMsg key={msg.id || i} msg={msg} />
          if (msg.role === 'user') return <UserMessage key={i} text={msg.text} />
          return <BotMessage key={msg.id || i} msg={msg} onAddRecipe={handleAddRecipe} />
        })}

        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div style={s.footer}>
        {!isEmpty && (
          <div style={s.chipsRow}>
            {CHIPS.map(c => (
              <button key={c} style={{ ...s.chip, ...s.chipSm }} onClick={() => send(c)} disabled={loading}>{c}</button>
            ))}
          </div>
        )}
        <div style={s.inputRow}>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => { setInput(e.target.value); resizeTa() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            rows={1}
            placeholder="Tell me what you're craving…"
            style={s.textarea}
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{ ...s.sendBtn, ...(loading || !input.trim() ? s.sendOff : {}) }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    maxWidth: 800, margin: '0 auto', width: '100%', padding: '0 16px',
  },
  messages: {
    flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
    gap: 16, padding: '20px 0 12px',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '40px 0 20px', animation: 'fadeUp .4s ease',
  },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 34,
    letterSpacing: 1.5, marginBottom: 8,
  },
  emptySub: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 560 },
  chip: {
    background: 'var(--surface)', border: '1.5px solid var(--border-strong)',
    borderRadius: 100, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, fontWeight: 500, padding: '9px 18px', cursor: 'pointer',
    transition: 'all .15s', whiteSpace: 'nowrap',
  },
  chipSm: { fontSize: 11, padding: '5px 12px' },
  botRow: { display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp .25s ease' },
  botWrap: { display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 'min(640px, 85%)' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'var(--surface-warm)', border: '1.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17, flexShrink: 0,
  },
  botBubble: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderTopLeftRadius: 3, borderTopRightRadius: 14,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    padding: '12px 16px', fontSize: 14, lineHeight: 1.7, color: 'var(--text)',
    boxShadow: 'var(--shadow-soft)',
  },
  addBtn: {
    alignSelf: 'flex-start',
    background: 'var(--accent-soft)', border: '1px solid var(--accent)',
    borderRadius: 8, color: 'var(--accent)', fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: 600, padding: '6px 12px', cursor: 'pointer',
    transition: 'all .15s',
  },
  addedBadge: { fontSize: 12, color: 'var(--success)', fontWeight: 600 },
  userRow: { display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp .25s ease' },
  userBubble: {
    background: 'var(--accent)', color: '#fff',
    borderTopLeftRadius: 14, borderTopRightRadius: 3,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    padding: '12px 16px', fontSize: 14, lineHeight: 1.6,
    maxWidth: 'min(520px, 80%)', fontWeight: 500, boxShadow: 'var(--shadow-soft)',
  },
  dot: {
    display: 'inline-block', width: 7, height: 7,
    background: 'var(--accent)', borderRadius: '50%', animation: 'bounce .9s infinite',
  },
  tool: {
    alignSelf: 'center', width: '100%', maxWidth: 600,
    background: 'var(--surface-warm)', border: '1px solid var(--border)',
    borderLeft: '3px solid var(--accent)', borderRadius: 8,
    padding: '10px 14px', animation: 'fadeUp .2s ease',
  },
  toolHeader: { display: 'flex', alignItems: 'center', gap: 10 },
  toolIcon: { fontSize: 13, flexShrink: 0 },
  toolMeta: { flex: 1, minWidth: 0 },
  toolName: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', letterSpacing: 0.3 },
  toolInput: { display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  toolStatus: { fontSize: 11, fontWeight: 500, flexShrink: 0, padding: '3px 8px', borderRadius: 10 },
  toolRunning: { color: 'var(--warning)', background: 'rgba(196,154,60,.12)' },
  toolDone: { color: 'var(--success)', background: 'rgba(90,143,106,.12)' },
  toolToggle: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: '6px 0 0', fontFamily: "'Inter', sans-serif" },
  toolResult: { marginTop: 8, padding: '10px 12px', background: 'var(--surface)', borderRadius: 6, fontSize: 11, lineHeight: 1.5, color: 'var(--text-muted)', overflowX: 'auto', maxHeight: 180, overflowY: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  footer: {
    borderTop: '1px solid var(--border)', padding: '10px 0 12px', flexShrink: 0,
  },
  chipsRow: { display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 10 },
  inputRow: { display: 'flex', gap: 10, alignItems: 'flex-end' },
  textarea: {
    flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border-strong)',
    borderRadius: 12, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 14, padding: '11px 16px', resize: 'none', outline: 'none',
    maxHeight: 120, lineHeight: 1.5, transition: 'border-color .15s',
  },
  sendBtn: {
    background: 'var(--accent)', border: 'none', borderRadius: 12, color: '#fff',
    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0, transition: 'background .15s',
  },
  sendOff: { background: 'var(--border)', cursor: 'not-allowed' },
}
