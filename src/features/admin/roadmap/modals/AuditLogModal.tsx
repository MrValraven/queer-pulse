import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { describeError } from "../../../../shared/api/errorMessage";
import { formatDate } from "../../../../shared/lib/date";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { useInvalidateAdminRoadmap } from "../../api/useInvalidateAdminRoadmap";
import { getRoadmapAuditCsv } from "../../api/roadmapAdmin.api";
import { buildRoadmapSeed } from "../../adminRoadmap.seed";
import { writeDemoRoadmap } from "../../adminRoadmap.data";
import { AdminModal } from "../../ui";
import { useRoadmapModals } from "../state/useRoadmapModals";
import { buildAuditCsv, downloadTextFile } from "./auditCsv";
import styles from "./roadmapModals.module.css";

/**
 * Read-only trail of every admin roadmap change — "on the record" is the
 * whole feature. Export mirrors the two data sources the rest of this file
 * already branches on: live downloads the server's real CSV
 * (`getRoadmapAuditCsv`), demo builds the same shape client-side from
 * `audit` (there's no backend to ask). "Reset board" only exists in demo —
 * it's the escape hatch back to the seeded fixture after a demo session's
 * accumulated edits, not a real destructive action against live data.
 */
export function AuditLogModal() {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { modal, close } = useRoadmapModals();
  const { demoMode } = useDemoMode();
  const { audit } = useAdminRoadmap();
  const invalidate = useInvalidateAdminRoadmap();
  const [exporting, setExporting] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (modal !== "audit") return null;

  async function exportCsv() {
    setExporting(true);
    try {
      const csv = demoMode ? buildAuditCsv(audit) : await getRoadmapAuditCsv();
      downloadTextFile(csv, "roadmap-audit.csv", "text/csv");
      showToast(t("admin:roadmap.toasts.auditExported"), "success");
    } catch (error) {
      showToast(
        describeError(t("admin:roadmap.modals.auditLog.exportCta"), error),
        "error",
      );
    } finally {
      setExporting(false);
    }
  }

  function resetBoard() {
    writeDemoRoadmap(buildRoadmapSeed());
    invalidate();
    showToast(t("admin:roadmap.toasts.boardReset"), "success");
    setConfirmingReset(false);
  }

  return (
    <AdminModal
      wide
      eyebrow={t("admin:roadmap.modals.auditLog.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.auditLog.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <Button variant="ghost" onClick={close}>
          {t("admin:common.close")}
        </Button>
      }
    >
      <div className={styles.auditActions}>
        <Button variant="primary" onClick={() => void exportCsv()} disabled={exporting}>
          {t("admin:roadmap.modals.auditLog.exportCta")}
        </Button>
      </div>

      {audit.length === 0 ? (
        <p className={styles.emptyOption}>—</p>
      ) : (
        <ul className={styles.auditList}>
          {audit.map((entry) => (
            <li key={entry.id} className={styles.auditRow}>
              <span className={styles.auditWhat}>{entry.action}</span>
              <span className={styles.auditMeta}>
                {entry.actorLabel} ·{" "}
                {formatDate(entry.createdAt, language, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}

      {demoMode && (
        <div className={styles.dangerZone}>
          {/* "Reset board" is demo-only tooling, not a documented product
              surface — gated behind a confirm step, same as the other
              irreversible action in this feature (BulkBar's bulk delete),
              rather than firing on the first click. */}
          <p className={styles.dangerHint}>
            {t("admin:roadmap.modals.auditLog.resetBoardHint")}
          </p>
          {confirmingReset ? (
            <div className={styles.auditActions}>
              <Button variant="ghost" onClick={() => setConfirmingReset(false)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={resetBoard}>
                {t("admin:roadmap.modals.auditLog.resetBoardCta")}
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmingReset(true)}>
              {t("admin:roadmap.modals.auditLog.resetBoardCta")}
            </Button>
          )}
        </div>
      )}
    </AdminModal>
  );
}
