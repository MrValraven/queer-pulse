import { useState } from 'react'
import { AppShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import { DRAFT_TABS, DRAFTS, type Draft, type MetaVariant } from './drafts.data'
import styles from './DraftsPage.module.css'

const kindClass: Record<Draft['kindVariant'], string> = {
  job: styles.kindJob,
  pitch: styles.kindPitch,
  grant: styles.kindGrant,
  post: styles.kindPost,
}

const metaClass: Record<MetaVariant, string> = {
  deadline: styles.metaDeadline,
  pulse: styles.metaPulse,
  stale: styles.metaStale,
}

export function DraftsPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState(0)
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  function runAction(d: Draft, action: Draft['actions'][number]) {
    if (action.deletes) {
      setDeleted((prev) => new Set(prev).add(d.id))
      showToast('Draft deleted', 'info')
    } else {
      showToast(action.label, 'info')
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Drafts · only visible to you</div>
          <h1 className={styles.h1}>
            Things you <em>started.</em>
          </h1>
          <p className={styles.lead}>
            Posts, articles, applications, and pitches you haven't sent yet.{' '}
            <em>Auto-saved every 8 seconds.</em> Drafts older than 90 days get a polite reminder,
            then a polite second one, then quietly delete.
          </p>
        </header>

        <div className={styles.tabs}>
          {DRAFT_TABS.map((t, i) => (
            <button
              key={t.label}
              className={`${styles.tab} ${tab === i ? styles.active : ''}`}
              onClick={() => setTab(i)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {DRAFTS.map((d) => (
          <div key={d.id} className={`${styles.row} ${deleted.has(d.id) ? styles.deleted : ''}`}>
            <div className={`${styles.kind} ${kindClass[d.kindVariant]}`}>{d.kind}</div>
            <div className={styles.info}>
              <b>{d.title}</b>
              <span>{d.desc}</span>
              <div className={styles.meta}>
                {d.meta.map((m, i) => (
                  <span key={i} className={m.variant ? metaClass[m.variant] : undefined}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.progress}>
              <div className={`${styles.bar} ${d.ready ? styles.full : ''}`}>
                <span style={{ width: `${d.progress}%` }} />
              </div>
              {d.ready ? <span className={styles.readyLabel}>Ready</span> : <span>{d.progress}%</span>}
            </div>
            <div className={styles.actions}>
              {d.actions.map((a) => (
                <button
                  key={a.label}
                  className={`${styles.action} ${a.variant === 'primary' ? styles.primary : ''} ${a.variant === 'danger' ? styles.danger : ''}`}
                  onClick={() => runAction(d, a)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.dangerBlock}>
          <b>About the 90-day rule:</b> drafts you haven't touched in 87+ days get an email reminder,
          then auto-delete on day 90. You can extend any draft 30 days at a time.{' '}
          <em>This is to keep your drafts list honest — not to lose work.</em>
        </div>
      </div>
    </AppShell>
  )
}
