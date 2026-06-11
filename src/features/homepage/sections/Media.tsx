import { Link } from 'react-router-dom'
import { Reveal, SectionHead } from '../../../shared/components/ui'
import { routes } from '../../../app/routeMap'
import styles from './Media.module.css'

const FilmIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x={2} y={4} width={20} height={16} rx={2.5} />
    <path d="M2 9h20M7 4v5M12 4v5M17 4v5" />
    <path d="M10 13l5 3-5 3z" fill="currentColor" stroke="none" />
  </svg>
)

const MusicIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 18V5l11-2v13" />
    <circle cx={6} cy={18} r={3} />
    <circle cx={17} cy={16} r={3} />
  </svg>
)

export function Media() {
  return (
    <section className={styles.section} id="media">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                Queer film and music, <em>made here.</em>
              </>
            }
            subtitle="Two community-run platforms inside QueerPulse — one for the screen, one for the speakers. Built by members, with the artists paid."
          />
        </Reveal>

        <Reveal className={styles.grid}>
          <Link to={routes.cinema} className={[styles.card, styles.cardFilm].join(' ')}>
            <span className={[styles.icon, styles.iconFilm].join(' ')}>
              <FilmIcon />
            </span>
            <div className={styles.eyebrow}>QueerPulse Cinema</div>
            <h3 className={styles.title}>
              Queer cinema, <em>on your terms.</em>
            </h3>
            <p className={styles.desc}>
              Stream a curated library of queer film, catch community screenings around Lisbon, and
              submit your own work. Festival favourites and first-time filmmakers, side by side.
            </p>
            <div className={styles.chips}>
              <span className={styles.chip}>Stream</span>
              <span className={styles.chip}>Screenings</span>
              <span className={styles.chip}>Submit a film</span>
            </div>
            <span className={styles.cta}>Enter the Cinema →</span>
          </Link>

          <Link to={routes.studio} className={[styles.card, styles.cardMusic].join(' ')}>
            <span className={[styles.icon, styles.iconMusic].join(' ')}>
              <MusicIcon />
            </span>
            <div className={styles.eyebrow}>QueerPulse Studio</div>
            <h3 className={styles.title}>
              Queer music, <em>fairly paid.</em>
            </h3>
            <p className={styles.desc}>
              Releases, artists, and live sessions from the community — with transparent payouts, a
              solidarity fund, and open calls. Listen, release your own, or back the people making it.
            </p>
            <div className={styles.chips}>
              <span className={styles.chip}>Listen</span>
              <span className={styles.chip}>Release</span>
              <span className={styles.chip}>Live sessions</span>
            </div>
            <span className={styles.cta}>Enter the Studio →</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
