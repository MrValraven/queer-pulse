import { useState } from 'react'
import { Button, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  SERVICES,
  INCIDENTS,
  UPTIME_SERVICES,
  STATUS_LABEL,
  type ServiceStatus,
} from './status.data'
import { ServiceCardSkeleton, IncidentSkeleton } from './StatusSkeletons'
import styles from './StatusComponents.module.css'

const PILL_CLASS: Record<ServiceStatus, string | undefined> = {
  op: styles.pillOp,
  deg: styles.pillDeg,
  out: styles.pillOut,
}

const DAYS = 90

function buildBars(name: string): string[] {
  return Array.from({ length: DAYS }, (_, i) => {
    if (name === 'Authentication' && i === 12) return 'partial'
    if (name === 'Messages' && i === 43) return 'partial'
    return 'op'
  })
}

export function StatusHero() {
  return (
    <section className={`${styles.hero} wrap`}>
      <div className={styles.overallBadge} aria-live="polite">
        <span className={styles.overallDot} aria-hidden />
        <span className={styles.overallLabel}>All systems operational</span>
      </div>
      <h1 className={styles.heroTitle}>
        Platform <em>status</em>
      </h1>
      <p className={styles.heroSub}>Updated just now · Refreshes every 60 s</p>
    </section>
  )
}

export function ServicesGrid() {
  const loading = useSimulatedLoad()
  return (
    <section className="wrap" style={{ paddingBottom: 60 }}>
      <p className={styles.sectionEye}>Services</p>
      <div className={styles.svcGrid} aria-busy={loading}>
        {loading
          ? Array.from({ length: SERVICES.length }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))
          : SERVICES.map((svc, i) => (
              <FadeIn key={svc.name} delay={Math.min(i, 8) * 60}>
                <div className={styles.svcCard}>
                  <div>
                    <div className={styles.svcName}>{svc.name}</div>
                    <div className={styles.svcDesc}>{svc.desc}</div>
                  </div>
                  <span className={`${styles.svcPill} ${PILL_CLASS[svc.status]}`}>
                    {STATUS_LABEL[svc.status]}
                  </span>
                </div>
              </FadeIn>
            ))}
      </div>
    </section>
  )
}

export function UptimeSection() {
  return (
    <section className="wrap" style={{ padding: '60px 0' }}>
      <p className={styles.sectionEye}>90-day uptime</p>
      {UPTIME_SERVICES.map((name) => {
        const bars = buildBars(name)
        const pct = ((bars.filter((b) => b === 'op').length / DAYS) * 100).toFixed(2)
        return (
          <div key={name}>
            <div className={styles.uptimeHead}>
              <span className={styles.uptimeName}>{name}</span>
              <span className={styles.uptimePct}>{pct}% uptime</span>
            </div>
            <div className={styles.uptimeBars}>
              {bars.map((bar, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (DAYS - i))
                const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                const tip =
                  bar === 'op'
                    ? `Operational — ${label}`
                    : bar === 'partial'
                      ? `Partial outage — ${label}`
                      : `Outage — ${label}`
                const cls = [
                  styles.ubar,
                  bar === 'partial' && styles.ubarPartial,
                  bar === 'down' && styles.ubarDown,
                ]
                  .filter(Boolean)
                  .join(' ')
                return <div key={i} className={cls} data-tip={tip} />
              })}
            </div>
          </div>
        )
      })}
      <div className={styles.uptimeAxis}>
        <span>90 days ago</span>
        <span>60 days ago</span>
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </section>
  )
}

export function IncidentsSection() {
  const loading = useSimulatedLoad()
  return (
    <section className="wrap" style={{ paddingBottom: 80 }}>
      <p className={styles.sectionEye}>Incident history</p>
      <div className={styles.incList} aria-busy={loading}>
        {loading
          ? Array.from({ length: INCIDENTS.length }).map((_, i) => (
              <IncidentSkeleton key={i} />
            ))
          : INCIDENTS.map((inc, i) => (
          <FadeIn
            key={inc.date + inc.title}
            delay={Math.min(i, 8) * 60}
            className={[styles.incItem, inc.resolved && styles.incItemResolved]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.incDot} aria-hidden>
              <svg
                width={14}
                height={14}
                viewBox="0 0 14 14"
                fill="none"
                stroke={inc.resolved ? 'var(--jade)' : 'rgba(45,27,61,.4)'}
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                {inc.resolved ? (
                  <polyline points="2,7 5.5,10.5 12,3.5" />
                ) : (
                  <circle cx={7} cy={7} r={5} />
                )}
              </svg>
            </div>
            <div>
              <div className={styles.incDate}>{inc.date}</div>
              <div className={styles.incTitle}>{inc.title}</div>
              <div className={styles.incText}>{inc.text}</div>
              <span
                className={[
                  styles.incTag,
                  inc.status === 'resolved' ? styles.incTagResolved : styles.incTagMonitoring,
                ].join(' ')}
              >
                {inc.status === 'resolved' ? 'Resolved' : 'Monitoring'}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

export function SubscribeStrip() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    showToast("You'll be notified during incidents.", 'success')
    setEmail('')
  }

  return (
    <div className="wrap">
      <div className={styles.subStrip}>
        <div>
          <h3>Get notified during incidents</h3>
          <p>One email when something breaks, one when it's fixed. Nothing else.</p>
        </div>
        <form className={styles.subForm} onSubmit={handleSubmit}>
          <input
            className={styles.subInput}
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </div>
  )
}
