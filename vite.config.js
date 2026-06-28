import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function proxyPlugin() {
  return {
    name: 'web-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')

        if (url.pathname === '/api/search') {
          const q = url.searchParams.get('q')
          if (!q) {
            res.statusCode = 400
            res.end('Missing q parameter')
            return
          }

          try {
            const target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`
            const response = await fetch(target, {
              headers: { 'User-Agent': BROWSER_UA },
            })
            const html = await response.text()
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.statusCode = response.status
            res.end(html)
          } catch (err) {
            res.statusCode = 502
            res.end(`Proxy error: ${err.message}`)
          }
          return
        }

        if (url.pathname === '/api/fetch') {
          const target = url.searchParams.get('url')
          if (!target) {
            res.statusCode = 400
            res.end('Missing url parameter')
            return
          }

          try {
            const response = await fetch(target, {
              headers: { 'User-Agent': BROWSER_UA },
            })
            const body = await response.text()
            res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html')
            res.statusCode = response.status
            res.end(body)
          } catch (err) {
            res.statusCode = 502
            res.end(`Proxy error: ${err.message}`)
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), proxyPlugin()],
  server: {
    port: 5181,
    proxy: {
      '/api/rag': {
        target: 'http://127.0.0.1:5280',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/rag/, '/api'),
        timeout: 300_000,
      },
    },
  },
})
