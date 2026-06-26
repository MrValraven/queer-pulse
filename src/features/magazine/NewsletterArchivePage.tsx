import { useSearchParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { MagazineMasthead } from './MagazineMasthead'
import {
  LATEST,
  STREAM_SLUG,
  TABS,
  streamFromSlug,
  type Stream,
} from './newsletterArchive.data'
import { NewsletterArchiveList } from './NewsletterArchiveList'
import { NewsletterSubscribe } from './NewsletterSubscribe'
import styles from './NewsletterArchivePage.module.css'

export function NewsletterArchivePage() {
  const [params, setParams] = useSearchParams()
  const stream = streamFromSlug(params.get('stream'))
  const latest = LATEST[stream]

  function selectStream(next: Stream | 'all') {
    const slug = STREAM_SLUG[next]
    setParams(slug === 'all' ? {} : { stream: slug })
  }

  return (
    <PageShell>
      <MagazineMasthead active="newsletter" />
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Newsletter archive · since 2024</div>
            <h1 className={styles.h1}>
              Every email we've <em>sent.</em>
            </h1>
            <p className={styles.dek}>
              Three newsletters: a fortnightly community dispatch, a monthly long-read
              companion, and a Trans Hub bulletin. All free. Read any of them here — or
              subscribe and we'll send them straight.
            </p>
            <NewsletterSubscribe stream={stream} />
            <div className={styles.stats}>
              <span><b><em>78</em></b>Issues in the archive</span>
              <span><b>3</b>Active newsletter streams</span>
              <span><b>8,420</b>Subscribers across all streams</span>
              <span><b><em>2</em></b>Languages · EN &amp; PT</span>
            </div>
          </div>
        </section>

        <div className={styles.tabs} role="tablist" aria-label="Newsletter streams">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={stream === t.id}
              className={[styles.tab, stream === t.id && styles.tabActive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectStream(t.id)}
            >
              {t.label} <span className={styles.badge}>{t.count}</span>
            </button>
          ))}
        </div>

        <section className={styles.latest}>
          <div className={styles.latestCard}>
            <div className={styles.latestInner}>
              <div>
                <div className={styles.latestMeta}>{latest.meta}</div>
                <h2>{latest.title}</h2>
                <p>{latest.dek}</p>
                <div className={styles.latestInfo}>
                  {latest.info.map((i) => (
                    <span key={i.label}>
                      {i.label} <b>{i.value}</b>
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="primary"
                to={`${routes.newsletterArchive}/${latest.num}`}
              >
                Read in browser →
              </Button>
            </div>
          </div>
        </section>

        <NewsletterArchiveList stream={stream} />
      </div>
    </PageShell>
  )
}
