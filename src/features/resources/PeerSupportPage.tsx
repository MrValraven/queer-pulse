import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { WHAT_IT_IS, STEPS } from './peerSupport.data'
import styles from './resources.module.css'

export function PeerSupportPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Trans Hub · Peer Support"
        eyebrowDotColor="var(--accent)"
        title={<>Someone who <em>gets it.</em></>}
        lead="Peer support in the Hub, in plain terms: what it is, what it isn't, how to ask for it, and how to become a peer yourself when you're ready."
        anchors={[
          { label: 'What it is', href: '#what' },
          { label: 'How it works', href: '#how' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="what">
        <div className="wrap">
          <Reveal as="h2">What peer support <em>is</em></Reveal>
          {WHAT_IT_IS.map((p) => (
            <Reveal as="p" key={p} className={styles.leadP} style={{ maxWidth: '64ch' }}>
              {p}
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="how">
        <div className="wrap">
          <Reveal as="h2">How it <em>works</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Four steps, none of them binding. You stay in control of every one.
          </Reveal>
          <div className={styles.stepList}>
            {STEPS.map((s) => (
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

      <Outro
        title={<>You don't have to carry it <em>alone.</em></>}
        sub="The Hub is here, and so is the wider community forum."
      >
        <Button to={routes.transHub} variant="primary" size="lg">
          Go to the Trans Hub
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          Open the forum
        </Button>
      </Outro>
    </PageShell>
  )
}
