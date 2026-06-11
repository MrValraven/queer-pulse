import { useState } from 'react'
import { Link } from 'react-router-dom'
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

function MentionRow({ m }: { m: Mention }) {
  const { showToast } = useToast()
  return (
    <div className={`${styles.row} ${m.unread ? styles.unread : ''}`}>
      <div className={styles.headRow}>
        <div className={`${styles.av} ${avClass[m.tint]}`}>{m.initials}</div>
        <div className={styles.who}>
          <Link to={routes.profile}>{m.name}</Link>
          <span> · {m.context}</span>
        </div>
        <div className={`${styles.when} ${m.fresh ? styles.fresh : ''}`}>{m.when}</div>
      </div>
      <div className={styles.content}>{m.content}</div>
      <div className={styles.where}>
        In{' '}
        {m.whereTo ? <Link to={m.whereTo}>{m.whereText}</Link> : <span>{m.whereText}</span>}
      </div>
      {m.actions.length > 0 && (
        <div className={styles.actions}>
          {m.actions.map((a) => (
            <button
              key={a.label}
              className={`${styles.action} ${a.primary ? styles.primary : ''}`}
              onClick={() => showToast(`${a.label} · ${m.name}`, 'info')}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
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
