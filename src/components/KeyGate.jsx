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
          <h2 style={styles.logoText}>Chef<span style={{ color: '#60a5fa' }}>AI</span></h2>
        </div>
        <p style={styles.desc}>
          Enter your Anthropic API key to get started. Your key stays in memory
          and is never stored anywhere — it's sent only directly to Anthropic.
        </p>
        <span style={styles.label}>ANTHROPIC API KEY</span>
        <div style={styles.inputWrap}>
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
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button onClick={handleUnlock} style={styles.unlockBtn}>
          Get Started
        </button>
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
    background: '#f8f5f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 24,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e8e4de',
    borderRadius: 16,
    padding: '40px 36px',
    maxWidth: 440, width: '100%',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  logoIcon: {
    width: 40, height: 40, background: '#eff6ff',
    border: '1.5px solid #60a5fa',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  logoText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#1c1917',
  },
  desc: { fontSize: 13, color: '#78716c', marginBottom: 24, lineHeight: 1.65 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.5, color: '#a8a29e', marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrap: { position: 'relative', marginBottom: 8 },
  input: {
    width: '100%', background: '#ffffff', border: '1px solid #e8e4de',
    borderRadius: 10, color: '#1c1917',
    fontFamily: "'Inter', sans-serif", fontSize: 13,
    padding: '11px 44px 11px 14px', outline: 'none', letterSpacing: 0.5,
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
    padding: '2px 4px', lineHeight: 1,
  },
  unlockBtn: {
    width: '100%', background: '#60a5fa', border: 'none', borderRadius: 10,
    color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 14,
    padding: '13px 18px', cursor: 'pointer', marginBottom: 16,
  },
  error: { fontSize: 12, color: '#dc2626', marginBottom: 12, minHeight: 18 },
  hint: { fontSize: 12, color: '#a8a29e', textAlign: 'center' },
  link: { color: '#60a5fa', textDecoration: 'none' },
}
