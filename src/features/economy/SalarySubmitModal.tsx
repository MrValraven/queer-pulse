import { useScrollLock } from '../../shared/hooks'
import styles from './EconomyPage.module.css'

export function SalarySubmitModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  useScrollLock()
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <div className={styles.modalTitle}>Submit your salary</div>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalSub}>Completely anonymous. Nothing that could identify you is stored.</div>
        <div className={styles.modalFields}>
          <input className={styles.modalInput} type="text" placeholder="Job title / role" />
          <input className={styles.modalInput} type="text" placeholder="Sector (e.g. Tech, NGO, Design)" />
          <div className={styles.modalRow2}>
            <input className={styles.modalInput} type="number" placeholder="Annual salary (€)" />
            <input className={styles.modalInput} type="number" placeholder="Years of experience" />
          </div>
          <select className={styles.modalSelect} defaultValue="">
            <option value="">Employment type</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Freelance</option>
            <option>Contract</option>
          </select>
        </div>
        <button type="button" className={`${styles.primaryBtn} ${styles.modalSubmit}`} onClick={onSubmit}>
          Submit anonymously
        </button>
      </div>
    </div>
  )
}
