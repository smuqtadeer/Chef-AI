import { useState } from 'react'

export default function KeyGate({ onUnlock }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)

  function handleUnlock() {
    const val = key.trim()
    if (!val.startsWith('sk-ant-')) {
      setError('Key should start with sk-ant- — double-check and try again.')
      return
    }
    setError('')
    onUnlock(val)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>🍳</div>
          <h2 style={styles.logoText}>CHEF<span style={{ color: 'var(--accent)' }}>AI</span></h2>
        </div>
        <p style={styles.desc}>
          Enter your Anthropic API key to fire up the kitchen. Your key stays in memory
          and is never stored anywhere — it's sent only directly to Anthropic.
        </p>
        <span style={styles.label}>ANTHROPIC API KEY</span>
        <div style={styles.inputRow}>
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="sk-ant-api03-…"
            autoComplete="off"
            spellCheck={false}
            style={styles.input}
          />
          <button
            onClick={() => setShowKey(v => !v)}
            style={styles.eyeBtn}
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? '🙈' : '👁️'}
          </button>
          <button onClick={handleUnlock} style={styles.unlockBtn}>
            Start →
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.hint}>
          Don't have a key?{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={styles.link}>
            console.anthropic.com
          </a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'var(--black)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 24,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderTop: '3px solid var(--accent)',
    borderRadius: 14,
    padding: '36px 32px',
    maxWidth: 460, width: '100%',
    boxShadow: 'var(--shadow-soft)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoIcon: {
    width: 42, height: 42, background: 'var(--accent)', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  logoText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 30, letterSpacing: 2, color: 'var(--white)',
  },
  desc: { fontSize: 13, color: 'var(--gray)', marginBottom: 20, lineHeight: 1.65 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    letterSpacing: 1.5, color: 'var(--gray)', marginBottom: 8,
  },
  inputRow: { display: 'flex', gap: 8, marginBottom: 8 },
  input: {
    flex: 1, background: 'var(--panel)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--white)',
    fontFamily: "'Inter', sans-serif", fontSize: 13,
    padding: '11px 14px', outline: 'none', letterSpacing: 0.5,
    minWidth: 0,
  },
  eyeBtn: {
    background: 'var(--panel)', border: '1px solid var(--border)',
    borderRadius: 8, cursor: 'pointer', padding: '0 12px', fontSize: 16,
    flexShrink: 0,
  },
  unlockBtn: {
    background: 'var(--accent)', border: 'none', borderRadius: 8,
    color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 13,
    padding: '11px 18px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },
  error: { fontSize: 12, color: 'var(--error)', marginBottom: 4, minHeight: 18 },
  hint: { fontSize: 11, color: 'var(--text-muted)', marginTop: 14 },
  link: { color: 'var(--accent)', textDecoration: 'none' },
}
