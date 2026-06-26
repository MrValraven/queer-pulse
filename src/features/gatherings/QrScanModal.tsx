import { useState } from 'react'
import { FiX, FiCheck } from 'react-icons/fi'
import { MdQrCodeScanner } from 'react-icons/md'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import type { Guest } from './gatheringDashboard.data'
import styles from './QrScanModal.module.css'

const SCAN_MS = 1400

export function QrScanModal({
  guests,
  onCheckIn,
  onClose,
}: {
  guests: Guest[]
  onCheckIn: (name: string) => void
  onClose: () => void
}) {
  useScrollLock()
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState<Guest | null>(null)

  const pending = guests.filter((g) => g.status === 'pending')

  const simulateScan = () => {
    if (pending.length === 0 || scanning) return
    setScanning(true)
    const guest = pending[Math.floor(Math.random() * pending.length)]
    window.setTimeout(() => {
      onCheckIn(guest.name)
      setScanned(guest)
      setScanning(false)
    }, SCAN_MS)
  }

  if (scanned) {
    return (
      <div
        className={styles.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className={styles.success}>
          <button type="button" className={styles.successClose} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
          <div className={styles.successIcon}>
            <FiCheck />
          </div>
          <div className={styles.successTitle}>
            Checked <em>in.</em>
          </div>
          <div className={styles.guestRow}>
            <span className={styles.guestAv} style={{ background: scanned.bg, color: scanned.color }}>
              {scanned.initials}
            </span>
            <div>
              <div className={styles.guestName}>{scanned.name}</div>
              <div className={styles.guestMeta}>{scanned.pronouns} · QR scanned</div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="ghost-dark" onClick={() => setScanned(null)} disabled={pending.length <= 1}>
              Scan next
            </Button>
            <Button variant="ghost-dark" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    )
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
          <FiX />
        </button>
        <div className={styles.eye}>Check-in</div>
        <div className={styles.title}>Scan member QR</div>

        <div className={styles.viewfinder}>
          <span className={`${styles.corner} ${styles.tl}`} />
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={`${styles.corner} ${styles.br}`} />
          {scanning && <span className={styles.scanLine} />}
          <div className={styles.vfStack}>
            <span className={styles.vfIcon}>
              <MdQrCodeScanner />
            </span>
            <span className={styles.vfHint}>
              {scanning ? 'Reading QR code…' : 'Point the camera at a member QR code'}
            </span>
          </div>
        </div>

        <Button variant="primary" className={styles.full} onClick={simulateScan} disabled={scanning || pending.length === 0}>
          {scanning ? 'Scanning…' : pending.length === 0 ? 'Everyone is checked in' : 'Simulate scan'}
        </Button>
        <div className={styles.note}>Demo mode — no real camera is used.</div>
      </div>
    </div>
  )
}
