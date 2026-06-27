import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSmartphone, FiMonitor, FiExternalLink, FiX } from 'react-icons/fi'
import { useScrollLock } from '../../shared/hooks'
import type { SimFlow } from './simulations.data'
import styles from './SimulationPreviewModal.module.css'

type Device = 'mobile' | 'desktop'

/** In-Settings preview: embeds the real route in a phone/desktop frame so the
 *  maintainer can walk a state screen without leaving the simulations gallery. */
export function SimulationPreviewModal({ flow, onClose }: { flow: SimFlow; onClose: () => void }) {
  useScrollLock()
  const [device, setDevice] = useState<Device>('desktop')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Preview: ${flow.title}`}>
        <header className={styles.bar}>
          <div className={styles.title}>
            <span className={styles.kicker}>Preview</span>
            {flow.title}
          </div>
          <div className={styles.controls}>
            <div className={styles.deviceToggle} role="group" aria-label="Preview width">
              <button
                type="button"
                className={[styles.deviceBtn, device === 'mobile' && styles.deviceBtnActive].filter(Boolean).join(' ')}
                onClick={() => setDevice('mobile')}
                aria-pressed={device === 'mobile'}
              >
                <FiSmartphone aria-hidden /> Mobile
              </button>
              <button
                type="button"
                className={[styles.deviceBtn, device === 'desktop' && styles.deviceBtnActive].filter(Boolean).join(' ')}
                onClick={() => setDevice('desktop')}
                aria-pressed={device === 'desktop'}
              >
                <FiMonitor aria-hidden /> Desktop
              </button>
            </div>
            <Link to={`${flow.to}?from=sim`} className={styles.openFull}>
              <FiExternalLink aria-hidden /> Open full screen
            </Link>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close preview">
              <FiX aria-hidden />
            </button>
          </div>
        </header>
        <div className={styles.stage}>
          <div className={[styles.frame, device === 'mobile' ? styles.frameMobile : styles.frameDesktop].filter(Boolean).join(' ')}>
            <iframe key={device} src={flow.to} title={flow.title} className={styles.iframe} />
          </div>
        </div>
      </div>
    </div>
  )
}
