import { Button, Reveal } from '../../../shared/components/ui'
import { routes } from '../../../app/routeMap'
import styles from './Outro.module.css'

export function Outro() {
  return (
    <section className={styles.outro}>
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal as="h2" className={styles.title}>
            Walk into a room where you <em>already belong.</em>
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={80}>
            Membership is by invitation and kept small on purpose. If someone you trust
            is already here, ask them to vouch for you.
          </Reveal>
          <Reveal delay={140}>
            <Button size="lg" to={routes.requestInvite}>
              Request an invite
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
