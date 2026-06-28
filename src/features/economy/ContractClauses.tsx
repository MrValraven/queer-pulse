import { FiCheck } from 'react-icons/fi'
import { CLAUSES, type Lang } from './contract.data'
import styles from './ContractGeneratorPage.module.css'

interface ContractClausesProps {
  /** Ids of the clauses currently included in the contract. */
  selected: string[]
  /** Toggle a single clause in or out by id. */
  onToggle: (id: string) => void
  /** Active document language, for the clause labels. */
  lang: Lang
}

/**
 * Toggle-chip list of the optional contract clauses. Each chip is a real
 * pressable button with aria-pressed reflecting whether the clause is included.
 */
export function ContractClauses({ selected, onToggle, lang }: ContractClausesProps) {
  return (
    <fieldset className={styles.clauses}>
      <legend className={styles.clausesLegend}>
        {lang === 'pt' ? 'Cláusulas a incluir' : 'Clauses to include'}
      </legend>
      <div className={styles.chipGrid}>
        {CLAUSES.map((clause) => {
          const on = selected.includes(clause.id)
          return (
            <button
              key={clause.id}
              type="button"
              className={[styles.chip, on && styles.chipOn].filter(Boolean).join(' ')}
              aria-pressed={on}
              onClick={() => onToggle(clause.id)}
            >
              <span className={styles.chipBox} aria-hidden>
                {on && <FiCheck size={13} />}
              </span>
              {clause.label[lang]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
