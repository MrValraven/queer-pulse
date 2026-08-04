import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
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
 * Tells everyone who voted for an item that it shipped or just moved — a
 * one-time send, never a re-engagement campaign (the reassurance box below
 * is a real product promise, not just copy). Prefills the message from the
 * item's current state (shipped vs. a column move) so most admins can send
 * without editing a word.
 */
export function NotifyVotersModal() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { payload, close } = useRoadmapModals();
  const { items } = useAdminRoadmap();
  const { notifyVoters, pending } = useAdminRoadmapMutations();

  const itemId = payload?.itemId;
  const item = items.find((candidate) => candidate.id === itemId);
  const [message, setMessage] = useState(() =>
    item
      ? item.column === "shipped"
        ? t("admin:roadmap.modals.notifyVoters.shippedMessage", { name: item.name })
        : t("admin:roadmap.modals.notifyVoters.movedMessage", {
            name: item.name,
            column: t(`admin:roadmap.board.column.${item.column}`),
          })
      : "",
  );

  if (!itemId) return null;

  const voterCount = item?.liveVotes ?? 0;

  function confirm() {
    const trimmed = message.trim();
    notifyVoters(
      { id: itemId as string, message: trimmed },
      {
        onSuccess: () => {
          showToast(
            t("admin:roadmap.toasts.notified", { count: voterCount }),
            "success",
          );
          close();
        },
        onError: (error) =>
          showToast(
            describeError(t("admin:roadmap.modals.notifyVoters.confirmCta"), error),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:roadmap.modals.notifyVoters.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.notifyVoters.title"
          values={{ count: voterCount }}
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            {t("admin:roadmap.modals.notifyVoters.cancelCta")}
          </Button>
          <Button variant="primary" onClick={confirm} disabled={pending}>
            {t("admin:roadmap.modals.notifyVoters.confirmCta")}
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

      <div className={styles.reassurance}>
        <FiCheckCircle className={styles.reassuranceIcon} aria-hidden />
        <div className={styles.reassuranceTx}>
          <p className={styles.reassuranceTitle}>
            {t("admin:roadmap.modals.notifyVoters.onceOnlyTitle")}
          </p>
          <p className={styles.reassuranceSub}>
            {t("admin:roadmap.modals.notifyVoters.onceOnlySub")}
          </p>
        </div>
      </div>

      <FormField
        className={styles.field}
        label={t("admin:roadmap.modals.notifyVoters.messageLabel")}
        required
      >
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
      </FormField>
    </AdminModal>
  );
}
