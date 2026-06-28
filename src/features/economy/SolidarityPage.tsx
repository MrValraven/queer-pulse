import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { HOW } from './solidarity.data'
import { SolidarityDirectory } from './SolidarityDirectory'
import styles from './SolidarityPage.module.css'

export function SolidarityPage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Community care</div>
          <h1 className={styles.title}>
            Pay what
            <br />
            <em>you can.</em>
          </h1>
          <p className={styles.sub}>
            Professionals from the QueerPulse community who offer sliding-scale
            fees — because access to good care shouldn't depend on what you earn.
          </p>
          <div className={styles.note}>
            All practitioners have been verified by at least two community members.
          </div>
        </div>
      </header>

      <section className={styles.howStrip}>
        <div className="wrap">
          <div className={styles.howGrid}>
            {HOW.map((h, i) => (
              <Reveal className={styles.howItem} key={h.n} delay={Math.min(i, 8) * 80}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howBody}>{h.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SolidarityDirectory />

      <Outro
        title={<>Care is a <em>collective act.</em></>}
        sub="QueerPulse connects the community to professionals who believe in access as much as you do."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Join the network
        </Button>
      </Outro>
    </PageShell>
  )
}
