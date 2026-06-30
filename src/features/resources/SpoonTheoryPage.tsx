import { GiSpoon } from "react-icons/gi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { WHAT, USES, RSVP_TIPS } from "./spoonTheory.data";
import styles from "./resources.module.css";

const SPOONS = [false, false, false, false, true, true]; // last two spent

export function SpoonTheoryPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Disabled Queers"
        eyebrowDotColor="var(--jade)"
        title={
          <>
            What we mean by <em>spoons.</em>
          </>
        }
        lead="A shared shorthand for limited energy — what spoon theory is, how this community runs on it, and how to use it when you RSVP. No essay required: 'I'm low on spoons today' is a full sentence here."
        anchors={[
          { label: "What it is", href: "#what" },
          { label: "How we use it", href: "#uses" },
          { label: "When you RSVP", href: "#rsvp" },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="what">
        <div className="wrap">
          <Reveal as="h2">
            What it <em>is</em>
          </Reveal>
          <Reveal>
            <div className={styles.spoonRow} aria-hidden>
              {SPOONS.map((spent, i) => (
                <GiSpoon
                  key={i}
                  className={`${styles.spoon} ${spent ? styles.spoonSpent : ""}`}
                />
              ))}
            </div>
            <div className={styles.archiveMeta} style={{ marginBottom: 24 }}>
              Four spoons left of six — a normal afternoon.
            </div>
          </Reveal>
          {WHAT.map((p) => (
            <Reveal
              as="p"
              key={p}
              className={styles.leadP}
              style={{ maxWidth: "64ch" }}
            >
              {p}
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="uses">
        <div className="wrap">
          <Reveal as="h2">
            How we <em>use it</em>
          </Reveal>
          <div className={styles.grid}>
            {USES.map((u, i) => (
              <Reveal key={u.title} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 18 }}>
                  {u.title}
                </div>
                <div className={styles.cardSpec}>{u.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="rsvp">
        <div className="wrap">
          <Reveal as="h2">
            When you <em>RSVP</em>
          </Reveal>
          <div className={styles.checklist}>
            {RSVP_TIPS.map((t) => (
              <Reveal
                key={t}
                className={styles.checkItem}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {t}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Come in whatever <em>state you're in.</em>
          </>
        }
        sub="We're not measuring. Every gathering is hybrid, drop-in, and built for real bodies."
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          Find a low-sensory hangout
        </Button>
      </Outro>
    </PageShell>
  );
}
