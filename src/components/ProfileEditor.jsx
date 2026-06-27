import { useState } from 'react'

const FIELDS = [
  {
    id: 'goal', label: 'Main goal', type: 'single',
    options: ['Lose weight', 'Maintain weight', 'Build muscle', 'Eat healthier', 'Save money on food'],
  },
  {
    id: 'dietType', label: 'Dietary restrictions', type: 'single',
    options: ['None / Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-free', 'Dairy-free', 'Halal'],
  },
  {
    id: 'householdSize', label: 'Cooking for', type: 'single',
    options: ['Just me', '2 people', '3–4 people', '5+ people'],
  },
  {
    id: 'mealsPerDay', label: 'Meals per day', type: 'single',
    options: ['2 meals', '3 meals', '3 meals + snack', '4+ meals'],
  },
  {
    id: 'skill', label: 'Cooking skill', type: 'single',
    options: ['Beginner — keep it super simple', 'Intermediate — I can follow a recipe', 'Advanced — challenge me'],
  },
  {
    id: 'timeAvailable', label: 'Time per meal', type: 'single',
    options: ['Under 15 mins', '15–30 mins', '30–60 mins', 'No limit — I enjoy cooking'],
  },
  {
    id: 'budget', label: 'Weekly budget', type: 'single',
    options: ['Under $50', '$50–$100', '$100–$150', '$150+ (no limit)'],
  },
  {
    id: 'equipment', label: 'Kitchen equipment', type: 'multi',
    options: ['Oven', 'Stovetop', 'Microwave', 'Air fryer', 'Slow cooker', 'Instant Pot', 'Blender', 'Grill'],
  },
  {
    id: 'prepDay', label: 'Prep day', type: 'single',
    options: ['Sunday', 'Saturday', 'Weekday evenings', 'No dedicated day'],
  },
  {
    id: 'dislikes', label: 'Dislikes / allergies', type: 'text',
    placeholder: 'e.g. cilantro, shellfish, dairy…',
  },
  {
    id: 'healthConditions', label: 'Health conditions', type: 'text',
    placeholder: 'e.g. diabetes, high blood pressure…',
  },
  {
    id: 'cuisines', label: 'Favorite cuisines', type: 'multi',
    options: ['Italian', 'Mexican', 'Japanese', 'Indian', 'Mediterranean', 'American', 'Chinese', 'Thai', 'Middle Eastern', 'Korean', 'Greek', 'Other'],
  },
]

function isOtherValue(options, value) {
  return value && !options.includes(value)
}

