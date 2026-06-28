export default function Header({ activeTab, onTab, groceryBadge }) {
  const tabs = [
    { id: 'chat',     label: 'Discover' },
    { id: 'mealprep', label: 'Meal Prep' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'grocery',  label: 'Grocery' },
  ]

  return (
    <header style={s.header}>
      <div style={s.inner}>
        {/* Left — logo */}
        <div style={s.brand}>
          <span style={s.logo}>🍳</span>
          <span style={s.name}>ChefAI</span>
        </div>

        {/* Center — nav */}
        <nav style={s.nav}>
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                style={{ ...s.tab, ...(active ? s.tabActive : {}) }}
                onClick={() => onTab(tab.id)}
              >
                {tab.label}
                {tab.id === 'grocery' && groceryBadge && (
                  <span style={{
                    ...s.badge,
                    background: groceryBadge.split('/')[0] === groceryBadge.split('/')[1]
                      ? '#16a34a' : '#60a5fa',
                  }}>
                    {groceryBadge}
                  </span>
                )}
                {active && <span style={s.underline} />}
              </button>
            )
          })}
        </nav>

        {/* Right — avatar */}
        <div style={s.avatar}>
          <svg viewBox="0 0 20 20" width={16} height={16} fill="#60a5fa">
            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H3z" />
          </svg>
        </div>
      </div>
    </header>
  )
}

const s = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #e8e4de',
    flexShrink: 0,
    height: 64,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    maxWidth: 1100,
    margin: '0 auto',
    height: '100%',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { fontSize: 20 },
  name: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#1c1917',
    letterSpacing: '-0.3px',
  },
  nav: { display: 'flex', gap: 4 },
  tab: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    padding: '8px 14px',
    fontSize: 14,
    fontWeight: 500,
    color: '#78716c',
    cursor: 'pointer',
    transition: 'color 150ms',
    fontFamily: "'Inter', sans-serif",
  },
  tabActive: { color: '#1c1917', fontWeight: 600 },
  underline: {
    position: 'absolute',
    bottom: -17,
    left: 14,
    right: 14,
    height: 2,
    background: '#60a5fa',
    borderRadius: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    padding: '1px 6px',
    borderRadius: 8,
    lineHeight: 1.6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#eff6ff',
    border: '1.5px solid #60a5fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}
