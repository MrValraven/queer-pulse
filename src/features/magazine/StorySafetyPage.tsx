import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
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

      <Outro
        title={<>Read it and think it sounds <em>right?</em></>}
        sub="We're not for everyone. But if this resonates, you might be for us."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
