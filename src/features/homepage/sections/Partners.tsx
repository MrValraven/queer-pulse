import { Link } from 'react-router-dom'
import { Reveal, SectionHead } from '../../../shared/components/ui'
import { linkToPath } from '../../../app/routeMap'
import { partners } from '../data/partners'
import styles from './Partners.module.css'

export function Partners() {
  return (
    <section className={styles.strip}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <>
                Community is stronger when <em>communities connect.</em>
              </>
            }
            subtitle="We work with organisations that share our values — across Portugal and beyond."
          />
        </Reveal>

        <Reveal className={styles.logos}>
          {partners.map((partner) => (
            <Link key={partner.name} to={linkToPath(partner.href)} className={styles.badge}>
              <span className={[styles.av, styles[partner.tone]].join(' ')}>
                {partner.initials}
              </span>
              <span>
                <span className={styles.name} style={{ display: 'block' }}>
                  {partner.name}
                </span>
                <span className={styles.loc}>{partner.location}</span>
              </span>
            </Link>
          ))}
          <Link
            to={linkToPath('QueerPulse Partners.html')}
            className={[styles.badge, styles.dashed].join(' ')}
          >
            <span className={[styles.av, styles.plus].join(' ')}>+</span>
            <span>
              <span className={[styles.name, styles.nameMuted].join(' ')} style={{ display: 'block' }}>
                See all partners
              </span>
              <span className={styles.loc}>8 communities</span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
