import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { NameTable, WhereGrid, FaqList } from './PronounsGuideSections'
import styles from './PronounsGuidePage.module.css'

export function PronounsGuidePage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEye}>For trans &amp; nonbinary members</div>
          <h1 className={styles.heroH}>
            Names, pronouns, <em>done right.</em>
          </h1>
          <p className={styles.heroSub}>
            How QueerPulse handles chosen names and pronouns — and what to do when your name or gender
            changes across the platform.
          </p>
        </div>
      </header>

      <main className={styles.body}>
        <div className={styles.layout}>
          <div>
            <section className={styles.section}>
              <div className={styles.proseEye}>The basics</div>
              <h2 className={styles.proseH}>
                Chosen name vs. <em>legal name.</em>
              </h2>
              <div className={styles.proseBody}>
                <p>
                  QueerPulse uses your <strong>chosen name</strong> everywhere. Your legal name is
                  only stored if you've provided it separately — for example, if you applied for event
                  ticketing that required it. In all other contexts, we use whatever you've entered as
                  your display name or chosen name in settings.
                </p>
                <p>
                  If you're in the process of changing your legal name and want QueerPulse to reflect
                  your new name before the paperwork is done, you can update your display name at any
                  time — no documentation required.
                </p>
              </div>
              <NameTable />
            </section>

            <section className={styles.section}>
              <div className={styles.proseEye}>When you update your name</div>
              <h2 className={styles.proseH}>
                What changes, <em>and when.</em>
              </h2>
              <div className={styles.proseBody}>
                <p>
                  Updating your display name is immediate across most of the platform. A few things
                  propagate slightly later — here's what to expect.
                </p>
              </div>
              <WhereGrid />
            </section>

            <section className={styles.section}>
              <div className={styles.proseEye}>Pronouns</div>
              <h2 className={styles.proseH}>
                Setting and <em>changing pronouns.</em>
              </h2>
              <div className={styles.proseBody}>
                <p>
                  Your pronouns appear on your profile page, next to your name in message threads, and
                  in the member directory if you've made that section visible. They do not appear in
                  URLs, notification emails, or search result snippets.
                </p>
                <p>
                  You can set multiple pronoun sets (e.g. she/they) and add a custom string if none of
                  the presets fit. Changes take effect immediately and there's no limit to how often
                  you can update them.
                </p>
                <p>
                  If another member uses the wrong pronouns for you in the forum or messages, you can
                  report it using the report function on any post or message. Our moderation team
                  treats repeated misgendering as a code of conduct issue.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.proseEye}>Common questions</div>
              <h2 className={styles.proseH}>
                Things people <em>ask us.</em>
              </h2>
              <FaqList />
            </section>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>
                Update your <em>name now</em>
              </h3>
              <p>
                Make changes to your display name, chosen name, and pronouns in your profile settings.
              </p>
              <Button variant="primary" to={routes.editProfile}>
                Edit profile
              </Button>
            </div>
            <div className={styles.commitment}>
              <h4>Our commitment</h4>
              <p>
                QueerPulse will never require documentation to change your name or pronouns. No legal
                name verification. No deadnaming by staff. If something on the platform misgenders you,{' '}
                <Link to={routes.contact}>tell us</Link> and we'll fix it.
              </p>
            </div>
            <div className={styles.sidebarCard}>
              <h3>
                Something <em>wrong?</em>
              </h3>
              <p>
                If you've found your deadname somewhere on the platform, or something isn't updating
                correctly, contact us directly.
              </p>
              <Button variant="ghost" to={routes.contact}>
                Contact us
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <section className={styles.outro}>
        <h2>
          Questions about <em>your identity settings?</em>
        </h2>
        <p className={styles.outroSub}>Write to us. We'll respond within two working days.</p>
        <Button variant="ghost-dark" size="lg" to={routes.contact}>
          Contact us
        </Button>
      </section>
    </PageShell>
  )
}
