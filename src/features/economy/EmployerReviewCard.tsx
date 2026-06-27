import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { safetyFor } from './employerSafety.data'
import { SafetyBadges } from './SafetyBadges'
import type { Company } from './employerReviews.data'
import styles from './EmployerReviewsPage.module.css'

export function EmployerReviewCard({
  company: c,
  onWriteReview,
}: {
  company: Company
  onWriteReview?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.companyCard}>
      <div className={styles.coTop}>
        <div className={styles.coAv} style={{ background: c.avBg, color: c.avColor }}>
          {c.av}
        </div>
        <div style={{ flex: 1, paddingLeft: 14 }}>
          <div className={styles.coName}>{c.name}</div>
          <div className={styles.coIndustry}>{c.industry}</div>
        </div>
        <div className={styles.coScore}>
          <div className={styles.coNum} style={c.scoreColor ? { color: c.scoreColor } : undefined}>
            {c.score}
          </div>
          <div className={styles.coLabel}>/ 10</div>
          <div className={styles.coConfidence}>based on {c.reviewCount} reviews</div>
        </div>
      </div>
      <div className={styles.coSafety}>
        <SafetyBadges
          signals={safetyFor(c.name)}
          affiliation={c.queerRun ? 'run' : 'friendly'}
        />
      </div>
      <div className={styles.coBars}>
        {c.bars.map((b) => (
          <div className={styles.barRow} key={b.label}>
            <span className={styles.barLabel}>{b.label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${b.pct}%`, background: b.accent ? 'var(--accent)' : undefined }}
              />
            </div>
            <span>{b.score}</span>
          </div>
        ))}
      </div>

      {expanded ? (
        <div className={styles.coReviews}>
          {c.reviews.map((r) => (
            <div className={styles.coReview} key={r.text}>
              <div className={styles.coReviewText}>{r.text}</div>
              <div className={styles.coReviewMeta}>
                {r.meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.coQuote}>{c.quote}</div>
      )}

      <div className={styles.coMeta}>
        {c.meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className={styles.coFoot}>
        <Button
          type="button"
          variant="ghost"
          className={styles.coBtn}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `Read all ${c.reviews.length} reviews`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={styles.coBtn}
          onClick={onWriteReview}
        >
          Write a review
        </Button>
      </div>
    </div>
  )
}
