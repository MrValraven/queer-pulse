import { FiCopy, FiExternalLink, FiRss } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { PLATFORMS, RSS_URL } from './podcastShow.data'
import styles from './AudioPlayerModals.module.css'

/**
 * "Listen on…" sheet. The product is fictional, so the platform buttons open a
 * styled in-app destination; the RSS link is real and copyable to the clipboard.
 */
export function PodcastListenModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast()
  useScrollLock()

  const copyRss = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(RSS_URL)
    showToast('RSS link copied', 'success')
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className={styles.eye}>Subscribe</div>
        <h3 className={styles.title}>
          Listen to <em>The Back Room</em>
        </h3>
        <p className={styles.sub}>Open the show in your podcast app, or grab the raw feed.</p>

        <div className={styles.list}>
          {PLATFORMS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className={styles.row}>
              <span className={styles.swatch} style={{ background: p.color }} />
              <span className={styles.rowMain}>
                <span className={styles.rowName}>{p.name}</span>
                <span className={styles.rowKind}>{p.kind}</span>
              </span>
              <span className={styles.platformLinks}>
                <FiExternalLink />
              </span>
            </a>
          ))}
        </div>

        <div className={styles.rssRow}>
          <FiRss style={{ color: 'var(--accent)', flex: 'none' }} />
          <span className={styles.rssUrl}>{RSS_URL}</span>
          <Button variant="ghost-dark" onClick={copyRss}>
            <FiCopy style={{ verticalAlign: '-2px', marginRight: 6 }} />
            Copy
          </Button>
        </div>
      </div>
    </div>
  )
}
