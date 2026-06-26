import { useEffect, useState } from 'react'
import { useAuth } from '../../../app/providers/authContext'
import { useScrollLock } from '../../hooks'
import styles from './RoomLoader.module.css'

const STEPS = ['Signing you in', 'Getting your data', 'Preparing the room']
const STEP_MS = 750

function CheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="var(--jade)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Full-screen plum take-over shown briefly after an explicit sign-in, while we
 * "get your data and prepare the room". Driven by `useAuth().preparing`; it runs
 * a short checklist sequence and then calls `endPreparing()` to dismiss itself.
 */
/** How long the fade-out lasts; keep in sync with the CSS opacity transition. */
const EXIT_MS = 520

export function RoomLoader() {
  const { preparing, endPreparing } = useAuth()
  const [step, setStep] = useState(0)
  // `mounted` keeps the overlay in the tree through its fade-out; `shown` drives
  // the opacity/transform transition (false on mount and during exit).
  const [mounted, setMounted] = useState(preparing)
  const [shown, setShown] = useState(false)
  useScrollLock(mounted)

  // Mount + reset on one frame, fade in on the next; fade out + unmount when
  // preparing ends. State changes run inside rAF/timeout callbacks (not the
  // effect body) so they don't fire synchronously during the effect.
  useEffect(() => {
    if (preparing) {
      let fadeRaf = 0
      const mountRaf = requestAnimationFrame(() => {
        setMounted(true)
        setStep(0)
        fadeRaf = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(mountRaf)
        cancelAnimationFrame(fadeRaf)
      }
    }
    const fadeRaf = requestAnimationFrame(() => setShown(false))
    const t = window.setTimeout(() => setMounted(false), EXIT_MS)
    return () => {
      cancelAnimationFrame(fadeRaf)
      window.clearTimeout(t)
    }
  }, [preparing])

  // Run the checklist sequence while preparing, then dismiss.
  useEffect(() => {
    if (!preparing) return
    let current = 0
    const id = window.setInterval(() => {
      current += 1
      setStep(current)
      if (current >= STEPS.length) {
        window.clearInterval(id)
        window.setTimeout(endPreparing, 600)
      }
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [preparing, endPreparing])

  if (!mounted) return null

  return (
    <div
      className={`${styles.overlay} ${shown ? styles.shown : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Preparing the room"
    >
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.dot} aria-hidden />
          Queer<span className={styles.brandItalic}>Pulse</span>
        </div>

        <h2 className={styles.title}>
          Setting up your <em>room</em>
        </h2>

        <ul className={styles.steps}>
          {STEPS.map((label, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'pending'
            return (
              <li key={label} className={`${styles.step} ${styles[state]}`}>
                <span className={styles.icon} aria-hidden>
                  {state === 'done' ? (
                    <CheckIcon />
                  ) : state === 'active' ? (
                    <span className={styles.spinner} />
                  ) : (
                    <span className={styles.pendingDot} />
                  )}
                </span>
                {label}
              </li>
            )
          })}
        </ul>

        <p className={styles.caption}>Pouring the coffee, dimming the lights…</p>
      </div>
    </div>
  )
}
