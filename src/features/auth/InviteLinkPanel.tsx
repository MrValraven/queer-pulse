import { useState } from 'react'
import { FiCheck, FiCopy, FiShare2 } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { currentUser } from '../members/data/members'
import { SharePreviewCard } from './SharePreviewCard'
import {
  DEFAULT_VOUCH,
  INVITE_FULL_URL,
  INVITE_URL,
  SENDER_NAME,
  SHARE_TARGETS,
  buildShareMessage,
} from './invite.data'
import styles from './InvitePage.module.css'

export function InviteLinkPanel() {
  const { showToast } = useToast()
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)

  const message = buildShareMessage(currentUser.first)
  const description = note.trim() || DEFAULT_VOUCH

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(INVITE_FULL_URL)
      setCopied(true)
      showToast('Link copied', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not copy — select and copy the link', 'error')
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Someone from QueerPulse wants you here',
          text: message,
          url: INVITE_FULL_URL,
        })
        return
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }
    copyLink()
  }

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.field}>
          <label>Your invite link</label>
          <div className={styles.urlRow}>
            <input className={styles.urlField} type="text" readOnly value={INVITE_URL} />
            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
              onClick={copyLink}
              aria-label={copied ? 'Link copied' : 'Copy invite link'}
            >
              {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className={styles.helper}>
            One-time link, personal to whoever you send it to. Expires in 7 days.
          </div>
        </div>

        <div className={styles.field}>
          <label>
            Personal note{' '}
            <span
              style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}
            >
              (optional)
            </span>
          </label>
          <textarea
            maxLength={200}
            placeholder="A line they'll see in the link preview."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className={styles.charCount}>{note.length}/200</div>
        </div>

        <div className={styles.field}>
          <label>Share via</label>
          <div className={styles.shareTargets}>
            {SHARE_TARGETS.map(({ key, label, Icon, build }) => (
              <a
                key={key}
                className={styles.shareChip}
                href={build(message)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon aria-hidden />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.epLabel}>How your link will look</div>
      <SharePreviewCard senderName={SENDER_NAME} description={description} url={INVITE_URL} />

      <div className={styles.actions}>
        <Button type="button" onClick={nativeShare}>
          <FiShare2 aria-hidden style={{ marginRight: 8 }} />
          Share link
        </Button>
      </div>
      <div className={styles.formNote}>
        Anyone with this link can request to join. Share it only with people you'd vouch for.
      </div>
    </div>
  )
}
