import { FiArrowUpRight } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { ORGS, VERIFY_NOTE } from './qtipocOrganisations.data'
import styles from './resources.module.css'

export function QtipocOrganisationsPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer POC"
        eyebrowDotColor="var(--accent)"
        title={<>Organisations that <em>hold all of it.</em></>}
        lead="Groups across Portugal working where race and queerness meet — neither treated as a footnote of the other. What they do, what they offer, and how to reach them."
        anchors={[
          { label: 'The organisations', href: '#orgs' },
          { label: 'Before you engage', href: '#verify' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="orgs">
        <div className="wrap">
          <Reveal as="h2">The <em>organisations</em></Reveal>
          <div className={styles.grid}>
            {ORGS.map((o, i) => (
              <Reveal key={o.name} className={styles.card} delay={i * 55}>
                <a
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardName}
                  style={{ fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {o.name} <FiArrowUpRight aria-hidden />
                </a>
                <div className={styles.cardSpec}>{o.mission}</div>
                <div className={styles.archiveMeta}>{o.offers}</div>
                <div className={styles.tags}>
                  {o.tags.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="verify">
        <div className="wrap">
          <Reveal as="h2">Before you <em>engage</em></Reveal>
          {VERIFY_NOTE.map((p) => (
            <Reveal as="p" key={p} className={styles.leadP} style={{ maxWidth: '64ch' }}>{p}</Reveal>
          ))}
        </div>
      </section>

      <Outro
        title={<>Know one we've <em>missed?</em></>}
        sub="This directory grows by word of mouth. Bring the ones that helped you."
      >
        <Button to={routes.forum} variant="primary" size="lg">
          Add an organisation
        </Button>
      </Outro>
    </PageShell>
  )
}
