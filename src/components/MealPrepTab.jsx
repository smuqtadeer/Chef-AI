import { useState } from 'react'
import Onboarding from './Onboarding'
import MealPlan from './MealPlan'
import ProfileEditor from './ProfileEditor'

function getDayLabel(chunk, i) {
  const m = chunk.match(/^##\s*(.+?)(?:\n|$)/i)
  return m ? m[1].trim() : `Day ${i + 1}`
}

export default function MealPrepTab({
  apiKey, profile, setProfile,
  mealPlan, setMealPlan, parsedPlan,
  selectedDay, setSelectedDay,
  completedDays, onToggleDay,
}) {
  const [editing, setEditing] = useState(false)

  if (!profile) return <Onboarding onComplete={setProfile} />

  if (editing) {
    return (
      <ProfileEditor
        profile={profile}
        onSave={(updated) => {
          setProfile(updated)
          setMealPlan(null)   // regenerate plan for new profile
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div style={s.layout}>
      {/* Day sidebar */}
      <nav style={s.sidebar}>
        <p style={s.sideLabel}>MEAL PLAN</p>

        {parsedPlan ? (
          parsedPlan.days.map((chunk, i) => {
            const done = completedDays.has(i)
            const active = selectedDay === i
            return (
              <div key={i} style={s.navRow}>
                <button
                  style={{
                    ...s.navBtn,
                    ...(active ? s.navActive : {}),
                    ...(done ? s.navDone : {}),
                  }}
                  onClick={() => setSelectedDay(i)}
                >
                  <span style={{ ...s.dot, ...(done ? s.dotDone : {}) }} />
                  <span style={done ? s.labelDone : {}}>{getDayLabel(chunk, i)}</span>
                </button>
                <button
                  style={s.checkBtn}
                  onClick={() => onToggleDay(i)}
                  aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                  title={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done ? (
                    <svg viewBox="0 0 16 16" width={14} height={14} fill="var(--success)">
                      <circle cx="8" cy="8" r="7" />
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="var(--border-strong)" strokeWidth="1.5">
                      <circle cx="8" cy="8" r="7" />
                    </svg>
                  )}
                </button>
              </div>
            )
          })
        ) : (
          Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={s.navRow}>
              <button style={{ ...s.navBtn, opacity: 0.35, cursor: 'default' }}>
                <span style={s.dot} />
                Day {i + 1}
              </button>
            </div>
          ))
        )}

        <div style={s.divider} />
        <button style={s.resetBtn} onClick={() => setEditing(true)}>
          ✏️ Edit Profile
        </button>
      </nav>

      {/* Plan content */}
      <main style={s.main}>
        <MealPlan
          apiKey={apiKey}
          profile={profile}
          mealPlan={mealPlan}
          setMealPlan={setMealPlan}
          selectedDayIndex={selectedDay}
          parsed={parsedPlan}
        />
      </main>
    </div>
  )
}

const s = {
  layout: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: {
    width: 210, flexShrink: 0,
    background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    padding: '16px 12px', overflowY: 'auto', gap: 2,
  },
  sideLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    color: 'var(--text-muted)', padding: '4px 8px 10px',
  },
  navRow: { display: 'flex', alignItems: 'center', gap: 2 },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    flex: 1, minWidth: 0, background: 'none', border: 'none',
    borderRadius: 8, color: 'var(--text)', fontFamily: "'Inter', sans-serif",
    fontSize: 13, fontWeight: 500, padding: '8px 8px', cursor: 'pointer',
    textAlign: 'left', transition: 'background .15s',
  },
  navActive: { background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 },
  navDone: { color: 'var(--text-muted)' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  dotDone: { background: 'var(--success)' },
  labelDone: { textDecoration: 'line-through', opacity: 0.6 },
  checkBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, flexShrink: 0,
  },
  divider: { height: 1, background: 'var(--border)', margin: '10px 0' },
  resetBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontFamily: "'Inter', sans-serif", fontSize: 12,
    padding: '6px 8px', cursor: 'pointer', textAlign: 'left',
  },
  main: { flex: 1, overflowY: 'auto', background: 'var(--bg)' },
}