export default function ProfileEditor({ profile, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...profile })
  const [openField, setOpenField] = useState(null)
  const [otherDraft, setOtherDraft] = useState({}) // fieldId → other text

  function toggleField(id) {
    setOpenField(prev => prev === id ? null : id)
  }

  function pickSingle(id, value) {
    setDraft(prev => ({ ...prev, [id]: value }))
    setOpenField(null)
    setOtherDraft(prev => ({ ...prev, [id]: '' }))
  }

  function confirmOther(id) {
    const val = (otherDraft[id] || '').trim()
    if (!val) return
    setDraft(prev => ({ ...prev, [id]: val }))
    setOpenField(null)
    setOtherDraft(prev => ({ ...prev, [id]: '' }))
  }

  function toggleMulti(id, option) {
    setDraft(prev => {
      const cur = prev[id] || []
      return {
        ...prev,
        [id]: cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option],
      }
    })
  }

  function displayValue(field) {
    const val = draft[field.id]
    if (!val || (Array.isArray(val) && !val.length)) return '—'
    if (Array.isArray(val)) return val.join(', ')
    return val
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h2 style={s.title}>Edit Your Profile</h2>
          <p style={s.sub}>Tap any field to change it. Your meal plan will be regenerated.</p>
        </div>

        <div style={s.fields}>
          {FIELDS.map(field => {
            const isOpen = openField === field.id
            const currentVal = draft[field.id]
            const isCustom = field.type === 'single' && field.options && isOtherValue(field.options, currentVal)

            return (
              <div key={field.id} style={{ ...s.field, ...(isOpen ? s.fieldOpen : {}) }}>
                {/* Row header — always visible */}
                <button style={s.fieldRow} onClick={() => toggleField(field.id)}>
                  <span style={s.fieldLabel}>{field.label}</span>
                  <span style={s.fieldValue}>{displayValue(field)}</span>
                  <span style={s.chevron}>{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Expanded editor */}
                {isOpen && (
                  <div style={s.editor}>
                    {field.type === 'single' && (
                      <>
                        <div style={s.opts}>
                          {field.options.map(opt => (
                            <button
                              key={opt}
                              style={{ ...s.optBtn, ...(currentVal === opt ? s.optBtnOn : {}) }}
                              onClick={() => pickSingle(field.id, opt)}
                            >
                              {opt}
                            </button>
                          ))}
                          {/* Other */}
                          {isCustom ? (
                            <button style={{ ...s.optBtn, ...s.optBtnOn }}>{currentVal}</button>
                          ) : null}
                        </div>
                        <OtherInput
                          value={otherDraft[field.id] || ''}
                          onChange={v => setOtherDraft(prev => ({ ...prev, [field.id]: v }))}
                          onConfirm={() => confirmOther(field.id)}
                        />
                      </>
                    )}

                    {field.type === 'text' && (
                      <textarea
                        value={draft[field.id] || ''}
                        onChange={e => setDraft(prev => ({ ...prev, [field.id]: e.target.value }))}
                        placeholder={field.placeholder || ''}
                        rows={2}
                        style={s.textarea}
                        autoFocus
                      />
                    )}

                    {field.type === 'multi' && (
                      <div style={s.multiGrid}>
                        {field.options.map(opt => {
                          const selected = (draft[field.id] || []).includes(opt)
                          return (
                            <button
                              key={opt}
                              style={{ ...s.multiBtn, ...(selected ? s.multiBtnOn : {}) }}
                              onClick={() => toggleMulti(field.id, opt)}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={s.saveBtn} onClick={() => onSave(draft)}>
            Save & Regenerate Plan
          </button>
        </div>
      </div>
    </div>
  )
}

function OtherInput({ value, onChange, onConfirm }) {
  const [show, setShow] = useState(false)
  if (!show) {
    return (
      <button style={s.otherToggle} onClick={() => setShow(true)}>
        + Set a custom answer
      </button>
    )
  }
  return (
    <div style={s.otherBox}>
      <input
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onConfirm()}
        placeholder="Type your answer…"
        style={s.otherInput}
      />
      <button
        style={{ ...s.confirmBtn, ...(value.trim() ? {} : s.confirmBtnOff) }}
        disabled={!value.trim()}
        onClick={onConfirm}
      >
        Use this
      </button>
    </div>
  )
}

const s = {
  page: {
    flex: 1, overflowY: 'auto', background: 'var(--bg)',
    padding: '28px 20px',
  },
  container: { maxWidth: 600, margin: '0 auto' },
  header: { marginBottom: 24 },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 6,
  },
  sub: { fontSize: 13, color: 'var(--text-muted)' },

  fields: { display: 'flex', flexDirection: 'column', gap: 4 },
  field: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
    transition: 'box-shadow .15s',
  },
  fieldOpen: { boxShadow: 'var(--shadow)', borderColor: 'var(--accent)' },
  fieldRow: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    background: 'none', border: 'none', padding: '14px 16px',
    cursor: 'pointer', textAlign: 'left',
  },
  fieldLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    flexShrink: 0, minWidth: 130,
  },
  fieldValue: {
    flex: 1, fontSize: 14, color: 'var(--text)', fontWeight: 500,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  chevron: { fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 },

  editor: {
    borderTop: '1px solid var(--border)',
    padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
  },
  opts: { display: 'flex', flexDirection: 'column', gap: 6 },
  optBtn: {
    background: 'var(--surface-warm)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, fontWeight: 500, padding: '10px 14px',
    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
  },
  optBtnOn: {
    background: 'var(--accent-soft)', borderColor: 'var(--accent)',
    color: 'var(--accent)', fontWeight: 700,
  },
  textarea: {
    width: '100%', background: 'var(--surface-warm)',
    border: '1.5px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 14, padding: '10px 12px', resize: 'vertical',
    outline: 'none', lineHeight: 1.5,
  },
  multiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6,
  },
  multiBtn: {
    background: 'var(--surface-warm)', border: '1.5px solid var(--border)',
    borderRadius: 8, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif",
    fontSize: 12, fontWeight: 500, padding: '8px 6px',
    cursor: 'pointer', transition: 'all .15s', textAlign: 'center',
  },
  multiBtnOn: {
    background: 'var(--accent-soft)', borderColor: 'var(--accent)',
    color: 'var(--accent)', fontWeight: 700,
  },

  otherToggle: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontFamily: "'Inter', sans-serif", fontSize: 12,
    cursor: 'pointer', padding: '2px 0', textAlign: 'left',
    textDecoration: 'underline', textDecorationStyle: 'dashed',
  },
  otherBox: { display: 'flex', gap: 8, alignItems: 'center' },
  otherInput: {
    flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, padding: '9px 12px', outline: 'none',
  },
  confirmBtn: {
    background: 'var(--accent)', border: 'none', borderRadius: 8,
    color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 13, padding: '9px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  confirmBtnOff: { opacity: 0.4, cursor: 'not-allowed' },

  actions: {
    display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'none', border: '1px solid var(--border-strong)',
    borderRadius: 10, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: 500, padding: '12px 20px', cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--accent)', border: 'none',
    borderRadius: 10, color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 700, fontSize: 14, padding: '12px 24px', cursor: 'pointer',
  },
}
