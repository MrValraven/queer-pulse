import type { BudgetRow } from './microGrants.data'
import { CATEGORIES, COMMITMENTS } from './microGrants.data'
import styles from './MicroGrantsPage.module.css'

/* Step 1 — category */
export function CategoryStep({ cat, setCat }: { cat: number | null; setCat: (i: number) => void }) {
  return (
    <>
      <div className={styles.stepTitle}>
        What kind of <em>project?</em>
      </div>
      <p className={styles.stepSub}>
        Choose the category that best describes your project. This helps the review panel read
        applications together.
      </p>
      <div className={styles.cats}>
        {CATEGORIES.map((c, i) => (
          <button
            key={c.name}
            type="button"
            className={[styles.cat, cat === i && styles.catSelected].filter(Boolean).join(' ')}
            onClick={() => setCat(i)}
          >
            <div className={styles.catIcon}>{c.icon}</div>
            <span className={styles.catName}>{c.name}</span>
            <span className={styles.catSub}>{c.sub}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* Step 2 — project details */
export function ProjectStep({
  projName,
  setProjName,
  projWhat,
  setProjWhat,
}: {
  projName: string
  setProjName: (v: string) => void
  projWhat: string
  setProjWhat: (v: string) => void
}) {
  return (
    <>
      <div className={styles.stepTitle}>
        Tell us about <em>the project.</em>
      </div>
      <p className={styles.stepSub}>
        Be specific and honest. The review panel reads everything. Plain language beats formal
        language every time.
      </p>
      <label className={styles.label}>Project name</label>
      <input
        className={styles.input}
        type="text"
        placeholder="A short, clear title"
        value={projName}
        onChange={(e) => setProjName(e.target.value)}
      />
      <label className={styles.label}>What will you make or do?</label>
      <textarea
        className={styles.textarea}
        placeholder="Describe the project in plain terms. What will exist or happen that doesn't exist now?"
        value={projWhat}
        maxLength={400}
        onChange={(e) => setProjWhat(e.target.value)}
      />
      <div className={styles.char}>{projWhat.length} / 400</div>
      <label className={styles.label}>Who benefits, and how?</label>
      <textarea
        className={styles.textarea}
        placeholder="Who in the queer community will this reach? How will it make a difference to them?"
        style={{ minHeight: 90 }}
      />
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>Timeline</label>
          <input className={styles.input} type="text" placeholder="e.g. August–October 2026" />
        </div>
        <div>
          <label className={styles.label}>Project stage</label>
          <select className={styles.select} defaultValue="">
            <option value="">Select…</option>
            <option>Idea — not yet started</option>
            <option>In development</option>
            <option>Ready to go — just needs funding</option>
            <option>Ongoing — this would expand it</option>
          </select>
        </div>
      </div>
    </>
  )
}

/* Step 3 — budget */
export function BudgetStep({
  rows,
  total,
  addRow,
  removeRow,
  updateRow,
}: {
  rows: BudgetRow[]
  total: number
  addRow: () => void
  removeRow: (id: number) => void
  updateRow: (id: number, field: 'item' | 'amount', val: string) => void
}) {
  return (
    <>
      <div className={styles.stepTitle}>
        How will you <em>spend it?</em>
      </div>
      <p className={styles.stepSub}>
        Break your budget into line items. Be realistic — the panel prefers honest estimates to
        optimistic ones. Maximum €2,000 this round.
      </p>
      <div className={styles.budgetItems}>
        {rows.map((r) => (
          <div className={styles.budgetRow} key={r.id}>
            <input
              className={styles.input}
              placeholder="Line item (e.g. Print costs)"
              value={r.item}
              onChange={(e) => updateRow(r.id, 'item', e.target.value)}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="€"
              min={0}
              max={2000}
              value={r.amount}
              onChange={(e) => updateRow(r.id, 'amount', e.target.value)}
            />
            <button type="button" className={styles.remove} onClick={() => removeRow(r.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItem} onClick={addRow}>
        + Add line item
      </button>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total requested</span>
        <span className={[styles.totalVal, total > 2000 && styles.totalValOver].filter(Boolean).join(' ')}>
          €{total.toFixed(0)}
        </span>
      </div>
      <div className={styles.hint}>
        If you're also contributing your own time or money, mention it below — it strengthens the
        application.
      </div>
      <label className={styles.label}>Other contributions (optional)</label>
      <input
        className={styles.input}
        type="text"
        placeholder="e.g. 20 hours of my own time, use of a friend's studio"
      />
    </>
  )
}

/* Step 4 — about you */
export function AboutStep({
  appName,
  setAppName,
  checks,
  toggleCheck,
}: {
  appName: string
  setAppName: (v: string) => void
  checks: Set<number>
  toggleCheck: (n: number) => void
}) {
  return (
    <>
      <div className={styles.stepTitle}>
        About <em>you.</em>
      </div>
      <p className={styles.stepSub}>
        We know who you are as a member, but tell us a little about your relationship to this project
        and the community it serves.
      </p>
      <label className={styles.label}>Your name (as you'd like it on the grant record)</label>
      <input
        className={styles.input}
        type="text"
        placeholder="Chosen name or full name — your call"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
      />
      <label className={styles.label}>Your connection to this project</label>
      <textarea
        className={styles.textarea}
        placeholder="Why are you the right person to do this? What is your relationship to the community it serves?"
        style={{ minHeight: 90 }}
      />
      <label className={styles.label}>Have you received a QueerPulse grant before?</label>
      <select className={styles.select} defaultValue="">
        <option value="">Select…</option>
        <option>No, this is my first application</option>
        <option>Yes — and I submitted a report</option>
        <option>Yes — report is pending (within 3 months)</option>
      </select>
      <div className={styles.label} style={{ marginBottom: 10 }}>
        Commitments
      </div>
      {COMMITMENTS.map((txt, i) => (
        <div className={styles.checkRow} key={i} onClick={() => toggleCheck(i)}>
          <div className={[styles.check, checks.has(i) && styles.checkChecked].filter(Boolean).join(' ')}>
            {checks.has(i) ? '✓' : ''}
          </div>
          <span className={styles.checkText}>{txt}</span>
        </div>
      ))}
    </>
  )
}

/* Step 5 — review */
export function ReviewStep({
  cat,
  projName,
  projWhat,
  appName,
  total,
  budgetItems,
}: {
  cat: number | null
  projName: string
  projWhat: string
  appName: string
  total: number
  budgetItems: string
}) {
  return (
    <>
      <div className={styles.stepTitle}>
        Review your <em>application.</em>
      </div>
      <p className={styles.stepSub}>Check everything looks right. You can go back to edit any section.</p>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>Category</div>
        <div className={styles.reviewVal}>
          {cat !== null ? (
            <>
              {CATEGORIES[cat].icon} <strong>{CATEGORIES[cat].name}</strong>
            </>
          ) : (
            '—'
          )}
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>Project</div>
        <div className={styles.reviewVal}>{projName || '—'}</div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>What you'll make / do</div>
        <div className={styles.reviewVal}>
          {projWhat ? projWhat.substring(0, 200) + (projWhat.length > 200 ? '…' : '') : '—'}
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>Budget requested</div>
        <div className={styles.reviewVal}>
          <strong>€{total.toFixed(0)}</strong> — {budgetItems}
        </div>
      </div>
      <div className={styles.reviewBlock}>
        <div className={styles.reviewLabel}>Applicant</div>
        <div className={styles.reviewVal}>{appName || '—'}</div>
      </div>
      <div className={`${styles.reviewBlock} ${styles.reviewDeadline}`}>
        <div className={`${styles.reviewLabel} ${styles.reviewDeadlineLabel}`}>Deadline</div>
        <div className={styles.reviewVal}>
          <strong>30 June 2026</strong> — decisions in 3–4 weeks
        </div>
      </div>
    </>
  )
}
