import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import styles from "./SubmitStoryPage.module.css";

/** Two weeks from "now", formatted as e.g. "10 July 2026". */
function replyByDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SubmitStorySuccess({ working }: { working: string }) {
  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <Reveal className={styles.panel}>
            <div className={styles.panelIcon}>
              <FiCheck />
            </div>
            <h1 className={styles.panelTitle}>
              We're <em>reading.</em>
            </h1>
            <p className={styles.panelSub}>
              Thank you for trusting us with “{working || "your story"}”.
              Whatever happens, the copyright stays yours.
            </p>
            <div className={styles.timeline}>
              <div className={styles.timelineRow}>
                <span className={styles.timelineDot} />
                <span>An editor reads every pitch personally.</span>
              </div>
              <div className={styles.timelineRow}>
                <span
                  className={[styles.timelineDot, styles.timelineDotKey].join(
                    " ",
                  )}
                />
                <span>
                  You'll hear from us by <strong>{replyByDate()}</strong> — yes,
                  no, or let's talk.
                </span>
              </div>
              <div className={styles.timelineRow}>
                <span className={styles.timelineDot} />
                <span>
                  If it's a yes, we agree a rate and deadline together.
                </span>
              </div>
            </div>
            <div className={styles.panelActions}>
              <Button to={routes.magazine} variant="ghost-dark" size="lg">
                Back to the magazine
              </Button>
              <Button to={routes.issues} variant="jade" size="lg">
                Read past issues
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
