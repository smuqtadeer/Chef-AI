import { AGENT_PROMPT } from './agentPrompt.js'
import { TOOL_DEFINITIONS, executeTool } from './tools/index.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 4096
const MAX_ITERATIONS = 10

function extractText(content) {
  if (!content) return ''
  return content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

async function callClaude(apiKey, messages) {
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
      max_tokens: MAX_TOKENS,
      system: AGENT_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data.error?.message || `API error (${res.status})`
    throw new Error(msg)
  }

  return data
}

export async function runAgent(apiKey, userMessages, { onToolStart, onToolComplete } = {}) {
  const messages = [...userMessages]

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const data = await callClaude(apiKey, messages)

    if (data.stop_reason === 'end_turn' || data.stop_reason === 'max_tokens') {
      return extractText(data.content) || "Hmm, I stalled out there. Try again!"
    }

    if (data.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: data.content })

      const toolResults = []
      for (const block of data.content) {
        if (block.type === 'tool_use') {
          onToolStart?.({ id: block.id, name: block.name, input: block.input })
          const result = await executeTool(block.name, block.input)
          onToolComplete?.({ id: block.id, name: block.name, input: block.input, result })
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          })
        }
      }

      messages.push({ role: 'user', content: toolResults })
      continue
    }

    return extractText(data.content) || "Hmm, I stalled out there. Try again!"
  }

  return "I hit the pit lane — too many tool calls. Try a simpler question!"
}
