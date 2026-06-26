import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { PRIVACY, STAGES } from './comingOut.data'
import styles from './ComingOutPage.module.css'

export function ComingOutPage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>Coming-Out Support · Private space</Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            A place to say it <em>before you say it.</em>
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            A private, low-visibility space for people navigating coming out — at work, to family,
            or to themselves. There's no pressure to be "out" to join, and nothing here is visible
            from your public profile.
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            Built for <em>privacy</em>, first.
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            This space carries additional controls beyond the rest of QueerPulse. They exist so you
            can be here without it costing you anything elsewhere.
          </Reveal>
          <div className={styles.grid}>
            {PRIVACY.map((item, index) => (
              <Reveal key={item.title} className={styles.card} delay={index * 55}>
                <div className={styles.cardIcon}><item.icon /></div>
                <div className={styles.cardTitle}>{item.title}</div>
                <div className={styles.cardBody}>{item.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            However you <em>need to use it.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            Facilitated with a light hand by Mariana, a clinical psychologist who holds
            confidentiality as the first rule and the last.
          </Reveal>
          <div className={styles.steps}>
            {STAGES.map((stage, index) => (
              <Reveal key={stage.n} className={styles.step} delay={index * 60}>
                <span className={styles.stepN}>{stage.n}</span>
                <div>
                  <div className={styles.stepTitle}>{stage.title}</div>
                  <div className={styles.stepBody}>{stage.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>You don't owe a <em>perfect speech.</em></>}
        sub="Saying the true thing badly is still saying the true thing. Enter the space whenever you're ready — and leave the moment you are."
      >
        <Button to="/community/coming-out" variant="primary" size="lg">
          Enter the space →
        </Button>
        <Button to="/communities" variant="ghost-dark" size="lg">
          See all communities
        </Button>
      </Outro>
    </PageShell>
  )
}
