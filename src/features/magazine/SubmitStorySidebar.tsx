import { Button } from "../../shared/components/ui";
import { AFTER_SUBMIT, GUIDELINES } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStorySidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sideCard}>
        <div className={styles.sideTitle}>Editorial guidelines</div>
        <div className={styles.sideList}>
          {GUIDELINES.map((g) => (
            <div key={g.term} className={styles.sideItem}>
              <span className={styles.sideDot} />
              <span className={styles.sideText}>
                <strong>{g.term}</strong> {g.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sideCard}>
        <div className={styles.sideTitle}>After you submit</div>
        <div className={styles.sideList}>
          {AFTER_SUBMIT.map((a) => (
            <div key={a.strong} className={styles.sideItem}>
              <span className={`${styles.sideDot} ${styles.sideDotJade}`} />
              <span className={styles.sideText}>
                {a.pre}
                <strong>{a.strong}</strong>
                {a.post}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.sideCard} ${styles.sideMuted}`}>
        <div className={styles.sideTitle}>Questions?</div>
        <p className={styles.sideText} style={{ marginBottom: 14 }}>
          Email the editorial team or check past issues for a sense of what we
          publish.
        </p>
        <Button
          href="mailto:magazine@queerpulse.pt"
          variant="ghost"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Email editorial
        </Button>
      </div>
    </aside>
  );
}
