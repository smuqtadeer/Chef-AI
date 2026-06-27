import { useState, useMemo, useCallback } from 'react'
import KeyGate from './components/KeyGate'
import Header from './components/Header'
import ChatTab from './components/ChatTab'
import MealPrepTab from './components/MealPrepTab'
import GroceryTab from './components/GroceryTab'

// ── meal-plan parsing ────────────────────────────────────────────────────────

function parseMealPlan(text) {
  const shoppingMatch = text.match(/##\s*Shopping List[\s\S]*/i)
  const shopping = shoppingMatch
    ? shoppingMatch[0].replace(/^##\s*Shopping List\s*/i, '').trim()
    : null
  const planBody = shoppingMatch ? text.slice(0, shoppingMatch.index).trim() : text
  const days = planBody
    .split(/(?=##\s*Day\s+\d+)/i)
    .filter(c => /^##\s*Day/i.test(c.trim()))
  return { days, shopping }
}

function parseGrocerySections(shopping) {
  if (!shopping) return []
  const sections = []
  let current = null
  for (const line of shopping.split('\n')) {
    const cat = line.match(/^###\s*(.+)/)
    if (cat) { current = { category: cat[1].trim(), items: [] }; sections.push(current) }
    else if (/^-\s+/.test(line) && current) current.items.push(line.replace(/^-\s+/, '').trim())
  }
  return sections
}

function allItemSet(sections) {
  return new Set(sections.flatMap(s => s.items))
}

// ── root component ────────────────────────────────────────────────────────────

const WELCOME = `Hey! 👋 I'm CravingAI — tell me what you're in the mood for and I'll find you a real recipe. What are you craving?`

export default function App() {
  const [apiKey, setApiKey] = useState(null)
  const [activeTab, setActiveTab] = useState('chat')

  // chat tab
  const [chatMessages, setChatMessages] = useState([{ role: 'bot', text: WELCOME }])
  const [chatHistory, setChatHistory] = useState([])
  const [chatGroceryItems, setChatGroceryItems] = useState([])   // {id, name, items:[]}
  const [chatChecked, setChatChecked] = useState(new Set())

  // meal prep tab
  const [profile, setProfile] = useState(null)
  const [mealPlan, setMealPlan] = useState(null)
  const [mealPrepDay, setMealPrepDay] = useState(0)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [mealPrepChecked, setMealPrepChecked] = useState(new Set())

  // derived
  const parsedPlan = useMemo(() => mealPlan ? parseMealPlan(mealPlan) : null, [mealPlan])
  const mealPrepSections = useMemo(
    () => parseGrocerySections(parsedPlan?.shopping),
    [parsedPlan?.shopping]
  )

  // ── meal plan update (also prunes checked items no longer present) ──────────
  const handleMealPlanUpdate = useCallback((newPlan) => {
    setMealPlan(newPlan)
    const p = parseMealPlan(newPlan)
    const secs = parseGrocerySections(p.shopping)
    const all = allItemSet(secs)
    setMealPrepChecked(prev => new Set([...prev].filter(i => all.has(i))))
  }, [])

  // ── chat grocery add ────────────────────────────────────────────────────────
  const addChatRecipe = useCallback((recipeName, items) => {
    setChatGroceryItems(prev => {
      const existing = new Set(prev.flatMap(g => g.items))
      const fresh = items.filter(i => !existing.has(i))
      if (!fresh.length) return prev
      return [...prev, { id: Date.now(), name: recipeName, items: fresh }]
    })
  }, [])

  // ── toggles ─────────────────────────────────────────────────────────────────
  const toggleDay = useCallback(i =>
    setCompletedDays(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n }), [])

  const toggleMealPrepItem = useCallback(item =>
    setMealPrepChecked(prev => { const n = new Set(prev); n.has(item) ? n.delete(item) : n.add(item); return n }), [])

  const toggleChatItem = useCallback(item =>
    setChatChecked(prev => { const n = new Set(prev); n.has(item) ? n.delete(item) : n.add(item); return n }), [])

  const removeChatRecipe = useCallback(id =>
    setChatGroceryItems(prev => prev.filter(g => g.id !== id)), [])

  // ── grocery counts for tab badge ────────────────────────────────────────────
  const mealPrepTotal = mealPrepSections.reduce((n, s) => n + s.items.length, 0)
  const chatTotal = chatGroceryItems.reduce((n, g) => n + g.items.length, 0)
  const groceryTotal = mealPrepTotal + chatTotal
  const groceryChecked = mealPrepChecked.size + chatChecked.size

  if (!apiKey) return <KeyGate onUnlock={setApiKey} />

  return (
    <div style={s.app}>
      <Header
        activeTab={activeTab}
        onTab={setActiveTab}
        groceryBadge={groceryTotal > 0 ? `${groceryChecked}/${groceryTotal}` : null}
      />

      <div style={s.body}>
        {activeTab === 'chat' && (
          <ChatTab
            apiKey={apiKey}
            profile={profile}
            messages={chatMessages}
            setMessages={setChatMessages}
            history={chatHistory}
            setHistory={setChatHistory}
            onAddRecipe={addChatRecipe}
          />
        )}
        {activeTab === 'mealprep' && (
          <MealPrepTab
            apiKey={apiKey}
            profile={profile}
            setProfile={setProfile}
            mealPlan={mealPlan}
            setMealPlan={handleMealPlanUpdate}
            parsedPlan={parsedPlan}
            selectedDay={mealPrepDay}
            setSelectedDay={setMealPrepDay}
            completedDays={completedDays}
            onToggleDay={toggleDay}
          />
        )}
        {activeTab === 'grocery' && (
          <GroceryTab
            mealPrepSections={mealPrepSections}
            mealPrepChecked={mealPrepChecked}
            onToggleMealPrep={toggleMealPrepItem}
            chatGroceryItems={chatGroceryItems}
            chatChecked={chatChecked}
            onToggleChat={toggleChatItem}
            onRemoveChatRecipe={removeChatRecipe}
            hasMealPlan={!!mealPlan}
            onGoMealPrep={() => setActiveTab('mealprep')}
          />
        )}
      </div>
    </div>
  )
}

const s = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  body: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
}
