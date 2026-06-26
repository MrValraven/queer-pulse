import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import type { Tab } from './family.data'
import styles from './FamilyPage.module.css'

export function FamilyTabContent({ tab }: { tab: Tab }) {
  return (
    <div className={styles.tabContent}>
      <div className="wrap">
        <div className={styles.tabHead}>
          <h2>{tab.headTitle}</h2>
          <p>{tab.headText}</p>
        </div>

        <div className={styles.infoGrid}>
          {tab.cards.map((card) => (
            <div className={styles.infoCard} key={card.title}>
              <div className={styles.icEyebrow}>{card.eyebrow}</div>
              <div className={styles.icTitle}>{card.title}</div>
              <div className={styles.icBody}>{card.body}</div>
              {card.note && <div className={styles.icNote}>{card.note}</div>}
              {card.link && (
                <div className={styles.icLink}>
                  <Link to={card.link.href}>{card.link.label}</Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {tab.note && (
          <div className={styles.communityNote}>
            <div className={styles.cnBar} />
            <div className={styles.cnBody}>{tab.note}</div>
          </div>
        )}

        {tab.reviewHead && <h2 className={styles.reviewHead}>{tab.reviewHead}</h2>}
        {tab.reviews && (
          <div className={styles.reviewGrid}>
            {tab.reviews.map((r) => (
              <div className={styles.reviewCard} key={r.name}>
                <div className={styles.rvTop}>
                  <div className={styles.rvAv} style={{ background: r.bg, color: r.color }}>
                    {r.initials}
                  </div>
                  <div>
                    <div className={styles.rvName}>{r.name}</div>
                    <div className={styles.rvContext}>{r.context}</div>
                  </div>
                </div>
                <div className={styles.rvStars} aria-label={`${r.stars} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <FiStar key={i} fill={i < r.stars ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <div className={styles.rvQuote}>{r.quote}</div>
              </div>
            ))}
          </div>
        )}

        {tab.steps && (
          <div className={styles.processSteps}>
            {tab.steps.map((step, i) => (
              <div className={styles.psStep} key={step.title}>
                <div className={styles.psNum}>{i + 1}</div>
                <div className={styles.psInfo}>
                  <div className={styles.psTitle}>{step.title}</div>
                  <div className={styles.psText}>{step.text}</div>
                  {step.time && <div className={styles.psTime}>{step.time}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
