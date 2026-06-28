import { Link } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import { FadeIn, Reveal, SkeletonLine } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { PROFILES, RES_CARDS, ACTIONS } from './transDayOfVisibility.data'
import styles from './TransDayOfVisibilityPage.module.css'

const PROFILE = routes.members

function ProfileCardSkeleton() {
  return (
    <div className={styles.profileCard} aria-hidden style={{ pointerEvents: 'none' }}>
      {/* mirrors the profileImg aspect-ratio: 4/5 */}
      <div className={styles.profileImg} style={{ background: 'rgba(45,27,61,.06)' }} />
      <div className={styles.profileBody}>
        <SkeletonLine width={80} height={11} />
        <SkeletonLine width="65%" height={26} style={{ marginTop: 6 }} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
        <SkeletonLine width="100%" height={13} style={{ marginTop: 12 }} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
        <div style={{ paddingTop: 14, borderTop: '1px solid rgba(45,27,61,.08)', marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonLine width={55} height={12} />
          <SkeletonLine width={80} height={12} />
        </div>
      </div>
    </div>
  )
}

export function TdovProfiles() {
  const loading = useSimulatedLoad()

  return (
    <section className={styles.profiles}>
      <div className={styles.profilesInner}>
        <div className={styles.profilesH}>
          <h2>
            Seven members · <em>at work</em>
          </h2>
          <span className={styles.metaNote}>
            Members chose to be featured. None are obligated.
          </span>
        </div>
        <div className={styles.profileGrid}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => <ProfileCardSkeleton key={i} />)
            : PROFILES.map((p, i) => (
                <FadeIn key={p.nameMain + p.nameEm} delay={Math.min(i, 8) * 60}>
                  <Link to={PROFILE} className={styles.profileCard}>
                    <div
                      className={[
                        styles.profileImg,
                        p.tint === 'b' && styles.tintB,
                        p.tint === 'c' && styles.tintC,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      Portrait · {p.nameMain}
                      {p.nameEm}
                    </div>
                    <div className={styles.profileBody}>
                      <div className={styles.profilePron}>{p.pron}</div>
                      <div className={styles.profileName}>
                        {p.nameMain}
                        <em>{p.nameEm}</em>
                      </div>
                      <div className={styles.profileRole}>{p.role}</div>
                      <p className={styles.profileQuote}>{p.quote}</p>
                      <div className={styles.profileRead}>
                        <span>{p.read}</span>
                        <span>Read profile →</span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
        </div>
      </div>
    </section>
  )
}

export function TdovResources() {
  return (
    <Reveal as="section" className={styles.resources}>
      <div className={styles.resourcesInner}>
        <h2>
          The infrastructure <em>behind the visibility.</em>
        </h2>
        <p className={styles.sub}>
          Four practical things that exist all year, not just today. Take a screenshot. Show a
          friend. Save what's useful.
        </p>
        <div className={styles.rGrid}>
          {RES_CARDS.map((c, i) => (
            <Reveal key={i} delay={Math.min(i, 8) * 60}>
              <Link
                to={c.href}
                className={[
                  styles.rCard,
                  c.cls === 'coral' && styles.rCardCoral,
                  c.cls === 'plum' && styles.rCardPlum,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.rIc}><c.icon /></div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export function TdovAllies() {
  return (
    <Reveal as="section" className={styles.allies}>
      <div className={styles.alliesInner}>
        <div className={styles.alliesKicker}>If you are a cis member · today</div>
        <h2>
          Three things that <em>actually help.</em>
        </h2>
        <p className={styles.alliesSub}>
          Not <em>celebrate</em>, not <em>amplify</em>. Concrete. Tangible. Done by tomorrow.
        </p>
        <div className={styles.actionList}>
          {ACTIONS.map((a, i) => (
            <Reveal key={i} as="div" className={styles.actionRow} delay={i * 80}>
              <div className={styles.actionN}>{a.n}</div>
              <div>
                <b>{a.title}</b>
                <p>{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
