import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { FEED_TABS, type FeedTab } from './feed.data'
import { GatheringCard, NewMemberCard, PostCard, SavedArticleCard, RecapCard } from './FeedCards'
import { FeedSidebar } from './FeedSidebar'
import styles from './FeedPage.module.css'

export function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('All')

  return (
    <AppShell unreadCount={3}>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.greetingRow}>
            <div>
              <div className={styles.greeting}>Good morning, <em>Sofia</em></div>
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
                <GatheringCard />
                <NewMemberCard />
                <PostCard />
                <SavedArticleCard />
                <RecapCard />
              </div>
            </div>
            <FeedSidebar />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
