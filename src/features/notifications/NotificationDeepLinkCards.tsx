import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import {
  CONNECTION,
  GATHERING,
  REPLY,
  MENTION,
  MODERATION,
  type AvTint,
} from './notificationDeepLink.data'
import styles from './NotificationDeepLinkPage.module.css'

const avClass: Record<AvTint, string> = {
  jade: styles.avJade,
  coral: styles.avCoral,
  plum: styles.avPlum,
}

function MemberMini({ initials, tint, name, meta }: { initials: string; tint: AvTint; name: string; meta: string }) {
  return (
    <div className={styles.memberMini}>
      <div className={`${styles.mmAv} ${avClass[tint]}`}>{initials}</div>
      <div>
        <div className={styles.mmName}>{name}</div>
        <div className={styles.mmMeta}>{meta}</div>
      </div>
    </div>
  )
}

function Composer({ initials, placeholder, onSend }: { initials: string; placeholder: string; onSend: () => void }) {
  return (
    <div className={styles.composer}>
      <div className={styles.rcAv}>{initials}</div>
      <textarea className={styles.rcInput} rows={1} placeholder={placeholder} />
      <button className={styles.rcSend} onClick={onSend}>
        Send
      </button>
    </div>
  )
}

export function ConnectionCard() {
  const { showToast } = useToast()
  const c = CONNECTION
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <MemberMini initials={c.initials} tint={c.tint} name={c.name} meta={c.meta} />
      <div className={styles.connHead}>
        Sofia wants to <em>connect</em>
      </div>
      <p className={styles.connIntro}>She sent you a note with her request:</p>
      <div className={styles.connNote}>{c.note}</div>
      <button className={styles.mutualPill} onClick={() => showToast('Opening mutual connections', 'info')}>
        <div className={styles.mutualAvs}>
          {c.mutuals.map((m) => (
            <div key={m.initials} className={`${styles.smAv} ${avClass[m.tint]}`}>
              {m.initials}
            </div>
          ))}
        </div>
        <div className={styles.mutualLabel}>{c.mutualLabel}</div>
      </button>
      <div className={styles.btnRow}>
        <Button variant="primary" onClick={() => showToast('Connected with Sofia', 'success')}>
          Accept
        </Button>
        <Button variant="ghost" onClick={() => showToast('Request declined', 'info')}>
          Decline
        </Button>
      </div>
      <button className={styles.notNow} onClick={() => showToast('We\'ll remind you later', 'info')}>
        Not now — decide later
      </button>
    </div>
  )
}

export function GatheringCard() {
  const { showToast } = useToast()
  const g = GATHERING
  return (
    <div className={styles.card}>
      <div className={styles.evCover}>
        <div className={styles.evBadge}>{g.badge}</div>
      </div>
      <div className={styles.cardPad}>
        <div className={styles.evTitle}>{g.title}</div>
        <div className={styles.evMeta}>
          {g.meta.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className={styles.evConfirm}>
          <strong>You're on the guest list.</strong> {g.confirm}
        </div>
        <div className={styles.evActions}>
          <Button variant="primary" onClick={() => showToast('Added to your calendar', 'success')} style={{ flex: 1 }}>
            Add to calendar
          </Button>
          <Button variant="ghost" to={routes.gathering} style={{ flex: 1, justifyContent: 'center' }}>
            View event details
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ReplyCard() {
  const { showToast } = useToast()
  const r = REPLY
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <MemberMini initials={r.initials} tint={r.tint} name={r.name} meta={r.meta} />
      <div className={styles.label}>Your post</div>
      <div className={styles.postExcerpt}>{r.postExcerpt}</div>
      <div className={`${styles.label} ${styles.labelGap}`}>Anika's reply</div>
      <div className={styles.replyBubble}>
        <div className={styles.rbHeader}>
          <div className={styles.rbAv}>{r.initials}</div>
          <div className={styles.rbName}>{r.name}</div>
          <div className={styles.rbTime}>{r.replyTime}</div>
        </div>
        <div className={styles.rbText}>{r.replyText}</div>
      </div>
      <Composer initials="YO" placeholder="Reply to Anika…" onSend={() => showToast('Reply sent', 'success')} />
    </div>
  )
}

export function MentionCard() {
  const { showToast } = useToast()
  const m = MENTION
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <MemberMini initials={m.initials} tint={m.tint} name={m.name} meta={m.meta} />
      <div className={styles.label}>Jordan's post</div>
      <div className={styles.mentionPost}>
        Really loved the panel discussion at last week's meetup. Shoutout to{' '}
        <span className={styles.mentionHighlight}>@you</span> for the point about accessible event
        design — it sparked a whole conversation in our team and we're now rethinking how we do
        Gathering descriptions.
      </div>
      <Composer initials="YO" placeholder="Reply to Jordan…" onSend={() => showToast('Reply sent', 'success')} />
    </div>
  )
}

export function ModerationCard() {
  return (
    <div className={`${styles.card} ${styles.cardPad}`}>
      <div className={styles.modIcon}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8" stroke="var(--plum)" strokeWidth="1.8" />
          <path d="M11 7v4.5M11 14.5v.5" stroke="var(--plum)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.modHead}>An update on your account</div>
      <div className={styles.modRef}>
        Reference <span className={styles.modRefN}>{MODERATION.ref}</span> · {MODERATION.updated}
      </div>
      <div className={styles.modBody}>{MODERATION.body}</div>
      <div className={styles.modActions}>
        <Button variant="primary" to={routes.appealOutcome} style={{ justifyContent: 'center' }}>
          View appeal outcome
        </Button>
        <Button variant="ghost" to={routes.governance} style={{ justifyContent: 'center' }}>
          How moderation works
        </Button>
      </div>
    </div>
  )
}
