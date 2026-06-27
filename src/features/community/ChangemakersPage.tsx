import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn, ImageSlot, Reveal, SkeletonLine } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { useConnect } from '../../app/providers/ConnectProvider'
import { CHANGEMAKERS } from './changemakerStories'
import styles from './ChangemakersPage.module.css'

const STATS = [
  { n: '34', l: 'Change makers profiled so far' },
  { n: '6', l: 'Cause areas active in Lisbon' },
  { n: '1.2k', l: 'People directly helped by their work' },
  { n: '12', l: 'Active campaigns running right now' },
]

const FEATURED = CHANGEMAKERS[0]
const MAKERS = CHANGEMAKERS.slice(1)

function MakerCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width="100%" height={180} style={{ borderRadius: 0 }} />
      <div className={styles.cardBody}>
        <SkeletonLine width={120} height={12} />
        <SkeletonLine width="65%" height={20} style={{ marginTop: 8 }} />
        <SkeletonLine width="100%" height={14} style={{ marginTop: 10 }} />
        <SkeletonLine width="80%" height={14} style={{ marginTop: 4 }} />
      </div>
    </div>
  )
}

export function ChangemakersPage() {
  const loading = useSimulatedLoad()
  const { showToast } = useToast()
  const { openConnect } = useConnect()
  const [nominee, setNominee] = useState('')

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Change Makers
          </Reveal>
          <Reveal as="h1" delay={60}>
            People making the future <em>liveable</em> for all of us.
          </Reveal>
          <Reveal as="p" delay={120}>
            They're not full-time activists. They're designers, lawyers, carers, and teachers who
            also happen to be changing things — neighbourhood by neighbourhood, policy by policy, one
            hard conversation at a time.
          </Reveal>
          <div className={styles.stats}>
            {STATS.map((s, i) => (
              <Reveal as="div" key={s.l} className={styles.stat} delay={160 + i * 60}>
                <div className="n" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(34px,4vw,52px)', color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(247,243,238,.55)', marginTop: 6, lineHeight: 1.4 }}>{s.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className="wrap">
          <Reveal as="div" className={styles.featLabel}>
            Featured change maker
          </Reveal>
          <Reveal as="div" className={styles.featCard}>
            <ImageSlot tint={FEATURED.tint} src={FEATURED.image} width="100%" height="100%" radius={0} placeholder={FEATURED.name} initials={FEATURED.initials} />
            <div className={styles.featBody}>
              <div className={styles.featCause}>{FEATURED.cause}</div>
              <div className={styles.featName}>{FEATURED.name}</div>
              <p className={styles.featBio}>{FEATURED.summary}</p>
              <div className={styles.impact}>
                {FEATURED.impact.map((row) => (
                  <div key={row} className={styles.impactRow}>
                    {row}
                  </div>
                ))}
              </div>
              <div className={styles.featFoot}>
                <Button to={`/changemaker/${FEATURED.slug}`}>Read her story →</Button>
                <Button variant="ghost" onClick={() => openConnect()}>
                  Connect
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.profiles}>
        <div className="wrap">
          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <MakerCardSkeleton key={i} />)
              : MAKERS.map((m, i) => (
              <FadeIn as={Link} to={`/changemaker/${m.slug}`} key={m.name} className={styles.card} delay={Math.min(i, 8) * 60}>
                <ImageSlot tint={m.tint} src={m.image} width="100%" height={180} radius={0} placeholder={m.name} initials={m.initials} />
                <div className={styles.cardBody}>
                  <div className={styles.cardCause}>{m.cause}</div>
                  <div className={styles.cardName}>{m.name}</div>
                  <p className={styles.cardBio}>{m.summary}</p>
                  <div className={styles.cardTags}>
                    {m.tags.map((t) => (
                      <span key={t} className={styles.cardTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.cardFoot}>
                  <span className={styles.read}>Read more →</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.nominate}>
        <div className="wrap">
          <Reveal as="div" className={styles.nomEye}>
            Community nominations
          </Reveal>
          <Reveal as="h2" delay={60}>
            Know someone who should <em>be here?</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            We add change makers through community nominations. If you know someone doing meaningful
            work for queer people in Lisbon, a name and a sentence is enough to start.
          </Reveal>
          <form
            className={styles.nomForm}
            onSubmit={(e) => {
              e.preventDefault()
              if (!nominee.trim()) return
              showToast(`Thank you — we'll look into ${nominee.trim()}.`, 'success')
              setNominee('')
            }}
          >
            <input
              className={styles.nomInput}
              type="text"
              placeholder="Their name…"
              value={nominee}
              onChange={(e) => setNominee(e.target.value)}
            />
            <Button type="submit">Nominate them</Button>
          </form>
        </div>
      </section>
    </PageShell>
  )
}
