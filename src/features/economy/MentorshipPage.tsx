import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { MENTORS, STATS, VOLUNTEER, type Mode } from './mentorship.data'
import { MentorMatchModal } from './MentorMatchModal'
import styles from './MentorshipPage.module.css'

export function MentorshipPage() {
  const [mode, setMode] = useState<Mode | null>(null)

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Mentorship</div>
          <h1>
            Someone ahead of you on the path <em>wants to help.</em>
          </h1>
          <p>
            Formal one-to-one mentorship matching between queer professionals in Lisbon. If you're
            finding it hard, someone in the network has been there. If you've made it through, you can
            give that back.
          </p>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.l}>
                <div className={styles.msN}>{s.n}</div>
                <div className={styles.msL}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.choose}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              What brings you <em>here?</em>
            </h2>
          </div>
          <div className={styles.chooseGrid}>
            <button type="button" className={styles.chooseCard} onClick={() => setMode('mentee')}>
              <div className={styles.ccIcon}>🌱</div>
              <div className={styles.ccTitle}>I'm looking for a mentor</div>
              <p className={styles.ccDesc}>
                You're navigating something — a career transition, a creative block, coming out
                professionally, a difficult workplace, a new city. You'd benefit from talking to
                someone who's been through it.
              </p>
              <div className={styles.ccFor}>For: anyone at any stage who could use some guidance →</div>
            </button>
            <button type="button" className={styles.chooseCard} onClick={() => setMode('mentor')}>
              <div className={styles.ccIcon}>🌳</div>
              <div className={styles.ccTitle}>I can be a mentor</div>
              <p className={styles.ccDesc}>
                You've been through enough to have something to offer. You don't need to be an expert
                — you just need to have navigated something that someone else is currently navigating.
              </p>
              <div className={styles.ccFor}>For: members with experience they're willing to share →</div>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.mentorsStrip}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Current mentors in <em>the network</em>
            </h2>
            <div className={styles.sub}>
              These members have opened themselves up to mentoring. You can request a match through
              the form above.
            </div>
          </div>
          <div className={styles.mentorGrid}>
            {MENTORS.map((m) => (
              <Link to={`${routes.mentorship}/${m.slug}`} className={styles.mentorCard} key={m.slug}>
                <div className={styles.mcTop}>
                  <div className={styles.mcAv} style={{ background: m.bg, color: m.color }}>
                    {m.initials}
                  </div>
                  <div>
                    <div className={styles.mcName}>{m.name}</div>
                    <div className={styles.mcRole}>{m.role}</div>
                  </div>
                </div>
                <div className={styles.mcAreas}>
                  {m.areas.map((a) => (
                    <span key={a} className={styles.mcArea}>
                      {a}
                    </span>
                  ))}
                </div>
                <div className={`${styles.mcCap} ${m.btn === 'Join waitlist' ? styles.mcCapWait : ''}`}>
                  {m.cap}
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.mcConnect}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMode('mentee')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setMode('mentee')
                    }
                  }}
                >
                  {m.btn}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Have something <em>to give?</em></>}
        sub="Mentorship is one way. Browse volunteer opportunities to find other ways to contribute to the community around you."
      >
        <Button to={VOLUNTEER} variant="primary" size="lg">
          See volunteer roles →
        </Button>
      </Outro>

      {mode && <MentorMatchModal mode={mode} onClose={() => setMode(null)} />}
    </PageShell>
  )
}
