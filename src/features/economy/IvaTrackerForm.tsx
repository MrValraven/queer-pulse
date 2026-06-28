import { useId, useState, type FormEvent } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { euro } from './economy.data'
import { newId, type IvaEntry } from './ivaTracker.data'
import styles from './IvaTrackerPage.module.css'

interface IvaTrackerFormProps {
  entries: IvaEntry[]
  setEntries: (next: IvaEntry[] | ((prev: IvaEntry[]) => IvaEntry[])) => void
}

/** Today as YYYY-MM-DD for the default date input value. */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Form to add an invoiced amount, plus the editable list of logged entries. */
export function IvaTrackerForm({ entries, setEntries }: IvaTrackerFormProps) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())

  const labelId = useId()
  const amountId = useId()
  const dateId = useId()

  const parsed = Number.parseFloat(amount)
  const valid = label.trim().length > 0 && Number.isFinite(parsed) && parsed > 0 && date !== ''

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    const entry: IvaEntry = {
      id: newId(),
      label: label.trim(),
      amount: Math.round(parsed * 100) / 100,
      date,
    }
    setEntries((prev) => [...prev, entry])
    setLabel('')
    setAmount('')
    setDate(today())
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={labelId}>
            What was it for <span className={styles.req}>*</span>
          </label>
          <input
            id={labelId}
            className={styles.input}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Logo design — Café Aurora"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={amountId}>
              Amount (€) <span className={styles.req}>*</span>
            </label>
            <input
              id={amountId}
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={dateId}>
              Date <span className={styles.req}>*</span>
            </label>
            <input
              id={dateId}
              className={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" disabled={!valid} className={styles.addBtn}>
          <FiPlus aria-hidden /> Add invoice
        </Button>
      </form>

      <div className={styles.listHead}>
        Logged invoices <span className={styles.count}>{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <p className={styles.empty}>Nothing logged yet. Add your first invoice above.</p>
      ) : (
        <ul className={styles.list}>
          {sorted.map((entry) => (
            <li key={entry.id} className={styles.item}>
              <div className={styles.itemMain}>
                <span className={styles.itemLabel}>{entry.label}</span>
                <span className={styles.itemDate}>{entry.date}</span>
              </div>
              <span className={styles.itemAmount}>{euro(entry.amount)}</span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => remove(entry.id)}
                aria-label={`Remove ${entry.label}`}
              >
                <FiX aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
