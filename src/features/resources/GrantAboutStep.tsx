import { FiCheck } from 'react-icons/fi'
import { COMMITMENTS } from './microGrants.data'
import styles from './MicroGrantsPage.module.css'

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
        <div
          className={styles.checkRow}
          key={i}
          role="button"
          tabIndex={0}
          onClick={() => toggleCheck(i)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleCheck(i)
            }
          }}
        >
          <div className={[styles.check, checks.has(i) && styles.checkChecked].filter(Boolean).join(' ')}>
            {checks.has(i) ? <FiCheck /> : ''}
          </div>
          <span className={styles.checkText}>{txt}</span>
        </div>
      ))}
    </>
  )
}
