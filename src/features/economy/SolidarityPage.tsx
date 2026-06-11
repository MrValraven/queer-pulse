import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
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
            {HOW.map((h) => (
              <div className={styles.howItem} key={h.n}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howBody}>{h.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SolidarityDirectory />

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Care is a <em>collective act.</em>
          </h2>
          <p className={styles.outroSub}>
            QueerPulse connects the community to professionals who believe in access
            as much as you do.
          </p>
          <Button to={routes.invite} variant="primary" size="lg">
            Join the network
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
