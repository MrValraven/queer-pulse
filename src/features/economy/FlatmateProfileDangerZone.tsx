import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDeleteFlatmateProfile } from "./api/useDeleteFlatmateProfile";
import styles from "./FlatmatesPage.module.css";

/**
 * The take-down group at the bottom of the flatmate profile editor: the one
 * way out of a personal ad that carries pronouns, identity tags, household
 * answers and a budget. A member who found a room, or who simply wants those
 * fields off a members-wide board, had no affordance at all before this, and
 * there is no visibility flag to hide behind either.
 *
 * Shaped after `CommunityDangerZone` (label + bordered zone + a row per
 * action) and confirmed the way `MyHousingListingsPage` confirms a listing
 * delete: a shared `ConfirmDialog`, which portals to <body> through `Modal`,
 * so the fixed scrim is never trapped by a transformed ancestor, and which
 * brings the focus trap, Escape, focus restore and accessible name with it.
 *
 * The confirm copy states only what `DELETE /flatmate-profiles/mine` actually
 * does: the profile row goes, and with it every like and pass pointing at it
 * (`flatmate_likes.to_profile_id` cascades), which ends any mutual match.
 * Conversations opened by a "say hello" are ordinary DMs and survive, so the
 * copy says they survive rather than implying a clean sweep.
 *
 * A failure keeps the dialog open with an inline reason and turns the confirm
 * into a retry, so nobody is left believing a take-down happened when it did
 * not.
 */
export function FlatmateProfileDangerZone({
  onDeleted,
}: {
  /** Runs only after the server confirmed the delete. */
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const deleteFlatmateProfile = useDeleteFlatmateProfile();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const closeConfirm = () => {
    if (deleteFlatmateProfile.isPending) return;
    setIsConfirmOpen(false);
    setHasFailed(false);
  };

  const handleConfirm = () => {
    if (deleteFlatmateProfile.isPending) return;
    setHasFailed(false);
    deleteFlatmateProfile.mutate(undefined, {
      onSuccess: () => {
        showToast(t("economy:flatmateDangerZone.toast.deleted"), "success");
        setIsConfirmOpen(false);
        onDeleted();
      },
      onError: () => setHasFailed(true),
    });
  };

  return (
    <>
      <div className={styles.dangerLabel}>
        <FiAlertTriangle aria-hidden />{" "}
        {t("economy:flatmateDangerZone.heading")}
      </div>
      <div className={styles.dangerZone}>
        <div className={styles.dangerRow}>
          <div className={styles.dangerRowLabel}>
            {t("economy:flatmateDangerZone.takeDown.label")}
          </div>
          <p className={styles.dangerRowText}>
            {t("economy:flatmateDangerZone.takeDown.text")}
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
          >
            {t("economy:flatmateDangerZone.takeDown.cta")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={t("economy:flatmateDangerZone.confirm.title")}
        description={t("economy:flatmateDangerZone.confirm.body")}
        tone="destructive"
        loading={deleteFlatmateProfile.isPending}
        confirmLabel={t(
          hasFailed
            ? "economy:flatmateDangerZone.confirm.retryCta"
            : "economy:flatmateDangerZone.confirm.cta",
        )}
      >
        <p className={styles.dangerKeeps}>
          {t("economy:flatmateDangerZone.confirm.keeps")}
        </p>
        {hasFailed && (
          <p className={styles.dangerError} role="alert">
            {t("economy:flatmateDangerZone.confirm.error")}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
