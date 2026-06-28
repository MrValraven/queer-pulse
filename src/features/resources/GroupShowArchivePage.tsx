import { PageShell } from '../../shared/components/layout'
import { Button, ImageSlot, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { SHOWS } from './groupShowArchive.data'
import styles from './resources.module.css'

export function GroupShowArchivePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Rainbow Arts · Archive"
        eyebrowDotColor="var(--accent)"
        title={<>Everything we've <em>hung.</em></>}
        lead="The collective documents every show before we strike it. Here's the archive — tag yourself, grab anything with your work in it, and see what the room has made together."
        anchors={[{ label: 'The shows', href: '#shows' }]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="shows">
        <div className="wrap">
          <Reveal as="h2">The <em>shows</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Most recent first. Full photo sets live in each album.
          </Reveal>
          <div className={styles.archiveGrid}>
            {SHOWS.map((show, i) => (
              <Reveal key={show.title} className={`${styles.card} ${styles.archiveCard}`} delay={i * 55}>
                <ImageSlot tint={show.tint} placeholder={show.title} height={180} />
                <div className={styles.archiveMeta}>{show.when} · {show.venue}</div>
                <div className={styles.cardName} style={{ fontSize: 21 }}>{show.title}</div>
                <div className={styles.cardSpec}>{show.blurb}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Documented <em>generously,</em> credited always.</>}
        sub="Shot the last show? Add your set to the archive so nobody's work disappears when the walls come down."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          See upcoming shows
        </Button>
      </Outro>
    </PageShell>
  )
}
