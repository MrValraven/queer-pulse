import { Button, Reveal, SectionHead } from '../../../shared/components/ui'
import { useScrollReveal } from '../../../shared/hooks/useScrollReveal'
import { useCountUp } from '../../../shared/hooks/useCountUp'
import { routes } from '../../../app/routeMap'
import { grantItems, grantStats } from '../data/grants'
import type { GrantStat } from '../data/types'
import styles from './MicroGrants.module.css'

function StatTile({ stat }: { stat: GrantStat }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const count = useCountUp(stat.countTo ?? 0, { active: isVisible })
  const display = stat.countTo
    ? `${stat.prefix ?? ''}${count.toLocaleString('en-US')}${stat.suffix ?? ''}`
    : stat.value

  return (
    <div className={styles.stat} ref={ref}>
      <div className={styles.statValue}>{display}</div>
      <div className={styles.statLabel}>{stat.label}</div>
    </div>
  )
}

export function MicroGrants() {
  return (
    <section className={styles.grants} id="grants">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                The community fund. <em>Small amounts, real impact.</em>
              </>
            }
            subtitle="Members contribute what they can. Others apply for €50–200 for event costs, project materials, or emergencies. No bureaucracy."
            action={
              <Button variant="ghost" to={routes.grants}>
                See the fund →
              </Button>
            }
          />
        </Reveal>

        <Reveal className={styles.stats}>
          {grantStats.map((stat) => (
            <StatTile key={stat.label} stat={stat} />
          ))}
        </Reveal>

        <div className={styles.list}>
          {grantItems.map((grant, index) => (
            <Reveal key={grant.title} className={styles.row} delay={index * 50}>
              <div className={styles.amount}>{grant.amount}</div>
              <div className={styles.info}>
                <h4>{grant.title}</h4>
                <p>{grant.description}</p>
              </div>
              <div className={styles.who}>{grant.who}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.cta}>
          <Button to={`${routes.grants}#apply`}>Apply for a grant</Button>
          <Button variant="ghost" to={`${routes.grants}#contribute`}>
            Contribute to the fund →
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
