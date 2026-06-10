import { Link } from 'react-router-dom'
import { Button, Reveal, SectionHead } from '../../../shared/components/ui'
import { linkToPath } from '../../../app/routeMap'
import { platforms } from '../data/platforms'
import styles from './Platforms.module.css'

export function Platforms() {
  return (
    <section className={styles.strip}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                The wider <em>queer ecosystem</em>
              </>
            }
            subtitle="Other LGBTQ+ platforms, media, and communities worth knowing about — beyond QueerPulse."
            action={
              <Button variant="ghost" to={linkToPath('QueerPulse Platforms.html')}>
                See all platforms →
              </Button>
            }
          />
        </Reveal>

        <Reveal className={styles.row}>
          {platforms.map((platform) => (
            <Link key={platform.name} to={linkToPath(platform.href)} className={styles.badge}>
              <span className={[styles.ic, styles[platform.tone]].join(' ')}>
                {platform.badge}
              </span>
              <span>
                <span className={styles.name} style={{ display: 'block' }}>
                  {platform.name}
                </span>
                <span className={styles.cat}>{platform.category}</span>
              </span>
            </Link>
          ))}
          <Link
            to={linkToPath('QueerPulse Platforms.html')}
            className={[styles.badge, styles.dashed].join(' ')}
          >
            <span className={[styles.ic, styles.plus].join(' ')}>+</span>
            <span>
              <span className={[styles.name, styles.nameMuted].join(' ')} style={{ display: 'block' }}>
                24 more
              </span>
              <span className={styles.cat}>Browse all →</span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
