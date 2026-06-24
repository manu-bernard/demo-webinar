import { createServer } from 'node:http'
import sirv from 'sirv'

// Sert un dossier statique en local. Renvoie { url, close }.
// single:false => chaque /demos/<slug>/ résout son propre index.html.
export function serveDir(dir, port = 0) {
  const handler = sirv(dir, { dev: true, single: false, etag: true })
  const server = createServer((req, res) => handler(req, res, () => {
    res.statusCode = 404
    res.end('Not found')
  }))
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const { port: p } = server.address()
      resolve({
        url: `http://127.0.0.1:${p}`,
        close: () => new Promise((r) => server.close(r)),
      })
    })
  })
}
