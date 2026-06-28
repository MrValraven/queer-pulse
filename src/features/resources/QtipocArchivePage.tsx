import { PageShell } from '../../shared/components/layout'
import { Button, ImageSlot, Outro, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { INTRO, PIECES } from './qtipocArchive.data'
import styles from './resources.module.css'

export function QtipocArchivePage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer POC · Archive"
        eyebrowDotColor="var(--accent)"
        title={<>Kept by us, <em>for us.</em></>}
        lead="A living archive of QTIPOC life in Lisbon — photo essays, writing, recordings, documents. Contributed, credited, and held with care. Credit all labour, especially the emotional kind."
        anchors={[
          { label: 'About the archive', href: '#about' },
          { label: 'The collection', href: '#collection' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="about">
        <div className="wrap">
          <Reveal as="h2">About the <em>archive</em></Reveal>
          {INTRO.map((p) => (
            <Reveal as="p" key={p} className={styles.leadP} style={{ maxWidth: '64ch' }}>{p}</Reveal>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="collection">
        <div className="wrap">
          <Reveal as="h2">The <em>collection</em></Reveal>
          <Reveal as="p" className={styles.leadP}>Most recent first. Tap any piece for the full set.</Reveal>
          <div className={styles.archiveGrid}>
            {PIECES.map((p, i) => (
              <Reveal key={p.title} className={`${styles.card} ${styles.archiveCard}`} delay={i * 55}>
                <ImageSlot tint={p.tint} placeholder={p.title} height={180} />
                <div className={styles.archiveMeta}>{p.kind} · {p.year}</div>
                <div className={styles.cardName} style={{ fontSize: 20 }}>{p.title}</div>
                <div className={styles.cardSpec}>{p.blurb}</div>
              </Reveal>
            ))}
          </div>
          <div className={`${styles.card} ${styles.cardDashed}`} style={{ marginTop: 24 }}>
            Have something to add — a photo, a piece, a recording?
            <Button
              variant="ghost"
              style={{ marginTop: 12 }}
              onClick={() => showToast('Thank you — a mod will reach out about adding it, with full credit and your terms.')}
            >
              Contribute to the archive
            </Button>
          </div>
        </div>
      </section>

      <Outro
        title={<>Nothing here is <em>extracted.</em></>}
        sub="Everything is given, on the contributor's terms. Bring yours when you're ready."
      >
        <Button to={routes.forum} variant="primary" size="lg">
          Talk to the group
        </Button>
      </Outro>
    </PageShell>
  )
}
