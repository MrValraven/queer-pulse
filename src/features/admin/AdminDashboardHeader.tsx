import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./AdminDashboardPage.module.css";

export function AdminDashboardHeader() {
  const { showToast } = useToast();

  return (
    <div className={styles.ph}>
      <div className={styles.phText}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          Sunday · 28 June 2026 · 09:14
        </div>
        <h1 className={styles.h1}>
          Seven reports
          <br />
          need <em>a human</em>.
        </h1>
        <p className={styles.phSub}>
          Two are flagged as safety emergencies — outing and doxxing. Everything
          else is calm. You're holding the whole network steady; here's where to
          start.
        </p>
      </div>
      <div className={styles.phActions}>
        <Button
          variant="ghost"
          onClick={() =>
            showToast("The weekly digest would open in a new tab", "info")
          }
        >
          Weekly digest
        </Button>
        <Button variant="primary" to={routes.adminModeration}>
          Open moderation →
        </Button>
      </div>
    </div>
  );
}
