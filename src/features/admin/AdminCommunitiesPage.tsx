import { useState } from 'react'
import { Avatar, Button, FadeIn } from '../../shared/components/ui'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { adminCommunityMod } from '../../app/routeMap'
import { COMMUNITIES, healthColor, type CommunityHealth } from './adminCommunities.data'
import { AdminCommunityDrawer } from './AdminCommunityDrawer'
import styles from './AdminCommunitiesPage.module.css'

const ARC_R = 22
const ARC_CIRC = 2 * Math.PI * ARC_R

export function AdminCommunitiesPage() {
  const [selected, setSelected] = useState<CommunityHealth | null>(null)

  return (
    <AdminShell title={<>Communities</>}>
      <div className={styles.grid}>
        {COMMUNITIES.map((c, i) => (
          <FadeIn key={c.slug} delay={Math.min(i, 8) * 60}>
            <CommunityCard
              community={c}
              onSelect={() => setSelected(c)}
            />
          </FadeIn>
        ))}
      </div>

      {selected && (
        <AdminCommunityDrawer
          community={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </AdminShell>
  )
}

function CommunityCard({
  community: c,
  onSelect,
}: {
  community: CommunityHealth
  onSelect: () => void
}) {
  const color = healthColor(c.score)
  const dash = (c.score / 100) * ARC_CIRC

  function handleButtonClick(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <article className={styles.card} onClick={onSelect}>
      <div className={styles.cardHead}>
        <Avatar initials={c.initials} tint={c.tint as never} size={40} alt={c.name} />
        <div className={styles.cardMeta}>
          <div className={styles.cardName}>{c.name}</div>
          <span className={styles.kindBadge}>{c.kind}</span>
        </div>
        <HealthArc score={c.score} color={color} dash={dash} />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{c.members}</span>
          <span className={styles.statLabel}>Members</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{c.mods}</span>
          <span className={styles.statLabel}>Mods</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statVal} ${c.openReports > 0 ? styles.statBad : ''}`}>
            {c.openReports}
          </span>
          <span className={styles.statLabel}>Reports</span>
        </div>
      </div>

      <div className={styles.cardFooter} onClick={handleButtonClick}>
        <Button
          variant="ghost"
          size="sm"
          to={adminCommunityMod(c.slug)}
        >
          View mod panel →
        </Button>
      </div>
    </article>
  )
}

function HealthArc({
  score,
  color,
  dash,
}: {
  score: number
  color: string
  dash: number
}) {
  return (
    <div className={styles.arcWrap}>
      <svg width={54} height={54} viewBox="0 0 54 54" aria-hidden>
        <circle
          cx={27}
          cy={27}
          r={ARC_R}
          fill="none"
          stroke="rgba(45,27,61,.09)"
          strokeWidth={5}
        />
        <circle
          cx={27}
          cy={27}
          r={ARC_R}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${dash} ${ARC_CIRC}`}
          strokeDashoffset={ARC_CIRC * 0.25}
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.score} style={{ color }}>
        {score}
      </span>
    </div>
  )
}
