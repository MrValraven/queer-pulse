import {
  REPORT_WEEKS,
  MEMBER_GROWTH,
  ACTION_BREAKDOWN,
} from './adminDashboard.data'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardCharts() {
  return (
    <section className={styles.chartGrid}>
      <StackedBarChart />
      <GrowthLineChart />
      <ActionDonut />
    </section>
  )
}

// ── StackedBarChart ──────────────────────────────────────────────────────────

const BAR_COLORS = {
  harassment: 'var(--accent)',
  outing: 'var(--plum)',
  spam: 'var(--jade)',
  vouch: 'rgba(45,27,61,.4)',
} as const

const BAR_LEGEND = [
  { key: 'harassment', label: 'Harassment' },
  { key: 'outing', label: 'Outing' },
  { key: 'spam', label: 'Spam' },
  { key: 'vouch', label: 'Vouch abuse' },
] as const

function StackedBarChart() {
  const W = 480
  const H = 160
  const PAD = { top: 8, right: 8, bottom: 24, left: 4 }
  const chartH = H - PAD.top - PAD.bottom
  const chartW = W - PAD.left - PAD.right

  const totals = REPORT_WEEKS.map(
    (w) => w.harassment + w.outing + w.spam + w.vouch,
  )
  const maxTotal = Math.max(...totals)
  const barW = Math.floor(chartW / REPORT_WEEKS.length)
  const gap = 4

  return (
    <figure className={styles.chartCard} style={{ margin: 0 }}>
      <h3 className={styles.chartTitle}>Reports by week (12 weeks)</h3>
      <div className={styles.chartLegend}>
        {BAR_LEGEND.map(({ key, label }) => (
          <span key={key} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ background: BAR_COLORS[key] }}
            />
            {label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Stacked bar chart of reports by week">
        {REPORT_WEEKS.map((w, i) => {
          const x = PAD.left + i * barW + gap / 2
          const bw = barW - gap
          const segments: { color: string; h: number }[] = [
            { color: BAR_COLORS.vouch, h: (w.vouch / maxTotal) * chartH },
            { color: BAR_COLORS.spam, h: (w.spam / maxTotal) * chartH },
            { color: BAR_COLORS.outing, h: (w.outing / maxTotal) * chartH },
            { color: BAR_COLORS.harassment, h: (w.harassment / maxTotal) * chartH },
          ]
          let yOffset = PAD.top + chartH
          return (
            <g key={w.week} className={styles.bar} role="img" aria-label={w.week}>
              {segments.map((seg, si) => {
                if (seg.h === 0) return null
                yOffset -= seg.h
                const y = yOffset
                return (
                  <rect
                    key={si}
                    className={styles.barSeg}
                    x={x}
                    y={y}
                    width={bw}
                    height={seg.h}
                    fill={seg.color}
                    rx={si === segments.length - 1 ? 3 : 0}
                  />
                )
              })}
              <text
                x={x + bw / 2}
                y={PAD.top + chartH + 14}
                textAnchor="middle"
                fontSize={9}
                fill="var(--ink-60)"
              >
                {w.week}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

// ── GrowthLineChart ──────────────────────────────────────────────────────────

function GrowthLineChart() {
  const W = 480
  const H = 200
  const PAD = { top: 12, right: 12, bottom: 28, left: 8 }
  const chartH = H - PAD.top - PAD.bottom
  const chartW = W - PAD.left - PAD.right

  const maxJoined = Math.max(...MEMBER_GROWTH.map((p) => p.joined))
  const n = MEMBER_GROWTH.length

  const px = (i: number) => PAD.left + (i / (n - 1)) * chartW
  const pyJoined = (v: number) => PAD.top + chartH - (v / maxJoined) * chartH
  const pyChurned = (v: number) =>
    PAD.top + chartH - (v / maxJoined) * chartH

  const joinedPts = MEMBER_GROWTH.map((p, i) => `${px(i)},${pyJoined(p.joined)}`).join(' ')
  const churnedPts = MEMBER_GROWTH.map((p, i) => `${px(i)},${pyChurned(p.churned)}`).join(' ')

  // Area under joined line: polygon = joined polyline + bottom-right + bottom-left
  const areaPoints =
    MEMBER_GROWTH.map((p, i) => `${px(i)},${pyJoined(p.joined)}`).join(' ') +
    ` ${px(n - 1)},${PAD.top + chartH} ${px(0)},${PAD.top + chartH}`

  return (
    <figure className={styles.chartCard} style={{ margin: 0 }}>
      <h3 className={styles.chartTitle}>Member growth (12 months)</h3>
      <div className={styles.chartLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--plum)' }} />
          Joined
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--accent)' }} />
          Churned
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--plum)', transform: 'rotate(45deg)', display: 'inline-block' }} />
          Milestone
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Dual line chart of member growth">
        {/* Area fill under joined */}
        <polygon points={areaPoints} fill="var(--plum)" opacity={0.1} />
        {/* Churned line */}
        <polyline
          points={churnedPts}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Joined line */}
        <polyline
          points={joinedPts}
          fill="none"
          stroke="var(--plum)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* Milestone diamonds */}
        {MEMBER_GROWTH.map((p, i) => {
          if (!p.milestone) return null
          const cx = px(i)
          const cy = pyJoined(p.joined)
          const s = 6
          return (
            <g key={p.month}>
              <rect
                x={cx - s / Math.SQRT2}
                y={cy - s / Math.SQRT2}
                width={s * Math.SQRT2}
                height={s * Math.SQRT2}
                fill="var(--plum)"
                transform={`rotate(45 ${cx} ${cy})`}
              />
              <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                fontSize={8}
                fill="var(--plum)"
              >
                {p.milestone}
              </text>
            </g>
          )
        })}
        {/* X-axis labels */}
        {MEMBER_GROWTH.map((p, i) => (
          <text
            key={p.month}
            x={px(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="var(--ink-60)"
          >
            {p.month}
          </text>
        ))}
      </svg>
    </figure>
  )
}

// ── ActionDonut ──────────────────────────────────────────────────────────────

function ActionDonut() {
  const SIZE = 200
  const cx = SIZE / 2
  const cy = SIZE / 2
  const R = 70
  const SW = 28
  const CIRC = 2 * Math.PI * R

  const total = ACTION_BREAKDOWN.reduce((s, d) => s + d.value, 0)

  // Compute stroke-dasharray offsets per slice
  let offset = 0
  const slices = ACTION_BREAKDOWN.map((slice) => {
    const fraction = slice.value / total
    const dash = fraction * CIRC
    const gap = CIRC - dash
    const rotation = (offset / CIRC) * 360 - 90 // start at top
    offset += dash
    return { ...slice, dash, gap, rotation }
  })

  return (
    <figure className={styles.chartCard} style={{ margin: 0 }}>
      <h3 className={styles.chartTitle}>Actions this quarter</h3>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        className={styles.donut}
        aria-label="Donut chart of moderation actions"
      >
        {slices.map((sl) => (
          <circle
            key={sl.label}
            className={styles.slice}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={sl.color}
            strokeWidth={SW}
            strokeDasharray={`${sl.dash} ${sl.gap}`}
            strokeDashoffset={0}
            transform={`rotate(${sl.rotation} ${cx} ${cy})`}
          />
        ))}
        {/* Center total */}
        <text x={cx} y={cy - 8} className={styles.donutLabel}>
          {total}
        </text>
        <text x={cx} y={cy + 16} className={styles.donutSub}>
          total actions
        </text>
      </svg>
      <div className={styles.donutLegend}>
        {ACTION_BREAKDOWN.map((sl) => (
          <div key={sl.label} className={styles.donutLegendRow}>
            <span
              className={styles.legendSwatch}
              style={{ background: sl.color, flexShrink: 0 }}
            />
            <span>{sl.label}</span>
            <span className={styles.donutLegendVal}>{sl.value}</span>
            <span className={styles.donutLegendPct}>
              {Math.round((sl.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </figure>
  )
}
