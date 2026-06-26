import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import {
  YEARS,
  INITIAL_YEARS,
  STREAM_CLASS,
  type Row,
  type Stream,
} from './newsletterArchive.data'
import styles from './NewsletterArchivePage.module.css'

interface Props {
  stream: Stream | 'all'
}

function olderIssueCount(fromYear: number): number {
  return YEARS.slice(fromYear).reduce((sum, y) => sum + y.rows.length, 0)
}

export function NewsletterArchiveList({ stream }: Props) {
  const navigate = useNavigate()
  const [shownYears, setShownYears] = useState(INITIAL_YEARS)

  const openIssue = (r: Row) =>
    navigate(`${routes.newsletterArchive}/${r.num}`)

  const remaining = olderIssueCount(shownYears)

  return (
    <section className={styles.list}>
      {YEARS.slice(0, shownYears).map((y, yi) => (
        <div key={yi}>
          <div className={styles.year}>
            <h3>{y.label as ReactNode}</h3>
            <div className={styles.yearMeta}>{y.meta}</div>
          </div>
          {y.rows
            .filter((r) => stream === 'all' || r.stream === stream)
            .map((r, ri) => (
              <button
                type="button"
                key={ri}
                className={[styles.row, STREAM_CLASS[r.stream] && styles[STREAM_CLASS[r.stream] as keyof typeof styles]]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => openIssue(r)}
                style={{ textAlign: 'left', border: 'none', background: 'none', width: '100%', font: 'inherit', cursor: 'pointer' }}
              >
                <div>
                  <div className={styles.rowNum}>
                    №<em>{r.num}</em>
                  </div>
                  <div className={styles.rowNumL}>{r.numLabel}</div>
                </div>
                <div>
                  <div className={styles.rowH}>
                    {r.title}
                    {r.ed && <span className={styles.ed}>{r.ed}</span>}
                  </div>
                  <div className={styles.rowDek}>{r.dek}</div>
                </div>
                <div className={styles.rowMeta}>
                  <b>{r.date}</b>
                  <span>{r.streamMeta}</span>
                </div>
                <div className={styles.rowStats}>
                  <b>{r.opens}</b>
                  <span className={styles.label}>{r.rate}</span>
                </div>
              </button>
            ))}
        </div>
      ))}
      {remaining > 0 && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShownYears(YEARS.length)}
          >
            Load {remaining} older issues
          </Button>
        </div>
      )}
    </section>
  )
}
