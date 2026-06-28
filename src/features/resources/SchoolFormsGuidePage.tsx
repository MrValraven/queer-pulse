import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { ON_FORMS, RIGHTS, VOICES } from './schoolFormsGuide.data'
import styles from './resources.module.css'

const badgeClass: Record<string, string> = {
  protected: styles.badgeProtected,
  know: styles.badgeKnow,
  practical: styles.badgeKnow,
}
const badgeLabel: Record<string, string> = {
  protected: 'Protected right',
  know: 'Know this',
  practical: 'Practical',
}

export function SchoolFormsGuidePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer Parents"
        eyebrowDotColor="var(--accent)"
        title={<>Two parents, <em>one form.</em></>}
        lead="School intake forms, navigated: what to expect on the fields, how to ask for both your names everywhere, and your rights when a form hasn't caught up with your family."
        anchors={[
          { label: 'On the forms', href: '#forms' },
          { label: 'Your rights', href: '#rights' },
          { label: 'What others did', href: '#voices' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="forms">
        <div className="wrap">
          <Reveal as="h2">On the <em>forms</em></Reveal>
          <Reveal as="p" className={styles.leadP}>Three moves that handle most of it.</Reveal>
          <div className={styles.stepList}>
            {ON_FORMS.map((s) => (
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

      <section className={`${styles.section} ${styles.sectionCream}`} id="rights">
        <div className="wrap">
          <Reveal as="h2">Your <em>rights</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Plain-language summary. For the full legal picture, the legal aid page goes deeper.
          </Reveal>
          <div className={styles.grid}>
            {RIGHTS.map((r, i) => (
              <Reveal key={r.title} className={styles.rightCard} delay={i * 55}>
                <span className={`${styles.badge} ${badgeClass[r.badge]}`}>{badgeLabel[r.badge]}</span>
                <div className={styles.rightTitle}>{r.title}</div>
                <div className={styles.rightBody}>{r.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="voices">
        <div className="wrap">
          <Reveal as="h2">What others <em>did</em></Reveal>
          <div>
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
        title={<>You don't have to <em>explain your family.</em></>}
        sub="Know your rights, then lean on the network. The legal aid page has the templates."
      >
        <Button to={routes.legal} variant="primary" size="lg">
          Read the legal guide
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          Ask the parents forum
        </Button>
      </Outro>
    </PageShell>
  )
}
