import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import m from './marketing.module.css'
import s from './VolunteerPage.module.css'

interface Opp {
  org: string
  av: string
  bg: string
  color: string
  role: string
  cause: string
  commit: 'low' | 'medium'
  time: string
  location: string
  skills: string[]
  desc: string
}

const OPPS: Opp[] = [
  { org: 'ILGA Portugal', av: 'IL', bg: 'rgba(74,140,111,.14)', color: 'var(--jade)', role: 'Community Outreach Volunteer', cause: 'Rights', commit: 'low', time: '2–4 hrs/week', location: 'In-person · Lisbon', skills: ['Communication', 'Languages', 'Event support'], desc: 'Help ILGA reach more people through community events, tabling, and direct outreach. No experience necessary — training provided on day one.' },
  { org: 'Opus Diversus', av: 'OD', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', role: 'Mental Health Peer Support', cause: 'Health', commit: 'medium', time: '4 hrs/week', location: 'In-person · Lisbon', skills: ['Active listening', 'Empathy', 'Confidentiality'], desc: "Support people through peer-led mental health conversations. Training provided — you don't need to be a professional. You need to care and to listen well." },
  { org: 'Rede ex aequo', av: 'RA', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', role: 'Youth Group Co-facilitator', cause: 'Youth', commit: 'medium', time: '3–5 hrs/week', location: 'Lisbon · Evenings', skills: ['Facilitation', 'Youth work', 'Care'], desc: 'Co-facilitate weekly peer support groups for LGBTQ+ young people. Showing up consistently is the most important thing you can do.' },
  { org: 'Panteras Rosa', av: 'PR', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)', role: 'Campaign Communications', cause: 'Rights', commit: 'low', time: '2–3 hrs/week', location: 'Remote or in-person', skills: ['Writing', 'Graphic design', 'Social media'], desc: 'Help craft communications for trans rights campaigns. Writing, social, design — bring what you have. Fully flexible and mostly remote.' },
  { org: 'Queer Housing Justice Network', av: 'HJ', bg: 'rgba(122,82,184,.1)', color: '#7A52B8', role: 'Community Housing Advocate', cause: 'Housing', commit: 'low', time: '2–3 hrs/week', location: 'In-person · Mouraria', skills: ['Listening', 'Documentation', 'Organising'], desc: "Support queer residents navigating housing challenges — documenting situations, connecting people with legal aid, attending community meetings." },
  { org: 'Rainbow Arts Collective', av: 'RA', bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)', role: 'Event Production Support', cause: 'Arts', commit: 'low', time: 'Project by project', location: 'In-person · Lisbon', skills: ['Event logistics', 'Hospitality', 'Photography'], desc: 'Help set up and run exhibitions, crits, and group shows. Event-by-event commitment — pick the ones that work for you.' },
  { org: 'QueerPulse', av: 'QP', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', role: 'Events & Gatherings Volunteer', cause: 'Arts', commit: 'low', time: 'Event by event', location: 'In-person · Lisbon', skills: ['Organisation', 'Hospitality', 'People skills'], desc: 'Help set up, run, and support QueerPulse member gatherings. Every event needs someone making it feel warm. Flexible commitment, instant community.' },
]

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
  const { showToast } = useToast()
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
                  <button className={s.express} onClick={() => showToast(`Interest sent to ${o.org} — they'll be in touch`, 'success')}>
                    Express interest →
                  </button>
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
