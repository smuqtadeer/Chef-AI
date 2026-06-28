import { useCallback, useEffect, useRef, useState } from 'react'
import { checkRagHealth, deleteDocument, listDocuments, uploadDocument } from '../api/rag.js'

const ACCEPT = '.txt,.md,.markdown,.pdf'

function StatusBadge({ status }) {
  const styles = {
    ready: { bg: '#dcfce7', color: '#166534', label: 'Ready' },
    processing: { bg: '#fef9c3', color: '#854d0e', label: 'Processing' },
    failed: { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
  }
  const s = styles[status] ?? styles.processing
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: s.bg, color: s.color, textTransform: 'capitalize',
    }}>
      {s.label}
    </span>
  )
}

export default function KnowledgeBaseTab() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [apiOnline, setApiOnline] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const refresh = useCallback(async () => {
    const health = await checkRagHealth()
    const online = health?.status === 'ok' || health?.status === 'degraded'
    setApiOnline(online)
    if (!online) {
      setLoading(false)
      return
    }
    try {
      const data = await listDocuments()
      setDocs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const health = await checkRagHealth()
      if (cancelled) return
      const online = health?.status === 'ok' || health?.status === 'degraded'
      setApiOnline(online)
      if (!online) {
        setLoading(false)
        return
      }
      try {
        const data = await listDocuments()
        if (!cancelled) setDocs(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleFiles(fileList) {
    const files = [...fileList]
    if (!files.length) return
    if (inputRef.current) inputRef.current.value = ''
    setUploading(true)
    setError('')
    for (const file of files) {
      try {
        const doc = await uploadDocument(file)
        if (doc?.status === 'failed') {
          setError(doc.errorMessage || `Failed to process ${file.name}`)
        }
        setDocs(prev => {
          const rest = prev.filter(d => d.id !== doc.id)
          return doc ? [doc, ...rest] : prev
        })
      } catch (err) {
        setError(err.message || `Upload failed for ${file.name}`)
      }
    }
    setUploading(false)
    await refresh()
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Knowledge Base</h2>
          <p style={s.sub}>
            Upload recipe docs (.txt, .md, .pdf). They are chunked, embedded, and searched by the chat agent.
          </p>
        </div>
      </div>

      {apiOnline === false && (
        <div style={s.banner}>
          RAG API is offline — uploads will not save. In a second terminal run{' '}
          <code style={s.code}>cd backend/ChefAI.RagApi && dotnet run</code>
          {' '}then refresh this page.
        </div>
      )}

      {error && <div style={s.error}>{error}</div>}

      <div
        style={{ ...s.drop, ...(dragOver ? s.dropActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={s.dropIcon}>📄</div>
        <p style={s.dropTitle}>{uploading ? 'Uploading & embedding…' : 'Drop files here or click to browse'}</p>
        <p style={s.dropSub}>Text, Markdown, or PDF · max 10 MB each</p>
      </div>

      <div style={s.listHeader}>
        <h3 style={s.listTitle}>Documents</h3>
        <span style={s.count}>{docs.length} file{docs.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : docs.length === 0 ? (
        <p style={s.muted}>No documents yet. Upload your first recipe collection above.</p>
      ) : (
        <div style={s.list}>
          {docs.map(doc => (
            <div key={doc.id} style={s.row}>
              <div style={s.rowMain}>
                <div style={s.fileName}>{doc.fileName}</div>
                <div style={s.meta}>
                  <StatusBadge status={doc.status} />
                  <span>{doc.chunkCount} chunks</span>
                  <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
                </div>
                {doc.errorMessage && <div style={s.rowError}>{doc.errorMessage}</div>}
              </div>
              <button style={s.deleteBtn} onClick={() => handleDelete(doc.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  page: { flex: 1, overflow: 'auto', padding: '32px 24px', maxWidth: 860, margin: '0 auto', width: '100%' },
  header: { marginBottom: 20 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1c1917' },
  sub: { margin: '8px 0 0', color: '#78716c', lineHeight: 1.5, fontSize: 14 },
  banner: {
    background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412',
    padding: '12px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, lineHeight: 1.5,
  },
  code: { background: '#ffedd5', padding: '1px 6px', borderRadius: 4, fontSize: 12 },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
    padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13,
  },
  drop: {
    border: '2px dashed #d6d3d1', borderRadius: 14, padding: '36px 24px', textAlign: 'center',
    background: '#fff', cursor: 'pointer', marginBottom: 28, transition: 'border-color 150ms, background 150ms',
  },
  dropActive: { borderColor: '#60a5fa', background: '#eff6ff' },
  dropIcon: { fontSize: 32, marginBottom: 8 },
  dropTitle: { margin: 0, fontWeight: 600, color: '#1c1917' },
  dropSub: { margin: '6px 0 0', color: '#78716c', fontSize: 13 },
  listHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  listTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#1c1917' },
  count: { fontSize: 13, color: '#78716c' },
  muted: { color: '#78716c', fontSize: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
    background: '#fff', border: '1px solid #e8e4de', borderRadius: 12, padding: '14px 16px',
  },
  rowMain: { flex: 1, minWidth: 0 },
  fileName: { fontWeight: 600, color: '#1c1917', wordBreak: 'break-word' },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 6, fontSize: 12, color: '#78716c' },
  rowError: { marginTop: 8, fontSize: 12, color: '#991b1b' },
  deleteBtn: {
    background: 'none', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8,
    padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
}
