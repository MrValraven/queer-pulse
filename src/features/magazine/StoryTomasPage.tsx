import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { memberName } from '../members/data/members'
import { Button, Outro } from '../../shared/components/ui'
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
                Words by <Link to={routes.profile}>{memberName('sofia')}</Link>
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

      <Outro
        title={<>Want to join Tomás's table? <em>Join the room first.</em></>}
        sub="The supper club, the network, the gatherings — it all starts with an invitation from someone who knows you."
      >
        <Button to={routes.invite} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
