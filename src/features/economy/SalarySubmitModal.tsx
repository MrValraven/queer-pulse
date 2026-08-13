import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell } from "./ModalKit";
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
  const [employmentType, setEmploymentType] = useState<string | null>(null);
  return (
    <ModalShell onClose={onClose} ariaLabel={t("economy:salary.submitLong")}>
      <div className={styles.modalHead}>
        <div id="salary-submit-title" className={styles.modalTitle}>
          {t("economy:salary.submitLong")}
        </div>
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
          {/* Stable English `value`s kept separate from the translated
              label text — see i18n sweep §5.1 (never let a rendered label
              double as the stored/submitted value). */}
          <Select
            label={t("economy:salarySubmitModal.employmentTypeLabel")}
            placeholder={t("economy:salarySubmitModal.employmentTypeLabel")}
            value={employmentType}
            onChange={setEmploymentType}
            options={[
              {
                value: "Full-time",
                label: t("economy:salarySubmitModal.type.fullTime"),
              },
              {
                value: "Part-time",
                label: t("economy:salarySubmitModal.type.partTime"),
              },
              {
                value: "Freelance",
                label: t("economy:salarySubmitModal.type.freelance"),
              },
              {
                value: "Contract",
                label: t("economy:salarySubmitModal.type.contract"),
              },
            ]}
          />
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
    </ModalShell>
  );
}
