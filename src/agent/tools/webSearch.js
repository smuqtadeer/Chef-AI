import { searchHtml } from './proxyFetch.js'

export const definition = {
  name: 'web_search',
  description:
    'Search the web for current culinary information — recipes, cooking techniques, food trends, ingredient info, or any time-sensitive food data. Use when you need up-to-date info beyond your training data.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query, e.g. "easy chicken tikka masala recipe" or "vegan egg substitutes baking"',
      },
    },
    required: ['query'],
  },
}

function parseInstantAnswers(data) {
  const results = []

  if (data.AbstractText) {
    results.push({
      title: data.Heading || 'Summary',
      snippet: data.AbstractText,
      url: data.AbstractURL || null,
      source: data.AbstractSource || 'DuckDuckGo',
    })
  }

  if (data.RelatedTopics?.length) {
    for (const topic of data.RelatedTopics.slice(0, 5)) {
      if (topic.Text) {
        results.push({
          title: topic.Text.split(' - ')[0] || topic.Text,
          snippet: topic.Text,
          url: topic.FirstURL || null,
        })
      } else if (topic.Topics) {
        for (const sub of topic.Topics.slice(0, 3)) {
          if (sub.Text) {
            results.push({
              title: sub.Text.split(' - ')[0] || sub.Text,
              snippet: sub.Text,
              url: sub.FirstURL || null,
            })
          }
        }
      }
    }
  }

  if (data.Results?.length) {
    for (const r of data.Results.slice(0, 5)) {
      results.push({ title: r.Text, snippet: r.Text, url: r.FirstURL })
    }
  }

  return results
}

function parseHtmlResults(html) {
  const results = []
  const regex =
    /class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?class="result__snippet"[^>]*>([^<]+)/g

  for (const [, href, title, snippet] of html.matchAll(regex)) {
    let url = href
    if (url.startsWith('//')) url = 'https:' + url
    results.push({ title: title.trim(), snippet: snippet.trim(), url: url || null })
  }

  return results
}

async function tryInstantAnswer(query) {
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`
    const res = await fetch(ddgUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    const data = await res.json()
    return parseInstantAnswers(data)
  } catch {
    return []
  }
}

export async function execute({ query }) {
  let results = await tryInstantAnswer(query)

  if (results.length === 0) {
    try {
      const html = await searchHtml(query)
      results = parseHtmlResults(html)
    } catch (err) {
      return {
        query,
        resultCount: 0,
        results: [],
        error: `Search failed: ${err.message}`,
        note: 'Web search requires the dev server (npm run dev) or a working network connection.',
      }
    }
  }

  return {
    query,
    resultCount: results.length,
    results: results.slice(0, 8),
    note: results.length === 0 ? 'No results found. Try rephrasing the query.' : undefined,
  }
}
