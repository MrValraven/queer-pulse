import { useState } from "react";
import { FiFlag, FiAlertTriangle } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity } from "../communities/community.model";
import styles from "./ModPanel.module.css";

export function ReportsTab({ living }: { living: LivingCommunity }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Intentional: snapshot the prop into local state once, then mutate locally as
  // the moderator resolves/dismisses. Not a live sync with the source list.
  const [reports, setReports] = useState(living.reports ?? []);

  const removeReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(t("admin:modPanel.reports.removedToast"), "success");
  };
  const warnAuthor = (id: string, authorName: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(
      t("admin:modPanel.reports.warnedToast", { name: authorName }),
      "info",
    );
  };
  const dismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(t("admin:modPanel.reports.dismissedToast"), "info");
  };
  const escalate = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(t("admin:modPanel.reports.escalatedToast"), "info");
  };

  return (
    <div>
      <div className={styles.secLbl}>
        {t("admin:modPanel.reports.sectionLabel")}{" "}
        {reports.length > 0 && (
          <span className={styles.tabCount}>{reports.length}</span>
        )}
      </div>
      {reports.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.reports.emptyTitle")}
          description={t("admin:modPanel.reports.emptyDesc")}
        />
      ) : (
        reports.map((rep) => (
          <div className={styles.reportCard} key={rep.id}>
            <div className={styles.reportReason}>
              <FiFlag aria-hidden /> {rep.reason}
            </div>
            <p className={styles.reportExcerpt}>"{rep.postExcerpt}"</p>
            <div className={styles.modMeta}>
              {t("admin:modPanel.reports.metaLine", {
                author: rep.author.name,
                reporter: rep.reporter.name,
                time: rep.time,
              })}
            </div>
            <div className={styles.modActions} style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => removeReport(rep.id)}>
                {t("admin:modPanel.reports.removeCta")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => warnAuthor(rep.id, rep.author.name)}
              >
                {t("admin:modPanel.reports.warnCta")}
              </Button>
              <Button variant="ghost" onClick={() => dismissReport(rep.id)}>
                {t("admin:modPanel.reports.dismissCta")}
              </Button>
              <Button variant="ghost" onClick={() => escalate(rep.id)}>
                <FiAlertTriangle aria-hidden />{" "}
                {t("admin:modPanel.reports.escalateCta")}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
