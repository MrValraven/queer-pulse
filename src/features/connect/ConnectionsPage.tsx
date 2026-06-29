import { useMemo, useState } from 'react'
import { FiInfo, FiSearch } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, EmptyState, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { useConnect } from '../../app/providers/ConnectProvider'
import { useConnections } from '../../app/providers/ConnectionsProvider'
import { useSocial } from '../../app/providers/SocialProvider'
import { useVouch } from '../../app/providers/VouchProvider'
import { ConnectionsGridSkeleton } from './ConnectionsSkeleton'
import {
  CONNECTION_META,
  MORE_POOL,
  MORE_PER_PAGE,
  connectionViews,
  vouchNote,
  type ConnectionView,
  type TabId,
} from './connections.data'
import { AllConnectionCard } from './ConnectionCards'
import { BlockedPanel, IncomingPanel, SentPanel, VouchedPanel } from './ConnectionsPanels'
import styles from './ConnectionsPage.module.css'

const SORTS = ['Recently connected', 'A to Z', 'Closest mutuals'] as const
type Sort = (typeof SORTS)[number]

function matchesView(v: ConnectionView, q: string): boolean {
  return [v.name, v.pron ?? '', v.role, ...v.tags].join(' ').toLowerCase().includes(q)
}

export function ConnectionsPage() {
  const loading = useSimulatedLoad()
  const { showToast } = useToast()
  const { openConnect } = useConnect()
  const { connected, incoming, sent, accept, decline, withdraw } = useConnections()
  const { blocked, isBlocked, toggleBlock } = useSocial()
  const { vouched, hasVouched } = useVouch()

  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('Recently connected')
  const [morePages, setMorePages] = useState(0)

  const revealed = MORE_POOL.slice(0, morePages * MORE_PER_PAGE)
  const hasMore = revealed.length < MORE_POOL.length

  const blockedViews = useMemo(() => connectionViews(blocked), [blocked])

  const vouchedSlugs = useMemo(() => {
    const set = new Set<string>(vouched)
    for (const [slug, meta] of Object.entries(CONNECTION_META)) {
      if (meta.vouchBadge) set.add(slug)
    }
    return [...set]
  }, [vouched])

  const visibleAll = useMemo(() => {
    const seen = new Set<string>()
    const slugs = [...connected, ...revealed].filter((s) => !seen.has(s) && seen.add(s))
    const q = query.trim().toLowerCase()
    let views = connectionViews(slugs)
    if (q) views = views.filter((v) => matchesView(v, q))
    if (sort === 'A to Z') {
      views = [...views].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'Closest mutuals') {
      views = [...views].sort((a, b) => (b.meta.mutuals ?? 0) - (a.meta.mutuals ?? 0))
    }
    return views
  }, [connected, revealed, query, sort])

  const tabs: { id: TabId; label: string; count: number; accent?: boolean }[] = [
    { id: 'all', label: 'All connections', count: connected.length },
    { id: 'incoming', label: 'Incoming requests', count: incoming.length, accent: incoming.length > 0 },
    { id: 'sent', label: 'Sent', count: sent.length },
    { id: 'blocked', label: 'Blocked', count: blockedViews.length },
    { id: 'vouched', label: 'Vouched-for', count: vouchedSlugs.length },
  ]

  function acceptRequest(v: ConnectionView) {
    accept(v.slug)
    showToast(`Connected with ${v.name.split(' ')[0]}`, 'success')
  }
  function declineRequest(v: ConnectionView) {
    decline(v.slug)
    showToast('Politely declined', 'info')
  }
  function withdrawRequest(v: ConnectionView) {
    withdraw(v.slug)
    showToast('Request withdrawn', 'info')
  }
  function unblock(v: ConnectionView) {
    toggleBlock(v.slug)
    showToast(`Unblocked ${v.name.split(' ')[0]}`, 'success')
  }

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
          {tabs.map((t) => (
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

        {tab === 'all' && (
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
        )}

        {tab === 'all' && (loading ? (
          <ConnectionsGridSkeleton count={6} />
        ) : (
          <>
            <div className={styles.grid}>
              {visibleAll.map((v, i) => (
                <FadeIn key={v.slug} delay={Math.min(i, 8) * 60}>
                  <AllConnectionCard
                    view={v}
                    blocked={isBlocked(v.slug)}
                    onUnblock={() => unblock(v)}
                    onMessage={() => openConnect(v.slug)}
                  />
                </FadeIn>
              ))}
            </div>
            {visibleAll.length === 0 && (
              <EmptyState
                compact
                icon={<FiSearch />}
                title="Nothing matches your filters"
                description="No one in your network fits that search just yet. Clear it to see everyone again."
                action={{
                  label: 'Clear filters',
                  onClick: () => {
                    setQuery('')
                    setSort('Recently connected')
                  },
                }}
              />
            )}
            {hasMore && query.trim() === '' && (
              <div className={styles.loadMore}>
                <Button type="button" variant="ghost" onClick={() => setMorePages((p) => p + 1)}>
                  Load more connections
                </Button>
              </div>
            )}
          </>
        ))}

        {tab === 'incoming' && (
          <IncomingPanel
            loading={loading}
            views={connectionViews(incoming)}
            onAccept={acceptRequest}
            onDecline={declineRequest}
          />
        )}

        {tab === 'sent' && (
          <SentPanel loading={loading} views={connectionViews(sent)} onWithdraw={withdrawRequest} />
        )}

        {tab === 'blocked' && (
          <BlockedPanel loading={loading} views={blockedViews} onUnblock={unblock} />
        )}

        {tab === 'vouched' && (
          <VouchedPanel
            loading={loading}
            views={connectionViews(vouchedSlugs)}
            noteFor={(v) => vouchNote(v.slug, hasVouched(v.slug))}
          />
        )}
      </div>
    </PageShell>
  )
}
