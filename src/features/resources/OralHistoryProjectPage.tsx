import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { ABOUT, STEPS, VOICES } from "./oralHistoryProject.data";
import styles from "./resources.module.css";

export function OralHistoryProjectPage() {
  const { showToast } = useToast();

  return (
    <PageShell>
      <ResourceHero
        eyebrow="Queer Elders · Oral History"
        eyebrowDotColor="var(--jade)"
        title={
          <>
            Your story is <em>worth keeping.</em>
          </>
        }
        lead="We're recording the lives of LGBTQ+ elders in Lisbon — voice-only if you like, no faces required, entirely on your terms. Here's what taking part actually looks like."
        anchors={[
          { label: "About the project", href: "#about" },
          { label: "How to take part", href: "#how" },
          { label: "In their words", href: "#voices" },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="about"
      >
        <div className="wrap">
          <Reveal as="h2">
            About the <em>project</em>
          </Reveal>
          {ABOUT.map((p) => (
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

      <section className={`${styles.section} ${styles.sectionCream}`} id="how">
        <div className="wrap">
          <Reveal as="h2">
            How to <em>take part</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Four steps, and you keep control of every one.
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
          <Reveal style={{ marginTop: 28 }}>
            <Button
              variant="jade"
              size="lg"
              onClick={() =>
                showToast(
                  "Thank you — Sofia will reach out gently to talk it through. No commitment.",
                )
              }
            >
              I'd like to take part
            </Button>
          </Reveal>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="voices"
      >
        <div className="wrap">
          <Reveal as="h2">
            In their <em>words</em>
          </Reveal>
          <div>
            {VOICES.map((v) => (
              <Reveal key={v.who} className={styles.qaItem}>
                <div
                  className={styles.qaQ}
                  style={{ fontStyle: "italic", fontWeight: 400 }}
                >
                  "{v.text}"
                </div>
                <div className={styles.archiveMeta}>{v.who}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            History, <em>kept honest.</em>
          </>
        }
        sub="Not ready to record but want to help? The group always needs listeners and transcribers."
      >
        <Button to={routes.forum} variant="primary" size="lg">
          Ask how to help
        </Button>
      </Outro>
    </PageShell>
  );
}
