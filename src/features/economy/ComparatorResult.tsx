import { FiAlertCircle, FiBriefcase, FiCheck, FiUser } from 'react-icons/fi'
import { euro } from './economy.data'
import { estimateSalariedNet, estimateTakeHome, type TakeHome, type TaxYear } from './tax.calc'
import { SIMPLIFIED_COEFFICIENTS, TAX_DISCLAIMER } from './tax.constants'
import { HIDDEN_COSTS, type ActivityKey, type StartupYear } from './comparator.data'
import styles from './ComparatorPage.module.css'

export interface ComparatorResultProps {
  gross: string
  activity: ActivityKey
  year: TaxYear
  startupYear: StartupYear
}

const safeNumber = (raw: string): number => {
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

const ratePct = (r: TakeHome) => Math.round(r.effectiveRate * 1000) / 10

interface ColumnProps {
  label: string
  icon: React.ReactNode
  result: TakeHome
  highlight: boolean
}

function ResultColumn({ label, icon, result, highlight }: ColumnProps) {
  return (
    <div className={`${styles.col} ${highlight ? styles.colHi : ''}`}>
      <p className={styles.colLabel}>
        <span className={styles.colIcon} aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className={styles.colNet}>{euro(result.net)}</p>
      <p className={styles.colMonthly}>
        ≈ <strong>{euro(result.net / 12)}</strong> / month
      </p>
      <dl className={styles.colBreakdown}>
        <div className={styles.colRow}>
          <dt>− Segurança Social</dt>
          <dd>−{euro(result.ss)}</dd>
        </div>
        <div className={styles.colRow}>
          <dt>− IRS</dt>
          <dd>−{euro(result.irs)}</dd>
        </div>
        <div className={styles.colRow}>
          <dt>Effective rate</dt>
          <dd>{ratePct(result)}%</dd>
        </div>
      </dl>
    </div>
  )
}

/** Side-by-side freelance vs salaried net, the net difference, and hidden costs. */
export function ComparatorResult({ gross, activity, year, startupYear }: ComparatorResultProps) {
  const grossNum = safeNumber(gross)

  const freelance = estimateTakeHome({
    gross: grossNum,
    coefficient: SIMPLIFIED_COEFFICIENTS[activity],
    year,
    startupYear,
    firstYear: startupYear === 1,
  })
  const salaried = estimateSalariedNet({ gross: grossNum, year })

  const diff = freelance.net - salaried.net
  const diffAbs = Math.abs(diff)
  const freelanceMore = diff >= 0

  return (
    <div className={styles.result}>
      <div className={styles.cols}>
        <ResultColumn
          label="Freelance"
          icon={<FiUser />}
          result={freelance}
          highlight={freelanceMore}
        />
        <ResultColumn
          label="Salaried"
          icon={<FiBriefcase />}
          result={salaried}
          highlight={!freelanceMore}
        />
      </div>

      <div className={styles.diffPanel}>
        <span className={styles.diffIcon} aria-hidden>
          <FiCheck />
        </span>
        <p className={styles.diffLabel}>The bottom line</p>
        <p className={styles.diffValue}>
          As a freelancer you&rsquo;d keep <em>{euro(diffAbs)}</em>{' '}
          {freelanceMore ? 'more' : 'less'} per year
        </p>
        <p className={styles.diffSub}>
          at {euro(grossNum)} gross — that&rsquo;s about {euro(diffAbs / 12)} a month{' '}
          {freelanceMore ? 'extra in your pocket' : 'you’d give up'}, before the costs below.
        </p>
      </div>

      <div className={styles.costs}>
        <h3 className={styles.costsTitle}>
          What the <em>payslip</em> doesn&rsquo;t show
        </h3>
        <ul className={styles.costsList}>
          {HIDDEN_COSTS.map((c) => (
            <li key={c.text} className={c.positive ? styles.costPos : styles.costNeg}>
              <span className={styles.costIcon} aria-hidden>
                {c.positive ? <FiCheck /> : <FiAlertCircle />}
              </span>
              {c.text}
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.disclaimer}>{TAX_DISCLAIMER}</p>
    </div>
  )
}
