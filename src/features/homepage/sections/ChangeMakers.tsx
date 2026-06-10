import { Link } from 'react-router-dom'
import { Button, ImageSlot, Reveal } from '../../../shared/components/ui'
import { linkToPath } from '../../../app/routeMap'
import { changemakers } from '../data/changemakers'
import styles from './ChangeMakers.module.css'

export function ChangeMakers() {
  return (
    <section className={styles.section} id="changemakers">
      <div className="wrap">
        <div className={styles.top}>
          <div>
            <Reveal className={styles.eyebrow}>Community voices</Reveal>
            <Reveal as="h2" className={styles.title} delay={60}>
              People <em>making it better</em> — every day
            </Reveal>
          </div>
          <div className={styles.aside}>
            <Reveal as="p" className={styles.sub}>
              Advocates, organisers, and artists reshaping queer life in Lisbon. Real
              people, real work, real change.
            </Reveal>
            <Reveal delay={60}>
              <Button variant="ghost-dark" to={linkToPath('QueerPulse Changemakers.html')}>
                Meet all change makers →
              </Button>
            </Reveal>
          </div>
        </div>

        <div className={styles.grid}>
          {changemakers.map((person, index) => (
            <Reveal key={person.key} delay={index * 70}>
              <Link
                to={linkToPath(`QueerPulse Changemakers.html#${person.key}`)}
                className={styles.card}
              >
                <ImageSlot
                  tint={person.tint}
                  height={240}
                  radius={0}
                  placeholder={`Portrait: ${person.name}`}
                />
                <div className={styles.body}>
                  <div className={styles.cause}>{person.cause}</div>
                  <div className={styles.name}>{person.name}</div>
                  <p className={styles.blurb}>{person.blurb}</p>
                  <div className={styles.tags}>
                    {person.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
