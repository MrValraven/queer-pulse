import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import { Button, EmptyState, FadeIn, SkeletonLine } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import {
  YEARS,
  INITIAL_YEARS,
  STREAM_CLASS,
  type Row,
  type Stream,
} from './newsletterArchive.data'
import styles from './NewsletterArchivePage.module.css'

function RowSkeleton() {
  // Mirrors the real .row grid: num column, title block, meta, stats.
  return (
    <div className={styles.row} aria-hidden>
      <div>
        <SkeletonLine width={48} height={28} />
        <SkeletonLine width={60} height={11} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width="70%" height={17} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 7 }} />
      </div>
      <SkeletonLine width={120} height={13} />
      <SkeletonLine width={70} height={20} />
    </div>
  )
}

interface Props {
  stream: Stream | 'all'
  /** Reset the stream filter back to "all" — used by the empty-state action. */
  onClearStream?: () => void
}

function olderIssueCount(fromYear: number): number {
  return YEARS.slice(fromYear).reduce((sum, y) => sum + y.rows.length, 0)
}

export function NewsletterArchiveList({ stream, onClearStream }: Props) {
  const navigate = useNavigate()
  const [shownYears, setShownYears] = useState(INITIAL_YEARS)
  const [swapping, setSwapping] = useState(false)

  // Brief skeleton swap whenever the active stream changes, so the list
  // transitions instead of hard-cutting.
  useEffect(() => {
    setSwapping(true)
    const t = setTimeout(() => setSwapping(false), 450)
    return () => clearTimeout(t)
  }, [stream])

  const openIssue = (r: Row) =>
    navigate(`${routes.newsletterArchive}/${r.num}`)

  const remaining = olderIssueCount(shownYears)

  const shownRows = YEARS.slice(0, shownYears).reduce(
    (sum, y) =>
      sum + y.rows.filter((r) => stream === 'all' || r.stream === stream).length,
    0,
  )

  if (swapping) {
    return (
      <section className={styles.list}>
        <div className={styles.year} aria-hidden>
          <SkeletonLine width={90} height={24} />
          <SkeletonLine width={140} height={12.5} style={{ marginTop: 6 }} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </section>
    )
  }

  if (shownRows === 0) {
    return (
      <section className={styles.list}>
        <EmptyState
          compact
          icon={<FiMail />}
          title="No issues in this stream"
          description={
            <>
              Nothing's gone out on this stream yet. Take a look across all
              three — there's plenty in the archive.
            </>
          }
          action={
            onClearStream
              ? { label: 'Clear filters', onClick: onClearStream }
              : undefined
          }
        />
      </section>
    )
  }

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
              <FadeIn
                as="button"
                type="button"
                key={ri}
                delay={Math.min(ri, 8) * 60}
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
              </FadeIn>
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
