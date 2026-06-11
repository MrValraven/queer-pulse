import { Link } from 'react-router-dom'
import { linkToPath } from '../../app/routeMap'
import { PROFILES, RES_CARDS, ACTIONS } from './transDayOfVisibility.data'
import styles from './TransDayOfVisibilityPage.module.css'

const PROFILE = linkToPath('QueerPulse Profile.html')

export function TdovProfiles() {
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
          {PROFILES.map((p) => (
            <Link to={PROFILE} className={styles.profileCard} key={p.nameMain + p.nameEm}>
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
          ))}
        </div>
      </div>
    </section>
  )
}

export function TdovResources() {
  return (
    <section className={styles.resources}>
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
            <Link
              to={c.href}
              key={i}
              className={[
                styles.rCard,
                c.cls === 'coral' && styles.rCardCoral,
                c.cls === 'plum' && styles.rCardPlum,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.rIc}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TdovAllies() {
  return (
    <section className={styles.allies}>
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
            <div className={styles.actionRow} key={i}>
              <div className={styles.actionN}>{a.n}</div>
              <div>
                <b>{a.title}</b>
                <p>{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
