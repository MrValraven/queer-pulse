import { useState } from 'react'
import { FiCheck, FiLoader, FiShield } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import type { Integration } from './integrations.data'
import styles from './SettingsModal.module.css'

type Phase = 'consent' | 'authorizing' | 'done'

/**
 * Simulated OAuth-style provider authorization. There is no real endpoint —
 * "Authorize" runs a short fake handshake then reports the linked state back
 * to the page via onLinked.
 */
export function LinkProviderModal({
  provider,
  onClose,
  onLinked,
}: {
  provider: Integration
  onClose: () => void
  onLinked: () => void
}) {
  const [phase, setPhase] = useState<Phase>('consent')
  useScrollLock()

  function authorize() {
    setPhase('authorizing')
    setTimeout(() => {
      setPhase('done')
      onLinked()
    }, 1400)
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {phase !== 'done' ? (
          <>
            <div className={styles.eye}>Authorize · {provider.name}</div>
            <div className={styles.providerHead}>
              <div className={styles.providerLogo}>{provider.glyph || provider.name[0]}</div>
              <div>
                <div className={styles.providerName}>Continue with {provider.name}</div>
                <div className={styles.providerMeta}>QueerPulse is requesting access</div>
              </div>
            </div>
            <p className={styles.desc}>{provider.desc}</p>
            <ul className={styles.scopeList}>
              {provider.scopes.map((s) => (
                <li key={s} className={styles.scopeItem}>
                  <FiShield size={16} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Button variant="primary" onClick={authorize} disabled={phase === 'authorizing'}>
                {phase === 'authorizing' ? (
                  <>
                    <span className={styles.spin}>
                      <FiLoader size={16} />
                    </span>{' '}
                    Authorizing…
                  </>
                ) : (
                  `Authorize ${provider.name}`
                )}
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={phase === 'authorizing'}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <FiCheck size={28} />
            </div>
            <div className={styles.successTitle}>
              {provider.name} <em>linked.</em>
            </div>
            <p className={styles.successSub}>
              You can now sign in to QueerPulse with {provider.name}. Revoke it any time from this
              page — your messages and memberships were never shared.
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
