import { useState } from "react";
import { Button, FormField } from "../../../../shared/components/ui";
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
 * "Why is this moving?" — required before a target-date change is allowed to
 * save. Confirming publishes the reason on the public roadmap right next to
 * the item (the whole point: members forgive a slipped date, not a silent
 * one). Cancelling leaves the item's `targetQuarter` untouched.
 */
export function SlipReasonModal() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { payload, close } = useRoadmapModals();
  const { items } = useAdminRoadmap();
  const { updateItem, pending } = useAdminRoadmapMutations();
  const [reason, setReason] = useState("");

  const itemId = payload?.itemId;
  const item = items.find((candidate) => candidate.id === itemId);
  if (!itemId) return null;

  function confirm() {
    const trimmed = reason.trim();
    if (trimmed.length === 0) {
      showToast(t("admin:roadmap.modals.slipReason.missingReasonToast"), "error");
      return;
    }
    updateItem(
      {
        id: itemId as string,
        body: { targetQuarter: payload?.to ?? null, slipReason: trimmed },
      },
      {
        onSuccess: () => {
          showToast(t("admin:roadmap.toasts.dateMoved"), "success");
          close();
        },
        onError: (error) =>
          showToast(
            describeError(t("admin:roadmap.modals.slipReason.confirmCta"), error),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:roadmap.modals.slipReason.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.slipReason.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            {t("admin:roadmap.modals.slipReason.cancelCta")}
          </Button>
          <Button variant="primary" onClick={confirm} disabled={pending}>
            {t("admin:roadmap.modals.slipReason.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>{t("admin:roadmap.modals.slipReason.body")}</p>

      <div className={styles.metaRow}>
        {item && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("admin:roadmap.modals.notifyVoters.itemLabel")}
            </span>
            <span className={styles.metaValue}>{item.name}</span>
          </div>
        )}
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>
            {t("admin:roadmap.modals.slipReason.targetLabel")}
          </span>
          <span className={styles.metaValue}>
            {payload?.from ?? "—"} → {payload?.to ?? "—"}
          </span>
        </div>
      </div>

      <FormField
        className={styles.field}
        label={t("admin:roadmap.modals.decline.reasonLabel")}
        required
      >
        <textarea
          value={reason}
          placeholder={t("admin:roadmap.modals.slipReason.placeholder")}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
    </AdminModal>
  );
}
