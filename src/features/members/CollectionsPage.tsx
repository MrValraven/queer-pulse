import type { ReactNode } from 'react'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  COLLECTIONS,
  RECENT_SAVES,
  type Privacy,
  type Thumb,
  type RecentSave,
} from './collections.data'
import styles from './CollectionsPage.module.css'

const thumbClass: Record<Thumb, string> = {
  a: styles.thumbA,
  b: styles.thumbB,
  c: styles.thumbC,
  d: styles.thumbD,
  e: styles.thumbE,
}

const kindClass: Record<RecentSave['kindVariant'], string> = {
  therapist: styles.kindTherapist,
  article: styles.kindArticle,
  business: styles.kindBusiness,
}

const privacyIcon: Record<Privacy, ReactNode> = {
  private: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  shared: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4" />
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  public: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
}

export function CollectionsPage() {
  const { showToast } = useToast()
  const newCollection = () => showToast('New collection · name it next', 'info')

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Collections · folders for saves</div>
            <h1 className={styles.h1}>
              Things you keep <em>coming back to.</em>
            </h1>
            <p className={styles.lead}>
              Saved items, grouped however makes sense to you. Folders can be private (default),
              shared with specific members, or public.
            </p>
          </div>
          <Button variant="primary" onClick={newCollection}>
            + New collection
          </Button>
        </header>

        <div className={styles.grid}>
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              className={`${styles.card} ${c.featured ? styles.featured : ''}`}
              onClick={() => showToast('Opening collection', 'info')}
            >
              <div className={styles.ic}>{c.count}</div>
              <div>
                <div className={styles.name}>{c.name}</div>
                <div className={styles.meta}>{c.meta}</div>
              </div>
              <div className={styles.thumbs}>
                {c.thumbs.map((t, i) => (
                  <span key={i} className={`${styles.thumb} ${thumbClass[t]}`} />
                ))}
                <span className={styles.more}>{c.more}</span>
              </div>
              <div className={styles.foot}>
                <span className={styles.priv}>
                  {privacyIcon[c.privacy]}
                  {c.privacyLabel}
                </span>
                <span>{c.updated}</span>
              </div>
            </button>
          ))}

          <button className={styles.newCard} onClick={newCollection}>
            <div className={styles.plus}>+</div>
            <b>New collection</b>
            <span>Group saves by why they matter</span>
          </button>
        </div>

        <div className={styles.secH}>
          <span>Recently saved · not yet in a collection</span>
          <span className={styles.ct}>+ 7 unfiled</span>
        </div>
        <div className={styles.recentList}>
          {RECENT_SAVES.map((r) => (
            <button
              key={r.id}
              className={styles.recentRow}
              onClick={() => showToast('Add to collection · pick one', 'info')}
            >
              <div className={`${styles.recentKind} ${kindClass[r.kindVariant]}`}>{r.kind}</div>
              <div className={styles.recentInfo}>
                <b>{r.title}</b>
                <span>{r.saved}</span>
              </div>
              <span className={styles.recentAdd}>+ Add to collection →</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
