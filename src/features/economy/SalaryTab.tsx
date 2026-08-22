import { useState } from "react";
import { FiDollarSign } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BADGE_CLASS,
  SALARIES,
  SAL_FILTERS,
  type Sector,
} from "./economy.data";
import { SalarySubmitModal } from "./SalarySubmitModal";
import styles from "./EconomyPage.module.css";

export function SalaryTab() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [sector, setSector] = useState<Sector | "all">("all");
  const [modal, setModal] = useState(false);
  const salaries = SALARIES.filter(
    (s) => sector === "all" || s.sector === sector,
  );

  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            <Translation
              i18nKey="economy:salary.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.econSub}>{t("economy:salary.sub")}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModal(true)}>
          {t("economy:salary.submitCta")}
        </Button>
      </div>
      {demoMode && (
        <div className={styles.salFilters}>
          {SAL_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={[
                styles.salChip,
                sector === filter.id && styles.salChipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setSector(filter.id)}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>
      )}
      {demoMode ? (
        <div className={styles.salTable}>
          <div className={styles.salHeader}>
            <div className={styles.salHcell}>
              {t("economy:salary.table.role")}
            </div>
            <div className={styles.salHcell}>
              {t("economy:salary.table.annual")}
            </div>
            <div className={styles.salHcell}>
              {t("economy:salary.table.experience")}
            </div>
            <div className={`${styles.salHcell} ${styles.salTypeCol}`}>
              {t("economy:salary.table.type")}
            </div>
          </div>
          {salaries.length === 0 ? (
            <EmptyState
              compact
              icon={<FiDollarSign />}
              title={t("economy:salary.empty.title")}
              description={t("economy:salary.empty.description")}
              action={{
                label: t("economy:salary.empty.clear"),
                onClick: () => setSector("all"),
              }}
            />
          ) : (
            salaries.map((salary) => (
              <div
                className={styles.salRow}
                key={`${salary.role}-${salary.sector}-${salary.money}`}
              >
                <div>
                  <div className={styles.salRole}>{salary.role}</div>
                  <div className={styles.salSector}>{salary.sectorLabel}</div>
                </div>
                <div className={`${styles.salCell} ${styles.salMoney}`}>
                  {salary.money}
                </div>
                <div className={styles.salCell}>
                  <span className={styles.salExp}>{salary.exp}</span>
                </div>
                <div className={`${styles.salCell} ${styles.salTypeCol}`}>
                  <span
                    className={`${styles.salBadge} ${styles[BADGE_CLASS[salary.type]]}`}
                  >
                    {salary.typeLabel}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <EmptyState
          icon={<FiDollarSign />}
          title={t("economy:salary.emptyLive.title")}
          description={t("economy:salary.emptyLive.description")}
          action={{
            label: t("economy:salary.submitLong"),
            onClick: () => setModal(true),
          }}
        />
      )}
      <div className={styles.salAnon}>{t("economy:salary.disclaimer")}</div>
      <div className={styles.salSubmitBox}>
        <p>{t("economy:salary.helpBody")}</p>
        <Button variant="primary" size="md" onClick={() => setModal(true)}>
          {t("economy:salary.submitLong")}
        </Button>
      </div>

      {modal && (
        <SalarySubmitModal
          onClose={() => setModal(false)}
          onSubmit={() => {
            setModal(false);
            showToast(t("economy:salary.submitToast"), "success");
          }}
        />
      )}
    </>
  );
}
