import { useEffect } from "react";
import { useScrollLock } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./EconomyPage.module.css";

export function SalarySubmitModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
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
        aria-labelledby="salary-submit-title"
      >
        <div className={styles.modalHead}>
          <div id="salary-submit-title" className={styles.modalTitle}>
            {t("economy:salary.submitLong")}
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label={t("economy:modalKit.closeAriaLabel")}
          >
            ×
          </button>
        </div>
        {!demoMode ? (
          // No salary-board endpoint yet — stay honest instead of faking an
          // "submitted anonymously" success the backend can't record.
          <>
            <div className={styles.modalSub}>
              {t("economy:comingSoon.body")}
            </div>
            <button
              type="button"
              className={`${styles.primaryBtn} ${styles.modalSubmit}`}
              onClick={onClose}
            >
              {t("economy:comingSoon.close")}
            </button>
          </>
        ) : (
          <>
        <div className={styles.modalSub}>
          {t("economy:salarySubmitModal.subtitle")}
        </div>
        <div className={styles.modalFields}>
          <input
            className={styles.modalInput}
            type="text"
            aria-label={t("economy:salarySubmitModal.jobTitlePlaceholder")}
            placeholder={t("economy:salarySubmitModal.jobTitlePlaceholder")}
          />
          <input
            className={styles.modalInput}
            type="text"
            aria-label={t("economy:salarySubmitModal.sectorPlaceholder")}
            placeholder={t("economy:salarySubmitModal.sectorPlaceholder")}
          />
          <div className={styles.modalRow2}>
            <input
              className={styles.modalInput}
              type="number"
              aria-label={t(
                "economy:salarySubmitModal.annualSalaryPlaceholder",
              )}
              placeholder={t(
                "economy:salarySubmitModal.annualSalaryPlaceholder",
              )}
            />
            <input
              className={styles.modalInput}
              type="number"
              aria-label={t("economy:salarySubmitModal.yearsExpPlaceholder")}
              placeholder={t("economy:salarySubmitModal.yearsExpPlaceholder")}
            />
          </div>
          <select
            className={styles.modalSelect}
            defaultValue=""
            aria-label={t("economy:salarySubmitModal.employmentTypeLabel")}
          >
            <option value="">
              {t("economy:salarySubmitModal.employmentTypeLabel")}
            </option>
            {/* Stable English `value`s kept separate from the translated
                label text — see i18n sweep §5.1 (never let a rendered label
                double as the stored/submitted value). */}
            <option value="Full-time">
              {t("economy:salarySubmitModal.type.fullTime")}
            </option>
            <option value="Part-time">
              {t("economy:salarySubmitModal.type.partTime")}
            </option>
            <option value="Freelance">
              {t("economy:salarySubmitModal.type.freelance")}
            </option>
            <option value="Contract">
              {t("economy:salarySubmitModal.type.contract")}
            </option>
          </select>
        </div>
        <button
          type="button"
          className={`${styles.primaryBtn} ${styles.modalSubmit}`}
          onClick={onSubmit}
        >
          {t("economy:salarySubmitModal.submitCta")}
        </button>
          </>
        )}
      </div>
    </div>
  );
}
