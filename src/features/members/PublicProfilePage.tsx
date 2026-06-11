import { PageShell } from '../../shared/components/layout'
import { Avatar, Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { PublicList, LockedSection, BottomCta } from './PublicProfileSections'
import {
  PUBLIC_MEMBER,
  PUBLIC_STATS,
  HERE_FOR,
  PUBLIC_WRITING,
  PUBLIC_HOSTING,
} from './publicProfile.data'
import styles from './PublicProfilePage.module.css'

const m = PUBLIC_MEMBER

export function PublicProfilePage() {
  return (
    <PageShell>
      <div className={styles.guestBar}>
        <span className={styles.guestLbl}>
          You're not signed in · viewing the <b>public version</b> of this profile
        </span>
        <div className={styles.guestActions}>
          <Button variant="ghost-dark" to={routes.signIn}>
            Sign in
          </Button>
          <Button variant="primary" to={routes.invite}>
            Request an invite
          </Button>
        </div>
      </div>

      <div className={styles.page}>
        <header className={styles.head}>
          <Avatar initials={m.initials} tint="coral" size={160} />
          <div>
            <div className={styles.eyebrow}>Public profile · {m.handle}</div>
            <h1 className={styles.name}>
              {m.firstName} <em>{m.lastName}</em>
              <span className={styles.verified} title="Verified member">
                <svg viewBox="0 0 24 24">
                  <polyline points="4,12.5 10,18 20,6" />
                </svg>
              </span>
            </h1>
            <p className={styles.pronouns}>
              <span className={styles.pron}>{m.pronouns}</span>
              {m.tagline}
            </p>
            <p className={styles.bio}>{m.bio}</p>

            <div className={styles.meta}>
              <span>
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <b>{m.location}</b>, Lisbon
              </span>
              <span>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 14" />
                </svg>
                Member since <b>{m.memberSince}</b>
              </span>
              <span>
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s-8-4-8-12V4l8-2 8 2v6c0 8-8 12-8 12z" />
                </svg>
                <b>Vouched-for</b> by {m.vouchedBy}
              </span>
            </div>

            <div className={styles.ctaRow}>
              <Button variant="primary" to={routes.invite}>
                Request an invite to connect
              </Button>
              <div className={styles.ctaNote}>{m.ctaNote}</div>
            </div>
          </div>
        </header>

        <div className={styles.stats}>
          {PUBLIC_STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <b>{s.em ? <em>{s.value}</em> : s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <section className={styles.sec}>
          <div className={styles.secH}>
            <h2>
              What I'm <em>here for</em>
            </h2>
            <span className={styles.secMeta}>Visible publicly</span>
          </div>
          <div className={styles.tagRow}>
            {HERE_FOR.map((t) => (
              <span key={t.label} className={`${styles.tag} ${t.primary ? styles.primary : ''}`}>
                {t.label}
              </span>
            ))}
          </div>
        </section>

        <PublicList
          heading={<>Public <em>writing</em></>}
          meta="4 articles · QueerPulse Magazine"
          cards={PUBLIC_WRITING}
          to={routes.article}
        />

        <PublicList
          heading={<>Public <em>hosting</em></>}
          meta="Open events anyone can RSVP to"
          cards={PUBLIC_HOSTING}
          to={routes.gathering}
        />

        <LockedSection
          heading={<>Posts &amp; <em>messages</em></>}
          meta="Members only"
          icon={
            <svg viewBox="0 0 24 24">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          }
          title={<>Posts, replies, and DMs are <em>members-only.</em></>}
          body="QueerPulse keeps day-to-day community life behind a sign-in to protect members. Become one and Tomás's feed unlocks immediately — including the ability to message him."
          action={
            <Button variant="primary" to={routes.invite}>
              Request an invite →
            </Button>
          }
        />

        <LockedSection
          heading="Connections"
          meta="Members only"
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          title={<>Who Tomás knows, <em>privately.</em></>}
          body="To protect members' networks, we don't show connection lists publicly. Sign in to see your mutuals with Tomás."
          action={
            <Button variant="ghost" to={routes.signIn}>
              Sign in
            </Button>
          }
        />

        <BottomCta />
      </div>
    </PageShell>
  )
}
