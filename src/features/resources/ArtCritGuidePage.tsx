import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { PRINCIPLE, FLOW, EXAMPLES } from './artCritGuide.data'
import styles from './resources.module.css'

export function ArtCritGuidePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Rainbow Arts"
        eyebrowDotColor="var(--accent)"
        title={<>How our crits <em>work.</em></>}
        lead="Honest, kind, specific — in that order. Here's the whole method, so your first open crit feels less like a test and more like the room being on your side."
        anchors={[
          { label: 'The principle', href: '#principle' },
          { label: 'How a session runs', href: '#flow' },
          { label: 'What to say', href: '#examples' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="principle">
        <div className="wrap">
          <Reveal as="h2">The <em>principle</em></Reveal>
          {PRINCIPLE.map((p) => (
            <Reveal as="p" key={p} className={styles.leadP} style={{ maxWidth: '62ch' }}>{p}</Reveal>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="flow">
        <div className="wrap">
          <Reveal as="h2">How a session <em>runs</em></Reveal>
          <Reveal as="p" className={styles.leadP}>Arrival to coffee, in four moves.</Reveal>
          <div className={styles.stepList}>
            {FLOW.map((s) => (
              <Reveal key={s.n} className={styles.step}>
                <div className={styles.stepN}>{s.n}</div>
                <div>
                  <div className={styles.stepTitle}>{s.title}</div>
                  <div className={styles.stepBody}>{s.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="examples">
        <div className="wrap">
          <Reveal as="h2">What to <em>say</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Specific beats nice. Here's the difference, in the room's own words.
          </Reveal>
          <div className={styles.grid}>
            {EXAMPLES.map((ex, i) => (
              <Reveal key={ex.good} className={styles.card} delay={i * 55}>
                <span className={`${styles.badge} ${styles.badgeProtected}`}>Try this</span>
                <div className={styles.cardSpec} style={{ flex: 'none' }}>{ex.good}</div>
                <span className={`${styles.badge} ${styles.badgeKnow}`} style={{ marginTop: 8 }}>Avoid</span>
                <div className={styles.cardSpec} style={{ flex: 'none' }}>{ex.avoid}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Bring <em>one work.</em></>}
        sub="Finished or not — half-finished is exactly what a crit is for. Find the next open crit on the board."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          Find the next crit
        </Button>
      </Outro>
    </PageShell>
  )
}
