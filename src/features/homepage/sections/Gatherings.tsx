import { Link } from 'react-router-dom'
import { Reveal, SectionHead } from '../../../shared/components/ui'
import { routes } from '../../../app/routeMap'
import { gatherings } from '../data/gatherings'
import styles from './Gatherings.module.css'

export function Gatherings() {
  return (
    <section className={styles.gather} id="gather">
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal>
            <SectionHead
              dark
              title={
                <>
                  Where the pulse <em>meets in person</em>
                </>
              }
              subtitle="Small, member-hosted gatherings across the city. Supper clubs, studio visits, quiet mixers — show up as you are."
            />
          </Reveal>

          <div className={styles.list}>
            {gatherings.map((event, index) => (
              <Reveal key={event.id} delay={index * 50}>
                <Link
                  to={`${routes.gathering}#${event.id}`}
                  className={styles.row}
                >
                  <div className={styles.date}>
                    <span className={styles.day}>{event.day}</span>
                    <span className={styles.month}>{event.month}</span>
                  </div>
                  <div>
                    <div className={styles.type}>{event.type}</div>
                    <h3 className={styles.title}>{event.title}</h3>
                    <div className={styles.meta}>
                      <span>{event.hood}</span>
                      <span className={styles.dot} aria-hidden />
                      <span>{event.detail}</span>
                    </div>
                  </div>
                  <div className={styles.right}>
                    <div className={styles.spots}>
                      {event.spotsValue ? <b>{event.spotsValue}</b> : null} {event.spotsLabel}
                    </div>
                    <span className={styles.cta}>{event.ctaLabel}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
