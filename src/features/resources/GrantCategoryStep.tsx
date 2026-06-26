import { CATEGORIES } from './microGrants.data'
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
            <div className={styles.catIcon}><c.icon /></div>
            <span className={styles.catName}>{c.name}</span>
            <span className={styles.catSub}>{c.sub}</span>
          </button>
        ))}
      </div>
    </>
  )
}
