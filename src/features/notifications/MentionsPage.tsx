import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { AppShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { MENTION_TABS, MENTION_DAYS, type Mention } from './mentions.data'
import styles from './MentionsPage.module.css'

const avClass: Record<Mention['tint'], string> = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
}

function ReplyComposer({ name, onSend }: { name: string; onSend: (body: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault()
        const body = value.trim()
        if (!body) return
        onSend(body)
        setValue('')
      }}
    >
      <textarea
        className={styles.rcInput}
        rows={1}
        placeholder={`Reply to ${name.split(' ')[0]}…`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button className={styles.rcSend} type="submit" disabled={!value.trim()}>
        Reply
      </button>
    </form>
  )
}

function MentionRow({ m }: { m: Mention }) {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(!!m.unread)
  const [going, setGoing] = useState(false)
  const [composing, setComposing] = useState(false)
  const [replies, setReplies] = useState<string[]>([])

  function runAction(label: string) {
    if (label === 'Reply') {
      setComposing((c) => !c)
    } else if (label === 'RSVP') {
      setGoing((g) => {
        const next = !g
        showToast(next ? `You're going · ${m.name}'s invite` : 'RSVP withdrawn', next ? 'success' : 'info')
        return next
      })
    } else if (label === 'Mark read') {
      setUnread(false)
    } else if (label.startsWith('Open')) {
      navigate(m.whereTo ?? routes.forum)
    } else {
      showToast(`${label} · ${m.name}`, 'info')
    }
  }

  function addReply(body: string) {
    setReplies((prev) => [...prev, body])
    setUnread(false)
    setComposing(false)
  }

  return (
    <div className={`${styles.row} ${unread ? styles.unread : ''}`}>
      <div className={styles.headRow}>
        <div className={`${styles.av} ${avClass[m.tint]}`}>{m.initials}</div>
        <div className={styles.who}>
          <Link to={routes.members}>{m.name}</Link>
          <span> · {m.context}</span>
        </div>
        <div className={`${styles.when} ${m.fresh ? styles.fresh : ''}`}>{m.when}</div>
      </div>
      <div className={styles.content}>{m.content}</div>
      <div className={styles.where}>
        In{' '}
        {m.whereTo ? <Link to={m.whereTo}>{m.whereText}</Link> : <span>{m.whereText}</span>}
      </div>
      {replies.map((body, i) => (
        <div key={i} className={styles.sentReply}>
          <span className={styles.srAuthor}>You</span>
          {body}
        </div>
      ))}
      {m.actions.length > 0 && (
        <div className={styles.actions}>
          {m.actions.map((a) => {
            const isGoing = a.label === 'RSVP' && going
            return (
              <button
                key={a.label}
                className={[
                  styles.action,
                  a.primary && styles.primary,
                  isGoing && styles.going,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => runAction(a.label)}
              >
                {isGoing ? (
                  <>
                    <FiCheck aria-hidden /> Going
                  </>
                ) : (
                  a.label
                )}
              </button>
            )
          })}
          {!unread && m.unread && <span className={styles.when}>Read</span>}
        </div>
      )}
      {composing && <ReplyComposer name={m.name} onSend={addReply} />}
    </div>
  )
}

export function MentionsPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState(0)

  return (
    <AppShell unreadCount={3}>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Mentions · @tomas-mendes</div>
          <h1 className={styles.h1}>
            When somebody <em>tagged you in.</em>
          </h1>
          <p className={styles.lead}>
            Posts, replies, and articles that @-mention you. Distinct from Notifications — this is
            just the mentions thread.
          </p>
        </header>

        <div className={styles.tabs}>
          {MENTION_TABS.map((t, i) => (
            <button
              key={t.label}
              className={`${styles.tab} ${tab === i ? styles.active : ''}`}
              onClick={() => setTab(i)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.markRow}>
          <p>
            <b>3 unread</b> · oldest from 14 hours ago
          </p>
          <button className={styles.markBtn} onClick={() => showToast('All marked as read', 'success')}>
            Mark all read
          </button>
        </div>

        {MENTION_DAYS.map((group) => (
          <div key={group.day}>
            <div className={styles.day}>{group.day}</div>
            <div className={styles.list}>
              {group.items.map((m) => (
                <MentionRow key={m.id} m={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
