import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import styles from './MaintenancePage.module.css'

const AFFECTED = [
  { up: false, text: 'Web platform · everything except…' },
  { up: false, text: 'Mobile app · same deployment' },
  { up: false, text: 'Email notifications · queued, sent after' },
  { up: true, text: <>Crisis chat · <b>fully up</b> — backed by separate infrastructure</> },
  { up: true, text: <>Emergency &amp; safety pages · <b>fully up</b> · cached worldwide</> },
]

export function MaintenancePage() {
  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />

      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.wrap}>
        <span className={styles.eyebrow}>Scheduled maintenance</span>
        <h1 className={styles.h1}>Be right <em>back.</em></h1>
        <p className={styles.lead}>
          We're shipping the <b>2.5 release</b> — better moderation tools, an upgraded crisis chat,
          and faster image uploads. Should be back in about <em>20 minutes</em>.
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLbl}>Started</div>
            <div className={styles.infoVal}>14:00 <em>WET</em></div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLbl}>Back by</div>
            <div className={styles.infoVal}><em>~14:20</em> WET</div>
          </div>
        </div>

        <div className={styles.affected}>
          <h4 className={styles.affectedTitle}>What's down · what isn't</h4>
          <ul className={styles.affectedList}>
            {AFFECTED.map((item, i) => (
              <li key={i} className={item.up ? styles.itemUp : styles.itemDown}>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Button to={routes.status}>Live status →</Button>
          <Button variant="ghost-dark" to={routes.crisisChat}>
            Crisis chat (still on)
          </Button>
        </div>

        <p className={styles.meta}>
          Follow along on{' '}
          <a href="https://status.queerpulse.app">status.queerpulse.app</a>
          {' '}· we post a public retrospective every time.{' '}
          <br />Built by humans in Lisbon, who'd rather we ship slowly than break crisis chat.
        </p>
      </div>
    </div>
  )
}
