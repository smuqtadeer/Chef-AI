import { fetchViaProxy } from './proxyFetch.js'

export const definition = {
  name: 'web_fetch',
  description:
    'Fetch and read the text content of a web page URL. Use for reading recipes, cooking blogs, food articles, or technique guides when you have a specific URL.',
  input_schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The full URL to fetch, e.g. "https://www.seriouseats.com/recipes/..."',
      },
    },
    required: ['url'],
  },
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function execute({ url }) {
  try {
    const html = await fetchViaProxy(url)
    const text = stripHtml(html)
    const maxLen = 6000

    return {
      url,
      contentLength: text.length,
      content: text.length > maxLen ? text.slice(0, maxLen) + '… [truncated]' : text,
    }
  } catch (err) {
    return {
      url,
      error: `Fetch failed: ${err.message}`,
      note: 'Web fetch works best with npm run dev. Some sites block proxy access.',
    }
  }
}
