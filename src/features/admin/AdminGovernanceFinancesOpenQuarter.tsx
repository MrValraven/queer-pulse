import { useState } from "react";
import { Button, Modal, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { nextQuarter } from "./adminGovernanceFinancesReport.utils";
import { useOpenFinanceQuarter } from "./api/useAdminGovernanceFinances";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/**
 * PRD-447. Opens an empty finance report for a new quarter, so the governance
 * team can enter real figures once the seeded report is gone. The report
 * stays off the public page until every headline figure is entered.
 */
export function AdminGovernanceFinancesOpenQuarter({
  latestQuarter,
  onClose,
}: {
  latestQuarter: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const openQuarter = useOpenFinanceQuarter();
  const suggested = nextQuarter(latestQuarter);
  const [year, setYear] = useState(String(suggested.year));
  const [quarter, setQuarter] = useState(String(suggested.quarter));
  const yearOptions = [0, 1, 2].map((offset) => {
    const optionYear = String(suggested.year - 1 + offset);
    return { value: optionYear, label: optionYear };
  });
  const quarterOptions = [1, 2, 3, 4].map((option) => ({
    value: String(option),
    label: t("admin:governance.finances.quarter.option", { quarter: option }),
  }));

  const onSave = () => {
    openQuarter.mutate(`${year}-Q${quarter}`, {
      onSuccess: () => {
        showToast(t("admin:governance.finances.quarter.saved"), "success");
        onClose();
      },
      onError: () => {
        showToast(t("admin:governance.finances.quarter.error"), "error");
      },
    });
  };

  return (
    <Modal
      onClose={onClose}
      eyebrow={t("admin:governance.finances.edit.eyebrow")}
      title={
        <Translation
          i18nKey="admin:governance.finances.quarter.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.finances.quarter.sub")}
      footer={
        <div className={styles.footActions}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={openQuarter.isPending}
          >
            {t("admin:governance.finances.edit.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={openQuarter.isPending}
          >
            {t("admin:governance.finances.quarter.save")}
          </Button>
        </div>
      }
    >
      <div className={styles.reserveFields}>
        <div className={styles.reserveField}>
          <span className={styles.reserveLabel} aria-hidden>
            {t("admin:governance.finances.quarter.field.quarter")}
          </span>
          <Select
            label={t("admin:governance.finances.quarter.field.quarter")}
            value={quarter}
            onChange={(value) => setQuarter(value ?? quarter)}
            options={quarterOptions}
          />
        </div>
        <div className={styles.reserveField}>
          <span className={styles.reserveLabel} aria-hidden>
            {t("admin:governance.finances.quarter.field.year")}
          </span>
          <Select
            label={t("admin:governance.finances.quarter.field.year")}
            value={year}
            onChange={(value) => setYear(value ?? year)}
            options={yearOptions}
          />
        </div>
      </div>
    </Modal>
  );
}
