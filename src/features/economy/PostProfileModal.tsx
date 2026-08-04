import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import type { UpsertFlatmateProfileBody } from "./api/flatmateProfile.api";
import { useMyFlatmateProfile } from "./api/useMyFlatmateProfile";
import { useUpsertFlatmateProfile } from "./api/useUpsertFlatmateProfile";
import { ModalShell } from "./ModalKit";
import { PostProfileForm } from "./PostProfileForm";
import styles from "./FlatmatesPage.module.css";

export function PostProfileModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { data: myProfile } = useMyFlatmateProfile();
  const upsertFlatmateProfile = useUpsertFlatmateProfile();

  const handleSubmit = (body: UpsertFlatmateProfileBody) => {
    // Guard against a rapid double-click firing two POSTs while the first is
    // still in flight.
    if (upsertFlatmateProfile.isPending) return;
    upsertFlatmateProfile.mutate(body, {
      onSuccess: () => setSubmitted(true),
      onError: () =>
        showToast(t("economy:postProfileModal.error"), "error"),
    });
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:postProfileModal.ariaLabel")}
    >
      {submitted ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <svg
              viewBox="0 0 28 28"
              fill="none"
              stroke="var(--jade)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 14l6 6L23 8" />
            </svg>
          </div>
          <h2>
            <Translation
              i18nKey="economy:postProfileModal.success.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("economy:postProfileModal.success.body")}</p>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("economy:postProfileModal.success.backCta")}
          </Button>
        </div>
      ) : (
        // Keyed on the loaded profile so the form remounts (re-running its
        // useState initializers) once `useMyFlatmateProfile` resolves in live
        // edit mode — otherwise an existing profile opens blank. Demo/create
        // resolve immediately/to null, so the key stays "new".
        <PostProfileForm
          key={myProfile?.slug ?? "new"}
          initial={myProfile}
          onSubmit={handleSubmit}
          onClose={onClose}
          submitting={upsertFlatmateProfile.isPending}
        />
      )}
    </ModalShell>
  );
}
