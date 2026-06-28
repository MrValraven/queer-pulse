import { useMemo, useState } from 'react'
import { AdminSeg } from './ui'
import {
  QUARTERS,
  QUARTER_AXIS_MAX,
  QUARTER_GRIDLINES,
  QUARTER_RANGES,
} from './adminGovernance.data'
import styles from './AdminGovernancePage.module.css'

const W = 720
const H = 260
const PAD_L = 36
const PAD_R = 12
const PAD_T = 14
const PAD_B = 34

export function AdminGovernanceChart() {
  const [range, setRange] = useState('6Q')

  const data = useMemo(
    () => (range === '4Q' ? QUARTERS.slice(-4) : QUARTERS),
    [range],
  )

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const groupW = plotW / data.length
  const barW = Math.min(26, groupW * 0.3)
  const gap = 6
  const y = (v: number) => PAD_T + plotH - (v / QUARTER_AXIS_MAX) * plotH

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <div>
          <h2 className={styles.cardTitle}>
            Income vs spending <em>by quarter</em>
          </h2>
          <p className={styles.cardSub}>The gap is surplus — it goes straight to the reserve.</p>
        </div>
        <AdminSeg options={QUARTER_RANGES} value={range} onChange={setRange} />
      </div>

      <div className={styles.chartLegend}>
        <Legend swatch={styles.legIncome} label="Income" />
        <Legend swatch={styles.legSpend} label="Spending" />
        <Legend swatch={styles.legReserve} label="Surplus to reserve" dashed />
      </div>

      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Grouped bar chart of income versus spending per quarter, in thousands of euros"
        preserveAspectRatio="xMidYMid meet"
      >
        {QUARTER_GRIDLINES.map((g) => (
          <g key={g}>
            <line
              className={styles.chartGrid}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(g)}
              y2={y(g)}
            />
            <text className={styles.chartAxis} x={PAD_L - 8} y={y(g) + 3} textAnchor="end">
              {g}
            </text>
          </g>
        ))}

        {data.map((q, i) => {
          const cx = PAD_L + groupW * i + groupW / 2
          const incX = cx - barW - gap / 2
          const spX = cx + gap / 2
          return (
            <g key={q.label}>
              <rect
                className={`${styles.chartBar} ${styles.barIncome}`}
                x={incX}
                y={y(q.income)}
                width={barW}
                height={PAD_T + plotH - y(q.income)}
                rx={4}
                style={{ animationDelay: `${i * 60}ms` }}
              />
              <rect
                className={`${styles.chartBar} ${styles.barSpend}`}
                x={spX}
                y={y(q.spend)}
                width={barW}
                height={PAD_T + plotH - y(q.spend)}
                rx={4}
                style={{ animationDelay: `${i * 60 + 30}ms` }}
              />
              <text className={styles.chartLabel} x={cx} y={H - 12} textAnchor="middle">
                {q.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Legend({
  swatch,
  label,
  dashed = false,
}: {
  swatch: string
  label: string
  dashed?: boolean
}) {
  return (
    <span className={styles.legItem}>
      <span className={[styles.legSwatch, swatch, dashed && styles.legDashed].filter(Boolean).join(' ')} aria-hidden />
      {label}
    </span>
  )
}
