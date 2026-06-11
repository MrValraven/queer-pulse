import { useEffect } from 'react'

/**
 * Prevents the page behind a modal from scrolling.
 *
 * Uses a shared reference count so several stacked modals don't fight over the
 * body styles, and compensates for the disappearing scrollbar width to avoid a
 * layout shift when the lock engages.
 */
let lockCount = 0
let savedOverflow = ''
let savedPaddingRight = ''

function engage() {
  if (lockCount === 0) {
    const body = document.body
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    savedOverflow = body.style.overflow
    savedPaddingRight = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${current + scrollbarWidth}px`
    }
  }
  lockCount += 1
}

function release() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPaddingRight
  }
}

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    engage()
    return release
  }, [active])
}
