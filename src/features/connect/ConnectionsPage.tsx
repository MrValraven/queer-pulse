import { useMemo, useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  ALL,
  INCOMING,
  MORE_PAGES,
  OUTGOING,
  TABS,
  VOUCHED,
  moreConnections,
  type AllConnection,
  type IncomingRequest,
  type OutgoingRequest,
  type Person,
  type TabId,
} from './connections.data'
import { MESSAGES, PROFILE } from './connections.data'
import {
  AllConnectionCard,
  IncomingCard,
  OutgoingCard,
  VouchedCard,
} from './ConnectionCards'
import styles from './ConnectionsPage.module.css'

const SORTS = ['Recently connected', 'A to Z', 'Closest mutuals', 'Recently active'] as const
type Sort = (typeof SORTS)[number]

/** Build an "All" connection card from a just-accepted incoming request. */
function acceptedToConnection(req: IncomingRequest): AllConnection {
  return {
    person: req.person,
    tags: [],
    meta: { mutuals: req.meta.mutuals, connected: 'Just now' },
    actions: [
      { label: 'Message', to: MESSAGES, variant: 'ghost' },
      { label: 'View profile', to: PROFILE, variant: 'primary' },
    ],
  }
}

function matches(person: Person, tags: string[], q: string): boolean {
  const haystack = [person.name, person.pron, person.role, ...tags].join(' ').toLowerCase()
  return haystack.includes(q)
}

export function ConnectionsPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('Recently connected')
  const [allList, setAllList] = useState<AllConnection[]>(ALL)
  const [incomingList, setIncomingList] = useState<IncomingRequest[]>(INCOMING)
  const [outgoingList, setOutgoingList] = useState<OutgoingRequest[]>(OUTGOING)
  const [page, setPage] = useState(0)

  const visibleAll = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? allList.filter((c) => matches(c.person, c.tags, q)) : allList
    const sorted = [...filtered]
    if (sort === 'A to Z') {
      sorted.sort((a, b) => a.person.name.localeCompare(b.person.name))
    } else if (sort === 'Closest mutuals') {
      sorted.sort((a, b) => (b.meta.mutuals ?? 0) - (a.meta.mutuals ?? 0))
    }
    // 'Recently connected' / 'Recently active' keep insertion order (newest accepted first
    // are unshifted onto the list).
    return sorted
  }, [allList, query, sort])

  function acceptRequest(req: IncomingRequest) {
    setIncomingList((prev) => prev.filter((r) => r.person.name !== req.person.name))
    setAllList((prev) => [acceptedToConnection(req), ...prev])
    showToast(`Connected with ${req.person.name.split(' ')[0]}`, 'success')
  }
  function declineRequest(req: IncomingRequest) {
    setIncomingList((prev) => prev.filter((r) => r.person.name !== req.person.name))
    showToast('Politely declined', 'info')
  }
  function withdrawRequest(req: OutgoingRequest) {
    setOutgoingList((prev) => prev.filter((r) => r.person.name !== req.person.name))
    showToast('Request withdrawn', 'info')
  }
  function loadMore() {
    const next = moreConnections(page)
    setAllList((prev) => [...prev, ...next])
    setPage((p) => p + 1)
  }

  const hasMore = page < MORE_PAGES

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Your network</div>
          <h1 className={styles.h1}>
            People you've <em>actually met.</em>
          </h1>
          <p className={styles.lead}>
            QueerPulse doesn't do followers. You connect with people once you've met them — at a
            gathering, through someone, or because they vouched for you. Quality over count.
          </p>
        </header>

        <div className={styles.langNote}>
          <span><FiInfo /></span>
          <span>
            <b>No follower counts on purpose.</b> If you're looking to "follow a member's posts"
            without connecting first, use the Communities feed instead. Connections are a two-way
            thing — they unlock messaging and tagged updates.
          </span>
        </div>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tab, tab === t.id && styles.tabActive].filter(Boolean).join(' ')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className={[styles.badge, t.accent && styles.badgeAccent].filter(Boolean).join(' ')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <div className={styles.searchInput}>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, role, or community"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.sortSel}
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {tab === 'all' && (
          <>
            <div className={styles.grid}>
              {visibleAll.map((c) => (
                <AllConnectionCard c={c} key={c.person.name} />
              ))}
            </div>
            {visibleAll.length === 0 && (
              <p className={styles.paneIntro}>No connections match “{query}”.</p>
            )}
            {hasMore && (
              <div className={styles.loadMore}>
                <Button type="button" variant="ghost" onClick={loadMore}>
                  Load more connections
                </Button>
              </div>
            )}
          </>
        )}

        {tab === 'incoming' && (
          <div className={styles.grid}>
            {incomingList.map((c) => (
              <IncomingCard
                key={c.person.name}
                c={c}
                onDecline={() => declineRequest(c)}
                onAccept={() => acceptRequest(c)}
              />
            ))}
            {incomingList.length === 0 && (
              <p className={styles.paneIntro}>No incoming requests right now.</p>
            )}
          </div>
        )}

        {tab === 'outgoing' && (
          <div className={styles.grid}>
            {outgoingList.map((c) => (
              <OutgoingCard key={c.person.name} c={c} onWithdraw={() => withdrawRequest(c)} />
            ))}
            {outgoingList.length === 0 && (
              <p className={styles.paneIntro}>No pending sent requests.</p>
            )}
          </div>
        )}

        {tab === 'vouched' && (
          <>
            <p className={styles.paneIntro}>
              People you've vouched for, or who've vouched for you.{' '}
              <em>Vouching is a small but meaningful act</em> — it stays attached to that member's
              profile.
            </p>
            <div className={styles.grid}>
              {VOUCHED.map((c) => (
                <VouchedCard c={c} key={c.person.name} />
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}
