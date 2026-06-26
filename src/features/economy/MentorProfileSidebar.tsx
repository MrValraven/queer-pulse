import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { BOOK_ROWS, MENTOR, MORE_FROM } from './mentorProfile.data'
import { MentorApplyModal } from './MentorApplyModal'
import styles from './MentorProfilePage.module.css'

export function MentorProfileSidebar() {
  const [open, setOpen] = useState(false)
  const mentorName = `${MENTOR.firstName} ${MENTOR.lastName}`

  return (
    <aside className={styles.side}>
      <div className={styles.sideCard} id="apply">
        <div className={styles.bookHead}>
          <h4>Apply for the '26 cohort</h4>
          <div className={styles.bookPrice}>
            €<em>0</em> + €<em>20</em>/mo
          </div>
          <div className={styles.bookPriceSub}>no upfront cost · solidarity rate available</div>
        </div>
        {BOOK_ROWS.map((row) => (
          <div key={row.label} className={styles.row}>
            <span>{row.label}</span>
            <b className={row.jade ? styles.jade : row.accent ? styles.accent : undefined}>
              {row.value}
            </b>
          </div>
        ))}
        <div className={styles.sideBtnWrap}>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Open application
          </Button>
        </div>
        <p className={styles.sideFoot}>
          All mentees get a free QueerPulse Sustainer membership for the year.
        </p>
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.moreTitle}>More from Catarina</h4>
        <div className={styles.moreLinks}>
          {MORE_FROM.map((link) => (
            <a key={link} href="#apply">
              {link}
            </a>
          ))}
        </div>
      </div>

      {open && <MentorApplyModal mentorName={mentorName} onClose={() => setOpen(false)} />}
    </aside>
  )
}
