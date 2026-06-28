import { useMemo } from 'react'
import { FiShield } from 'react-icons/fi'
import { TAX_DISCLAIMER } from './tax.constants'
import { euro } from './economy.data'
import type { PotEntry } from './setAside.data'
import styles from './SetAsidePlannerPage.module.css'

interface SetAsideResultProps {
  gross: number
  setAsidePct: number
  pot: PotEntry[]
}

export function SetAsideResult({ gross, setAsidePct, pot }: SetAsideResultProps) {
  const frac = setAsidePct / 100
  const annualPark = gross * frac
  const monthlyPark = annualPark / 12

  const { logged, potOwed } = useMemo(() => {
    const total = pot.reduce((sum, e) => sum + e.amount, 0)
    return { logged: total, potOwed: total * frac }
  }, [pot, frac])

  return (
    <div className={styles.result}>
      <div className={styles.panel}>
        <FiShield className={styles.panelIcon} aria-hidden />
        <p className={styles.panelKicker}>For every invoice, park</p>
        <p className={styles.bigPct}>{setAsidePct}%</p>
        <h2 className={styles.panelTitle}>
          Set aside <em>{setAsidePct}%</em> of every euro you invoice.
        </h2>
        <p className={styles.panelBody}>
          On your expected {euro(gross)}, that's about {euro(monthlyPark)} a month
          you keep aside for the IRS and Segurança Social — and don't spend.
        </p>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Park per month</span>
          <span className={styles.statVal}>{euro(monthlyPark)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Park this year</span>
          <span className={styles.statVal}>{euro(annualPark)}</span>
        </div>
      </div>

      <div className={styles.potCard}>
        <div className={styles.potHead}>
          <span className={styles.potLabel}>Your set-aside pot</span>
          <span className={styles.potCount}>
            {pot.length} invoice{pot.length === 1 ? '' : 's'} logged
          </span>
        </div>
        <p className={styles.potTotal}>{euro(potOwed)}</p>
        <p className={styles.potSub}>
          {pot.length === 0
            ? 'Log your first invoice to start the pot.'
            : `${setAsidePct}% of the ${euro(logged)} you've logged so far. Keep this much untouched.`}
        </p>
      </div>

      <p className={styles.disclaimer}>{TAX_DISCLAIMER}</p>
    </div>
  )
}
