import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { PROFILES, matchesBudget, type ListingType } from './flatmates.data'
import { FlatmateCard } from './FlatmateCard'
import { FlatmatesFilterBar } from './FlatmatesFilterBar'
import { PostProfileModal } from './PostProfileModal'
import styles from './FlatmatesPage.module.css'

export function FlatmatesPage() {
  const [type, setType] = useState<ListingType | 'all'>('all')
  const [neighbourhood, setNeighbourhood] = useState('all')
  const [budget, setBudget] = useState('all')
  const [movein, setMovein] = useState('all')
  const [tags, setTags] = useState<string[]>([])
  const [sent, setSent] = useState<Set<number>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = PROFILES.filter((p) => {
    if (type !== 'all' && p.type !== type) return false
    if (neighbourhood !== 'all' && p.neighbourhood !== neighbourhood) return false
    if (!matchesBudget(p, budget)) return false
    if (movein !== 'all' && p.moveinKey !== movein) return false
    if (tags.length > 0 && !tags.every((t) => p.tags.includes(t))) return false
    return true
  })

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Flatmates · Lisbon</div>
          <h1>
            Find your people to <em>come home to.</em>
          </h1>
          <p className={styles.heroSub}>
            A queer-specific flatmate board. Community-based, member-only — browse real profiles,
            reach out directly, find someone you can actually be yourself around.
          </p>
          <div className={styles.ethos}>
            <div className={styles.ethosRule} />
            <p className={styles.ethosText}>
              <strong>This is a queer-first space.</strong>
              You don't need to explain or justify yourself to a flatmate here. Everyone on this
              board is a QueerPulse member. Reach out directly, have a real conversation, find your
              home.
            </p>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteDot} />
            Community-based matching · no algorithm · members only
          </div>
        </div>
      </div>

      <FlatmatesFilterBar
        type={type}
        setType={setType}
        neighbourhood={neighbourhood}
        setNeighbourhood={setNeighbourhood}
        budget={budget}
        setBudget={setBudget}
        movein={movein}
        setMovein={setMovein}
        tags={tags}
        toggleTag={toggleTag}
      />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <div className={styles.count}>
              <b>{filtered.length}</b> profiles active this week
            </div>
            <button type="button" className={styles.postBtn} onClick={() => setModalOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Post your profile
            </button>
          </div>
          <div className={styles.grid}>
            {filtered.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyTitle}>No profiles match those filters.</div>
                <div className={styles.emptySub}>
                  Try removing a filter, or be the first to post in this combination.
                </div>
              </div>
            )}
            {filtered.map((p) => (
              <FlatmateCard
                key={p.id}
                p={p}
                sent={sent.has(p.id)}
                onSayHello={() => setSent((prev) => new Set(prev).add(p.id))}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.hsStrip}>
        <div className="wrap">
          <div className={styles.hsStripInner}>
            <div className={styles.hsStripText}>
              <h3>
                Need a place first? See the <em>Housing Board.</em>
              </h3>
              <p>
                Full tenancy resources, legal guidance, landlord recommendations, sublets and room
                shares — everything you need to find and secure a home in Lisbon.
              </p>
            </div>
            <Button to={routes.housing} variant="ghost">
              Housing Board →
            </Button>
          </div>
        </div>
      </div>

      <Outro
        title={<>A home where <em>you belong.</em></>}
        sub="The right flatmate can make a city feel like home. Take your time, trust your gut, and use the community."
      >
        <Button type="button" variant="primary" size="lg" onClick={() => setModalOpen(true)}>
          Post your profile
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          Ask the forum →
        </Button>
      </Outro>

      {modalOpen && <PostProfileModal onClose={() => setModalOpen(false)} />}
    </PageShell>
  )
}
