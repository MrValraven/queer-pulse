import { PageShell } from "../../shared/components/layout";
import { Button, ImageSlot, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { EQUIPMENT, CARE } from "./sharedEquipment.data";
import styles from "./resources.module.css";

export function SharedEquipmentPage() {
  const { showToast } = useToast();

  return (
    <PageShell>
      <ResourceHero
        eyebrow="Rainbow Arts"
        eyebrowDotColor="var(--accent)"
        title={
          <>
            Shared kit, <em>shared care.</em>
          </>
        }
        lead="The riso, the kiln, the projector — everything the collective owns together, what it's for, and how to book it. The deal is simple: book it, clean it, log it."
        anchors={[
          { label: "The kit", href: "#kit" },
          { label: "How we care for it", href: "#care" },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="kit">
        <div className="wrap">
          <Reveal as="h2">
            The <em>kit</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            All of it lives at the atelier. Tap request and a mod confirms your
            slot.
          </Reveal>
          <div className={styles.grid}>
            {EQUIPMENT.map((item, i) => (
              <Reveal key={item.name} className={styles.card} delay={i * 55}>
                <ImageSlot
                  tint={item.tint}
                  placeholder={item.name}
                  height={160}
                />
                <div
                  className={styles.cardName}
                  style={{ fontSize: 19, marginTop: 4 }}
                >
                  {item.name}
                </div>
                <div className={styles.cardSpec}>{item.specs}</div>
                <div className={styles.cardFoot}>
                  <span className={styles.cardLoc}>{item.status}</span>
                  <Button
                    variant={item.available ? "jade" : "ghost"}
                    disabled={!item.available}
                    onClick={() =>
                      showToast(
                        `Request sent for the ${item.name} — a mod will confirm your slot.`,
                      )
                    }
                  >
                    {item.available ? "Request slot" : "On loan"}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="care">
        <div className="wrap">
          <Reveal as="h2">
            How we <em>care for it</em>
          </Reveal>
          <div className={styles.checklist}>
            {CARE.map((c) => (
              <Reveal
                key={c}
                className={styles.checkItem}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {c}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Make <em>something.</em>
          </>
        }
        sub="The kit is here so the work can happen. Come to a print day and put it to use."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          Find a print day
        </Button>
      </Outro>
    </PageShell>
  );
}
