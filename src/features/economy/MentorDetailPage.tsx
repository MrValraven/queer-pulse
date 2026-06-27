import { Link, Navigate, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { MENTORS } from './mentorship.data'
import { MentorDetailSkeleton } from './MentorDetailSkeleton'
import styles from './MentorDetailPage.module.css'

export function MentorDetailPage() {
  const { slug } = useParams()
  const idx = MENTORS.findIndex((m) => m.slug === slug)
  const loading = useSimulatedLoad()
  if (idx === -1) return <Navigate to={routes.mentorship} replace />

  const m = MENTORS[idx]
  const prev = MENTORS[(idx - 1 + MENTORS.length) % MENTORS.length]
  const next = MENTORS[(idx + 1) % MENTORS.length]
  const first = m.name.split(' ')[0]
  const base = routes.mentorship

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={base} className={styles.back}>
          ← All mentors
        </Link>

        <div className={styles.cycle}>
          <Link to={`${base}/${prev.slug}`} className={styles.cycleBtn}>
            <span className={styles.cycleDir}>← Previous</span>
            <span className={styles.cycleName}>{prev.name}</span>
          </Link>
          <span className={styles.cyclePos}>
            {idx + 1} of {MENTORS.length}
          </span>
          <Link to={`${base}/${next.slug}`} className={`${styles.cycleBtn} ${styles.next}`}>
            <span className={styles.cycleDir}>Next →</span>
            <span className={styles.cycleName}>{next.name}</span>
          </Link>
        </div>

        {loading ? (
          <MentorDetailSkeleton />
        ) : (
          <FadeIn>
        <header className={styles.header}>
          <div className={styles.av} style={{ background: m.bg, color: m.color }}>
            {m.initials}
          </div>
          <div>
            <h1 className={styles.name}>{m.name}</h1>
            <div className={styles.role}>
              {m.pronouns} · {m.role}
            </div>
            <p className={styles.quote}>“{m.quote}”</p>
            <div className={styles.pills}>
              {m.areas.map((a) => (
                <span key={a} className={styles.pill}>
                  {a}
                </span>
              ))}
            </div>
            <span className={styles.cap}>{m.cap}</span>
          </div>
        </header>

        <section className={styles.sec}>
          <h2 className={styles.secTitle}>
            Why {first} is a <em>great mentor</em>
          </h2>
          <p className={styles.text}>{m.why}</p>
        </section>

        <section className={styles.sec}>
          <h2 className={styles.secTitle}>
            What they <em>charge</em>
          </h2>
          <div className={styles.chargeCard}>
            <div className={styles.chargeLabel}>Cost</div>
            <p className={styles.chargeText}>{m.charge}</p>
          </div>
        </section>

        <section className={styles.sec}>
          <h2 className={styles.secTitle}>
            Are you a <em>good fit?</em>
          </h2>
          <div className={styles.fitGrid}>
            <div className={`${styles.fit} ${styles.fitFor}`}>
              <div className={styles.fitH}>You'd be a fit if…</div>
              <ul className={styles.fitList}>
                {m.fitFor.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.fit} ${styles.fitNot}`}>
              <div className={styles.fitH}>Maybe not if…</div>
              <ul className={styles.fitList}>
                {m.fitNot.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.sec}>
          <div className={styles.reachCard}>
            <h2>
              How to <em>reach out</em>
            </h2>
            <p className={styles.reachText}>{m.reach}</p>
            <div className={styles.reachActions}>
              <Button to={base} variant="primary">
                {m.btn} →
              </Button>
              <Button to={routes.messages} variant="ghost-dark">
                Message {first}
              </Button>
            </div>
          </div>
        </section>

        <div className={styles.cycle} style={{ marginBottom: 0 }}>
          <Link to={`${base}/${prev.slug}`} className={styles.cycleBtn}>
            <span className={styles.cycleDir}>← Previous</span>
            <span className={styles.cycleName}>{prev.name}</span>
          </Link>
          <span className={styles.cyclePos}>
            {idx + 1} of {MENTORS.length}
          </span>
          <Link to={`${base}/${next.slug}`} className={`${styles.cycleBtn} ${styles.next}`}>
            <span className={styles.cycleDir}>Next →</span>
            <span className={styles.cycleName}>{next.name}</span>
          </Link>
        </div>
          </FadeIn>
        )}
      </div>
    </PageShell>
  )
}
