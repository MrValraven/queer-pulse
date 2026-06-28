import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Button, FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AdminTabs, AdminAvatar, type AdminTab } from './ui'
import { ScopedQueuePane, MembersPane } from './AdminCommunityDetailTabs'
import { SettingsPane } from './AdminCommunitySettings'
import { AdminHealthModal } from './AdminHealthModal'
import { AdminSupportModal } from './AdminSupportModal'
import { firstName, type Community } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

export function AdminCommunityDetail({
  community,
  onBack,
}: {
  community: Community
  onBack: () => void
}) {
  const { showToast } = useToast()
  const [active, setActive] = useState('queue')
  const [health, setHealth] = useState(false)
  const [support, setSupport] = useState(false)

  const tabs: AdminTab[] = [
    { id: 'queue', label: 'Scoped queue', count: community.reports },
    { id: 'members', label: 'Members' },
    { id: 'settings', label: 'Settings' },
  ]

  const words = community.name.split(/\s+/)
  const lead = words.slice(0, -1).join(' ')
  const lastWord = words[words.length - 1]

  return (
    <FadeIn>
      <button type="button" className={styles.backLink} onClick={onBack}>
        <FiArrowLeft aria-hidden /> All communities
      </button>

      <div className={styles.hero}>
        <AdminAvatar initials={community.initials} tone={community.tone} size="lg" />
        <div className={styles.heroMain}>
          <h1 className={styles.heroName}>
            {lead && `${lead} `}
            <em>{lastWord}</em>
          </h1>
          <p className={styles.heroDesc}>
            {community.desc} Stewarded by {community.mods.length} moderator
            {community.mods.length > 1 ? 's' : ''} · founded {community.founded}.
          </p>
          <div className={styles.heroChips}>
            <button
              type="button"
              className={`${styles.healthChip} ${styles[`hc_${healthTone(community.health)}`]}`}
              onClick={() => setHealth(true)}
            >
              <span className={styles.healthChipDot} aria-hidden />
              Health {community.health} · {labelFor(community.health)}
            </button>
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

      {community.support && (
        <div className={styles.supportBanner}>
          <div>
            <h3 className={styles.bannerTitle}>
              This community could use <em>a hand</em>.
            </h3>
            <p className={styles.bannerText}>
              A health score this low is a call for support, not a mark against the mods.{' '}
              {firstName(community.mods[0].name)} is stewarding {community.members} members{' '}
              {community.mods.length < 2 ? 'almost alone' : 'with a thin team'}.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setSupport(true)}>
            Offer support
          </Button>
        </div>
      )}

      <div className={styles.statBar}>
        <StatCell label="Members" value={community.members} />
        <StatCell label="Active this week" value={`${community.activePct}%`} />
        <StatCell
          label="Open reports"
          value={String(community.reports)}
          color={community.reports > 0 ? 'var(--accent-ink)' : 'var(--jade)'}
        />
        <StatCell
          label="Resolved on time"
          value={`${community.resolvedPct}%`}
          color={community.resolvedPct >= 95 ? 'var(--jade)' : 'var(--amber)'}
        />
      </div>

      <AdminTabs tabs={tabs} active={active} onChange={setActive} className={styles.detailTabs} />

      {active === 'queue' && <ScopedQueuePane community={community} />}
      {active === 'members' && <MembersPane community={community} />}
      {active === 'settings' && <SettingsPane community={community} />}

      {health && (
        <AdminHealthModal
          community={community}
          onClose={() => setHealth(false)}
          onOfferSupport={() => setSupport(true)}
        />
      )}
      {support && (
        <AdminSupportModal community={community} onClose={() => setSupport(false)} />
      )}
    </FadeIn>
  )
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className={styles.statCell}>
      <div className={styles.statVal} style={color ? { color } : undefined}>
        {value}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

function healthTone(score: number): 'jade' | 'amber' | 'coral' {
  if (score >= 90) return 'jade'
  if (score >= 78) return 'amber'
  return 'coral'
}

function labelFor(score: number): string {
  if (score >= 90) return 'thriving'
  if (score >= 78) return 'steady'
  return 'needs a hand'
}
