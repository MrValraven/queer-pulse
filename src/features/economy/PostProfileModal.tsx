import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import type { UpsertFlatmateProfileBody } from "./api/flatmateProfile.api";
import { useMyFlatmateProfile } from "./api/useMyFlatmateProfile";
import { useUpsertFlatmateProfile } from "./api/useUpsertFlatmateProfile";
import { PostProfileForm } from "./PostProfileForm";
import styles from "./FlatmatesPage.module.css";

export function PostProfileModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  useScrollLock();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const [submitted, setSubmitted] = useState(false);
  const { data: myProfile } = useMyFlatmateProfile();
  const upsertFlatmateProfile = useUpsertFlatmateProfile();

  const handleSubmit = (body: UpsertFlatmateProfileBody) => {
    upsertFlatmateProfile.mutate(body, {
      onSuccess: () => setSubmitted(true),
      onError: () =>
        showToast(t("economy:postProfileModal.error"), "error"),
    });
  };

  return (
    <div
      className={styles.overlay}
      // Backdrop click is a mouse-only shortcut; Esc and the close button
      // already provide the keyboard path, so this div is not interactive.
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t("economy:postProfileModal.ariaLabel")}
      >
        <button
          type="button"
          className={styles.modalX}
          onClick={onClose}
          aria-label={t("economy:housingModal.close")}
        >
          ×
        </button>
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
          <PostProfileForm
            initial={myProfile}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
