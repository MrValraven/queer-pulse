import { useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { REMOVED_SPACES } from './safeSpaces'
import { CRITERIA, HOW } from './safeSpacesPage.data'
import styles from './SafeSpacesPage.module.css'

export function BadgeExplainer() {
  return (
    <div className={styles.badgeExplainer}>
      <div className="wrap">
        <div className={styles.beGrid}>
          <div className={styles.beBadge}>
            <div className={styles.badgeVisual}>
              <div className={styles.bvCheck}><FiCheck /></div>
              <div className={styles.bvName}>
                Community
                <br />
                Verified
              </div>
              <div className={styles.bvSub}>QueerPulse</div>
            </div>
            <div className={styles.badgeCaption}>The badge venues can display — earned, not purchased</div>
          </div>
          <div className={styles.beText}>
            <h2>
              What <em>"verified"</em> actually means.
            </h2>
            <p>
              Any venue can put a rainbow flag in the window during Pride. Verification means
              something different — it means community members have been there, assessed it against a
              clear set of criteria, and agreed it meets the standard. And it can be revoked.
            </p>
            <div className={styles.criteriaList}>
              {CRITERIA.map((c) => (
                <div className={styles.critItem} key={c.lead}>
                  <div className={styles.critDot}><c.icon /></div>
                  <div className={styles.critText}>
                    <strong>{c.lead}</strong>
                    {c.rest}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HowSection() {
  return (
    <div className={styles.howSection}>
      <div className="wrap">
        <h2>
          How <em>verification</em> works.
        </h2>
        <div className={styles.howGrid}>
          {HOW.map((h) => (
            <div className={styles.howCard} key={h.num}>
              <div className={styles.howNum}>{h.num}</div>
              <div className={styles.howTitle}>{h.title}</div>
              <div className={styles.howDesc}>{h.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RemovedSection() {
  return (
    <div className={styles.removedSection}>
      <div className="wrap">
        <div className={styles.removedHead}>
          <h2>
            When a space <em>loses</em> its badge.
          </h2>
          <p>
            Verification can be revoked — and is. A listing isn't a reward a venue keeps forever;
            it's a standard they keep meeting. When they stop, we say so, and we say why. We removed{' '}
            {REMOVED_SPACES.length > 0 ? 6 : 0} spaces this year.
          </p>
        </div>
        <div className={styles.removedSteps}>
          <div className={styles.rStep}>
            <span>3 flags</span> suspend the badge instantly, pending review.
          </div>
          <div className={styles.rStep}>
            <span>Panel review</span> reads every report against the criteria.
          </div>
          <div className={styles.rStep}>
            <span>Removed</span> if criteria fail or owners won't engage.
          </div>
          <div className={styles.rStep}>
            <span>Public reason</span> — every removal is recorded openly, never quietly.
          </div>
        </div>
        <div className={styles.removedList}>
          {REMOVED_SPACES.map((r) => (
            <Link key={r.slug} to={`${routes.safeSpaces}/${r.slug}`} className={styles.removedCard}>
              <div className={styles.rcTop}>
                <span className={styles.rcType}>
                  {r.typeLabel} · {r.hood}
                </span>
                <span className={styles.rcBadge}>Removed</span>
              </div>
              <div className={styles.rcName}>{r.name}</div>
              <div className={styles.rcReason}>{r.reason}</div>
              <div className={styles.rcFoot}>
                <span>{r.removedDate}</span>
                <span className={styles.rcLink}>Why it was removed →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NominateSection({ sectionRef }: { sectionRef: RefObject<HTMLDivElement | null> }) {
  const [nominated, setNominated] = useState(false)
  const [nomName, setNomName] = useState('')

  return (
    <div className={styles.nomSection} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.nomBox}>
          {nominated ? (
            <div className={styles.nomThanks}>
              <div className={styles.nomThanksIcon}>
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className={styles.nomThanksTitle}>
                Thank you. We're <em>on it.</em>
              </h3>
              <p className={styles.nomThanksText}>
                Your nomination{nomName.trim() ? <> for <strong>{nomName.trim()}</strong></> : null} is in.
                The community is the reason this list means anything — adding to it is genuinely a gift.
              </p>
              <p className={styles.nomThanksSub}>
                Here's what happens next: we acknowledge every nomination within<strong> 48 hours</strong>.
                Then three verified members visit independently and review it against the criteria before
                a volunteer panel decides. We'll keep you posted.
              </p>
              <Button
                variant="ghost-dark"
                onClick={() => {
                  setNominated(false)
                  setNomName('')
                }}
              >
                Nominate another space
              </Button>
            </div>
          ) : (
            <>
              <div>
                <h3>
                  Nominate a <em>space.</em>
                </h3>
                <p>You've found somewhere that genuinely feels safe. Tell us about it. We do the rest.</p>
                <div className={styles.nomFlagNote}>
                  You can also flag a verified space that's changed — use the flag button on any
                  listing, or contact us directly.
                </div>
              </div>
              <form
                className={styles.nomFields}
                onSubmit={(e) => {
                  e.preventDefault()
                  setNominated(true)
                }}
              >
                <input
                  className={styles.nomInput}
                  type="text"
                  placeholder="Space name"
                  value={nomName}
                  onChange={(e) => setNomName(e.target.value)}
                  required
                />
                <input className={styles.nomInput} type="text" placeholder="Address or neighbourhood" />
                <select className={styles.nomSelect} defaultValue="">
                  <option value="">Type of space</option>
                  <option>Bar</option>
                  <option>Club</option>
                  <option>Café</option>
                  <option>Healthcare</option>
                  <option>Services</option>
                  <option>Arts venue</option>
                  <option>Gym / fitness</option>
                  <option>Other</option>
                </select>
                <textarea
                  className={styles.nomTextarea}
                  placeholder="Why do you think this space should be verified? Specific experiences help."
                />
                <button type="submit" className={styles.nomBtn}>
                  Submit nomination
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
