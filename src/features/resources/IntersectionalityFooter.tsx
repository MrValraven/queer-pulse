import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { COMMITMENTS, COMMUNITIES, CONTACT, FORUM, GOVERNANCE, ORGS } from './intersectionality.data'
import styles from './IntersectionalityPage.module.css'

export function IntersectionalityFooter() {
  return (
    <>
      <section className={styles.commitSec}>
        <div className="wrap">
          <div className={styles.commitInner}>
            <div className={styles.commitLeft}>
              <h2>
                What QueerPulse <em>commits to.</em>
              </h2>
              <p>
                These are specific things, not aspirations. We're accountable to them — if we're not
                doing them, say so.
              </p>
              <div className={styles.commitBtns}>
                <Button to={GOVERNANCE} variant="ghost-dark">
                  How we're governed →
                </Button>
                <Button to={CONTACT} variant="ghost-dark">
                  Hold us accountable →
                </Button>
              </div>
            </div>
            <div className={styles.commitCards}>
              {COMMITMENTS.map((c) => (
                <div className={styles.commitCardD} key={c.title}>
                  <div className={styles.ccdTitle}>{c.title}</div>
                  <div className={styles.ccdText}>{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sec} id="orgs" style={{ paddingBottom: 100 }}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Organisations &amp; <em>resources</em>
            </h2>
            <p>External organisations relevant to the specific intersections on this page.</p>
          </div>
          <div className={styles.orgsGrid}>
            {ORGS.map((o) => (
              <div className={styles.orgCard} key={o.name}>
                <div className={styles.orgFocus}>{o.focus}</div>
                <div className={styles.orgName}>{o.name}</div>
                <div className={styles.orgText}>{o.text}</div>
                <Link to={o.link.href} className={styles.orgLink}>
                  {o.link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            All of you <em>belongs here.</em>
          </h2>
          <p className={styles.outroSub}>Not the parts that are easiest to hold. All of it.</p>
          <div className={styles.outroBtns}>
            <Button to={COMMUNITIES} variant="primary" size="lg">
              Find your community group
            </Button>
            <Button to={FORUM} variant="ghost-dark" size="lg">
              Forum →
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
