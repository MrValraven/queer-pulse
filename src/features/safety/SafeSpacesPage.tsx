import { useRef, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { VERIFIED_SPACES, type Category } from './safeSpaces'
import { FILTERS } from './safeSpacesPage.data'
import { FlagModal } from './FlagModal'
import { SafeSpaceCard } from './SafeSpaceCard'
import { BadgeExplainer, HowSection, NominateSection, RemovedSection } from './SafeSpacesSections'
import styles from './SafeSpacesPage.module.css'

export function SafeSpacesPage() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [flagging, setFlagging] = useState<string | null>(null)
  const nomRef = useRef<HTMLDivElement>(null)

  const items = VERIFIED_SPACES.filter((s) => filter === 'all' || s.cat === filter)
  const scrollToNominate = () => nomRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Community verified</div>
          <h1>
            Spaces that are actually <em>safe.</em>
          </h1>
          <p className={styles.lead}>
            Not self-declared. Not a rainbow sticker in the window. Every venue on this list has been
            visited and reviewed by multiple community members — and can lose its status if things
            change.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.n}>47</div>
              <div className={styles.l}>verified spaces in Lisbon</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>312</div>
              <div className={styles.l}>member reviews submitted</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>6</div>
              <div className={styles.l}>spaces flagged &amp; removed this year</div>
            </div>
          </div>
        </div>
      </div>

      <BadgeExplainer />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.dirHead}>
            <div>
              <h2>
                Verified <em>spaces.</em>
              </h2>
              <div className={styles.dirUpdated}>Last updated June 2025 · Member-maintained</div>
            </div>
            <button type="button" className={styles.nominateBtn} onClick={scrollToNominate}>
              + Nominate a space
            </button>
          </div>

          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={[styles.chip, filter === f.id && styles.chipActive].filter(Boolean).join(' ')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {items.map((s) => (
              <SafeSpaceCard key={s.name} s={s} onFlag={() => setFlagging(s.name)} />
            ))}
          </div>
        </div>
      </div>

      <HowSection />
      <RemovedSection />
      <NominateSection sectionRef={nomRef} />

      <Outro
        title={<>Safety is <em>collective.</em></>}
        sub="Every review, every flag, every nomination makes this list more useful for everyone. It only works because the community maintains it."
      >
        <Button to={routes.safety} variant="primary" size="lg">
          Safety &amp; reporting
        </Button>
        <Button to={routes.sober} variant="ghost-dark" size="lg">
          Sober &amp; social
        </Button>
      </Outro>

      {flagging && (
        <FlagModal
          spaceName={flagging}
          onClose={() => setFlagging(null)}
          onSubmitted={(reason) => showToast(`Flag submitted — ${reason.toLowerCase()}`, 'success')}
        />
      )}
    </PageShell>
  )
}
