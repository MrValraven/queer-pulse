import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useProfile,
  getChangedSectionLabelKeys,
} from "../../app/providers/useProfile";
import { useEscapeToCancel } from "./useEscapeToCancel";
import styles from "./ProfileEdit.module.css";

/**
 * Sticky bottom bar for the self-profile edit flow. While editing it offers
 * Discard / Save profile; just after a save it shows the plum confirmation
 * banner with a jade check (the design-system success pattern).
 */
export function ProfileEditBar() {
  const { t } = useTranslation();
  const {
    profile,
    draft,
    isEditing,
    justSaved,
    isSaving,
    saveError,
    isDirty,
    save,
    requestCancel,
  } = useProfile();
  useEscapeToCancel(isEditing);
  const changedSectionKeys = isDirty
    ? getChangedSectionLabelKeys(draft, profile)
    : [];

  // Keep the saved banner mounted for one beat after `justSaved` clears so it can
  // animate out instead of popping out of place.
  const [closing, setClosing] = useState(false);
  const wasSaved = useRef(false);
  useEffect(() => {
    if (wasSaved.current && !justSaved) {
      setClosing(true);
      const t = setTimeout(() => setClosing(false), 320);
      wasSaved.current = justSaved;
      return () => clearTimeout(t);
    }
    wasSaved.current = justSaved;
  }, [justSaved]);

  if (isEditing) {
    return (
      <div className={styles.saveBar}>
        <span className={styles.unsavedLabel}>
          {saveError ? (
            <span className={styles.saveError} role="alert">
              {saveError}
            </span>
          ) : isDirty ? (
            <>
              <span className={styles.unsavedDot} aria-hidden />
              {changedSectionKeys.length > 0
                ? t("members:profileEdit.bar.unsavedIn", {
                    sections: changedSectionKeys
                      .map((key) => t(key))
                      .join(", "),
                  })
                : t("members:profileEdit.bar.unsaved")}
            </>
          ) : null}
        </span>
        <div className={styles.saveActions}>
          <Button variant="ghost" onClick={requestCancel} disabled={isSaving}>
            {t("members:profileEdit.bar.discard")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void save()}
            disabled={isSaving}
          >
            {isSaving
              ? t("members:profileEdit.bar.saving")
              : saveError
                ? t("members:profileEdit.bar.tryAgain")
                : t("members:profileEdit.bar.save")}
          </Button>
        </div>
      </div>
    );
  }

  if (justSaved || closing) {
    return (
      <div
        className={`${styles.savedBar} ${closing ? styles.savedBarLeaving : ""}`}
        role="status"
      >
        <span className={styles.savedIcon}>
          <FiCheck />
        </span>
        <span className={styles.savedText}>
          <Translation
            i18nKey="members:profileEdit.bar.savedBanner"
            components={{ strong: <strong /> }}
          />
        </span>
      </div>
    );
  }

  return null;
}
