import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { routes } from '../../app/routeMap'
import { GiftMembershipForm } from './GiftMembershipForm'
import { GIFT_MODES, type ModeIcon } from './giftMembership.data'
import styles from './GiftMembershipPage.module.css'

const modeIcons: Record<ModeIcon, ReactNode> = {
  gift: (
    <svg viewBox="0 0 24 24">
      <path d="M20 12v10H4V12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}

export function GiftMembershipPage() {
  const [mode, setMode] = useState<'gift' | 'sponsor'>('gift')

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Sustainer · gift &amp; sponsor</div>
          <h1 className={styles.h1}>
            Give somebody else <em>a seat.</em>
          </h1>
          <p className={styles.dek}>
            Two ways to do this. <b>Gift</b> someone you know directly — a friend, a partner, the
            person who introduced you to all this. Or <b>sponsor anonymously</b> — your gift goes
            into a pool a member applies to, no questions asked, when they need it.{' '}
            <em>Both keep someone here who might otherwise have stepped back.</em>
          </p>
        </div>
      </section>

      <section className={styles.modes}>
        <div className={styles.modesH}>
          <h2>
            Which <em>gift</em> are you making?
          </h2>
        </div>
        <div className={styles.modeGrid}>
          {GIFT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.modeCard} ${m.jade ? styles.jade : ''} ${mode === m.id ? styles.selected : ''}`}
              onClick={() => setMode(m.id)}
            >
              <div className={styles.modeIc}>{modeIcons[m.icon]}</div>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
              <div className={styles.price}>
                {m.price}
                <span className={styles.priceSub}>{m.priceSub}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formInner}>
          <h2 className={styles.formH}>
            Gift details · <em>tell us who's it for</em>
          </h2>
          <p className={styles.formSub}>
            All editable until they accept. You can also schedule the delivery — for a birthday, a
            coming-out anniversary, the day they need it most.
          </p>
          <GiftMembershipForm />
        </div>
      </section>

      <section className={styles.sponsorFoot}>
        <h3>
          Or skip the form · <em>sponsor anonymously</em>
        </h3>
        <p>
          If you'd rather not name a recipient,{' '}
          <Link to={routes.solidarity}>drop your gift into the solidarity-membership pool</Link>. We
          match it with a member who applied — usually within 48 hours.{' '}
          <em>You get a thank-you and a count; not a name.</em>
        </p>
      </section>
    </PageShell>
  )
}
