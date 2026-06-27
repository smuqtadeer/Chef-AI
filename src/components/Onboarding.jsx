import { useState } from 'react'

const STEPS = [
  {
    id: 'goal',
    title: "What's your main goal?",
    subtitle: 'This shapes your calorie targets and meal style.',
    type: 'single',
    options: ['Lose weight', 'Maintain weight', 'Build muscle', 'Eat healthier', 'Save money on food'],
  },
  {
    id: 'dietType',
    title: 'Any dietary restrictions?',
    subtitle: "We'll respect this in every single meal — no exceptions.",
    type: 'single',
    options: ['None / Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-free', 'Dairy-free', 'Halal'],
  },
  {
    id: 'householdSize',
    title: 'Who are you cooking for?',
    subtitle: "Portions and shopping quantities will be scaled accordingly.",
    type: 'single',
    options: ['Just me', '2 people', '3–4 people', '5+ people'],
  },
  {
    id: 'mealsPerDay',
    title: 'How many meals per day?',
    subtitle: 'Including snacks. This determines how your calories are split.',
    type: 'single',
    options: ['2 meals', '3 meals', '3 meals + snack', '4+ meals'],
  },
  {
    id: 'skill',
    title: 'How confident are you in the kitchen?',
    subtitle: "Recipes will be matched to your skill level.",
    type: 'single',
    options: ['Beginner — keep it super simple', 'Intermediate — I can follow a recipe', 'Advanced — challenge me'],
  },
  {
    id: 'timeAvailable',
    title: 'How much time can you spend cooking?',
    subtitle: 'Per meal, on average.',
    type: 'single',
    options: ['Under 15 mins', '15–30 mins', '30–60 mins', 'No limit — I enjoy cooking'],
  },
  {
    id: 'budget',
    title: "What's your weekly grocery budget?",
    subtitle: 'Per person. Helps us keep things realistic.',
    type: 'single',
    options: ['Under $50', '$50–$100', '$100–$150', '$150+ (no limit)'],
  },
  {
    id: 'equipment',
    title: 'What kitchen equipment do you have?',
    subtitle: 'Select everything available to you.',
    type: 'multi',
    options: ['Oven', 'Stovetop', 'Microwave', 'Air fryer', 'Slow cooker', 'Instant Pot', 'Blender', 'Grill'],
    default: ['Oven', 'Stovetop', 'Microwave'],
  },
  {
    id: 'prepDay',
    title: 'When do you usually meal prep?',
    subtitle: "We'll design the plan around batch cooking on that day.",
    type: 'single',
    options: ['Sunday', 'Saturday', 'Weekday evenings', 'No dedicated day'],
  },
  {
    id: 'dislikes',
    title: 'Any dislikes or allergies?',
    subtitle: 'Ingredients you absolutely never want to see. Leave blank if none.',
    type: 'text',
    placeholder: 'e.g. cilantro, shellfish, mushrooms, dairy…',
  },
  {
    id: 'healthConditions',
    title: 'Any health conditions to consider?',
    subtitle: "Optional — helps us tailor macros and avoid triggers. Leave blank to skip.",
    type: 'text',
    placeholder: 'e.g. diabetes, high blood pressure, IBS, PCOS…',
  },
  {
    id: 'cuisines',
    title: 'Favorite cuisines',
    subtitle: 'Select at least one. The more you pick, the more variety in your plan.',
    type: 'multi',
    options: ['Italian', 'Mexican', 'Japanese', 'Indian', 'Mediterranean', 'American', 'Chinese', 'Thai', 'Middle Eastern', 'Korean', 'Greek', 'Other'],
  },
]

