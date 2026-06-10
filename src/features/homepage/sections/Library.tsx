import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Button, Reveal, SectionHead } from '../../../shared/components/ui'
import { linkToPath } from '../../../app/routeMap'
import { libraryItems, libraryMoreCount } from '../data/libraryItems'
import styles from './Library.module.css'

export function Library() {
  return (
    <section className={styles.library} id="library">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                The knowledge <em>doesn't disappear.</em>
              </>
            }
            subtitle="Recordings, guides, and notes from every gathering — searchable and preserved. Workshop wisdom that outlives the room."
            action={
              <Button variant="ghost" to={linkToPath('QueerPulse Library.html')}>
                Browse the library →
              </Button>
            }
          />
        </Reveal>

        <div className={styles.grid}>
          {libraryItems.map((item, index) => (
            <Reveal key={item.href} delay={index * 50}>
              <Link to={linkToPath(item.href)} className={styles.card}>
                <span className={[styles.type, styles[item.type]].join(' ')}>
                  {item.typeLabel}
                </span>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.meta}>
                  {item.meta.map((part, i) => (
                    <Fragment key={part}>
                      {i > 0 && <span className={styles.dot} aria-hidden />}
                      <span>{part}</span>
                    </Fragment>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}

          <Reveal delay={libraryItems.length * 50}>
            <Link
              to={linkToPath('QueerPulse Library.html')}
              className={[styles.card, styles.more].join(' ')}
            >
              <div className={styles.moreCount}>{libraryMoreCount}</div>
              <div className={styles.moreSub}>in the archive →</div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
