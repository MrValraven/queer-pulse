import { useEffect, useState } from 'react'
import { useScrollLock } from '../../shared/hooks'
import { GatheringSuccessPanel } from './GatheringSuccessPanel'
import styles from './GatheringModals.module.css'

export function DownloadAlbumModal({
  photoCount,
  onClose,
}: {
  photoCount: number
  onClose: () => void
}) {
  useScrollLock()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        // Only allow dismissing once the album is ready.
        if (ready && e.target === e.currentTarget) onClose()
      }}
    >
      {ready ? (
        <GatheringSuccessPanel
          title={
            <>
              Album <em>ready.</em>
            </>
          }
          sub={
            <>
              We've zipped all <b>{photoCount} photos</b> into <b>album.zip</b> and started the
              download. Faces stay blurred unless the person opted in by name — that's baked into
              the export.
            </>
          }
          meta={`album.zip · ${photoCount} photos`}
          onClose={onClose}
          closeLabel="Done"
        />
      ) : (
        <div className={styles.loadingPanel} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden />
          <div className={styles.loadingTitle}>Preparing album…</div>
          <p className={styles.loadingSub}>
            Zipping {photoCount} photos and applying consent-based blurring.
          </p>
        </div>
      )}
    </div>
  )
}
