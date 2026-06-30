import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { STEPS, TIPS } from "./disabilityHealthcare.data";
import styles from "./resources.module.css";

export function DisabilityHealthcarePage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Disabled Queers"
        eyebrowDotColor="var(--jade)"
        title={
          <>
            The system, <em>navigated.</em>
          </>
        }
        lead="Getting through Portuguese healthcare with a disability or chronic condition — accommodations, referrals, accessibility-aware GPs, and the insurance maze — without it becoming an appointment about your identity."
        anchors={[
          { label: "Step by step", href: "#steps" },
          { label: "Peer tips", href: "#tips" },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="steps"
      >
        <div className="wrap">
          <Reveal as="h2">
            Step by <em>step</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Never ask anyone here what their diagnosis is — and expect the same
            care from the system.
          </Reveal>
          <div className={styles.stepList}>
            {STEPS.map((s) => (
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

      <section className={`${styles.section} ${styles.sectionCream}`} id="tips">
        <div className="wrap">
          <Reveal as="h2">
            Peer <em>tips</em>
          </Reveal>
          <div>
            {TIPS.map((t) => (
              <Reveal key={t.who} className={styles.qaItem}>
                <div
                  className={styles.qaQ}
                  style={{ fontStyle: "italic", fontWeight: 400 }}
                >
                  "{t.text}"
                </div>
                <div className={styles.archiveMeta}>{t.who}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            You set the <em>terms.</em>
          </>
        }
        sub="Know your rights, and never navigate it alone. The legal page and the group are both here."
      >
        <Button to={routes.legal} variant="primary" size="lg">
          Know your rights
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          Ask the group
        </Button>
      </Outro>
    </PageShell>
  );
}
