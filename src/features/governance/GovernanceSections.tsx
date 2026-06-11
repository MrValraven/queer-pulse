import { Button, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { COUNCIL, DECISIONS, EVENTS, FIN_STATS, HEALTH, PRINCIPLES, STEPS, EXPENSE, INCOME } from './governance.data'
import { FinanceLines } from './GovernanceFinance'
import styles from './GovernancePage.module.css'

export function HealthSection() {
  return (
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
  )
}

export function ModerationSection() {
  return (
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
          <strong>What we won't tolerate:</strong> Any behaviour that makes a member feel unsafe or
          unwelcome on the basis of their identity, body, or background. Harassment of any form.
          Commercial solicitation without permission. Violation of another member's privacy.
        </p>
      </div>
    </Reveal>
  )
}

export function CouncilSection() {
  return (
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
  )
}

export function PrinciplesSection() {
  return (
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
  )
}

export function FinancesSection() {
  return (
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
          <strong>What we do with the surplus.</strong> Quarterly surpluses go into an operational
          reserve. Our target is three months of running costs — ~€12,450.
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
  )
}

export function DecisionsSection() {
  return (
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
  )
}

export function RaiseSection() {
  const { showToast } = useToast()
  return (
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
  )
}
