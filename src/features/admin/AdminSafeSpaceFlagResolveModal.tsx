import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import { FLAG_REASON_LABEL_KEY } from "./adminSafeSpaceGovernance.data";
import { useResolveSafeSpaceFlag } from "../safety/api/useAdminSafeSpaceFlags";
import type { AdminSafeSpaceFlagDTO } from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * Close one flag: uphold it or dismiss it, with a note.
 *
 * The member who raised it is told what happened, because someone who raises
 * something and is never answered does not raise the next one. The note is
 * moderator-authored and never names anyone.
 */
export function AdminSafeSpaceFlagResolveModal({
  flag,
  onClose,
}: {
  flag: AdminSafeSpaceFlagDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const resolve = useResolveSafeSpaceFlag();
  const [note, setNote] = useState("");

  function close(resolution: "upheld" | "dismissed") {
    resolve.mutate(
      { id: flag.id, resolution, note: note.trim() || undefined },
      {
        onSuccess: () => {
          showToast(
            t(
              resolution === "upheld"
                ? "safety:governance.toast.flagUpheld"
                : "safety:governance.toast.flagDismissed",
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
      eyebrow={t(FLAG_REASON_LABEL_KEY[flag.reasonCode])}
      title={flag.listingName ?? t("safety:governance.flags.unknownSpace")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => close("dismissed")}
            disabled={resolve.isPending}
          >
            {t("safety:governance.flags.dismissCta")}
          </Button>
          <Button
            variant="primary"
            onClick={() => close("upheld")}
            disabled={resolve.isPending}
          >
            {t("safety:governance.flags.upholdCta")}
          </Button>
        </>
      }
    >
      <p className={styles.privacyNote}>
        {t("safety:governance.flags.privacyNote")}
      </p>

      {flag.detail && <p className={styles.quote}>{flag.detail}</p>}

      <label className={styles.sectionTitle} htmlFor="safe-space-flag-note">
        {t("safety:governance.flags.noteLabel")}
      </label>
      <textarea
        id="safe-space-flag-note"
        className={styles.textarea}
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={t("safety:governance.flags.notePlaceholder")}
      />
    </AdminModal>
  );
}
