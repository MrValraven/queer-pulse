import { Link } from 'react-router-dom'
import type { InfoCard, Voice } from './intersectionality.data'
import styles from './IntersectionalityPage.module.css'

export function VoiceCard({ v }: { v: Voice }) {
  return (
    <div className={styles.voiceCard}>
      <div className={styles.vcTop}>
        <div className={styles.vcAv} style={{ background: v.bg, color: v.color }}>
          {v.initials}
        </div>
        <div>
          <div className={styles.vcName}>{v.name}</div>
          <div className={styles.vcContext}>{v.context}</div>
        </div>
      </div>
      <p className={styles.vcQuote}>{v.quote}</p>
    </div>
  )
}

export function InfoCards({ cards }: { cards: InfoCard[] }) {
  return (
    <div className={styles.infoGrid}>
      {cards.map((c) => (
        <div className={styles.infoCard} key={c.title}>
          <div className={styles.icEyebrow}>{c.eyebrow}</div>
          <div className={styles.icTitle}>{c.title}</div>
          <div className={styles.icBody}>{c.body}</div>
          {c.link && (
            <div className={styles.icLink}>
              <Link to={c.link.href}>{c.link.label}</Link>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
