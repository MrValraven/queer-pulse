import { useRef, useState, type MouseEvent } from 'react'
import { FiCheck, FiCopy, FiShare2 } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { currentUser } from '../members/data/members'
import { useCreateInvite, type CreatedInvite } from './api/useCreateInvite'
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
  const createInvite = useCreateInvite()
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [invite, setInvite] = useState<CreatedInvite | null>(null)
  const inflight = useRef<Promise<CreatedInvite> | null>(null)

  // The link/message reflect the persisted invite once created; until then they
  // show the sample so the preview card has something to render.
  const displayUrl = invite?.url ?? INVITE_URL
  const fullUrl = invite?.fullUrl ?? INVITE_FULL_URL
  const description = note.trim() || DEFAULT_VOUCH
  const message = buildShareMessage(currentUser.first, fullUrl)

  /** Persist the invite once (POST /invites), then reuse it for every share action. */
  function ensureInvite(): Promise<CreatedInvite> {
    if (invite) return Promise.resolve(invite)
    if (!inflight.current) {
      inflight.current = createInvite
        .mutateAsync({ note: note.trim() || undefined })
        .then((created) => {
          setInvite(created)
          return created
        })
        .finally(() => {
          inflight.current = null
        })
    }
    return inflight.current
  }

  async function copyLink() {
    try {
      const created = await ensureInvite()
      await navigator.clipboard.writeText(created.fullUrl)
      setCopied(true)
      showToast('Link copied', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not create your invite link — try again', 'error')
    }
  }

  async function nativeShare() {
    let created: CreatedInvite
    try {
      created = await ensureInvite()
    } catch {
      showToast('Could not create your invite link — try again', 'error')
      return
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Someone from QueerPulse wants you here',
          text: buildShareMessage(currentUser.first, created.fullUrl),
          url: created.fullUrl,
        })
        return
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }
    await navigator.clipboard.writeText(created.fullUrl).catch(() => {})
    showToast('Link copied', 'success')
  }

  async function shareToTarget(
    e: MouseEvent<HTMLAnchorElement>,
    build: (message: string) => string,
  ) {
    if (invite) return // anchor href already carries the persisted link
    e.preventDefault()
    try {
      const created = await ensureInvite()
      const href = build(buildShareMessage(currentUser.first, created.fullUrl))
      window.open(href, '_blank', 'noopener,noreferrer')
    } catch {
      showToast('Could not create your invite link — try again', 'error')
    }
  }

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.field}>
          <label>Your invite link</label>
          <div className={styles.urlRow}>
            <input className={styles.urlField} type="text" readOnly value={displayUrl} />
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
                onClick={(e) => shareToTarget(e, build)}
              >
                <Icon aria-hidden />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.epLabel}>How your link will look</div>
      <SharePreviewCard senderName={SENDER_NAME} description={description} url={displayUrl} />

      <div className={styles.actions}>
        <Button type="button" onClick={nativeShare} disabled={createInvite.isPending}>
          <FiShare2 aria-hidden style={{ marginRight: 8 }} />
          {createInvite.isPending ? 'Creating link…' : 'Share link'}
        </Button>
      </div>
      <div className={styles.formNote}>
        Anyone with this link can request to join. Share it only with people you'd vouch for.
      </div>
    </div>
  )
}
