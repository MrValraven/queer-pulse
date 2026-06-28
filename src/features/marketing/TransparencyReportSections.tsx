import { Button } from '../../shared/components/ui'
import { downloadBlob } from './downloadBlob'
import {
  ALLOC,
  GOV_STATS,
  MISTAKES,
  MOD_ROWS,
  MOD_STATS,
  PEOPLE1,
  PEOPLE2,
  REQUESTS,
  SOURCES,
  type Bignum as BignumData,
} from './transparencyReport.data'
import styles from './TransparencyReportPage.module.css'

export function Bignum({ d }: { d: BignumData }) {
  return (
    <div className={styles.bignum}>
      <div className={styles.lbl}>{d.lbl}</div>
      <b>{d.b}</b>
      <p>{d.p}</p>
      {d.delta && <span className={[styles.delta, d.down && styles.deltaDown].filter(Boolean).join(' ')}>{d.delta}</span>}
    </div>
  )
}

export function MoneySection() {
  return (
    <section className={styles.sec} id="money">
      <div className={styles.secH}>
        <h2>
          Where the money <em>came from,</em> and where it <em>went.</em>
        </h2>
        <span className={styles.secNum}>0<em>1</em></span>
      </div>
      <p className={styles.secSub}>
        All figures in euros, calendar year 2025. Books audited by an independent auditor (no
        relationship to the organisation), available on request as itemised CSV.
      </p>
      <div className={styles.miniH}>Where the €278,400 came from</div>
      <div className={styles.sourceGrid}>
        {SOURCES.map((s) => (
          <div className={styles.source} key={s.name}>
            <div className={styles.sourceAmt}>{s.amt}</div>
            <div className={styles.sourceName}>{s.name}</div>
            <div className={styles.sourceDetail}>{s.detail}</div>
          </div>
        ))}
      </div>
      <div className={styles.alloc}>
        <div className={styles.allocTotal}>
          <em>€267,420</em>
        </div>
        <div className={styles.allocTotalLbl}>Spent in 2025 · 96.1% of receipts · €10,980 surplus carried to reserves</div>
        <div className={styles.allocBar}>
          {ALLOC.map((a, i) => (
            <span key={i} style={{ background: a.color, width: `${a.w}%` }} />
          ))}
        </div>
        <div className={styles.allocKey}>
          {ALLOC.map((a, i) => (
            <div className={styles.allocKeyRow} key={i}>
              <span className={styles.dot} style={{ background: a.color }} />
              <div>
                <div className={styles.label}>{a.label}</div>
                <div className={styles.detail}>{a.detail}</div>
              </div>
              <span className={styles.amt}>{a.amt}</span>
              <span className={styles.pct}>{a.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PeopleSection() {
  return (
    <section className={styles.sec} id="people">
      <div className={styles.secH}>
        <h2>
          The <em>people</em> behind the numbers.
        </h2>
        <span className={styles.secNum}>0<em>2</em></span>
      </div>
      <p className={styles.secSub}>
        Members at year-end, growth, who actually shows up. We don't celebrate big numbers — only the
        right ones.
      </p>
      <div className={styles.bignumRow}>
        {PEOPLE1.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
      <div className={styles.bignumRow} style={{ marginBottom: 0 }}>
        {PEOPLE2.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
    </section>
  )
}

export function ModerationSection() {
  return (
    <section className={styles.sec} id="moderation">
      <div className={styles.secH}>
        <h2>
          Moderation, <em>by the numbers.</em>
        </h2>
        <span className={styles.secNum}>0<em>3</em></span>
      </div>
      <p className={styles.secSub}>
        What was reported, what we acted on, and how long it took. Every action logged; full
        anonymised log available to any member on request.
      </p>
      <div className={styles.bignumRow} style={{ marginBottom: 24 }}>
        {MOD_STATS.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
      <div className={styles.modTable}>
        <div className={`${styles.modRow} ${styles.modHead}`}>
          <span>Reason for moderation action</span>
          <span>Count</span>
          <span>YoY</span>
          <span>% of all</span>
        </div>
        {MOD_ROWS.map((r, i) => (
          <div className={styles.modRow} key={i}>
            <span className={styles.reason}>{r.reason}</span>
            <span className={styles.count}>{r.count}</span>
            <span className={[styles.delta, r.up && styles.deltaUp].filter(Boolean).join(' ')}>{r.delta}</span>
            <span className={styles.pct}>{r.pct}</span>
          </div>
        ))}
      </div>
      <p className={styles.modBreakdown}>
        Action breakdown: <b>96 posts/comments removed</b>, <b>52 warnings issued</b>,{' '}
        <b>23 temporary suspensions</b> (median 7 days), <b>9 permanent bans</b>,{' '}
        <b>4 cases referred to ILGA</b> for legal handling.
      </p>
    </section>
  )
}

export function RequestsSection() {
  return (
    <section className={styles.sec} id="requests">
      <div className={styles.secH}>
        <h2>
          Government &amp; legal <em>requests</em> for member data.
        </h2>
        <span className={styles.secNum}>0<em>4</em></span>
      </div>
      <p className={styles.secSub}>
        Every request we received from any government or legal entity in 2025. We comply with valid
        Portuguese court orders. <em>We do not comply with informal asks.</em>
      </p>
      {REQUESTS.map((r, i) => (
        <div className={styles.reqCard} key={i}>
          <div>
            <div className={styles.reqH}>{r.h}</div>
            <div className={styles.reqD}>{r.d}</div>
          </div>
          <div>
            <div className={styles.reqR}>{r.r}</div>
            <div className={styles.reqRL}>{r.rl}</div>
          </div>
        </div>
      ))}
    </section>
  )
}

export function MistakesSection() {
  return (
    <section className={styles.sec} id="mistakes">
      <div className={styles.secH}>
        <h2>
          Things we got <em>wrong</em> in 2025.
        </h2>
        <span className={styles.secNum}>0<em>5</em></span>
      </div>
      <p className={styles.secSub}>
        Published because we want this section to be the easiest part of the report to write next
        year. <em>Naming our own mistakes is the price of being trusted.</em>
      </p>
      {MISTAKES.map((m, i) => (
        <div className={styles.mistake} key={i}>
          <div className={styles.mistakeMeta}>{m.meta}</div>
          <h3 className={styles.mistakeH}>{m.h}</h3>
          <p className={styles.mistakeText}>{m.text}</p>
          <div className={styles.mistakeFix}>{m.fix}</div>
        </div>
      ))}
    </section>
  )
}

export function GovernanceSection() {
  return (
    <section className={styles.sec} id="governance">
      <div className={styles.secH}>
        <h2>
          How <em>decisions</em> got made.
        </h2>
        <span className={styles.secNum}>0<em>6</em></span>
      </div>
      <p className={styles.secSub}>
        Boring meeting minutes are the foundation of trust. Here's how QueerPulse's governance
        actually worked in 2025.
      </p>
      <div className={styles.bignumRow} style={{ marginBottom: 24 }}>
        {GOV_STATS.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
      <p className={styles.modBreakdown}>
        For full meeting minutes, the constitution, the Sustainer agreement, and the formal
        organisational chart, see Governance.
      </p>
    </section>
  )
}

const REPORT_TEXT = `QueerPulse — Annual Transparency Report 2025
============================================

This is a mock export from the QueerPulse prototype. The full 84-page report
is summarised below.

WHERE THE MONEY CAME FROM (2025): €278,400
WHERE IT WENT: €267,420 spent · €10,980 carried to reserves
MODERATION: 184 actions logged · median response 4.2h
GOVERNMENT/LEGAL DATA REQUESTS: see §04 — no informal asks complied with.

Prepared by Catarina Vaz & André Bento.
Independently audited by Dra. Helena Faria, Faria Auditoria.
Questions: transparency@queerpulse.app
`

const REPORT_CSV = `section,metric,value
finance,income_eur,278400
finance,spend_eur,267420
finance,surplus_eur,10980
people,members_year_end,1847
moderation,actions_logged,184
moderation,median_response_hours,4.2
governance,assembly_votes_cast,312
`

export function Signoff() {
  return (
    <div className={styles.signoff}>
      <h3>
        Signed in <em>good faith,</em> and ready for questions.
      </h3>
      <p>
        This report was prepared by Catarina Vaz and André Bento, reviewed by the full Assembly, and
        audited independently by Dra. Helena Faria of Faria Auditoria. <em>Errors are ours.</em>{' '}
        Questions, corrections, or concerns:{' '}
        <a href="mailto:transparency@queerpulse.app">transparency@queerpulse.app</a> — a real person
        reads them within 48 hours.
      </p>
      <div className={styles.signRow}>
        <div className={styles.signAv}>CV</div>
        <div>
          <div className={styles.signName}>Catarina Vaz</div>
          <div className={styles.signRole}>Co-treasurer · drafted finance + mistakes</div>
        </div>
        <div className={styles.signAv} style={{ background: 'rgba(var(--jade-rgb),.18)', color: 'var(--jade-soft)' }}>AB</div>
        <div>
          <div className={styles.signName}>André Bento</div>
          <div className={styles.signRole}>Co-treasurer · drafted moderation + governance</div>
        </div>
        <div className={styles.signAv} style={{ background: 'rgba(247,243,238,.10)', color: 'rgba(247,243,238,.8)' }}>HF</div>
        <div>
          <div className={styles.signName}>Dra. Helena Faria</div>
          <div className={styles.signRole}>Independent auditor</div>
        </div>
      </div>
      <div className={styles.trActions}>
        <Button type="button" variant="primary" onClick={() => downloadBlob('transparency-report-2025.txt', REPORT_TEXT, 'text/plain')}>
          Download PDF (84 pages)
        </Button>
        <Button type="button" variant="ghost-dark" onClick={() => downloadBlob('transparency-figures-2025.csv', REPORT_CSV, 'text/csv')}>
          Download raw CSV
        </Button>
      </div>
    </div>
  )
}
