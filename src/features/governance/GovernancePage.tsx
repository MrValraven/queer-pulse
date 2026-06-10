import { useEffect, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './GovernancePage.module.css'

const NAV = [
  { id: 'health', label: 'Community health' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'council', label: 'Advisory council' },
  { id: 'principles', label: 'Principles' },
  { id: 'finances', label: 'Finances' },
  { id: 'decisions', label: 'Decision log' },
  { id: 'raise', label: 'Raise a concern' },
]

const HEALTH = [
  { n: '247', l: 'Active members', trend: '↑ 38 this quarter', up: true },
  { n: '96%', l: 'Member retention rate', trend: 'Steady', up: false },
  { n: '12', l: 'Reports filed this quarter', trend: 'All resolved', up: false },
  { n: '3', l: 'Members removed', trend: 'Code of care violations', up: false },
  { n: '34', l: 'Gatherings hosted', trend: '↑ 8 vs Q1', up: true },
  { n: '1', l: 'Moderation appeal upheld', trend: 'of 2 filed', up: false },
]

const STEPS = [
  { title: 'Report filed', text: 'Any member can report another member, a gathering, a board post, or any content. Reports are confidential — the reported person is not told who filed the report.' },
  { title: 'Review within 48 hours', text: 'The moderation team reviews the report within 48 hours. For urgent safety issues, same-day. The person who filed is updated at each stage.' },
  { title: 'Decision and communication', text: 'Possible outcomes: no action (with explanation), direct communication, warning, temporary suspension, permanent removal. The reported person is informed of the outcome but not the reporter.' },
  { title: 'Right to appeal', text: 'Any member can appeal a moderation decision within 14 days. Appeals are reviewed by the advisory council, not the original team. The outcome is final.' },
]

const COUNCIL = [
  { i: 'ML', name: 'Mariana Loução', role: 'Psychologist · Chair', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)' },
  { i: 'RB', name: 'Raquel Baptista', role: 'Lawyer · Legal advisor', bg: 'rgba(122,82,184,.12)', color: '#7A52B8' },
  { i: 'CV', name: 'Catarina Vaz', role: 'Housing activist', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)' },
  { i: 'JF', name: 'Jonas Ferreira', role: 'Healthcare advocate', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)' },
]

const PRINCIPLES = [
  { icon: '🔒', title: 'We will never sell member data', text: 'Member data is used only to run the platform. We never share, sell, or use it for advertising.' },
  { icon: '👁️', title: 'Visibility is always your choice', text: 'You control who can see your profile, posts, and activity. Defaults are conservative.' },
  { icon: '🚫', title: 'No algorithms deciding who you see', text: 'No engagement algorithm. Members are not ranked. You see what you choose to see.' },
  { icon: '💬', title: 'Community has a voice in decisions', text: 'Significant changes are discussed in the Forum before implementation; proposals go to the council.' },
  { icon: '📖', title: 'Transparency is non-negotiable', text: 'Quarterly health reports. Published moderation stats. Council meetings summarised publicly.' },
  { icon: '♿', title: 'Access is not conditional on ability to pay', text: 'A sliding scale for all paid gatherings. No one is excluded for financial circumstances.' },
]

const FIN_STATS = [
  { n: '€4,620', l: 'Total income this quarter', trend: '↑ €380 vs Q1', up: true },
  { n: '€4,150', l: 'Total expenditure', trend: 'Within budget', up: false },
  { n: '€470', l: 'Quarterly surplus', trend: 'Added to reserve', up: false },
  { n: '28', l: 'Members on free or reduced access', trend: 'No questions asked', up: false },
]

interface FinLine {
  label: string
  amount: string
  note: string
  width: number
  items: { name: string; period: string; amount: string }[]
  total: { label: string; amount: string }
}

const INCOME: FinLine[] = [
  { label: 'Member contributions', amount: '€1,840', note: 'Sliding scale €5–€25/month. 99 of 247 members contribute. No one is required to.', width: 80, items: [{ name: 'Pay-what-you-can tier (€5–€9/mo)', period: '28 members', amount: '€504' }, { name: 'Standard tier (€10–€14/mo)', period: '38 members', amount: '€836' }, { name: 'Supporter tier (€15–€25/mo)', period: '33 members', amount: '€500' }], total: { label: '99 contributing members', amount: '€1,840' } },
  { label: 'Gathering ticket sales', amount: '€2,180', note: 'Net figure. QueerPulse takes 0% of ticket revenue — 100% goes to hosts. Covers only events we organise ourselves.', width: 94, items: [{ name: 'Newcomer welcome dinner (April)', period: '26 × €8', amount: '€208' }, { name: 'Community skills fair (April)', period: '45 × €12', amount: '€540' }, { name: 'Queer cinema nights × 2', period: '38 × €10', amount: '€380' }, { name: 'Summer community dinner (June)', period: '47 × €18', amount: '€846' }, { name: 'Misc', period: '—', amount: '€206' }], total: { label: '6 platform-run events', amount: '€2,180' } },
  { label: 'Partner support', amount: '€600', note: 'Restricted grants from two organisations. Neither has any influence over platform decisions.', width: 26, items: [{ name: 'Fundação Calouste Gulbenkian', period: 'Mental Health Fund', amount: '€400' }, { name: 'ILGA Portugal', period: 'Community events', amount: '€200' }], total: { label: '2 partners · restricted use', amount: '€600' } },
]

const EXPENSE: FinLine[] = [
  { label: 'Platform & tools', amount: '€520', note: 'Hosting, email, storage, dev tools. Open-source where possible.', width: 26, items: [{ name: 'Web server (Hetzner)', period: '€20/mo', amount: '€60' }, { name: 'Managed PostgreSQL', period: '€28/mo', amount: '€84' }, { name: 'Email sending (Postmark)', period: '€24/mo', amount: '€72' }, { name: 'Storage, security, CI, misc', period: '—', amount: '€304' }], total: { label: '11 line items', amount: '€520' } },
  { label: 'Community events', amount: '€1,240', note: 'Venue hire, equipment, materials for platform-organised gatherings.', width: 60, items: [{ name: 'Newcomer dinner — venue + food', period: 'April', amount: '€400' }, { name: 'Skills fair — venue (LX Factory)', period: 'April', amount: '€280' }, { name: 'Queer cinema nights × 2', period: 'May–June', amount: '€180' }, { name: 'Other rooms & supplies', period: '—', amount: '€380' }], total: { label: '9 line items · 7 events subsidised', amount: '€1,240' } },
  { label: 'Mental health fund', amount: '€740', note: 'Subsidised therapy sessions. Partly funded by the Gulbenkian grant. 11 sessions this quarter.', width: 36, items: [{ name: 'Individual therapy subsidies (8)', period: 'avg €46', amount: '€368' }, { name: 'Group therapy × 3', period: '€90/session', amount: '€270' }, { name: 'Crisis support disbursements (2)', period: '€51 each', amount: '€102' }], total: { label: '11 sessions · 10 members', amount: '€740' } },
  { label: 'Micro-grants', amount: '€800', note: 'Direct support to members for community projects, emergencies, and creative work. 6 grants this quarter.', width: 38, items: [{ name: 'Housing emergency support', period: '—', amount: '€200' }, { name: 'Creative project (documentary)', period: '—', amount: '€150' }, { name: 'Trans healthcare travel', period: '—', amount: '€120' }, { name: 'Events, training, relocation', period: '—', amount: '€330' }], total: { label: '6 grants awarded', amount: '€800' } },
  { label: 'Moderator honoraria', amount: '€470', note: 'Small quarterly payments to our three volunteer moderators. Moderation is difficult work.', width: 22, items: [{ name: 'Mariana — lead moderator', period: 'Q2', amount: '€200' }, { name: 'Rui — moderator', period: 'Q2', amount: '€150' }, { name: 'Ana — moderator (part-time)', period: 'Q2', amount: '€120' }], total: { label: '3 moderators', amount: '€470' } },
]

const EVENTS = [
  ['Hosts keep 100% of ticket sales.', 'QueerPulse charges no platform fee. Sell 20 tickets at €8, you receive €160.'],
  ['Sliding scale is mandatory.', 'Every paid gathering must offer a reduced rate. Members request it privately, no explanation asked.'],
  ['QueerPulse subsidises specific event types.', 'Newcomer, mental health, and education events can apply for a venue subsidy. We covered 7 this quarter.'],
  ['No paid promotion.', 'Events are never ranked by payment. Only recency and community engagement affect visibility.'],
  ['This quarter:', '34 gatherings hosted. ~€8,400 in ticket revenue — all of which went directly to hosts.'],
]

const DECISIONS = [
  ['May 2026 — Sliding scale introduced for gatherings.', 'Following a forum discussion by Catarina Vaz, the council agreed to implement a sliding scale for all paid gatherings. 23 members participated.'],
  ['April 2026 — Forum launched.', 'Following member requests for a place to discuss longer-form topics. Categories and guidelines co-designed with 12 members over three weeks.'],
  ['March 2026 — Visibility defaults made more conservative.', 'New members now default to "network only" instead of "open", and can open up when comfortable.'],
  ['February 2026 — Language toggle added.', 'PT/EN toggle added to all pages following requests from Portuguese-speaking members.'],
]

function FinanceRow({ line, color }: { line: FinLine; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={[styles.finLine, open && styles.finLineOpen].filter(Boolean).join(' ')}>
      <button type="button" className={styles.finSummary} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <div className={styles.finLineTop}>
          <span className={styles.finLineLabel}>{line.label}</span>
          <span className={styles.finLineRight}>
            <span className={styles.finLineAmount}>{line.amount}</span>
            <span className={styles.finChevron}>▾</span>
          </span>
        </div>
        <div className={styles.finLineNote}>{line.note}</div>
        <div className={styles.finTrack}>
          <div className={styles.finFill} style={{ width: `${line.width}%`, background: color }} />
        </div>
      </button>
      <div className={styles.finDetailWrap}>
        <div className={styles.finDetailInner}>
          <div className={styles.finDetail}>
            {line.items.map((it) => (
              <div key={it.name} className={styles.finDetailItem}>
                <span>{it.name}</span>
                <span className={styles.fdiPeriod}>{it.period}</span>
                <span className={styles.fdiAmount}>{it.amount}</span>
              </div>
            ))}
            <div className={styles.finDetailTotal}>
              <span>{line.total.label}</span>
              <span>{line.total.amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinanceLines({ lines, color, total }: { lines: FinLine[]; color: string; total: string }) {
  return (
    <>
      {lines.map((line) => (
        <FinanceRow key={line.label} line={line} color={color} />
      ))}
      <div className={styles.finTotalLine}>
        <span className={styles.finTotalLabel}>{total}</span>
      </div>
    </>
  )
}

export function GovernancePage() {
  const { showToast } = useToast()
  const [active, setActive] = useState('health')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140
      for (const { id } of NAV) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Governance &amp; Transparency</div>
          <h1>
            How we run this, and who <em>decides.</em>
          </h1>
          <p>
            QueerPulse is a community platform. That means being transparent about how it's
            governed, how decisions are made, and what happens when things go wrong. This page is
            that record.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <nav className={styles.nav}>
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={[styles.navItem, active === item.id && styles.navItemActive].filter(Boolean).join(' ')}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className={styles.content}>
              {/* Health */}
              <Reveal as="section" className={styles.section} id="health">
                <div className={styles.eye}>Q2 2026 Community Health Report</div>
                <h2 className={styles.secH}>
                  The <em>numbers,</em> honestly.
                </h2>
                <div className={styles.statGrid}>
                  {HEALTH.map((s) => (
                    <div key={s.l} className={styles.statCard}>
                      <div className={styles.statN}>{s.n}</div>
                      <div className={styles.statL}>{s.l}</div>
                      <div className={[styles.statTrend, s.up ? styles.trendUp : styles.trendOk].join(' ')}>{s.trend}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.prose}>
                  <p>Twelve reports were filed this quarter. All were reviewed within 48 hours. Three resulted in member removal (repeated Code of Care violations after warning). Eight were resolved with direct communication and no formal action.</p>
                  <p>Two moderation appeals were filed. One was upheld — we had made the wrong call and reversed it. We publish this because transparency is how trust gets built.</p>
                </div>
              </Reveal>

              {/* Moderation */}
              <Reveal as="section" className={styles.section} id="moderation">
                <div className={styles.eye}>How moderation works</div>
                <h2 className={styles.secH}>
                  What happens when something <em>goes wrong.</em>
                </h2>
                <div className={styles.prose}>
                  <p>QueerPulse is moderated by a small team of members who agreed to take on this role. They are accountable to the advisory council, and their decisions can be appealed.</p>
                </div>
                <div className={styles.steps}>
                  {STEPS.map((s, i) => (
                    <div key={s.title} className={styles.step}>
                      <div className={styles.stepNum}>{i + 1}</div>
                      <div>
                        <div className={styles.stepTitle}>{s.title}</div>
                        <div className={styles.stepText}>{s.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.prose} style={{ marginTop: 16 }}>
                  <p>
                    <strong>What we won't tolerate:</strong> Any behaviour that makes a member feel
                    unsafe or unwelcome on the basis of their identity, body, or background.
                    Harassment of any form. Commercial solicitation without permission. Violation of
                    another member's privacy.
                  </p>
                </div>
              </Reveal>

              {/* Council */}
              <Reveal as="section" className={styles.section} id="council">
                <div className={styles.eye}>Advisory council</div>
                <h2 className={styles.secH}>
                  Who <em>oversees</em> this.
                </h2>
                <div className={styles.prose}>
                  <p>The advisory council reviews moderation appeals, proposes platform changes, and serves as an accountability layer. Members serve one-year terms and can be removed by a two-thirds community vote.</p>
                </div>
                <div className={styles.acList}>
                  {COUNCIL.map((m) => (
                    <div key={m.name} className={styles.acItem}>
                      <div className={styles.acAv} style={{ background: m.bg, color: m.color }}>
                        {m.i}
                      </div>
                      <div>
                        <div className={styles.acName}>{m.name}</div>
                        <div className={styles.acRole}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Principles */}
              <Reveal as="section" className={styles.section} id="principles">
                <div className={styles.eye}>Platform principles</div>
                <h2 className={styles.secH}>
                  What this platform <em>will and won't do.</em>
                </h2>
                <div className={styles.prinList}>
                  {PRINCIPLES.map((p) => (
                    <div key={p.title} className={styles.prinItem}>
                      <span className={styles.prinIcon}>{p.icon}</span>
                      <div>
                        <div className={styles.prinTitle}>{p.title}</div>
                        <div className={styles.prinText}>{p.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Finances */}
              <Reveal as="section" className={styles.section} id="finances">
                <div className={styles.eye}>Q2 2026 · Financial transparency</div>
                <h2 className={styles.secH}>
                  What it costs, what comes in, <em>where it goes.</em>
                </h2>
                <div className={styles.prose}>
                  <p>We publish our finances every quarter. QueerPulse is funded by the people who use it, and those people deserve to know exactly how money is raised and spent. No investor interests. No growth targets. No exit plan.</p>
                </div>
                <div className={styles.statGrid} style={{ gridTemplateColumns: 'repeat(2,1fr)', marginTop: 24 }}>
                  {FIN_STATS.map((s) => (
                    <div key={s.l} className={styles.statCard}>
                      <div className={styles.statN}>{s.n}</div>
                      <div className={styles.statL}>{s.l}</div>
                      <div className={[styles.statTrend, s.up ? styles.trendUp : styles.trendOk].join(' ')}>{s.trend}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.finCols}>
                  <div>
                    <div className={styles.finColHead}>Where money comes from</div>
                    <p className={styles.finHint}>Click any row to see the full breakdown.</p>
                    <FinanceLines lines={INCOME} color="var(--jade)" total="Total income · €4,620" />
                  </div>
                  <div>
                    <div className={styles.finColHead}>Where money goes</div>
                    <p className={styles.finHint}>Click any row to see the full breakdown.</p>
                    <FinanceLines lines={EXPENSE} color="var(--accent)" total="Total expenditure · €4,150" />
                  </div>
                </div>

                <div className={styles.eventsCard}>
                  <div className={styles.fecTitle}>How event finances work</div>
                  {EVENTS.map(([strong, rest]) => (
                    <div key={strong} className={styles.fecRow}>
                      <span className={styles.fecDot} />
                      <span>
                        <strong>{strong}</strong> {rest}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.prose} style={{ marginTop: 28 }}>
                  <p>
                    <strong>What we do with the surplus.</strong> Quarterly surpluses go into an
                    operational reserve. Our target is three months of running costs — ~€12,450.
                  </p>
                  <div className={styles.reserveBar}>
                    <div className={styles.reserveFill} />
                  </div>
                  <p className={styles.reserveCap}>Operational reserve: €4,380 of €12,450 target</p>
                  <p>Once we reach the target, additional surplus is redirected in full to the community micro-grants fund. We do not accumulate capital. We redistribute it.</p>
                </div>
                <div className={styles.partnerRow}>
                  <div className={styles.partnerName}>Fundação Calouste Gulbenkian</div>
                  <div className={styles.partnerBody}>€400 · Restricted to the Mental Health Fund. No editorial, governance, or platform influence.</div>
                </div>
                <div className={styles.partnerRow}>
                  <div className={styles.partnerName}>ILGA Portugal</div>
                  <div className={styles.partnerBody}>€200 · Restricted to community events. No editorial, governance, or platform influence.</div>
                </div>
                <div className={styles.prose}>
                  <p>We do not accept funding from corporations, brands, or government bodies whose interests could conflict with community autonomy. If that ever changes, we'll say so here first — and the community will vote on it.</p>
                </div>
              </Reveal>

              {/* Decision log */}
              <Reveal as="section" className={styles.section} id="decisions">
                <div className={styles.eye}>Recent decisions</div>
                <h2 className={styles.secH}>
                  What changed and <em>why.</em>
                </h2>
                <div className={styles.prose}>
                  {DECISIONS.map(([strong, rest]) => (
                    <p key={strong}>
                      <strong>{strong}</strong> {rest}
                    </p>
                  ))}
                </div>
              </Reveal>

              {/* Raise a concern */}
              <Reveal as="section" className={styles.section} id="raise">
                <div className={styles.eye}>Raise a concern</div>
                <h2 className={styles.secH}>
                  Something isn't <em>right?</em> Tell us.
                </h2>
                <div className={styles.prose}>
                  <p>Use this form to report a member, a piece of content, a platform decision, or a concern about how QueerPulse is run. All submissions are confidential and reviewed within 48 hours.</p>
                </div>
                <div className={styles.raiseCard}>
                  <div className={styles.rcTitle}>Submit a concern</div>
                  <p className={styles.rcText}>Your identity is kept confidential. You'll receive a confirmation within 48 hours and an update when the matter is resolved.</p>
                  <form
                    className={styles.rcForm}
                    onSubmit={(e) => {
                      e.preventDefault()
                      showToast("Submitted — we'll be in touch within 48 hours", 'success')
                    }}
                  >
                    <select className={styles.rcSelect} defaultValue="">
                      <option value="" disabled>
                        What kind of concern?
                      </option>
                      <option>Report a member or behaviour</option>
                      <option>Report a gathering or event</option>
                      <option>Content or platform issue</option>
                      <option>Moderation decision I want to appeal</option>
                      <option>Something else</option>
                    </select>
                    <textarea className={styles.rcTextarea} placeholder="Describe what happened, or what's wrong, in as much detail as you're comfortable with…" />
                    <input className={styles.rcInput} type="email" placeholder="Your email (so we can update you)" />
                    <Button type="submit">Submit →</Button>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
