import {
  REPORT_WEEKS,
  REPORT_SERIES,
  MEMBER_GROWTH,
  RESPONSE_DIST,
} from './adminDashboard.data'
import styles from './AdminDashboardPage.module.css'

// ── 1 · Reports by type (stacked bar) ───────────────────────────────────────

export function ReportsByTypeChart() {
  const W = 640, H = 240, padL = 34, padB = 30, padT = 12
  const gw = W - padL - 10, gh = H - padB - padT
  const max = 14
  const colW = gw / REPORT_WEEKS.length
  const bw = colW * 0.52

  return (
    <figure className={styles.chartCard}>
      <div className={styles.chHead}>
        <div>
          <div className={styles.chTitle}>Reports by type</div>
          <div className={styles.chSub}>Last 8 weeks · weekly volume</div>
        </div>
        <div className={styles.chLegend}>
          {REPORT_SERIES.map((s) => (
            <span key={s.key} className={styles.chLeg}>
              <span className={styles.chSw} style={{ background: s.color }} />
              {s.key}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Stacked weekly reports by type">
        {[0, 4, 8, 12].map((v) => {
          const y = padT + gh - (v / max) * gh
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - 6} y2={y} stroke="rgba(45,27,61,.08)" strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" className={styles.chAxisSerif}>{v}</text>
            </g>
          )
        })}
        {REPORT_WEEKS.map((wk, i) => {
          const x = padL + (i + 0.5) * colW - bw / 2
          let acc = 0
          const recent = i >= REPORT_WEEKS.length - 2
          return (
            <g key={wk.week}>
              {wk.values.map((val, si) => {
                if (val === 0) return null
                const bh = (val / max) * gh
                const y = padT + gh - acc - bh
                acc += bh
                return (
                  <rect
                    key={si}
                    className={styles.barSeg}
                    x={x}
                    y={y}
                    width={bw}
                    height={bh}
                    fill={REPORT_SERIES[si].color}
                    style={{ animationDelay: `${i * 55 + si * 20}ms` }}
                  />
                )
              })}
              <text
                x={padL + (i + 0.5) * colW}
                y={H - 10}
                textAnchor="middle"
                className={recent ? styles.chLabelStrong : styles.chLabel}
              >
                {wk.week}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

// ── 2 · Member growth (line) ────────────────────────────────────────────────

function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }
  return d
}

export function MemberGrowthChart() {
  const W = 360, H = 220, padL = 8, padR = 8, padT = 14, padB = 26
  const gw = W - padL - padR, gh = H - padT - padB
  const max = 560
  const n = MEMBER_GROWTH.length
  const px = (i: number) => padL + i * (gw / (n - 1))
  const py = (v: number) => padT + gh - (v / max) * gh
  const joined = MEMBER_GROWTH.map((p, i): [number, number] => [px(i), py(p.joined)])
  const churned = MEMBER_GROWTH.map((p, i): [number, number] => [px(i), py(p.churned)])
  const area = `${smoothPath(joined)} L${joined[n - 1][0]} ${padT + gh} L${joined[0][0]} ${padT + gh} Z`
  const spikeIdx = MEMBER_GROWTH.findIndex((p) => p.spike)
  const spike = joined[spikeIdx]

  return (
    <figure className={styles.chartCard}>
      <div className={styles.chTitle}>Member growth</div>
      <div className={styles.chSub}>Joined vs churned · with Pride spike</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Member growth line chart">
        {[0, 140, 280, 420, 560].map((v) => (
          <line key={v} x1={padL} y1={py(v)} x2={W - padR} y2={py(v)} stroke="rgba(45,27,61,.07)" strokeWidth={1} />
        ))}
        <path d={area} fill="rgba(var(--jade-rgb),.10)" />
        <path
          d={smoothPath(churned)}
          fill="none"
          stroke="var(--accent-ink)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 5"
        />
        <path
          className={styles.lineDraw}
          d={smoothPath(joined)}
          pathLength={1}
          fill="none"
          stroke="var(--jade)"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {spike && (
          <>
            <circle cx={spike[0]} cy={spike[1]} r={5} fill="var(--accent)" stroke="var(--paper)" strokeWidth={2} />
            <text x={spike[0]} y={spike[1] - 12} textAnchor="middle" className={styles.chSpike}>Pride</text>
          </>
        )}
        {MEMBER_GROWTH.map((p, i) =>
          p.month ? (
            <text key={i} x={px(i)} y={H - 8} textAnchor="middle" className={styles.chLabel}>{p.month}</text>
          ) : null,
        )}
      </svg>
      <div className={styles.chLegend}>
        <span className={styles.chLeg}><span className={styles.chSwDot} style={{ background: 'var(--jade)' }} />Joined</span>
        <span className={styles.chLeg}><span className={styles.chSwDot} style={{ background: 'var(--accent-ink)' }} />Churned</span>
      </div>
    </figure>
  )
}

// ── 3 · Response time (distribution) ────────────────────────────────────────

export function ResponseTimeChart() {
  const W = 360, H = 220, padL = 8, padR = 8, padT = 14, padB = 30
  const gw = W - padL - padR, gh = H - padT - padB
  const max = 80
  const slaIdx = RESPONSE_DIST.findIndex((b) => b.overSla)
  const colW = gw / RESPONSE_DIST.length
  const bw = colW * 0.6
  const slaX = padL + slaIdx * colW

  return (
    <figure className={styles.chartCard}>
      <div className={styles.chTitle}>Response time</div>
      <div className={styles.chSub}>Distribution · this month</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Moderation response distribution">
        {[0, 40, 80].map((v) => {
          const y = padT + gh - (v / max) * gh
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(45,27,61,.07)" strokeWidth={1} />
              <text x={padL} y={y - 4} className={styles.chAxisSerif}>{v}</text>
            </g>
          )
        })}
        {RESPONSE_DIST.map((b, i) => {
          const bh = (b.value / max) * gh
          const x = padL + (i + 0.5) * colW - bw / 2
          const y = padT + gh - bh
          return (
            <g key={b.label}>
              <rect
                className={styles.barSeg}
                x={x}
                y={y}
                width={bw}
                height={bh}
                rx={6}
                fill={b.overSla ? 'var(--amber)' : 'var(--jade)'}
                opacity={b.overSla ? 0.92 : 1}
                style={{ animationDelay: `${i * 55}ms` }}
              />
              <text x={padL + (i + 0.5) * colW} y={H - 12} textAnchor="middle" className={styles.chLabel}>{b.label}</text>
            </g>
          )
        })}
        <line x1={slaX} y1={padT - 2} x2={slaX} y2={padT + gh} stroke="var(--danger)" strokeWidth={1.4} strokeDasharray="4 4" opacity={0.6} />
        <text x={slaX + 5} y={padT + 8} className={styles.chSla}>6h SLA</text>
      </svg>
      <div className={styles.chLegend}>
        <span className={styles.chLeg}><span className={styles.chSw} style={{ background: 'var(--jade)' }} />Within SLA</span>
        <span className={styles.chLeg}><span className={styles.chSw} style={{ background: 'var(--amber)' }} />Over 6h</span>
      </div>
    </figure>
  )
}
