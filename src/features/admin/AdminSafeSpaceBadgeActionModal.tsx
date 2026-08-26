import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import { useSafeSpaceBadgeSuspension } from "../safety/api/useAdminSafeSpaceFlags";
import styles from "./AdminSafeSpaceGovernance.module.css";

export interface BadgeActionTarget {
  ref: string;
  name: string;
  kind: "suspend" | "restore";
}

/**
 * Suspend a badge pending review, or lift a suspension.
 *
 * A reason is required either way. A suspension the venue cannot be told the
 * grounds of is not accountability, and this reason is platform-authored:
 * nothing a flagger wrote reaches it, so nobody can be identified from it.
 */
export function AdminSafeSpaceBadgeActionModal({
  target,
  onClose,
}: {
  target: BadgeActionTarget;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const suspension = useSafeSpaceBadgeSuspension();
  const [reason, setReason] = useState("");
  const isSuspending = target.kind === "suspend";

  function submit() {
    suspension.mutate(
      { kind: target.kind, ref: target.ref, reason: reason.trim() },
      {
        onSuccess: () => {
          showToast(
            t(
              isSuspending
                ? "safety:governance.toast.suspended"
                : "safety:governance.toast.restored",
              { name: target.name },
            ),
            "success",
          );
          onClose();
        },
        onError: () => showToast(t("safety:governance.toast.failed"), "error"),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={target.name}
      title={t(
        isSuspending
          ? "safety:governance.badge.suspendTitle"
          : "safety:governance.badge.restoreTitle",
      )}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:governance.badge.cancelCta")}
          </Button>
          <Button
            variant={isSuspending ? "primary" : "jade"}
            onClick={submit}
            disabled={!reason.trim() || suspension.isPending}
          >
            {t(
              isSuspending
                ? "safety:governance.badge.suspendCta"
                : "safety:governance.badge.restoreCta",
            )}
          </Button>
        </>
      }
    >
      <p className={styles.privacyNote}>
        {t(
          isSuspending
            ? "safety:governance.badge.suspendNote"
            : "safety:governance.badge.restoreNote",
        )}
      </p>
      <label className={styles.sectionTitle} htmlFor="safe-space-badge-reason">
        {t("safety:governance.badge.reasonLabel")}
      </label>
      <textarea
        id="safe-space-badge-reason"
        className={styles.textarea}
        rows={3}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
    </AdminModal>
  );
}
