import { useState } from 'react'
import { FiCheck, FiPlus } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { AVAILABLE_INTEGRATIONS } from './integrations.data'
import styles from './SettingsModal.module.css'

/**
 * Gallery of available integrations. Each card has a Connect button that flips
 * to a connected state in local set — no real endpoints involved.
 */
export function IntegrationsModal({ onClose }: { onClose: () => void }) {
  const [connected, setConnected] = useState<Set<string>>(new Set())
  useScrollLock()

  function connect(id: string) {
    setConnected((prev) => new Set(prev).add(id))
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.eye}>Connect another</div>
        <div className={styles.title}>
          Available <em>integrations.</em>
        </div>
        <p className={styles.desc}>
          Each integration is scoped narrowly — none can read your DMs, drafts, billing, or
          community memberships.
        </p>
        <div className={styles.grid}>
          {AVAILABLE_INTEGRATIONS.map((int) => {
            const isConnected = connected.has(int.id)
            return (
              <div key={int.id} className={styles.intCard}>
                <div className={styles.intTop}>
                  <div className={styles.intLogo}>{int.glyph}</div>
                  <div className={styles.intName}>{int.name}</div>
                </div>
                <p className={styles.intDesc}>{int.desc}</p>
                {isConnected ? (
                  <span className={styles.connectedTag}>
                    <FiCheck size={15} /> Connected
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => connect(int.id)}
                    style={{ fontSize: '13px', padding: '8px 16px', alignSelf: 'flex-start' }}
                  >
                    <FiPlus size={14} /> Connect
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
