import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { TIMING, SIGNALS, SCRIPTS, IF_BAD, VOICES } from './comingOutAtWork.data'
import styles from './resources.module.css'

export function ComingOutAtWorkPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Coming Out · At Work"
        eyebrowDotColor="var(--violet)"
        title={<>Coming out <em>at work.</em></>}
        lead="There's no single right way and no deadline. This is a practical guide to reading your workplace, having the conversation on your terms, and knowing your rights if it goes badly."
        anchors={[
          { label: 'Is there a right time?', href: '#timing' },
          { label: 'Reading your workplace', href: '#signals' },
          { label: 'The conversation', href: '#scripts' },
          { label: 'If it goes badly', href: '#bad' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="timing">
        <div className="wrap">
          <Reveal as="h2">Is there a <em>right time?</em></Reveal>
          <Reveal as="p" className={styles.leadP}>Short answer: only yours.</Reveal>
          <div className={styles.grid}>
            {TIMING.map((t, i) => (
              <Reveal key={t.title} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>{t.title}</div>
                <div className={styles.cardSpec}>{t.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="signals">
        <div className="wrap">
          <Reveal as="h2">Reading your <em>workplace</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            None of these is decisive on its own — but together they tell you a lot.
          </Reveal>
          <div className={styles.grid}>
            {SIGNALS.map((s, i) => (
              <Reveal key={s.text} className={styles.rightCard} delay={i * 45}>
                <span className={`${styles.badge} ${s.badge === 'good' ? styles.badgeProtected : styles.badgeKnow}`}>
                  {s.badge === 'good' ? 'Green flag' : 'Caution'}
                </span>
                <div className={styles.rightBody}>{s.text}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="scripts">
        <div className="wrap">
          <Reveal as="h2">Having the <em>conversation</em></Reveal>
          <Reveal as="p" className={styles.leadP}>Words you can borrow. Adjust until they sound like you.</Reveal>
          <div>
            {SCRIPTS.map((s) => (
              <Reveal key={s.context} className={styles.qaItem}>
                <div className={styles.qaQ}>{s.context}</div>
                <div className={styles.qaA} style={{ fontStyle: 'italic' }}>{s.line}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="bad">
        <div className="wrap">
          <Reveal as="h2">If it goes <em>badly</em></Reveal>
          <div className={styles.grid}>
            {IF_BAD.map((b, i) => (
              <Reveal key={b.title} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>{b.title}</div>
                <div className={styles.cardSpec}>{b.body}</div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            {VOICES.map((v) => (
              <Reveal key={v.who} className={styles.qaItem}>
                <div className={styles.qaQ} style={{ fontStyle: 'italic', fontWeight: 400 }}>"{v.text}"</div>
                <div className={styles.archiveMeta}>{v.who}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Your timeline is <em>yours.</em></>}
        sub="Know your rights before you need them, and lean on the people who've done it."
      >
        <Button to={routes.legal} variant="primary" size="lg">
          Know your workplace rights
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          Talk it through
        </Button>
      </Outro>
    </PageShell>
  )
}
