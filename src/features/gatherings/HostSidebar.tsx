import { Button, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { SPACES } from './hostPage.data'
import styles from './HostPage.module.css'

export function HostSidebar() {
  return (
    <Reveal as="aside" className={styles.sidebar} delay={90}>
      <div className={styles.sidebarCard}>
        <h3>Ready to list your gathering?</h3>
        <p>
          Once you have a date, a format, and a rough idea of who you're inviting, you can
          list it on the QueerPulse gatherings page.
        </p>
        <Button className={styles.fullBtn} to={routes.createGathering}>
          Create your gathering →
        </Button>
      </div>
      <div className={styles.sidebarCard}>
        <h3>Partner spaces</h3>
        <p>Spaces that have hosted QueerPulse gatherings and are open to hosting more.</p>
        <div className={styles.spaceList}>
          {SPACES.map((space) => (
            <div key={space.name} className={styles.spaceRow}>
              <div className={styles.spaceHood}>{space.hood}</div>
              <div className={styles.spaceName}>{space.name}</div>
              <div className={styles.spaceNote}>{space.note}</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
