/**
 * Trigger a real browser download of an in-memory Blob via a temporary
 * <a download> element + URL.createObjectURL. Used by the press-kit preview
 * modals — the prototype has no backend, so we generate the file client-side.
 */
export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke on the next tick so the click has flushed.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
