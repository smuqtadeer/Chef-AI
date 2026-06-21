const PROXY_PREFIX = import.meta.env.DEV ? '' : null

async function tryFetch(url, options = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

export async function fetchViaProxy(targetUrl) {
  const attempts = []

  if (PROXY_PREFIX !== null) {
    attempts.push({
      name: 'local',
      url: `/api/fetch?url=${encodeURIComponent(targetUrl)}`,
      parse: async (res) => res.text(),
    })
  }

  attempts.push(
    {
      name: 'corsproxy',
      url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      parse: async (res) => res.text(),
    },
    {
      name: 'allorigins-raw',
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      parse: async (res) => res.text(),
    },
    {
      name: 'allorigins-json',
      url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
      parse: async (res) => {
        const data = await res.json()
        if (!data.contents) throw new Error('Empty proxy response')
        return data.contents
      },
    },
  )

  const errors = []
  for (const attempt of attempts) {
    try {
      const res = await tryFetch(attempt.url)
      const body = await attempt.parse(res)
      if (body?.length > 0) return body
      errors.push(`${attempt.name}: empty response`)
    } catch (err) {
      errors.push(`${attempt.name}: ${err.message}`)
    }
  }

  throw new Error(errors.join('; '))
}

export async function searchHtml(query) {
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`

  if (PROXY_PREFIX !== null) {
    try {
      const res = await tryFetch(`/api/search?q=${encodeURIComponent(query)}`)
      const html = await res.text()
      if (html.length > 0) return html
    } catch {
      // fall through to public proxies
    }
  }

  return fetchViaProxy(ddgUrl)
}
