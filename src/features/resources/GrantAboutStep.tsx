import { useId, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMITMENT_KEYS } from "./microGrants.data";
import styles from "./MicroGrantsPage.module.css";

/* Step 4 — about you */
export function AboutStep({
  appName,
  setAppName,
  checks,
  toggleCheck,
}: {
  appName: string;
  setAppName: (v: string) => void;
  checks: Set<number>;
  toggleCheck: (n: number) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [priorGrant, setPriorGrant] = useState("");
  return (
    <>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="resources:microGrants.apply.about.stepTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>
        {t("resources:microGrants.apply.about.stepSub")}
      </p>
      <label className={styles.label} htmlFor={`${fieldId}-name`}>
        {t("resources:microGrants.apply.about.nameLabel")}
      </label>
      <input
        id={`${fieldId}-name`}
        className={styles.input}
        type="text"
        placeholder={t("resources:microGrants.apply.about.namePlaceholder")}
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
      />
      <label className={styles.label} htmlFor={`${fieldId}-connection`}>
        {t("resources:microGrants.apply.about.connectionLabel")}
      </label>
      <textarea
        id={`${fieldId}-connection`}
        className={styles.textarea}
        placeholder={t(
          "resources:microGrants.apply.about.connectionPlaceholder",
        )}
        style={{ minHeight: 90 }}
      />
      <label className={styles.label} htmlFor={`${fieldId}-prior`}>
        {t("resources:microGrants.apply.about.priorGrantLabel")}
      </label>
      <Select
        id={`${fieldId}-prior`}
        placeholder={t("resources:microGrants.apply.about.priorGrant.select")}
        value={priorGrant || null}
        onChange={(value) => setPriorGrant(value ?? "")}
        options={[
          {
            value: "first",
            label: t("resources:microGrants.apply.about.priorGrant.first"),
          },
          {
            value: "reported",
            label: t("resources:microGrants.apply.about.priorGrant.reported"),
          },
          {
            value: "pending",
            label: t("resources:microGrants.apply.about.priorGrant.pending"),
          },
        ]}
      />
      <div className={styles.label} style={{ marginBottom: 10 }}>
        {t("resources:microGrants.apply.about.commitmentsLabel")}
      </div>
      {COMMITMENT_KEYS.map((commitmentKey, i) => (
        <div
          className={styles.checkRow}
          key={commitmentKey}
          role="button"
          tabIndex={0}
          onClick={() => toggleCheck(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleCheck(i);
            }
          }}
        >
          <div
            className={[styles.check, checks.has(i) && styles.checkChecked]
              .filter(Boolean)
              .join(" ")}
          >
            {checks.has(i) ? <FiCheck /> : ""}
          </div>
          <span className={styles.checkText}>{t(commitmentKey)}</span>
        </div>
      ))}
    </>
  );
}
