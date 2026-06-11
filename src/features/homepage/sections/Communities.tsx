import { Link } from 'react-router-dom'
import { Button, Reveal, SectionHead } from '../../../shared/components/ui'
import { linkToPath, routes } from '../../../app/routeMap'
import { communities } from '../data/communities'
import styles from './Communities.module.css'

function PrivateIcon() {
  return (
    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={3} y={11} width={18} height={11} rx={2.5} stroke="currentColor" strokeWidth={2.5} />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}

export function Communities() {
  return (
    <section className={styles.section} id="communities">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                Find your <em>people</em>
              </>
            }
            subtitle="A living directory of queer communities across Lisbon — social groups, arts collectives, activist circles, sports clubs, and more."
            action={
              <Button variant="ghost" to={routes.communities}>
                Browse all communities →
              </Button>
            }
          />
        </Reveal>

        <div className={styles.grid}>
          {communities.map((community, index) => (
            <Reveal key={community.name} delay={index * 45}>
              <Link
                to={linkToPath(community.href)}
                className={[styles.card, community.dashed && styles.dashed]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={[styles.type, styles[community.type]].join(' ')}>
                  {community.privateBadge && <PrivateIcon />}
                  {community.typeLabel}
                </span>
                <div className={styles.name}>{community.name}</div>
                <p className={styles.desc}>{community.description}</p>
                <div className={styles.foot}>
                  <span className={styles.count}>{community.count}</span>
                  <span className={styles.join}>{community.joinLabel}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
