import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import type { TaxYear } from './tax.calc'
import { euro } from './economy.data'
import {
  ACTIVITY_OPTIONS,
  YEAR_OPTIONS,
  type Activity,
  type PotEntry,
} from './setAside.data'
import styles from './SetAsidePlannerPage.module.css'

interface SetAsideFormProps {
  gross: number
  activity: Activity
  year: TaxYear
  pot: PotEntry[]
  today: string
  onGross: (n: number) => void
  onActivity: (a: Activity) => void
  onYear: (y: TaxYear) => void
  onAdd: (amount: number, date: string) => void
  onRemove: (id: string) => void
}

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export function SetAsideForm({
  gross,
  activity,
  year,
  pot,
  today,
  onGross,
  onActivity,
  onYear,
  onAdd,
  onRemove,
}: SetAsideFormProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const parsedAmount = Number(amount)
  const canAdd = parsedAmount > 0 && !!date

  const handleAdd = () => {
    if (!canAdd) return
    onAdd(parsedAmount, date)
    setAmount('')
    setDate(today)
  }

  return (
    <div className={styles.form}>
      <section className={styles.fieldset}>
        <h2 className={styles.legend}>Your year</h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sa-gross">
            Expected annual gross <span className={styles.req}>*</span>
          </label>
          <input
            id="sa-gross"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            className={styles.input}
            value={gross || ''}
            onChange={(e) => onGross(Math.max(0, Number(e.target.value)))}
            placeholder="30000"
          />
          <p className={styles.hint}>Everything you expect to invoice this year, before tax.</p>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-activity">
              Activity
            </label>
            <select
              id="sa-activity"
              className={styles.select}
              value={activity}
              onChange={(e) => onActivity(e.target.value as Activity)}
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-year">
              Tax year
            </label>
            <select
              id="sa-year"
              className={styles.select}
              value={year}
              onChange={(e) => onYear(Number(e.target.value) as TaxYear)}
            >
              {YEAR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={styles.fieldset}>
        <h2 className={styles.legend}>Log an invoice</h2>
        <p className={styles.hint}>
          Add each payment as it lands. We total what you should have parked.
        </p>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-amount">
              Amount received <span className={styles.req}>*</span>
            </label>
            <input
              id="sa-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="1200"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-date">
              Date
            </label>
            <input
              id="sa-date"
              type="date"
              className={styles.input}
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <Button variant="primary" onClick={handleAdd} disabled={!canAdd}>
          <FiPlus aria-hidden /> Add to pot
        </Button>

        {pot.length > 0 && (
          <ul className={styles.list}>
            {pot.map((e) => (
              <li key={e.id} className={styles.item}>
                <span className={styles.itemAmount}>{euro(e.amount)}</span>
                <span className={styles.itemDate}>{fmtDate(e.date)}</span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onRemove(e.id)}
                  aria-label={`Remove ${euro(e.amount)} invoice`}
                >
                  <FiX aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
