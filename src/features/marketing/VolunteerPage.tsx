import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { VOLUNTEER_OPPORTUNITIES as OPPS } from './volunteerOpportunities'
import m from './marketing.module.css'
import s from './VolunteerPage.module.css'

const FILTERS = [
  { f: 'all', label: 'All opportunities' },
  { f: 'low', label: 'Low commitment' },
  { f: 'medium', label: 'Medium commitment' },
  { f: 'Rights', label: 'LGBTQ+ Rights' },
  { f: 'Health', label: 'Health & Wellbeing' },
  { f: 'Youth', label: 'Youth' },
  { f: 'Housing', label: 'Housing' },
  { f: 'Arts', label: 'Arts & Culture' },
]

export function VolunteerPage() {
  const [filter, setFilter] = useState('all')

  const visible = useMemo(
    () =>
      OPPS.filter((o) => {
        if (filter === 'all') return true
        if (filter === 'low' || filter === 'medium') return o.commit === filter
        return o.cause === filter
      }),
    [filter],
  )

  return (
    <PageShell>
      <header className={`${m.hero} ${m.heroPlum}`}>
        <div className="wrap">
          <div className={m.eyebrow}>Volunteer</div>
          <h1 className={m.heroTitle}>
            Give your time to the <em>community</em> around you.
          </h1>
          <p className={m.heroSub}>You don't need to be an activist. You need two free hours and a willingness to show up. Below are organisations in Lisbon genuinely looking for people like you.</p>
          <div className={s.note}>
            <span className={s.dot} /> Every organisation below has been vetted by the QueerPulse community
          </div>
        </div>
      </header>

      <section className={s.body}>
        <div className="wrap">
          <div className={s.filters}>
            {FILTERS.map((f) => (
              <button key={f.f} className={[s.chip, filter === f.f && s.chipOn].filter(Boolean).join(' ')} onClick={() => setFilter(f.f)}>
                {f.label}
              </button>
            ))}
          </div>

          <div className={s.grid}>
            {visible.map((o) => (
              <div key={o.role} className={s.card}>
                <div className={s.org}>
                  <span className={s.orgAv} style={{ background: o.bg, color: o.color }}>
                    {o.av}
                  </span>
                  <div>
                    <div className={s.orgName}>{o.org}</div>
                    <div className={s.orgCause}>{o.cause}</div>
                  </div>
                </div>
                <div className={s.role}>{o.role}</div>
                <p className={s.desc}>{o.desc}</p>
                <div className={s.metaRow}>
                  <span className={`${s.commit} ${o.commit === 'low' ? s.commitGreen : s.commitAmber}`}>
                    {o.commit === 'low' ? 'Low commitment' : 'Medium commitment'}
                  </span>
                  <span className={s.metaPill}>{o.location}</span>
                </div>
                <div className={s.skills}>
                  {o.skills.map((sk) => (
                    <span key={sk} className={s.skill}>
                      #{sk}
                    </span>
                  ))}
                </div>
                <div className={s.cardFoot}>
                  <span className={s.time}>{o.time}</span>
                  <Link className={s.express} to={`/volunteer-opportunity/${o.slug}`}>
                    Express interest →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={m.outro}>
        <div className="wrap">
          <h2>
            Want to connect <em>more deeply?</em>
          </h2>
          <p>Find the change makers already working on the causes you care about.</p>
          <Button size="lg" to="/changemakers">
            Meet the change makers →
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
