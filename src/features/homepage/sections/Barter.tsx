import { Link } from 'react-router-dom'
import { Button, Reveal, SectionHead } from '../../../shared/components/ui'
import { linkToPath, routes } from '../../../app/routeMap'
import { swaps } from '../data/swaps'
import styles from './Barter.module.css'

export function Barter() {
  return (
    <section className={styles.barter} id="barter">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                Swap what you know <em>for what you need.</em>
              </>
            }
            subtitle="A structured barter system — skills for skills, expertise for expertise. Post what you offer and what you want. No money, no platforms."
            action={
              <Button variant="ghost" to={routes.barter}>
                Browse all swaps →
              </Button>
            }
          />
        </Reveal>

        <div className={styles.grid}>
          {swaps.map((swap, index) => (
            <Reveal key={swap.href} delay={index * 55}>
              <Link to={linkToPath(swap.href)} className={styles.card}>
                <div>
                  <span className={[styles.label, styles.offering].join(' ')}>Offering</span>
                  <div className={styles.skill}>{swap.offering}</div>
                </div>
                <div className={styles.divider}>in exchange for</div>
                <div>
                  <span className={[styles.label, styles.wanting].join(' ')}>Wanting</span>
                  <div className={styles.skill}>{swap.wanting}</div>
                </div>
                <div className={styles.poster}>
                  <span className={styles.avMini}>{swap.posterInitials}</span>
                  {swap.poster}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
