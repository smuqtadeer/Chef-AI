import { useState } from 'react'
import KeyGate from './components/KeyGate'
import Header from './components/Header'
import ChatView from './components/ChatView'
import HowItWorks from './components/HowItWorks'

export default function App() {
  const [apiKey, setApiKey] = useState(null)
  const [view, setView] = useState('chat')

  if (!apiKey) return <KeyGate onUnlock={setApiKey} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header view={view} setView={setView} onReset={() => setApiKey(null)} />
      {view === 'chat' ? <ChatView apiKey={apiKey} /> : <HowItWorks />}
    </div>
  )
}
