import { Link } from 'react-router-dom'
import { Button, Reveal } from '../../shared/components/ui'
import { useConnect } from '../../app/providers/ConnectProvider'
import { routes } from '../../app/routeMap'
import { THERAPISTS, CRISIS, HARM } from './wellbeing.data'
import styles from './resources.module.css'

/** Community-vetted therapist directory. */
export function TherapistsSection() {
  const { openConnect } = useConnect()
  return (
    <section className={`${styles.section} ${styles.sectionPaper}`} id="therapists">
      <div className="wrap">
        <Reveal as="h2">
          Queer-affirming <em>therapists in Lisbon</em>
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          Vetted by community members. Each therapist listed has been recommended by at least two
          QueerPulse members. We do not charge listing fees. Want to add someone?{' '}
          <Link to={routes.contact}>Get in touch.</Link>
        </Reveal>
        <div className={styles.grid}>
          {THERAPISTS.map((therapist, index) => (
            <Reveal key={therapist.name} className={styles.card} delay={index * 55}>
              <div className={styles.cardName}>{therapist.name}</div>
              <div className={styles.cardSpec}>{therapist.spec}</div>
              <div className={styles.tags}>
                {therapist.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.cardFoot}>
                <span className={styles.cardLoc}>{therapist.loc}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.cardCta}
                  onClick={() => openConnect()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openConnect()
                    }
                  }}
                >
                  Request intro →
                </span>
              </div>
            </Reveal>
          ))}
          <Reveal className={`${styles.card} ${styles.cardDashed}`} delay={THERAPISTS.length * 55}>
            <div>
              Are you a queer-affirming therapist?
              <br />
              <Link to={routes.contact} style={{ color: 'var(--plum)', fontWeight: 600 }}>
                Apply to be listed →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Plum peer-support strip with headline stats. */
export function PeerSupportSection() {
  return (
    <section className={`${styles.section} ${styles.sectionCream}`} id="peer-support">
      <div className="wrap">
        <Reveal className={styles.plumStrip}>
          <div>
            <h3>
              You don't have to <em>hold it alone.</em>
            </h3>
            <p>
              A moderated peer support space inside the Forum — for members going through difficult
              times. No advice unless asked. No fixing. Just people who understand, listening.
            </p>
            <div className={styles.plumActions}>
              <Button variant="ghost-dark" to={routes.forum}>
                Join the group
              </Button>
              <Button variant="ghost-dark" href="#crisis">
                In crisis right now?
              </Button>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statN}>340</div>
              <div className={styles.statL}>members in the support space</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>24h</div>
              <div className={styles.statL}>guaranteed moderation response</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>100%</div>
              <div className={styles.statL}>confidential within the group</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Crisis & emergency contact cards. */
export function CrisisSection() {
  return (
    <section className={`${styles.section} ${styles.sectionPaper}`} id="crisis">
      <div className="wrap">
        <Reveal as="h2">
          Crisis &amp; <em>emergency resources</em>
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          If you are in immediate danger, call <strong>112</strong>. These resources are specific
          to LGBTQ+ situations in Portugal.
        </Reveal>
        <div className={styles.gridNarrow} style={{ display: 'grid' }}>
          {CRISIS.map((item, index) => (
            <Reveal key={item.name} className={styles.card} delay={index * 55}>
              <div className={styles.cardName} style={{ fontSize: 18 }}>
                {item.name}
              </div>
              <div className={styles.cardSpec}>{item.desc}</div>
              <div className={styles.crisisNum}>{item.num}</div>
              <div className={styles.crisisHours}>{item.hours}</div>
            </Reveal>
          ))}
          <Reveal className={styles.card} delay={CRISIS.length * 55}>
            <div className={styles.cardName} style={{ fontSize: 18 }}>
              QueerPulse Emergency
            </div>
            <div className={styles.cardSpec}>
              Safe housing contacts, community members who can help, and emergency escalation
              paths — available always.
            </div>
            <Link to={routes.emergency} className={styles.crisisNum} style={{ fontSize: 16 }}>
              Open emergency page →
            </Link>
            <div className={styles.crisisHours}>Always available</div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Harm-reduction information cards. */
export function HarmReductionSection() {
  return (
    <section className={`${styles.section} ${styles.sectionCream}`} id="harm-reduction">
      <div className="wrap">
        <Reveal as="h2">
          Harm <em>reduction</em>
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          Non-judgmental information for a community that lives in the real world. This is not
          moral instruction — it's practical care. No one here will tell you how to live.
        </Reveal>
        <div className={styles.gridNarrow} style={{ display: 'grid' }}>
          {HARM.map((item, index) => (
            <Reveal key={item.title} className={styles.card} delay={index * 55}>
              <div className={styles.cardName} style={{ fontSize: 18 }}>
                {item.title}
              </div>
              <div className={styles.cardSpec}>{item.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
