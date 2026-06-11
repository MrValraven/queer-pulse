import { useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { ManageGatheringTabs, ManageGatheringSidebar } from "./ManageGatheringTabs";
import styles from "./ManageGatheringPage.module.css";

export function ManageGatheringPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cancelGathering = () => {
    if (window.confirm("Cancel Pride Brunch? All 14 attendees will be notified.")) {
      navigate(routes.gatheringCancelled);
    }
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.header}>
            <div className={styles.eyebrow}>
              <div className={styles.phDot} /> Hosting
            </div>
            <div className={styles.title}>
              Pride Brunch — <em>June Edition</em>
            </div>
            <div className={styles.phRow}>
              <div className={styles.status}>
                <div className={styles.statusDot} /> Approved · 12 days to go
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" className={styles.actionBtn} onClick={() => showToast("Opening editor…", "info")}>
                  Edit details
                </Button>
                <Button variant="ghost" className={styles.actionBtn} onClick={() => showToast("Opening messages…", "info")}>
                  Message attendees
                </Button>
                <Button variant="primary" className={styles.actionBtn} to={routes.gatheringDashboard}>
                  Day-of dashboard →
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.layout}>
            <ManageGatheringTabs onCancel={cancelGathering} />
            <ManageGatheringSidebar onCopyLink={() => showToast("Link copied!", "success")} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
