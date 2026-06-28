import { Button, FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AdminPageHeader, AdminAvatar } from './ui'
import { COMMUNITIES, healthColor, type Community } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

export function AdminCommunityGrid({
  onOpen,
  onHealth,
}: {
  onOpen: (c: Community) => void
  onHealth: (c: Community) => void
}) {
  const { showToast } = useToast()

  return (
    <>
      <FadeIn>
        <AdminPageHeader
          eyebrow="Communities"
          title={
            <>
              Eight spaces,
              <br />
              each <em>tended to</em>.
            </>
          }
          sub="Every community has a moderator who knows it by name. Health is how steady each one feels — reports answered, members held, no one slipping through."
          actions={
            <Button
              variant="ghost"
              onClick={() => showToast('Creating a new community would open a guided setup', 'info')}
            >
              + New community
            </Button>
          }
        />
      </FadeIn>

      <div className={styles.grid}>
        {COMMUNITIES.map((c, i) => (
          <FadeIn key={c.slug} delay={Math.min(i, 8) * 60}>
            <HealthCard community={c} onOpen={() => onOpen(c)} onHealth={() => onHealth(c)} />
          </FadeIn>
        ))}
      </div>
    </>
  )
}

function HealthCard({
  community: c,
  onOpen,
  onHealth,
}: {
  community: Community
  onOpen: () => void
  onHealth: () => void
}) {
  const color = healthColor(c.health)

  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <div className={styles.cardHead}>
        <AdminAvatar initials={c.initials} tone={c.tone} size="md" />
        <div className={styles.cardMeta}>
          <div className={styles.cardName}>{c.name}</div>
          <div className={styles.cardTag}>
            {c.tag}
            {c.support && <span className={styles.cardTagWarn}> · needs a hand</span>}
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          className={styles.scoreBtn}
          style={{ color }}
          aria-label={`Health ${c.health}, see breakdown`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onHealth()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onHealth()
            }
          }}
        >
          {c.health}
        </span>
      </div>

      <Sparkline points={c.spark} color={color} />

      <div className={styles.cardStats}>
        <Stat label="Members" value={c.members} />
        <Stat label="Activity" value={c.activity} />
        <Stat
          label="Open reports"
          value={String(c.reports)}
          tone={c.reports > 0 ? 'coral' : 'jade'}
        />
      </div>
    </button>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'coral' | 'jade' }) {
  return (
    <div className={styles.cardStat}>
      <span
        className={styles.cardStatVal}
        style={tone ? { color: tone === 'coral' ? 'var(--accent-ink)' : 'var(--jade)' } : undefined}
      >
        {value}
      </span>
      <span className={styles.cardStatLabel}>{label}</span>
    </div>
  )
}

// ── Inline sparkline (area + line) ──────────────────────────────────────────

const SW = 220
const SH = 48
const SPAD = 4

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const n = points.length
  const px = (i: number) => SPAD + (i * (SW - SPAD * 2)) / (n - 1)
  const py = (v: number) => SPAD + (SH - SPAD * 2) * (1 - (v - min) / span)

  const coords = points.map((v, i): [number, number] => [px(i), py(v)])
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[n - 1][0].toFixed(1)} ${SH - SPAD} L${coords[0][0].toFixed(1)} ${SH - SPAD} Z`
  const last = coords[n - 1]

  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${SW} ${SH}`}
      width="100%"
      height={SH}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Health trend, latest ${points[n - 1]}`}
    >
      <path d={area} fill={color} opacity={0.1} />
      <path
        className={styles.sparkLine}
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} />
    </svg>
  )
}
