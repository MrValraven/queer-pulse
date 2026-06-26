import { useState } from 'react'
import { FiBookOpen } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, EmptyState, Outro } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import {
  FORMAT_FILTERS,
  GENRE_FILTERS,
  GROUPS,
  type Format,
  type Genre,
} from './readingGroups.data'
import { ReadingGroupCard } from './ReadingGroupCard'
import styles from './ReadingGroupsPage.module.css'

export function ReadingGroupsPage() {
  const { showToast } = useToast()
  const [genre, setGenre] = useState<Genre | 'all'>('all')
  const [format, setFormat] = useState<Format | 'all'>('all')
  const messages = routes.messages

  const items = GROUPS.filter(
    (g) => (genre === 'all' || g.genre === genre) && (format === 'all' || g.format === format),
  )

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Community · Reading</div>
          <h1 className={styles.title}>
            Read together.
            <br />
            <em>Trust faster.</em>
          </h1>
          <p className={styles.sub}>
            Small groups, one book, one month. No homework anxiety, no gatekeeping. The best way to
            find your people in a new city is to argue about a book with them.
          </p>
          <div className={styles.why}>
            <div className={styles.w}>
              <strong>Queer-curated books</strong>
              <span>Every group chooses its own reading. We do not tell you what matters.</span>
            </div>
            <div className={styles.w}>
              <strong>Small by design</strong>
              <span>Groups cap at 6–8 people. Real conversations, not lectures.</span>
            </div>
            <div className={styles.w}>
              <strong>Mixed formats</strong>
              <span>In-person in cafés and homes. Online for those outside Lisbon or with access needs.</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.fbInner}>
          <span className={styles.fbLabel}>Genre</span>
          {GENRE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.chip, genre === f.id && styles.chipActive].filter(Boolean).join(' ')}
              onClick={() => setGenre(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className={styles.fbSep} />
          <span className={styles.fbLabel}>Format</span>
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.chip, format === f.id && styles.chipActive].filter(Boolean).join(' ')}
              onClick={() => setFormat(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className={styles.fbSep} />
          <div className={styles.count}>
            <b>{items.length}</b> group{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {items.length === 0 && (
              <EmptyState
                className={styles.empty}
                icon={<FiBookOpen />}
                title="No groups match those filters"
                description="Nothing fits this genre and format combination yet — try widening your filters, or start a group around the book you want to read."
                action={{
                  label: 'Clear filters',
                  onClick: () => {
                    setGenre('all')
                    setFormat('all')
                  },
                }}
              />
            )}
            {items.map((g) => (
              <ReadingGroupCard
                key={g.id}
                g={g}
                messagesPath={messages}
                onWaitlist={() => showToast('Added to waitlist', 'info')}
              />
            ))}
          </div>

          <div className={styles.startStrip}>
            <div className={styles.ssText}>
              <h3>
                Start your <em>own group.</em>
              </h3>
              <p>
                Pick a book. Say how many people you want. Say where and when. We will list it here
                and match you with members who want to read the same thing.
              </p>
            </div>
            <form
              className={styles.ssForm}
              onSubmit={(e) => {
                e.preventDefault()
                showToast("Group listed — we'll find your readers", 'success')
              }}
            >
              <div className={styles.ssRow}>
                <label className={styles.ssLabel}>Book title &amp; author</label>
                <input className={styles.ssInput} type="text" placeholder="e.g. Giovanni's Room — James Baldwin" />
              </div>
              <div className={styles.ssRow}>
                <label className={styles.ssLabel}>Why this book?</label>
                <input className={styles.ssInput} type="text" placeholder="One sentence — what made you choose it?" />
              </div>
              <div className={styles.ssRow2}>
                <div className={styles.ssRow}>
                  <label className={styles.ssLabel}>Format</label>
                  <select className={styles.ssInput} defaultValue="In-person">
                    <option>In-person</option>
                    <option>Online</option>
                    <option>Either</option>
                  </select>
                </div>
                <div className={styles.ssRow}>
                  <label className={styles.ssLabel}>Max people</label>
                  <select className={styles.ssInput} defaultValue="6">
                    <option>4</option>
                    <option>6</option>
                    <option>8</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={styles.ssSubmit}>
                List my group
              </button>
            </form>
          </div>
        </div>
      </main>

      <Outro
        title={<>Books build <em>community.</em></>}
        sub="QueerPulse reading groups have been running since 2024. Some have turned into friendships, some into collaborations, two into bands."
      >
        <Button to={routes.invite} variant="primary" size="lg">
          Join the network
        </Button>
      </Outro>
    </PageShell>
  )
}
