import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { useResolveBanEvasionEscalation } from "./api/useAdminBanEvasionEscalations";
import {
  MAX_ESCALATION_RESOLUTION_NOTE_LENGTH,
  isEscalationConflict,
  type BanEvasionEscalationDTO,
} from "./api/adminBanEvasionEscalations.api";
import styles from "./AdminBanEvasionEscalationsPage.module.css";

/**
 * Close one escalation, with an optional note.
 *
 * IT BANS NOBODY. Resolving records that a staff member looked, and it releases
 * the "one open escalation per (community, join request)" lock so the community
 * can ask again later if the applicant comes back. Whatever staff decide to do
 * about the applicant happens on the surfaces that already exist for it.
 *
 * The note stays on this console and is never returned on any community-scoped
 * surface, so the modal says so: the escalating moderator learns that somebody
 * closed the question and nothing about what was found.
 */
export function AdminBanEvasionEscalationResolveModal({
  escalation,
  onClose,
}: {
  escalation: BanEvasionEscalationDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fieldId = useId();
  const resolveEscalation = useResolveBanEvasionEscalation();
  const [resolutionNote, setResolutionNote] = useState("");

  function handleResolve() {
    resolveEscalation.mutate(
      { escalation, resolutionNote: resolutionNote.trim() || null },
      {
        onSuccess: () => {
          showToast(t("admin:banEvasionEscalations.toast.resolved"), "success");
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              isEscalationConflict(error)
                ? t("admin:banEvasionEscalations.error.alreadyResolved")
                : t("admin:banEvasionEscalations.error.resolve"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:banEvasionEscalations.resolve.eyebrow")}
      title={t("admin:banEvasionEscalations.resolve.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:banEvasionEscalations.action.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleResolve}
            disabled={resolveEscalation.isPending}
          >
            {t("admin:banEvasionEscalations.action.resolve")}
          </Button>
        </>
      }
    >
      <p className={styles.fieldHint}>
        {t("admin:banEvasionEscalations.resolve.body", {
          community: escalation.communityName,
        })}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-note`}>
        {t("admin:banEvasionEscalations.resolve.noteLabel")}
      </label>
      <textarea
        id={`${fieldId}-note`}
        className={styles.textarea}
        rows={5}
        value={resolutionNote}
        maxLength={MAX_ESCALATION_RESOLUTION_NOTE_LENGTH}
        placeholder={t("admin:banEvasionEscalations.resolve.notePlaceholder")}
        onChange={(event) => setResolutionNote(event.target.value)}
      />
      <p className={styles.fieldHint}>
        {t("admin:banEvasionEscalations.resolve.noteHint")}
      </p>
    </AdminModal>
  );
}
