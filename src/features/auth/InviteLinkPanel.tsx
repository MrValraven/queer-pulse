import { useState } from 'react'
import { FiAlertCircle, FiCheck, FiCopy, FiLink } from 'react-icons/fi'
import { Button, Sending } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { ApiError } from '../../shared/api/client'
import { routes } from '../../app/routeMap'
import { currentUser } from '../members/data/members'
import { useCreateInvite, type CreatedInvite } from './api/useCreateInvite'
import { SharePreviewCard } from './SharePreviewCard'
import {
  DEFAULT_VOUCH,
  INVITE_URL,
  SENDER_NAME,
  SHARE_TARGETS,
  buildShareMessage,
} from './invite.data'
import styles from './InvitePage.module.css'

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

/** Format the live `expiresAt`; demo mode sends '' so we fall back to the 7-day line. */
function expiryLabel(iso: string): string {
  if (!iso) return 'Expires in 7 days'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Expires in 7 days'
  return `Expires ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

export function InviteLinkPanel() {
  const { showToast } = useToast()
  const createInvite = useCreateInvite()
  const [vouch, setVouch] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  // Covers the whole generate() run — including the delay floor — so the button
  // stays disabled even in demo mode where the mutation resolves instantly.
  const [generating, setGenerating] = useState(false)
  // The invite is created only when the member generates it — null until then.
  const [invite, setInvite] = useState<CreatedInvite | null>(null)
  // Set when the backend rejects with the monthly quota 403 — blocks generating
  // and shows the message inline instead of a transient toast.
  const [quotaError, setQuotaError] = useState<string | null>(null)

  const description = note.trim() || DEFAULT_VOUCH

  /** Surface a failed POST /invites: a quota 403 sticks, everything else toasts. */
  function handleInviteError(err: unknown) {
    if (err instanceof ApiError && err.status === 403 && /limit|month/i.test(err.message)) {
      setQuotaError(err.message)
      showToast(err.message, 'error')
    } else {
      showToast('Could not create your invite link — try again', 'error')
    }
  }

  /** Persist the invite (POST /invites), then reveal the animated ready panel. */
  async function generate() {
    if (generating || quotaError) return
    setGenerating(true)
    try {
      // A short floor so the success lands as a deliberate beat, not an instant pop.
      const [created] = await Promise.all([
        createInvite.mutateAsync({
          note: note.trim() || undefined,
          vouch: vouch.trim() || undefined,
        }),
        sleep(650),
      ])
      setInvite(created)
    } catch (err) {
      handleInviteError(err)
      setGenerating(false)
    }
  }

  async function copyLink() {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.fullUrl)
      setCopied(true)
      showToast('Link copied', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Couldn’t copy — select and copy the link', 'error')
    }
  }

  // ── Ready: the invite exists. Quiet plum success panel with the live link. ──
  if (invite) {
    const message = buildShareMessage(currentUser.first, invite.fullUrl)
    return (
      <div className={`${styles.ready} ${styles.screenIn}`}>
        <div className={styles.readyIcon} aria-hidden>
          <FiCheck />
        </div>
        <h2 className={styles.readyHead}>
          Your link is <em>ready</em>
        </h2>
        <p className={styles.readySub}>
          It’s one-time and personal to whoever you send it, and it expires in 7 days. Share it only
          with someone you’d vouch for.
        </p>

        <div className={styles.readyLinkRow}>
          <input className={styles.readyLinkField} type="text" readOnly value={invite.url} />
          <button
            type="button"
            className={`${styles.readyCopyBtn} ${copied ? styles.readyCopyBtnDone : ''}`}
            onClick={copyLink}
            aria-label={copied ? 'Link copied' : 'Copy invite link'}
          >
            {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className={styles.readyShare}>
          <span className={styles.readyShareLabel}>Or send it through</span>
          <div className={styles.readyShareTargets}>
            {SHARE_TARGETS.map(({ key, label, Icon, build }) => (
              <a
                key={key}
                className={styles.readyShareChip}
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

        <div className={styles.readyMeta}>One-time link · {expiryLabel(invite.expiresAt)}</div>

        <Button variant="ghost-dark" to={routes.accountProfile} className={styles.readyDone}>
          Back to my profile
        </Button>
      </div>
    )
  }

  // ── Compose: write the optional note, preview the unfurl, then generate. ──
  return (
    <div>
      <div className={styles.card}>
        <div className={styles.field}>
          <label>
            Why you’re inviting them{' '}
            <span
              style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}
            >
              (optional)
            </span>
          </label>
          <textarea
            maxLength={280}
            placeholder="A few words on why they belong here. They’ll read this as they join."
            value={vouch}
            onChange={(e) => setVouch(e.target.value)}
          />
          <div className={styles.charCount}>{vouch.length}/280</div>
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
      </div>

      <div className={styles.epLabel}>How your link will look</div>
      <SharePreviewCard senderName={SENDER_NAME} description={description} url={INVITE_URL} />

      {quotaError && (
        <div className={styles.quotaError} role="alert">
          <FiAlertCircle aria-hidden />
          {quotaError}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          onClick={generate}
          disabled={generating || Boolean(quotaError)}
          aria-busy={generating}
        >
          {generating ? (
            <Sending label="Generating link…" />
          ) : (
            <>
              <FiLink aria-hidden style={{ marginRight: 8 }} />
              Generate link
            </>
          )}
        </Button>
      </div>
      <div className={styles.formNote}>
        One link, one person — we’ll create it when you generate. Share it only with people you’d
        vouch for.
      </div>
    </div>
  )
}
