import * as webSearch from './webSearch.js'
import * as webFetch from './webFetch.js'
import * as knowledgeSearch from './knowledgeSearch.js'

const TOOL_MODULES = [
  knowledgeSearch,
  webSearch,
  webFetch,
]

export const TOOL_DEFINITIONS = TOOL_MODULES.map(m => m.definition)

export const TOOL_LABELS = {
  search_knowledge: '📚 Searching knowledge base',
  web_search: '🔍 Searching the web',
  web_fetch: '🌐 Fetching page',
}

export function formatToolInput(name, input) {
  switch (name) {
    case 'search_knowledge':
      return `query: "${input.query}"`
    case 'web_search':
      return `query: "${input.query}"`
    case 'web_fetch':
      return `url: ${input.url}`
    default:
      return JSON.stringify(input, null, 2)
  }
}

export function formatToolResultSummary(name, result) {
  if (result?.error) return `Error: ${result.error}`

  switch (name) {
    case 'search_knowledge':
      return result.note ?? `${result.resultCount ?? 0} chunk(s) from knowledge base`
    case 'web_search':
      return `${result.resultCount ?? 0} result(s) found`
    case 'web_fetch':
      return result.contentLength ? `${result.contentLength.toLocaleString()} chars fetched` : 'Page fetched'
    default:
      return 'Done'
  }
}

const executors = Object.fromEntries(TOOL_MODULES.map(m => [m.definition.name, m.execute]))

export async function executeTool(name, input) {
  const fn = executors[name]
  if (!fn) return { error: `Unknown tool: ${name}` }
  return fn(input)
}
