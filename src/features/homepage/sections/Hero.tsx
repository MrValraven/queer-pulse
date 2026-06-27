import { Button, Eyebrow, Reveal } from '../../../shared/components/ui'
import { routes } from '../../../app/routeMap'
import { neighbourhoods } from '../data/gatherings'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <header className={styles.hero} id="top">
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal>
            <Eyebrow live className={styles.eyebrow}>
              A queer professional network · Lisbon
            </Eyebrow>
          </Reveal>

          <Reveal as="h1" className={styles.title} delay={60}>
            Where Lisbon's queer talent <em>finds each other.</em>
          </Reveal>

          <Reveal as="p" className={styles.sub} delay={120}>
            A quiet, vouched-for network for LGBTQ+ professionals in the city. No
            follower counts, no hustle, no performing — just people worth knowing,
            and a room that already feels like yours.
          </Reveal>

          <Reveal className={styles.cta} delay={180}>
            <Button size="lg" to={routes.requestInvite}>
              Request an invite
            </Button>
            <Button size="lg" variant="ghost" href="#discovery">
              Explore members
            </Button>
          </Reveal>

          <Reveal as="p" className={styles.note} delay={220}>
            <span className={styles.liveDot} aria-hidden />
            Invite-only · every member is vouched for by another
          </Reveal>

          <Reveal className={styles.ticker} delay={260}>
            {neighbourhoods.map((hood) => (
              <span key={hood} className={styles.hood}>
                {hood}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </header>
  )
}
