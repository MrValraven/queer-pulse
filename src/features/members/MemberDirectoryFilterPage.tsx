import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { INITIAL_APPLIED, MEMBERS } from './memberDirectoryFilter.data'
import { FiltersSidebar, MemberResultCard } from './MemberFilterCards'
import styles from './MemberDirectoryFilterPage.module.css'

export function MemberDirectoryFilterPage() {
  const { showToast } = useToast()
  const [applied, setApplied] = useState(INITIAL_APPLIED)

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Members · advanced filter</div>
          <h1 className={styles.h1}>
            Find <em>1,847 members,</em> exactly.
          </h1>
          <p className={styles.lead}>
            Filter by what they offer, where they're based, what they're <b>open to</b>. The same
            data goes both ways — members appear here because they opted in to be findable for these
            reasons.
          </p>
        </header>

        <div className={styles.grid}>
          <FiltersSidebar
            appliedCount={applied.length}
            onClearAll={() => {
              setApplied([])
              showToast('Filters cleared', 'info')
            }}
          />

          <main>
            <div className={styles.topRow}>
              <div className={styles.count}>
                Showing{' '}
                <b>
                  <em>184</em>
                </b>{' '}
                of 1,847 members
              </div>
              <div className={styles.sort}>
                <span className={styles.sortLabel}>Sort</span>
                <select defaultValue="Recently active">
                  <option>Recently active</option>
                  <option>Recently joined</option>
                  <option>Closest mutuals</option>
                  <option>A to Z</option>
                  <option>Most vouched</option>
                </select>
              </div>
            </div>

            {applied.length > 0 && (
              <div className={styles.appliedRow}>
                {applied.map((label) => (
                  <span key={label} className={styles.applied}>
                    {label}
                    <button
                      type="button"
                      aria-label={`Remove ${label}`}
                      onClick={() => setApplied((prev) => prev.filter((l) => l !== label))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className={styles.mGrid}>
              {MEMBERS.map((member) => (
                <MemberResultCard key={member.name} member={member} />
              ))}
            </div>

            <div className={styles.loadMore}>
              <Button type="button" variant="ghost" onClick={() => showToast('Loading more members…', 'info')}>
                Load 178 more members
              </Button>
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  )
}
