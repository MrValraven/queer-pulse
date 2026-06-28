import { FiCheckCircle } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { PROVIDERS, HOW_IT_WORKS } from './queerPaediatricians.data'
import styles from './resources.module.css'

export function QueerPaediatriciansPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer Parents"
        eyebrowDotColor="var(--accent)"
        title={<>Doctors who <em>don't blink.</em></>}
        lead="Paediatricians in Lisbon that families in the network actually trust — ones who won't pause at two mums on the intake form and who talk to both of you equally. Peer-verified, dated, honest."
        anchors={[
          { label: 'The list', href: '#list' },
          { label: 'How it works', href: '#how' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="list">
        <div className="wrap">
          <Reveal as="h2">The <em>list</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Every entry added by a parent who sees them. Dates show the last peer check.
          </Reveal>
          <div className={styles.grid}>
            {PROVIDERS.map((p, i) => (
              <Reveal key={p.name} className={styles.card} delay={i * 55}>
                <span className={styles.verifiedTag}>
                  <FiCheckCircle aria-hidden /> {p.checked}
                </span>
                <div className={styles.cardName} style={{ fontSize: 19 }}>{p.name}</div>
                <div className={styles.archiveMeta}>{p.practice} · {p.hood}</div>
                <div className={styles.cardSpec}>{p.notedFor}</div>
                <div className={styles.tags}>
                  {p.tags.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </Reveal>
            ))}
            <div className={`${styles.card} ${styles.cardDashed}`}>
              Know a paediatrician the community should have?
              <Button
                variant="ghost"
                style={{ marginTop: 12 }}
                onClick={() => showToast('Thanks — a parent mod will follow up to add and verify them.')}
              >
                Suggest a provider
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="how">
        <div className="wrap">
          <Reveal as="h2">How the list <em>works</em></Reveal>
          {HOW_IT_WORKS.map((p) => (
            <Reveal as="p" key={p} className={styles.leadP} style={{ maxWidth: '64ch' }}>{p}</Reveal>
          ))}
        </div>
      </section>

      <Outro
        title={<>Ask the <em>network.</em></>}
        sub="Looking for something specific — a dentist, a therapist for a teen? The parents forum is the fastest way to a trusted name."
      >
        <Button to={routes.forum} variant="primary" size="lg">
          Ask in the forum
        </Button>
      </Outro>
    </PageShell>
  )
}
