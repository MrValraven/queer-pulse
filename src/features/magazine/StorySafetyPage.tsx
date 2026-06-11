import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { StorySafetyArticle } from './StorySafetyArticle'
import styles from './StorySafetyPage.module.css'

export function StorySafetyPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>On Building</div>
          <h1>
            Why we stayed <em>invite-only:</em> safety as a feature, not a gate.
          </h1>
          <div className={styles.byline}>
            <span>The QueerPulse team</span>
            <span className={styles.sep} />
            <span>3 min read</span>
            <span className={styles.sep} />
            <span>April 2026</span>
          </div>
        </div>
      </div>

      <StorySafetyArticle />

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Read it and think it sounds <em>right?</em>
          </h2>
          <p className={styles.outroSub}>
            We're not for everyone. But if this resonates, you might be for us.
          </p>
          <Button to={routes.invite} variant="primary" size="lg">
            Request an invite
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
