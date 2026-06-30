import { useState } from 'react'
import { Button, FormField } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import styles from './PrintOrderModal.module.css'

type Stage = 'compose' | 'placing' | 'done'

/**
 * Self-contained print-order flow for Issue 09: compose the order → simulated
 * "placing" loading state → plum-panel success. Mounted only when open, so it
 * locks scroll unconditionally and owns its own state.
 */
export function PrintOrderModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>('compose')
  const [qty, setQty] = useState(1)
  const [email, setEmail] = useState('')
  useScrollLock()

  const total = 12 * qty
  const valid = /\S+@\S+\.\S+/.test(email)

  const placeOrder = () => {
    if (!valid || stage !== 'compose') return
    setStage('placing')
    setTimeout(() => setStage('done'), 1100)
  }

  const success = stage === 'done'

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`${styles.modal} ${success ? styles.modalSuccess : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Order the print edition"
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {success ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </div>
            <h2>
              It's on its <em>way to you.</em>
            </h2>
            <p>
              {qty} {qty === 1 ? 'copy' : 'copies'} of <b>Issue 09 · On Health</b> reserved from the
              print run. We'll email <b>{email}</b> when it ships from Marvila — usually within a
              week. Thank you for funding the next issue's contributors.
            </p>
            <Button size="lg" variant="ghost-dark" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div>
            <div className={styles.eye}>Print edition · Issue 09</div>
            <h2 className={styles.title}>
              Order the <em>print run.</em>
            </h2>
            <p className={styles.lead}>
              84 pages, risograph cover, printed in Marvila. <b>€12 at cost</b> — proceeds fund the
              next issue's contributors.
            </p>

            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Copies</span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1 || stage === 'placing'}
                  aria-label="Fewer copies"
                >
                  −
                </button>
                <span className={styles.qtyVal} aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  disabled={qty >= 10 || stage === 'placing'}
                  aria-label="More copies"
                >
                  +
                </button>
              </div>
              <span className={styles.total}>
                €<b>{total}</b>
              </span>
            </div>

            <FormField
              label="Email for shipping updates"
              required
              helper="We only use this to tell you when your copy ships."
            >
              <input
                id="po-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={stage === 'placing'}
              />
            </FormField>

            <div className={styles.foot}>
              <button
                type="button"
                className={styles.back}
                onClick={onClose}
                disabled={stage === 'placing'}
              >
                ← Cancel
              </button>
              <Button
                size="lg"
                type="button"
                onClick={placeOrder}
                disabled={!valid || stage === 'placing'}
                aria-busy={stage === 'placing'}
              >
                {stage === 'placing' ? 'Placing your order…' : `Place order — €${total}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
