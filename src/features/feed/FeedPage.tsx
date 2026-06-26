import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { SkeletonAvatar, SkeletonLine } from '../../shared/components/ui'
import { currentUser } from '../members/data/members'
import { FEED_TABS, type FeedTab } from './feed.data'
import { GatheringCard, NewMemberCard, PostCard, SavedArticleCard, RecapCard } from './FeedCards'
import { FeedSidebar } from './FeedSidebar'
import styles from './FeedPage.module.css'

/** Each feed item tagged with the tabs it belongs to (besides "All"). */
const FEED_ITEMS: { key: string; tab: FeedTab; Card: () => React.ReactElement }[] = [
  { key: 'gathering', tab: 'Gatherings', Card: GatheringCard },
  { key: 'new-member', tab: 'People', Card: NewMemberCard },
  { key: 'post', tab: 'Posts', Card: PostCard },
  { key: 'saved-article', tab: 'Posts', Card: SavedArticleCard },
  { key: 'recap', tab: 'Gatherings', Card: RecapCard },
]

function FeedSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.pad} style={{ display: 'flex', gap: 12 }}>
        <SkeletonAvatar size={44} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="40%" height={14} />
          <SkeletonLine width="80%" height={18} style={{ marginTop: 12 }} />
          <SkeletonLine width="60%" height={13} style={{ marginTop: 10 }} />
        </div>
      </div>
    </div>
  )
}

export function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <AppShell unreadCount={3}>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.greetingRow}>
            <div>
              <div className={styles.greeting}>Good morning, <em>{currentUser.first}</em></div>
              <div className={styles.greetingDate}>Saturday · Lisbon · 21 June 2026</div>
            </div>
            <Link to="/messages" className={styles.msgChip}>
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M1 2.5h11v7H1zM1 2.5l5.5 4 5.5-4" stroke="var(--jade)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              2 new messages
            </Link>
          </div>

          <div className={styles.layout}>
            <div>
              <div className={styles.tabs}>
                {FEED_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={[styles.tab, activeTab === tab && styles.tabActive].filter(Boolean).join(' ')}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className={styles.list}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <FeedSkeleton key={i} />)
                ) : (
                  FEED_ITEMS
                    .filter(({ tab }) => activeTab === 'All' || tab === activeTab)
                    .map(({ key, Card }) => <Card key={key} />)
                )}
              </div>
            </div>
            <FeedSidebar />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
