const BASE = '/api/rag'

async function ragFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    let message = `RAG API error (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
      else if (data?.title) message = data.title
    } catch { /* ignore */ }
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function checkRagHealth() {
  try {
    const res = await fetch(`${BASE}/health`)
    if (!res.ok) return { ok: false }
    return res.json()
  } catch {
    return { ok: false }
  }
}

export function listDocuments() {
  return ragFetch('/documents')
}

export function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  return ragFetch('/documents', { method: 'POST', body: form })
}

export function deleteDocument(id) {
  return ragFetch(`/documents/${id}`, { method: 'DELETE' })
}

export function searchKnowledge(query, topK = 5) {
  return ragFetch('/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK }),
  })
}
