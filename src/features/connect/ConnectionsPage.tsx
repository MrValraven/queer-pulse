import { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { ALL, INCOMING, OUTGOING, TABS, VOUCHED, type TabId } from './connections.data'
import {
  AllConnectionCard,
  IncomingCard,
  OutgoingCard,
  VouchedCard,
} from './ConnectionCards'
import styles from './ConnectionsPage.module.css'

export function ConnectionsPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<TabId>('all')

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
            <input type="text" placeholder="Search by name, role, or community" />
          </div>
          <select className={styles.sortSel} defaultValue="Recently connected">
            <option>Recently connected</option>
            <option>A to Z</option>
            <option>Closest mutuals</option>
            <option>Recently active</option>
          </select>
        </div>

        {tab === 'all' && (
          <>
            <div className={styles.grid}>
              {ALL.map((c) => (
                <AllConnectionCard c={c} key={c.person.name} />
              ))}
            </div>
            <div className={styles.loadMore}>
              <Button type="button" variant="ghost" onClick={() => showToast('Loading more connections…', 'info')}>
                Load 39 more connections
              </Button>
            </div>
          </>
        )}

        {tab === 'incoming' && (
          <div className={styles.grid}>
            {INCOMING.map((c) => (
              <IncomingCard
                key={c.person.name}
                c={c}
                onDecline={() => showToast('Politely declined', 'info')}
                onAccept={(firstName) => showToast(`Connected with ${firstName}`, 'success')}
              />
            ))}
          </div>
        )}

        {tab === 'outgoing' && (
          <div className={styles.grid}>
            {OUTGOING.map((c) => (
              <OutgoingCard key={c.person.name} c={c} onWithdraw={() => showToast('Request withdrawn', 'info')} />
            ))}
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
