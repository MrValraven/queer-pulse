import { CATEGORIES } from './microGrants.data'
import styles from './MicroGrantsPage.module.css'

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
              {(() => {
                const Icon = CATEGORIES[cat]!.icon
                return <Icon />
              })()}{' '}
              <strong>{CATEGORIES[cat]!.name}</strong>
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
