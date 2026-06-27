const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

export async function callClaude(apiKey, { system, messages, maxTokens = 4096 }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data.error?.message || `API error (${res.status})`
    throw new Error(msg)
  }

  const text = data.content
    ?.filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')

  if (!text) throw new Error('No response received from Claude.')
  return text
}
