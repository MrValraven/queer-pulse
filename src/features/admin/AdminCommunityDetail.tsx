import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Button, FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AdminTabs, AdminChip, AdminAvatar, type AdminTab } from './ui'
import { ScopedQueuePane, MembersPane, SettingsPane } from './AdminCommunityDetailTabs'
import type { CommunityDetail } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

export function AdminCommunityDetail({
  detail,
  onBack,
}: {
  detail: CommunityDetail
  onBack: () => void
}) {
  const { showToast } = useToast()
  const [active, setActive] = useState('queue')

  const tabs: AdminTab[] = [
    { id: 'queue', label: 'Scoped queue', count: detail.scoped.length },
    { id: 'members', label: 'Members' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <FadeIn>
      <button type="button" className={styles.backLink} onClick={onBack}>
        <FiArrowLeft aria-hidden /> All communities
      </button>

      <div className={styles.hero}>
        <AdminAvatar initials={detail.initials} tone={detail.tone} size="lg" />
        <div className={styles.heroMain}>
          <h1 className={styles.heroName}>
            {detail.name.includes('&') ? (
              <>
                Trans <em>&amp; Friends</em>
              </>
            ) : (
              detail.name
            )}
          </h1>
          <p className={styles.heroDesc}>{detail.description}</p>
          <div className={styles.heroChips}>
            <AdminChip tone="jade" dot>
              Health {detail.health} · {detail.healthLabel}
            </AdminChip>
            <Button
              variant="ghost"
              size="md"
              onClick={() => showToast('Community settings would open here', 'info')}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.statBar}>
        {detail.stats.map((s) => (
          <div key={s.label} className={styles.statCell}>
            <div
              className={styles.statVal}
              style={
                s.tone === 'coral'
                  ? { color: 'var(--accent-ink)' }
                  : s.tone === 'jade'
                    ? { color: 'var(--jade)' }
                    : undefined
              }
            >
              {s.value}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <AdminTabs tabs={tabs} active={active} onChange={setActive} className={styles.detailTabs} />

      {active === 'queue' && <ScopedQueuePane detail={detail} />}
      {active === 'members' && <MembersPane detail={detail} />}
      {active === 'settings' && <SettingsPane detail={detail} />}
    </FadeIn>
  )
}
