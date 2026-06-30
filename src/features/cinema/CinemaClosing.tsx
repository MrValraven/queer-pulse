import { Link } from 'react-router-dom'
import { Button, Outro } from '../../shared/components/ui'
import { liveEvents } from './data'
import styles from './CinemaPage.module.css'
import { routes } from '../../app/routeMap'

const badgeClass: Record<string, string> = { premiere: styles.bgPremiere, party: styles.bgParty, live: styles.bgLive }

export function LiveSection() {
  return (
    <div className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Live <em>this week</em>
        </h2>
        <div className="sub">Premieres, Q&amp;As, watch parties. Hosted by members, open by default.</div>
        <Link to="/calendar" className="all">
          Full calendar →
        </Link>
      </div>
      <div className={styles.liveList}>
        {liveEvents.map((e) => (
          <div key={e.day} className={styles.liveRow}>
            <div className={styles.liveDate}>
              <div className="d">{e.day}</div>
              <div className="m">{e.dow}</div>
            </div>
            <div className={styles.liveMain}>
              <h4>
                {e.titlePre}
                <em>{e.titleEm}</em>
                {e.titlePost}
              </h4>
              <div className={styles.lmSub}>{e.sub}</div>
              <div className={styles.lmTags}>
                <span className={`${styles.bg} ${badgeClass[e.badgeClass]}`}>{e.badge}</span>
                {e.tags.map((t, i) => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    {i >= 0 && <span className="dot" />}
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="ghost-dark" to="/rsvp">
              RSVP
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LedgerSection() {
  return (
    <div className={styles.ledger}>
      <div className={styles.ledgerText}>
        <div className={styles.ledgerEb}>How this works</div>
        <h2>
          The room <em>pays</em> the filmmaker.
        </h2>
        <p>
          QueerPulse Cinema runs as a co-op. 80% of every rent or buy goes to the filmmaker. 100% of
          every tip. The rest covers payments, hosting, and captioning. The ledger is public. The
          split is non-negotiable.
        </p>
        <div className={styles.ledgerActions}>
          <Button to={routes.cinemaMembership}>Become a sustainer · €7/mo</Button>
          <Button variant="ghost-dark" to={routes.governance}>
            Read the co-op deed
          </Button>
        </div>
      </div>
      <div className={styles.ledgerCard}>
        <div className={styles.lcHead}>
          <span className="live" />
          Public ledger · this month
        </div>
        <div className={styles.lcRow}>
          <span className="k">Paid to filmmakers</span>
          <span className="v">€<em>8,420</em></span>
        </div>
        <div className={styles.lcRow}>
          <span className="k">Films streamed</span>
          <span className="v">14,<em>207</em></span>
        </div>
        <div className={styles.lcRow}>
          <span className="k">Average filmmaker share</span>
          <span className="v"><em>82</em>%</span>
        </div>
        <div className={styles.lcRow}>
          <span className="k">Open commissions</span>
          <span className="v"><em>4</em></span>
        </div>
        <div className={styles.lcFoot}>Updated every Monday at noon Lisbon. Audited quarterly.</div>
      </div>
    </div>
  )
}

export function CinemaOutro() {
  return (
    <Outro
      title={<>Watch <em>together</em>.</>}
      sub="Cinema is a room with people in it. The room is open."
    >
      <Button size="lg" to={routes.cinemaMembership}>
        Sustain the cinema
      </Button>
    </Outro>
  )
}
