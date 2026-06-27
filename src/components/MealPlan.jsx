import { useState, useEffect } from 'react'
import { callClaude } from '../api/claude.js'
import { MEAL_PLAN_SYSTEM, formatProfile } from '../prompts.js'

function renderContent(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4 style="margin:14px 0 6px;font-size:13px;color:var(--accent);font-weight:700">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:18px 0 8px;font-size:16px;font-weight:700">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:18px;margin-bottom:5px">$1</li>')
    .replace(/\n/g, '<br>')
}

export default function MealPlan({ apiKey, profile, mealPlan, setMealPlan, selectedDayIndex, parsed }) {
  const [loading, setLoading] = useState(!mealPlan)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mealPlan) return
    let cancelled = false

    async function generate() {
      setLoading(true)
      setError(null)
      try {
        const text = await callClaude(apiKey, {
          system: MEAL_PLAN_SYSTEM,
          messages: [{
            role: 'user',
            content: `Here is my dietary profile:\n\n${formatProfile(profile)}\n\nPlease generate my personalized 7-day meal plan.`,
          }],
          maxTokens: 8192,
        })
        if (!cancelled) setMealPlan(text)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    generate()
    return () => { cancelled = true }
  }, [apiKey, profile, mealPlan, setMealPlan])

  if (error) {
    return (
      <div style={styles.centered}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>⚠️ Couldn't generate your meal plan — {error}</p>
          <button style={styles.retryBtn} onClick={() => { setError(null); setMealPlan(null) }}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (loading || !mealPlan || !parsed) {
    return (
      <div style={styles.centered}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <h2 style={styles.loadingTitle}>Crafting your meal plan…</h2>
          <p style={styles.loadingText}>
            ChefAI is building a personalized 7-day plan based on your profile. This may take a moment.
          </p>
          <div style={styles.typing}>
            <span style={{ ...styles.dot, animationDelay: '0s' }} />
            <span style={{ ...styles.dot, animationDelay: '.15s' }} />
            <span style={{ ...styles.dot, animationDelay: '.3s' }} />
          </div>
        </div>
      </div>
    )
  }

  const dayChunk = parsed.days[selectedDayIndex]

  if (!dayChunk) {
    return (
      <div style={styles.centered}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data for this day.</p>
      </div>
    )
  }

  const titleMatch = dayChunk.match(/^##\s*(.+?)(?:\n|$)/i)
  const title = titleMatch ? titleMatch[1].trim() : `Day ${selectedDayIndex + 1}`
  const body = dayChunk.replace(/^##[^\n]*\n?/, '').trim()

  const mealSections = body.split(/(?=###\s)/i).filter(Boolean)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.dayLabel}>DAY {selectedDayIndex + 1}</p>
        <h2 style={styles.dayTitle}>{title.replace(/^Day\s+\d+[:\s–-]*/i, '') || title}</h2>
        <p style={styles.sub}>{profile.goal} · {profile.dietType} · {profile.skill}</p>
      </div>

      {mealSections.length > 1 ? (
        <div style={styles.grid}>
          {mealSections.map((section, i) => {
            const mTitleMatch = section.match(/^###\s*(.+?)(?:\n|$)/i)
            const mTitle = mTitleMatch ? mTitleMatch[1].trim() : `Meal ${i + 1}`
            const mBody = section.replace(/^###[^\n]*\n?/, '').trim()
            return (
              <div key={i} style={styles.mealCard}>
                <p style={styles.mealLabel}>{mTitle}</p>
                <div
                  style={styles.mealBody}
                  dangerouslySetInnerHTML={{ __html: renderContent(mBody) }}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div
          style={styles.fallbackCard}
          dangerouslySetInnerHTML={{ __html: renderContent(body) }}
        />
      )}
    </div>
  )
}

const styles = {
  page: {
    padding: '28px 32px',
    maxWidth: 860,
    margin: '0 auto',
    animation: 'fadeUp .2s ease',
  },
  header: { marginBottom: 28 },
  dayLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: 'var(--accent)',
    marginBottom: 6,
  },
  dayTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 28, fontWeight: 800,
    letterSpacing: '-0.5px',
    color: 'var(--text)',
    lineHeight: 1.1,
    marginBottom: 6,
  },
  sub: { fontSize: 13, color: 'var(--text-muted)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  mealCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '18px 20px',
    boxShadow: 'var(--shadow-soft)',
    animation: 'fadeUp .25s ease',
  },
  mealLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  mealBody: {
    fontSize: 13,
    lineHeight: 1.7,
    color: 'var(--text)',
  },
  fallbackCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '24px 28px',
    fontSize: 14,
    lineHeight: 1.8,
    color: 'var(--text)',
    boxShadow: 'var(--shadow-soft)',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 32,
  },
  loadingCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '48px 40px',
    textAlign: 'center',
    maxWidth: 420,
    width: '100%',
    boxShadow: 'var(--shadow-soft)',
    animation: 'fadeUp .3s ease',
  },
  spinner: {
    width: 40, height: 40,
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 20, fontWeight: 700, letterSpacing: '-0.2px', marginBottom: 8, color: 'var(--text)',
  },
  loadingText: {
    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto',
  },
  typing: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 },
  dot: {
    display: 'inline-block', width: 7, height: 7,
    background: 'var(--accent)', borderRadius: '50%',
    animation: 'bounce .9s infinite',
  },
  errorCard: {
    background: 'var(--surface)',
    border: '1px solid var(--error)',
    borderRadius: 14, padding: '28px 24px', textAlign: 'center', maxWidth: 380,
  },
  errorText: { fontSize: 14, color: 'var(--error)', marginBottom: 16 },
  retryBtn: {
    background: 'var(--accent)', border: 'none', borderRadius: 8,
    color: '#fff', fontFamily: "'Inter', sans-serif",
    fontWeight: 600, fontSize: 13, padding: '10px 20px', cursor: 'pointer',
  },
}
