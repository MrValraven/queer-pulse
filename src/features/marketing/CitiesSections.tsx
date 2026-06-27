import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { BETA, WAITLIST, HOW } from './cities.data'
import styles from './CitiesPage.module.css'

export function GroundworkSection() {
  const { showToast } = useToast()
  return (
    <section>
      <div className={styles.secH}>
        <h2>
          In <em>groundwork</em>
        </h2>
        <span className={styles.meta}>
          Local moderator identified · partner negotiations underway
        </span>
      </div>
      <div className={styles.betaGrid}>
        {BETA.map((b) => (
          <div className={styles.betaCard} key={b.name}>
            <div className={styles.cityHRow}>
              <div className={styles.cityName}>
                {b.name}
                <em>.</em>
              </div>
              <span className={styles.cityFlag}>
                <span className={styles.dot}>{b.flag}</span>
                {b.country}
              </span>
            </div>
            <p>{b.desc}</p>
            <div className={styles.betaLead}>{b.lead}</div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => showToast(b.toast, 'success')}
            >
              {b.btn}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

export function WaitlistSection() {
  const { showToast } = useToast()
  const [voted, setVoted] = useState<Record<string, boolean>>(
    Object.fromEntries(WAITLIST.filter((w) => w.voted).map((w) => [w.name, true])),
  )

  const vote = (name: string) => {
    setVoted((prev) => ({ ...prev, [name]: true }))
    showToast('Vote recorded · we read these signals monthly', 'success')
  }

  return (
    <section>
      <div className={styles.secH}>
        <h2>
          Cities <em>members are asking for</em>
        </h2>
        <span className={styles.meta}>
          Public waitlist · members can vote · 1 vote per member
        </span>
      </div>
      <p className={styles.wlIntro}>
        Votes are <em>signals to us about where the community is</em>, not promises to build. We
        open one city at a time. Adding your vote takes 1 click.
      </p>
      {WAITLIST.map((w) => {
        const hasVoted = voted[w.name]
        return (
          <div className={styles.wlRow} key={w.name}>
            <div className={styles.wlCity}>
              <b>{w.name}</b>
              <span>
                {w.flag} {w.region}
              </span>
            </div>
            <div>
              <div className={styles.wlVotes}>
                <em>{w.votes}</em>
              </div>
              <div className={styles.wlVotesL}>Members asking</div>
            </div>
            <div className={styles.wlProgress}>
              <div className={styles.wlBar}>
                <span style={{ width: `${w.pct}%` }} />
              </div>
              <span className={styles.wlPct}>{w.pct}% to threshold</span>
            </div>
            {hasVoted ? (
              <button
                type="button"
                className={`${styles.wlVoteBtn} ${styles.wlVoteBtnVoted}`}
                disabled
              >
                <FiCheck /> You voted
              </button>
            ) : (
              <button
                type="button"
                className={styles.wlVoteBtn}
                onClick={() => vote(w.name)}
              >
                + Add my vote
              </button>
            )}
          </div>
        )
      })}
      <p className={styles.wlFoot}>
        Don't see your city? <Link to={routes.contact}>Write to us</Link> with what you'd build there.
      </p>
    </section>
  )
}

export function HowSection() {
  return (
    <section className={styles.howSection}>
      <div className={styles.howInner}>
        <div className={styles.howKicker}>The rule book</div>
        <h2>
          How we <em>actually open</em> a new city.
        </h2>
        <p className={styles.howIntro}>Four conditions, all required. No shortcuts.</p>
        <div className={styles.howList}>
          {HOW.map((h) => (
            <div className={styles.howRow} key={h.n}>
              <div className={styles.howN}>
                {h.n[0]}
                <em>{h.n[1]}</em>
              </div>
              <div>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
