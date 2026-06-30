import { FiCheckCircle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { GROUPS } from "./accessibleLisbon.data";
import styles from "./resources.module.css";

export function AccessibleLisbonPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Accessible Lisbon"
        eyebrowDotColor="var(--jade)"
        title={
          <>
            Lisbon, <em>actually reachable.</em>
          </>
        }
        lead="Step-free routes, low-sensory venues, and family-friendly spaces — every entry peer-verified by someone who went there. If it's on the list, somebody checked it themselves."
        anchors={GROUPS.map((g) => ({ label: g.label, href: `#${g.id}` }))}
      />

      {GROUPS.map((group, gi) => (
        <section
          key={group.id}
          className={`${styles.section} ${gi % 2 === 0 ? styles.sectionPaper : styles.sectionCream}`}
          id={group.id}
        >
          <div className="wrap">
            <Reveal as="h2">{group.label}</Reveal>
            <Reveal as="p" className={styles.leadP}>
              {group.intro}
            </Reveal>
            <div className={styles.grid}>
              {group.places.map((place, i) => (
                <Reveal key={place.name} className={styles.card} delay={i * 55}>
                  <span className={styles.verifiedTag}>
                    <FiCheckCircle aria-hidden /> Peer-verified
                  </span>
                  <div className={styles.cardName} style={{ fontSize: 19 }}>
                    {place.name}
                  </div>
                  <div className={styles.cardSpec}>{place.detail}</div>
                  <div className={styles.tags}>
                    {place.flags.map((f) => (
                      <span key={f} className={styles.tag}>
                        {f}
                      </span>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Outro
        title={
          <>
            Been somewhere <em>that works?</em>
          </>
        }
        sub="The list only stays honest because we keep adding to it. Bring a verified spot to your community's resource board."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          Find a gathering
        </Button>
      </Outro>
    </PageShell>
  );
}
