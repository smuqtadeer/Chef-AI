export default function Header({ activeTab, onTab, groceryBadge }) {
  const tabs = [
    { id: 'chat',     label: 'Chat',      icon: '💬' },
    { id: 'mealprep', label: 'Meal Prep', icon: '📅' },
    { id: 'grocery',  label: 'Grocery',   icon: '🛒' },
  ]

  return (
    <header style={s.header}>
      <div style={s.inner}>
        <div style={s.brand}>
          <span style={s.logo}>🍳</span>
          <span style={s.name}>ChefAI</span>
        </div>

        <nav style={s.nav}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
              onClick={() => onTab(tab.id)}
            >
              <span style={s.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'grocery' && groceryBadge && (
                <span style={{
                  ...s.badge,
                  background: groceryBadge.split('/')[0] === groceryBadge.split('/')[1]
                    ? 'var(--success)'
                    : 'var(--accent)',
                }}>
                  {groceryBadge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

const s = {
  header: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    maxWidth: 1100,
    margin: '0 auto',
    width: '100%',
    height: 54,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { fontSize: 22 },
  name: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 24,
    letterSpacing: 1.5,
    color: 'var(--text)',
    lineHeight: 1,
  },
  nav: { display: 'flex', gap: 4 },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    borderRadius: 8,
    color: 'var(--text-muted)',
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 12px',
    cursor: 'pointer',
    transition: 'all .15s',
    position: 'relative',
  },
  tabActive: {
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    fontWeight: 700,
  },
  tabIcon: { fontSize: 14 },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    padding: '1px 5px',
    borderRadius: 8,
    lineHeight: 1.6,
  },
}
