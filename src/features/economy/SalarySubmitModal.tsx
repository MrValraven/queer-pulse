import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { commitmentLabelKey } from "./jobVocabulary.data";
import { ModalShell } from "./ModalKit";
import styles from "./EconomyPage.module.css";

/** The commitments a salary report can describe (volunteer work has no pay). */
const SALARY_EMPLOYMENT_TYPE_IDS = [
  "fullTime",
  "partTime",
  "freelanceGig",
  "contract",
  "internship",
] as const;

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
        // No salary-board endpoint yet, so this says so plainly: the backend
        // can't record a "submitted anonymously" success.
        <>
          <div className={styles.modalSub}>{t("economy:comingSoon.body")}</div>
          <Button
            variant="primary"
            size="md"
            className={styles.modalSubmit}
            onClick={onClose}
          >
            {t("economy:comingSoon.close")}
          </Button>
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
            {/* The job commitment ids (`jobVocabulary.data.ts`) are the
              submitted values, labelled with the job form's commitment
              labels, so a salary entry and a job listing share one
              vocabulary. See i18n sweep §5.1: a rendered label never
              doubles as the stored value. */}
            <Select
              label={t("economy:salarySubmitModal.employmentTypeLabel")}
              placeholder={t("economy:salarySubmitModal.employmentTypeLabel")}
              value={employmentType}
              onChange={setEmploymentType}
              options={SALARY_EMPLOYMENT_TYPE_IDS.map((id) => ({
                value: id,
                label: t(commitmentLabelKey(id)),
              }))}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            className={styles.modalSubmit}
            onClick={onSubmit}
          >
            {t("economy:salarySubmitModal.submitCta")}
          </Button>
        </>
      )}
    </ModalShell>
  );
}
