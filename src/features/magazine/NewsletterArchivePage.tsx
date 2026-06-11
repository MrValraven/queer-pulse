import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { TABS, type Stream } from './newsletterArchive.data'
import { NewsletterArchiveList } from './NewsletterArchiveList'
import styles from './NewsletterArchivePage.module.css'

export function NewsletterArchivePage() {
  const { showToast } = useToast()
  const [stream, setStream] = useState<Stream | 'all'>('all')

  return (
    <PageShell>
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
            <form
              className={styles.sub}
              onSubmit={(e) => {
                e.preventDefault()
                showToast('Almost there — check your inbox', 'success')
              }}
            >
              <input type="email" placeholder="you@example.com" required />
              <Button variant="primary" type="submit">
                Subscribe →
              </Button>
            </form>
            <p className={styles.subFoot}>
              Pick which newsletters you want in step 2. Unsubscribe one-tap from any
              email. We never share your address.
            </p>
            <div className={styles.stats}>
              <span><b><em>78</em></b>Issues in the archive</span>
              <span><b>3</b>Active newsletter streams</span>
              <span><b>8,420</b>Subscribers across all streams</span>
              <span><b><em>2</em></b>Languages · EN &amp; PT</span>
            </div>
          </div>
        </section>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tab, stream === t.id && styles.tabActive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setStream(t.id)}
            >
              {t.label} <span className={styles.badge}>{t.count}</span>
            </button>
          ))}
        </div>

        <section className={styles.latest}>
          <div className={styles.latestCard}>
            <div className={styles.latestInner}>
              <div>
                <div className={styles.latestMeta}>
                  Latest · sent yesterday · 8,420 inboxes
                </div>
                <h2>
                  The summer slowdown <em>edition.</em>
                </h2>
                <p>
                  What we're reading, who's hosting in July, the new vetted-therapist
                  list, and the back room of Café Beirão schedule. Plus: Sara's cover
                  piece pulled into a shorter take.
                </p>
                <div className={styles.latestInfo}>
                  <span>Community dispatch · <b>Issue 52</b></span>
                  <span>Sent <b>8 Jun 2026</b></span>
                  <span>Read time <b>~ 8 min</b></span>
                  <span>Open rate <b>61%</b></span>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={() => showToast('Opening in browser…', 'info')}
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
