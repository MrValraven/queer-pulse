import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { StoryTomasArticle } from './StoryTomasArticle'
import styles from './StoryTomasPage.module.css'

export function StoryTomasPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLabel}>
          <div className="wrap">
            <div className={styles.cat}>Profiles</div>
            <h1>
              Leaving the startup grind for a supper club <em>in Mouraria</em>
            </h1>
            <div className={styles.heroByline}>
              <span className={styles.bylineAv}>SA</span>
              <span>
                Words by <Link to={routes.profile}>Sofia Andrade</Link>
              </span>
              <span className={styles.bDot} />
              <span>4 min read</span>
              <span className={styles.bDot} />
              <span>May 2026</span>
            </div>
          </div>
        </div>
      </div>

      <StoryTomasArticle />

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Want to join Tomás's table? <em>Join the room first.</em>
          </h2>
          <p className={styles.outroSub}>
            The supper club, the network, the gatherings — it all starts with an invitation from
            someone who knows you.
          </p>
          <Button to={routes.invite} variant="primary" size="lg">
            Request an invite
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
