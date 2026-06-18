export default function Header({ view, setView, onReset }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logoIcon}>🏎️</div>
        <h1 style={styles.title}>
          AUTO<span style={{ color: 'var(--red)' }}>BOT</span>
        </h1>
      </div>

      <nav style={styles.nav}>
        <button
          style={{ ...styles.navBtn, ...(view === 'chat' ? styles.navActive : {}) }}
          onClick={() => setView('chat')}
        >
          Chat
        </button>
        <button
          style={{ ...styles.navBtn, ...(view === 'how' ? styles.navActive : {}) }}
          onClick={() => setView('how')}
        >
          How It Works
        </button>
      </nav>

      <div style={styles.right}>
        <div style={styles.dot} />
        <span style={styles.status}>Engine Running</span>
        <button onClick={onReset} style={styles.resetBtn} title="Change API key">
          🔑
        </button>
      </div>
    </header>
  )
}

const styles = {
  header: {
    background: 'var(--dark)',
    borderBottom: '2px solid var(--red)',
    padding: '0 24px',
    height: 64,
    display: 'flex', alignItems: 'center', gap: 14,
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 14 },
  logoIcon: {
    width: 38, height: 38, background: 'var(--red)', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28, letterSpacing: 2, color: 'var(--white)',
  },
  nav: { display: 'flex', gap: 4, marginLeft: 16 },
  navBtn: {
    background: 'none', border: '1px solid transparent',
    borderRadius: 8, color: 'var(--gray)', fontSize: 13,
    fontFamily: "'Inter', sans-serif", fontWeight: 500,
    padding: '6px 14px', cursor: 'pointer', transition: 'all .2s',
  },
  navActive: {
    borderColor: 'var(--red)', color: 'var(--white)',
    background: 'var(--red-dim)',
  },
  right: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, color: 'var(--gray)',
  },
  dot: {
    width: 8, height: 8, background: '#22c55e',
    borderRadius: '50%', boxShadow: '0 0 6px #22c55e',
  },
  status: { fontSize: 12, color: 'var(--gray)' },
  resetBtn: {
    background: 'none', border: '1px solid var(--border)',
    borderRadius: 6, cursor: 'pointer', fontSize: 14,
    padding: '4px 8px', marginLeft: 4,
    transition: 'border-color .2s',
  },
}
