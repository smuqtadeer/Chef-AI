function CheckItem({ text, checked, onToggle }) {
  return (
    <li onClick={onToggle} style={s.item}>
      <span style={{ ...s.checkbox, ...(checked ? s.checkboxOn : {}) }}>
        {checked && (
          <svg viewBox="0 0 10 10" width={10} height={10} fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={checked ? s.textOff : s.text}>{text}</span>
    </li>
  )
}

function SectionCard({ category, items, checked, onToggle }) {
  return (
    <div style={s.card}>
      <p style={s.category}>{category}</p>
      <ul style={s.list}>
        {items.map(item => (
          <CheckItem
            key={item}
            text={item}
            checked={checked.has(item)}
            onToggle={() => onToggle(item)}
          />
        ))}
      </ul>
    </div>
  )
}

export default function GroceryTab({
  mealPrepSections, mealPrepChecked, onToggleMealPrep,
  chatGroceryItems, chatChecked, onToggleChat, onRemoveChatRecipe,
  hasMealPlan, onGoMealPrep,
}) {
  const mpTotal = mealPrepSections.reduce((n, s) => n + s.items.length, 0)
  const mpChecked = mealPrepChecked.size
  const chatTotal = chatGroceryItems.reduce((n, g) => n + g.items.length, 0)
  const chatCheckedCount = chatChecked.size

  const bothEmpty = mpTotal === 0 && chatTotal === 0

  return (
    <div style={s.page}>
      {bothEmpty ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🛒</div>
          <h2 style={s.emptyTitle}>Your grocery list is empty</h2>
          <p style={s.emptySub}>
            Build your 7-day meal plan to get a full ingredient list, or ask
            the chat for a recipe and add its ingredients here.
          </p>
          {!hasMealPlan && (
            <button style={s.emptyBtn} onClick={onGoMealPrep}>
              Set up Meal Prep →
            </button>
          )}
        </div>
      ) : (
        <div style={s.cols}>
          {/* Meal Prep List */}
          <section style={s.col}>
            <div style={s.colHeader}>
              <h2 style={s.colTitle}>📅 Meal Prep</h2>
              {mpTotal > 0 && (
                <span style={{
                  ...s.progress,
                  color: mpChecked === mpTotal ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {mpChecked}/{mpTotal} checked
                </span>
              )}
            </div>

            {mealPrepSections.length === 0 ? (
              <div style={s.colEmpty}>
                <p style={s.colEmptyText}>No meal plan yet.</p>
                <button style={s.colEmptyBtn} onClick={onGoMealPrep}>
                  Build Meal Plan →
                </button>
              </div>
            ) : (
              <div style={s.grid}>
                {mealPrepSections.map(sec => (
                  <SectionCard
                    key={sec.category}
                    category={sec.category}
                    items={sec.items}
                    checked={mealPrepChecked}
                    onToggle={onToggleMealPrep}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Chat Recipe List */}
          <section style={s.col}>
            <div style={s.colHeader}>
              <h2 style={s.colTitle}>💬 Chat Recipes</h2>
              {chatTotal > 0 && (
                <span style={{
                  ...s.progress,
                  color: chatCheckedCount === chatTotal ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {chatCheckedCount}/{chatTotal} checked
                </span>
              )}
            </div>

            {chatGroceryItems.length === 0 ? (
              <div style={s.colEmpty}>
                <p style={s.colEmptyText}>No recipes added yet.</p>
                <p style={s.colEmptyHint}>
                  When the chat shows a full recipe, click<br/>
                  "Add ingredients to grocery list".
                </p>
              </div>
            ) : (
              <div style={s.grid}>
                {chatGroceryItems.map(group => (
                  <div key={group.id} style={s.recipeGroup}>
                    <div style={s.groupHeader}>
                      <p style={s.groupName}>{group.name}</p>
                      <button
                        style={s.removeBtn}
                        onClick={() => onRemoveChatRecipe(group.id)}
                        title="Remove recipe"
                      >
                        ✕
                      </button>
                    </div>
                    <ul style={s.list}>
                      {group.items.map(item => (
                        <CheckItem
                          key={item}
                          text={item}
                          checked={chatChecked.has(item)}
                          onToggle={() => onToggleChat(item)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { flex: 1, overflowY: 'auto', padding: '28px 24px' },

  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', paddingTop: 80, animation: 'fadeUp .3s ease',
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 30,
    letterSpacing: 1.5, marginBottom: 10,
  },
  emptySub: { fontSize: 14, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.6, marginBottom: 24 },
  emptyBtn: {
    background: 'var(--accent)', border: 'none', borderRadius: 10,
    color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 700, fontSize: 14, padding: '12px 24px', cursor: 'pointer',
  },

  cols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 32,
    maxWidth: 1000, margin: '0 auto',
  },
  col: {},
  colHeader: {
    display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16,
  },
  colTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1,
  },
  progress: { fontSize: 12, fontWeight: 600 },
  grid: { display: 'flex', flexDirection: 'column', gap: 12 },

  colEmpty: {
    background: 'var(--surface)', border: '1px dashed var(--border-strong)',
    borderRadius: 14, padding: '28px 20px', textAlign: 'center',
  },
  colEmptyText: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 },
  colEmptyHint: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 },
  colEmptyBtn: {
    marginTop: 14, background: 'var(--accent-soft)', border: '1px solid var(--accent)',
    borderRadius: 8, color: 'var(--accent)', fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 13, padding: '8px 16px', cursor: 'pointer',
  },

  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-soft)',
  },
  recipeGroup: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderLeft: '3px solid var(--accent)', borderRadius: 12,
    padding: '14px 16px', boxShadow: 'var(--shadow-soft)',
  },
  groupHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  groupName: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
    color: 'var(--accent)', textTransform: 'uppercase',
  },
  removeBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: 12, cursor: 'pointer', padding: '2px 4px', lineHeight: 1,
  },

  category: {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
  },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 },
  item: {
    display: 'flex', alignItems: 'center', gap: 10,
    cursor: 'pointer', padding: '2px 0', borderRadius: 4, userSelect: 'none',
  },
  checkbox: {
    width: 17, height: 17, borderRadius: 5,
    border: '1.5px solid var(--border-strong)', background: 'var(--bg)',
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s',
  },
  checkboxOn: { background: 'var(--success)', border: '1.5px solid var(--success)' },
  text: { fontSize: 13, color: 'var(--text)', lineHeight: 1.4 },
  textOff: { fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', lineHeight: 1.4 },
}
