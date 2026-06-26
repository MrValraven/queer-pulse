import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { INITIAL_GUESTS, nowHHMM, type Guest } from './gatheringDashboard.data'
import { CheckInColumn, GuestListCard, StatsColumn } from './GatheringDashboardCards'
import styles from './GatheringDashboardPage.module.css'

const MANAGE = routes.manageGathering

export function GatheringDashboardPage() {
  const { showToast } = useToast()
  const [clock, setClock] = useState(nowHHMM())
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS)

  useEffect(() => {
    const t = window.setInterval(() => setClock(nowHHMM()), 10000)
    return () => window.clearInterval(t)
  }, [])

  const checkedIn = guests.filter((g) => g.status === 'in').length

  const checkInManual = (name: string) => {
    setGuests((prev) => prev.map((g) => (g.name === name ? { ...g, status: 'in', time: nowHHMM() } : g)))
    showToast(`${name.split(' ')[0]} checked in`, 'success')
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandDot} />
          Queer<span className={styles.brandQ}>Pulse</span>
        </Link>
        <Link to={MANAGE} className={styles.backLink}>
          ← Manage gathering
        </Link>
        <span className={styles.clock}>{clock}</span>
      </div>

      <div className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} /> In progress
          </div>
          <div className={styles.heroTitle}>
            Pride Brunch — <em>June Edition</em>
          </div>
          <div className={styles.heroStats}>
            <div>
              <div className={styles.hsN}>{checkedIn}</div>
              <div className={styles.hsL}>Checked in</div>
            </div>
            <div>
              <div className={styles.hsN}>14</div>
              <div className={styles.hsL}>Expected</div>
            </div>
            <div>
              <div className={styles.hsN}>
                <em>3</em>
              </div>
              <div className={styles.hsL}>Waitlist</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <CheckInColumn guests={guests} onCheckIn={checkInManual} />
            <GuestListCard guests={guests} checkedIn={checkedIn} onCheckIn={checkInManual} />
            <StatsColumn />
          </div>
        </div>
      </div>

      <div className={styles.dataFooter}>
        <div className={`wrap ${styles.dfInner}`}>
          <div className={styles.dfText}>Gathering data is deleted 30 days after the event</div>
          <div className={styles.dfDot} />
          <div className={styles.dfText}>Attendance records are never shared publicly</div>
        </div>
      </div>
    </div>
  )
}