const EMPTY = {
  goal: '', dietType: '', householdSize: '', mealsPerDay: '', skill: '',
  timeAvailable: '', budget: '', equipment: [], prepDay: '',
  dislikes: '', healthConditions: '', cuisines: [],
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState(EMPTY)
  const [textInput, setTextInput] = useState('')
  const [otherText, setOtherText] = useState('')   // for "Other" inline input
  const [showOther, setShowOther] = useState(false) // single: show other input
  const [animKey, setAnimKey] = useState(0)

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  function advance(stepIndex) {
    setStep(stepIndex)
    setAnimKey(k => k + 1)
    setShowOther(false)
    setOtherText('')
    const next = STEPS[stepIndex]
    if (next?.type === 'text') setTextInput(profile[next.id] || '')
    if (next?.type === 'multi' && next.default && !profile[next.id]?.length) {
      setProfile(p => ({ ...p, [next.id]: next.default }))
    }
  }

  function goNext(value) {
    const updated = { ...profile, [current.id]: value }
    setProfile(updated)
    if (step < STEPS.length - 1) {
      advance(step + 1)
    } else {
      onComplete(updated)
    }
  }

  function goBack() {
    if (step === 0) return
    advance(step - 1)
  }

  // single: pick a preset option
  function pickOption(opt) {
    setShowOther(false)
    setOtherText('')
    goNext(opt)
  }

  // single: toggle "Other" input visibility
  function toggleOther() {
    setShowOther(v => !v)
    setOtherText('')
  }

  // single: confirm the typed other value
  function confirmOther() {
    const val = otherText.trim()
    if (!val) return
    goNext(val)
  }

  function toggleMulti(id, option) {
    setProfile(prev => ({
      ...prev,
      [id]: prev[id].includes(option) ? prev[id].filter(o => o !== option) : [...prev[id], option],
    }))
  }

  // multi: handle "Other" chip — when selected, prompt inline; when deselected, clear
  function handleMultiOther(id) {
    const selected = profile[id]?.includes('Other')
    if (selected) {
      // deselect: remove 'Other' and any custom value
      setProfile(prev => ({ ...prev, [id]: prev[id].filter(o => o !== 'Other') }))
      setShowOther(false)
      setOtherText('')
    } else {
      setProfile(prev => ({ ...prev, [id]: [...(prev[id] || []), 'Other'] }))
      setShowOther(true)
    }
  }

  // Build the display list for multi: replace 'Other' with 'Other: <value>' if typed
  function multiDisplayValue(id) {
    const vals = profile[id] || []
    if (vals.includes('Other') && otherText.trim()) {
      return vals.map(v => (v === 'Other' ? `Other: ${otherText.trim()}` : v))
    }
    return vals
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.logoRow}>
          <span style={s.logoIcon}>📅</span>
          <h1 style={s.logoText}>Meal Prep Setup</h1>
        </div>

        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>
        <p style={s.progressLabel}>Step {step + 1} of {STEPS.length}</p>

        <div key={animKey} style={s.card}>
          <h2 style={s.title}>{current.title}</h2>
          <p style={s.subtitle}>{current.subtitle}</p>

          {current.type === 'single' && (
            <div style={s.options}>
              {current.options.map(opt => (
                <button key={opt} style={s.optBtn} onClick={() => pickOption(opt)}>
                  {opt}
                </button>
              ))}

              {/* Other option */}
              {!showOther ? (
                <button style={{ ...s.optBtn, ...s.optBtnOther }} onClick={toggleOther}>
                  Other — let me type it
                </button>
              ) : (
                <div style={s.otherBox}>
                  <input
                    autoFocus
                    value={otherText}
                    onChange={e => setOtherText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmOther()}
                    placeholder="Type your answer…"
                    style={s.otherInput}
                  />
                  <div style={s.otherActions}>
                    <button
                      style={{ ...s.continueBtn, flex: 1, ...(otherText.trim() ? {} : s.continueBtnOff) }}
                      disabled={!otherText.trim()}
                      onClick={confirmOther}
                    >
                      Continue →
                    </button>
                    <button style={s.cancelBtn} onClick={() => { setShowOther(false); setOtherText('') }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {current.type === 'text' && (
            <div>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={current.placeholder || ''}
                rows={3}
                style={s.textarea}
                autoFocus
              />
              <button style={s.continueBtn} onClick={() => goNext(textInput.trim())}>
                Continue →
              </button>
            </div>
          )}

          {current.type === 'multi' && (
            <div>
              <div style={s.multiGrid}>
                {current.options.map(opt => {
                  const isOther = opt === 'Other'
                  const selected = profile[current.id]?.includes(opt)
                  return (
                    <button
                      key={opt}
                      style={{ ...s.multiBtn, ...(selected ? s.multiBtnOn : {}) }}
                      onClick={() => isOther ? handleMultiOther(current.id) : toggleMulti(current.id, opt)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {/* Inline text when "Other" is selected in multi */}
              {showOther && profile[current.id]?.includes('Other') && (
                <div style={{ ...s.otherBox, marginBottom: 14 }}>
                  <input
                    autoFocus
                    value={otherText}
                    onChange={e => setOtherText(e.target.value)}
                    placeholder="Describe your other option…"
                    style={s.otherInput}
                  />
                </div>
              )}

              <button
                style={{
                  ...s.continueBtn,
                  ...(!multiDisplayValue(current.id).length ? s.continueBtnOff : {}),
                }}
                disabled={!multiDisplayValue(current.id).length}
                onClick={() => goNext(multiDisplayValue(current.id))}
              >
                {step === STEPS.length - 1 ? 'Build My Meal Plan →' : 'Continue →'}
              </button>
            </div>
          )}
        </div>

        {step > 0 && (
          <button style={s.backBtn} onClick={goBack}>← Back</button>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    flex: 1, background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', overflowY: 'auto',
  },
  container: { width: '100%', maxWidth: 520, animation: 'fadeIn .3s ease' },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    justifyContent: 'center', marginBottom: 24,
  },
  logoIcon: { fontSize: 26 },
  logoText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)',
  },
  progressBar: {
    height: 4, background: 'var(--border)', borderRadius: 2,
    overflow: 'hidden', marginBottom: 6,
  },
  progressFill: {
    height: '100%', background: 'var(--accent)',
    borderRadius: 2, transition: 'width .4s ease',
  },
  progressLabel: {
    fontSize: 11, color: 'var(--text-muted)', marginBottom: 18,
    textAlign: 'center', letterSpacing: 0.4,
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '28px 24px',
    animation: 'slideIn .3s ease', boxShadow: 'var(--shadow)',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 6,
  },
  subtitle: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  optBtn: {
    background: 'var(--surface-warm)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 14, fontWeight: 500, padding: '12px 16px',
    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
  },
  textarea: {
    width: '100%', background: 'var(--surface-warm)',
    border: '1.5px solid var(--border)', borderRadius: 10,
    color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 14, padding: '12px 14px', resize: 'vertical',
    outline: 'none', marginBottom: 14, lineHeight: 1.6,
  },
  multiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 8, marginBottom: 18,
  },
  multiBtn: {
    background: 'var(--surface-warm)', border: '1.5px solid var(--border)',
    borderRadius: 10, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, fontWeight: 500, padding: '10px 8px',
    cursor: 'pointer', transition: 'all .15s',
  },
  multiBtnOn: {
    borderColor: 'var(--accent)', color: 'var(--accent)',
    background: 'var(--accent-soft)', fontWeight: 700,
  },
  continueBtn: {
    width: '100%', background: 'var(--accent)', border: 'none',
    borderRadius: 10, color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 700, fontSize: 14, padding: '13px 18px', cursor: 'pointer',
  },
  continueBtnOff: { opacity: 0.4, cursor: 'not-allowed' },
  backBtn: {
    display: 'block', margin: '14px auto 0', background: 'none', border: 'none',
    color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, cursor: 'pointer', padding: '8px 16px',
  },
  optBtnOther: {
    color: 'var(--text-muted)', borderStyle: 'dashed',
    fontStyle: 'italic',
  },
  otherBox: {
    marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8,
    background: 'var(--accent-soft)', border: '1.5px solid var(--accent)',
    borderRadius: 10, padding: '12px 14px',
  },
  otherInput: {
    background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 14, padding: '10px 12px', outline: 'none', width: '100%',
  },
  otherActions: { display: 'flex', gap: 8 },
  cancelBtn: {
    background: 'none', border: '1px solid var(--border-strong)',
    borderRadius: 8, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
  },
}
