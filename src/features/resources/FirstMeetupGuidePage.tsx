import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { EXPECT, VALUES, FAQS } from './firstMeetupGuide.data'
import styles from './resources.module.css'

export function FirstMeetupGuidePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer Social"
        eyebrowDotColor="var(--accent)"
        title={<>Your first meetup, <em>no pressure.</em></>}
        lead="What to expect, what 'no agenda' actually means, and answers to the things you're too nervous to ask. Come alone, come anxious — you'll be looked after."
        anchors={[
          { label: 'What to expect', href: '#expect' },
          { label: 'Our values', href: '#values' },
          { label: 'Nervous questions', href: '#faq' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="expect">
        <div className="wrap">
          <Reveal as="h2">What to <em>expect</em></Reveal>
          <Reveal as="p" className={styles.leadP}>The whole format, so none of it is a surprise.</Reveal>
          <div className={styles.grid}>
            {EXPECT.map((e, i) => (
              <Reveal key={e.title} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>{e.title}</div>
                <div className={styles.cardSpec}>{e.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="values">
        <div className="wrap">
          <Reveal as="h2">What "no agenda" <em>means</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Four things we hold to, so the room stays easy for everyone in it.
          </Reveal>
          <div className={styles.stepList}>
            {VALUES.map((v, i) => (
              <Reveal key={v} className={styles.step}>
                <div className={styles.stepN}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.stepBody} style={{ alignSelf: 'center' }}>{v}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="faq">
        <div className="wrap">
          <Reveal as="h2">The nervous <em>questions</em></Reveal>
          <div>
            {FAQS.map((f) => (
              <Reveal key={f.q} className={styles.qaItem}>
                <div className={styles.qaQ}>{f.q}</div>
                <div className={styles.qaA}>{f.a}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Just <em>show up.</em></>}
        sub="That's the whole entry requirement. The next meetup is on the board."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          Find the next meetup
        </Button>
      </Outro>
    </PageShell>
  )
}
