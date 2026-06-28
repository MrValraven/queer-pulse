import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { PACE_GROUPS, BRING } from './runningGuide.data'
import styles from './resources.module.css'

export function RunningGuidePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer Runners"
        eyebrowDotColor="var(--jade)"
        title={<>Your first run, <em>honestly.</em></>}
        lead="Which pace group is yours, what to bring, and the one thing that matters most: nobody runs alone and nobody gets left. Here's everything you need before Sunday."
        anchors={[
          { label: 'Pace groups', href: '#pace' },
          { label: 'What to bring', href: '#bring' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="pace">
        <div className="wrap">
          <Reveal as="h2">Which group is <em>yours</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            We split into three pace groups at the start. Pick the honest one, not the ambitious
            one — you can always move up next week. Every pace belongs here.
          </Reveal>
          <div className={styles.grid}>
            {PACE_GROUPS.map((g, i) => (
              <Reveal key={g.name} className={styles.card} delay={i * 55}>
                <div className={styles.cardName}>{g.name}</div>
                <div className={styles.tags}>
                  <span className={styles.tag}>{g.pace}</span>
                </div>
                <div className={styles.cardSpec}>{g.who}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="bring">
        <div className="wrap">
          <Reveal as="h2">What to <em>bring</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Short version: less than you think. Here's the whole list.
          </Reveal>
          <div className={styles.checklist}>
            {BRING.map((item) => (
              <Reveal key={item.title} className={styles.checkItem}>
                <FiCheck className={styles.checkIcon} aria-hidden />
                <div>
                  <div className={styles.cardName} style={{ fontSize: 18 }}>{item.title}</div>
                  <div className={styles.cardSpec} style={{ marginTop: 4 }}>{item.note}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>See you at the <em>start line.</em></>}
        sub="Coffee after is half the point. Find the next run on the gatherings board."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          Find the next run
        </Button>
      </Outro>
    </PageShell>
  )
}
