import { useEffect, useRef, useState } from 'react'
import { FiMoreHorizontal, FiFlag, FiVolumeX, FiSlash, FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSocial } from '../../app/providers/SocialProvider'
import { REPORT_REASONS, SAFETY_EMAIL } from './feed.data'
import styles from './FeedPage.module.css'

interface MoreMenuProps {
  authorName: string
  onReport: () => void
}

/** Keyboard-accessible three-dot moderation menu (Report / Mute / Block). */
export function MoreMenu({ authorName, onReport }: MoreMenuProps) {
  const { showToast } = useToast()
  const { isMuted, toggleMute, isBlocked, toggleBlock } = useSocial()
  const muted = isMuted(authorName)
  const blocked = isBlocked(authorName)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items: { label: string; icon: React.ReactNode; run: () => void }[] = [
    { label: 'Report post', icon: <FiFlag />, run: onReport },
    {
      label: muted ? `Unmute ${authorName}` : `Mute ${authorName}`,
      icon: <FiVolumeX />,
      run: () => {
        const now = toggleMute(authorName)
        showToast(now ? `Muted ${authorName}` : `Unmuted ${authorName}`, now ? 'success' : 'info')
      },
    },
    {
      label: blocked ? `Unblock ${authorName}` : `Block ${authorName}`,
      icon: <FiSlash />,
      run: () => {
        const now = toggleBlock(authorName)
        showToast(now ? `Blocked ${authorName}` : `Unblocked ${authorName}`, now ? 'success' : 'info')
      },
    },
  ]

  return (
    <div className={styles.moreWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.moreBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Post options"
        onClick={() => setOpen((o) => !o)}
      >
        <FiMoreHorizontal />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setOpen(false)
                item.run()
              }}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ReportModalProps {
  authorName: string
  onClose: () => void
}

/** Accessible report dialog ending in a plum-panel confirmation. */
export function ReportModal({ authorName, onClose }: ReportModalProps) {
  useScrollLock()
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={sent ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden><FiCheck /></span>
            <h2 id="report-title" className={styles.confirmTitle}>
              Thank you — <em>we're on it</em>
            </h2>
            <p className={styles.confirmBody}>
              Our moderation team will review this post about {authorName}. For anything
              urgent, reach us directly at <strong>{SAFETY_EMAIL}</strong>.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <h2 id="report-title" className={styles.dialogTitle}>Report this post</h2>
            <p className={styles.dialogSub}>
              Tell us what's wrong. Reports are confidential and reviewed by our safety team.
            </p>
            <div className={styles.reasons}>
              {REPORT_REASONS.map((r) => (
                <label key={r} className={styles.reasonRow}>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
            <textarea
              className={styles.detail}
              placeholder="Add any details (optional)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
            />
            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={!reason}>Submit report</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
