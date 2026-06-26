import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { linkToPath } from '../../app/routeMap'
import { SEARCH_DATA, TYPE_BG, TYPE_ICON, TYPE_LABEL, RECENTS, TABS, type ResultType, type SearchItem } from './search.data'
import styles from './SearchPage.module.css'

function ResultCard({ item }: { item: SearchItem }) {
  const TypeIcon = TYPE_ICON[item.t]
  return (
    <Link to={linkToPath(item.href)} className={styles.card}>
      <div className={styles.cardIcon} style={{ background: TYPE_BG[item.t] }}><TypeIcon /></div>
      <div className={styles.cardBody}>
        <div className={styles.cardType}>{TYPE_LABEL[item.t]}</div>
        <div className={styles.cardName}>{item.name}</div>
        <div className={styles.cardSub}>{item.sub}</div>
      </div>
    </Link>
  )
}

function Group({ items, label }: { items: SearchItem[]; label: string }) {
  if (!items.length) return null
  return (
    <div className={styles.section}>
      <div className={styles.secHead}>{label}</div>
      <div className={styles.grid}>
        {items.map((item) => <ResultCard key={item.name} item={item} />)}
      </div>
    </div>
  )
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<ResultType | 'all'>('all')
  const q = query.trim().toLowerCase()

  let content: React.ReactNode
  if (!q) {
    content = (
      <>
        <div className={styles.recent}>
          <div className={styles.recentLabel}>Recent searches</div>
          <div className={styles.recentChips}>
            {RECENTS.map((r) => (
              <button key={r} type="button" className={styles.chip} onClick={() => setQuery(r)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-6.93" />
                </svg>
                {r}
              </button>
            ))}
          </div>
        </div>
        <Group items={SEARCH_DATA.filter((d) => d.t === 'member').slice(0, 6)} label="Members" />
        <Group items={SEARCH_DATA.filter((d) => d.t === 'gathering')} label="Upcoming gatherings" />
      </>
    )
  } else {
    const hits = SEARCH_DATA.filter((d) => {
      const matches = `${d.name} ${d.sub} ${d.kw}`.toLowerCase().includes(q)
      return matches && (tab === 'all' || d.t === tab)
    })
    const countEl = (
      <div className={styles.count}>
        <b>{hits.length}</b> result{hits.length === 1 ? '' : 's'} for "<b>{query.trim()}</b>"
      </div>
    )
    if (!hits.length) {
      content = (
        <>
          {countEl}
          <div className={styles.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--plum)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>Nothing found</h3>
            <p>Try a different word — member name, neighbourhood, skill, or type of gathering.</p>
          </div>
        </>
      )
    } else if (tab === 'all') {
      const types: ResultType[] = ['member', 'gathering', 'community', 'board']
      content = (
        <>
          {countEl}
          {types.map((typ) => (
            <Group key={typ} items={hits.filter((h) => h.t === typ)} label={TYPE_LABEL[typ]} />
          ))}
        </>
      )
    } else {
      content = <>{countEl}<Group items={hits} label={TYPE_LABEL[tab]} /></>
    }
  }

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.label}>Search</div>
          <h1 className={styles.title}>Find anyone, anything <em>in the community.</em></h1>
          <div className={styles.barWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.barInput}
              type="text"
              placeholder="Members, gatherings, communities, board posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={styles.shortcut}>⌘K</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={[styles.tab, tab === t.id && styles.tabActive].filter(Boolean).join(' ')}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {content}
        </div>
      </div>
    </PageShell>
  )
}
