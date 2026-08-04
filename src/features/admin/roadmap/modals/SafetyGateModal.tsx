import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import { AdminModal } from "../../ui";
import { useRoadmapModals } from "../state/useRoadmapModals";
import styles from "./roadmapModals.module.css";

/**
 * Blocks publishing a sensitive item (housing/asylum/employer content) until
 * Trust & Safety clears it — `safetyStatus: 1` gates `isPublic` server-side
 * (see `roadmapAdmin.types.ts`). Clearing sets `safetyStatus: 2` and
 * `isPublic: true` together; the clear itself is logged (`note` copy below),
 * not just the publish.
 */
export function SafetyGateModal() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { payload, close } = useRoadmapModals();
  const { items } = useAdminRoadmap();
  const { updateItem, pending } = useAdminRoadmapMutations();

  const itemId = payload?.itemId;
  const item = items.find((candidate) => candidate.id === itemId);
  if (!itemId) return null;

  function confirm() {
    updateItem(
      { id: itemId as string, body: { safetyStatus: 2, isPublic: true } },
      {
        onSuccess: () => {
          showToast(t("admin:roadmap.toasts.safetyCleared"), "success");
          close();
        },
        onError: (error) =>
          showToast(
            describeError(t("admin:roadmap.modals.safetyGate.confirmCta"), error),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:roadmap.modals.safetyGate.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.safetyGate.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            {t("admin:roadmap.modals.safetyGate.cancelCta")}
          </Button>
          <Button variant="primary" onClick={confirm} disabled={pending}>
            {t("admin:roadmap.modals.safetyGate.confirmCta")}
          </Button>
        </>
      }
    >
      {item && (
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("admin:roadmap.modals.notifyVoters.itemLabel")}
            </span>
            <span className={styles.metaValue}>{item.name}</span>
          </div>
        </div>
      )}
      <p className={styles.body}>{t("admin:roadmap.modals.safetyGate.body")}</p>
      <p className={styles.note}>{t("admin:roadmap.modals.safetyGate.note")}</p>
    </AdminModal>
  );
}
