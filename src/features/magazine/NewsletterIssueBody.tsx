import { FiArrowRight } from 'react-icons/fi'
import { Reveal } from '../../shared/components/ui'
import type { IssueSection } from './newsletterArchiveIssue.data'
import styles from './NewsletterArchiveIssuePage.module.css'

interface Props {
  sections: IssueSection[]
}

export function NewsletterIssueBody({ sections }: Props) {
  return (
    <div className={styles.body}>
      {sections.map((s, i) => (
        <Reveal as="section" key={i} delay={i * 60} className={styles.section}>
          <div className={styles.kicker}>{s.kicker}</div>
          <h2 className={styles.sectionH}>{s.heading}</h2>
          <p className={styles.sectionBody}>{s.body}</p>
          {s.links && s.links.length > 0 && (
            <ul className={styles.links}>
              {s.links.map((l, li) => (
                <li key={li} className={styles.linkRow}>
                  <span className={styles.linkLabel}>
                    {l.label}
                    <FiArrowRight aria-hidden className={styles.linkIcon} />
                  </span>
                  <span className={styles.linkMeta}>{l.meta}</span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      ))}
    </div>
  )
}
