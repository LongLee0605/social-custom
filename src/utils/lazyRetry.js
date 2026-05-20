import { lazy } from 'react'

const CHUNK_RELOAD_KEY = 'vite:chunk-reload'

function isChunkLoadError(error) {
  const msg = String(error?.message || error)
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('MIME type') ||
    msg.includes('Loading chunk')
  )
}

/** Lazy route — tự reload một lần khi chunk cũ sau deploy (404 → index.html) */
export function lazyRetry(importFn) {
  return lazy(() =>
    importFn().catch((error) => {
      if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
        window.location.reload()
        return new Promise(() => {})
      }
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      throw error
    })
  )
}

export function clearChunkReloadFlag() {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY)
}
