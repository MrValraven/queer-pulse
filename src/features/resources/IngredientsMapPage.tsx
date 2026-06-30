import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { INTRO, AREAS } from "./ingredientsMap.data";
import styles from "./resources.module.css";

export function IngredientsMapPage() {
  const { showToast } = useToast();

  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer POC"
        eyebrowDotColor="var(--accent)"
        title={
          <>
            Ingredients from <em>home.</em>
          </>
        }
        lead="A living map of where to find the tastes of home in Lisbon — crowd-sourced by the group, organised by neighbourhood. Home is partly a flavour, and this is where to find it."
        anchors={AREAS.map((a) => ({
          label: a.hood,
          href: `#${a.hood.split(" ")[0]!.toLowerCase()}`,
        }))}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          {INTRO.map((p) => (
            <Reveal
              as="p"
              key={p}
              className={styles.leadP}
              style={{ maxWidth: "64ch", marginBottom: 48 }}
            >
              {p}
            </Reveal>
          ))}

          {AREAS.map((area) => (
            <div
              key={area.hood}
              className={styles.mapGroup}
              id={area.hood.split(" ")[0]!.toLowerCase()}
            >
              <Reveal as="div" className={styles.mapGroupLabel}>
                {area.hood}
              </Reveal>
              <div className={styles.grid}>
                {area.spots.map((s, i) => (
                  <Reveal key={s.name} className={styles.card} delay={i * 45}>
                    <div className={styles.cardName} style={{ fontSize: 18 }}>
                      {s.name}
                    </div>
                    <div className={styles.cardSpec}>{s.finds}</div>
                    <div className={styles.tags}>
                      <span className={styles.tag}>{s.origin}</span>
                      <span className={styles.tag}>{s.hours}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}

          <div
            className={`${styles.card} ${styles.cardDashed}`}
            style={{ marginTop: 32 }}
          >
            Know a spot we're missing?
            <Button
              variant="ghost"
              style={{ marginTop: 12 }}
              onClick={() =>
                showToast(
                  "Added to the queue — a mod will pop it on the map. Obrigada!",
                )
              }
            >
              Add your spot
            </Button>
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Joy is as <em>political</em> as solidarity.
          </>
        }
        sub="The map is one of the best things we've made together. Bring the rest of yourself to the group too."
      >
        <Button to={routes.forum} variant="primary" size="lg">
          Join the conversation
        </Button>
      </Outro>
    </PageShell>
  );
}
