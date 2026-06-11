import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import type { PublicCard } from './publicProfile.data'
import styles from './PublicProfilePage.module.css'

export function PublicList({
  heading,
  meta,
  cards,
  to,
}: {
  heading: ReactNode
  meta: string
  cards: PublicCard[]
  to: string
}) {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>{heading}</h2>
        <span className={styles.secMeta}>{meta}</span>
      </div>
      <div className={styles.list}>
        {cards.map((card, i) => (
          <Link key={i} to={to} className={styles.card}>
            <div className={styles.cardKicker}>{card.kicker}</div>
            <div className={styles.cardTitle}>{card.title}</div>
            <div className={styles.cardMeta}>{card.meta}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function LockedSection({
  heading,
  meta,
  icon,
  title,
  body,
  action,
}: {
  heading: ReactNode
  meta: string
  icon: ReactNode
  title: ReactNode
  body: string
  action: ReactNode
}) {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>{heading}</h2>
        <span className={styles.secMeta}>{meta}</span>
      </div>
      <div className={styles.locked}>
        <div className={styles.lockedIc}>{icon}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        {action}
      </div>
    </section>
  )
}

export function BottomCta() {
  return (
    <div className={styles.bottomCta}>
      <div>
        <h3>
          Want the <em>full picture?</em>
        </h3>
        <p>
          QueerPulse is invite-based — Tomás can vouch for you if you've met in person. Or request an
          invite from us directly.
        </p>
      </div>
      <div className={styles.bottomCtaActions}>
        <Button variant="primary" to={routes.invite}>
          Request an invite
        </Button>
        <Button variant="ghost-dark" to={routes.vouch}>
          Ask Tomás to vouch
        </Button>
      </div>
    </div>
  )
}
