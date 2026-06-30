import { FiArrowUpRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { TOPICS, LINKS } from "./lgbtqAgingGuide.data";
import styles from "./resources.module.css";

export function LgbtqAgingGuidePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer Elders"
        eyebrowDotColor="var(--jade)"
        title={
          <>
            Aging on <em>your own terms.</em>
          </>
        }
        lead="Navigating Portuguese healthcare as an LGBTQ+ person over 50 — GPs, hospitals, care, and mental health, with the specific history you carry taken as a given, not a surprise."
        anchors={[
          { label: "The essentials", href: "#topics" },
          { label: "Useful links", href: "#links" },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="topics"
      >
        <div className="wrap">
          <Reveal as="h2">
            The <em>essentials</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Plain, practical, and written by the group that uses it. Recently
            translated into Portuguese.
          </Reveal>
          <div className={styles.grid}>
            {TOPICS.map((t, i) => (
              <Reveal key={t.title} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>
                  {t.title}
                </div>
                <div className={styles.cardSpec}>{t.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="links"
      >
        <div className="wrap">
          <Reveal as="h2">
            Useful <em>links</em>
          </Reveal>
          <div className={styles.grid}>
            {LINKS.map((l, i) => (
              <Reveal
                as="a"
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
                delay={i * 55}
              >
                <div
                  className={styles.cardName}
                  style={{
                    fontSize: 19,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {l.label} <FiArrowUpRight aria-hidden />
                </div>
                <div className={styles.cardSpec}>{l.note}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Later life, <em>well held.</em>
          </>
        }
        sub="If what you need is someone to talk to, the mental health directory is affirming at every age."
      >
        <Button to={routes.mentalHealth} variant="primary" size="lg">
          Find affirming support
        </Button>
      </Outro>
    </PageShell>
  );
}
