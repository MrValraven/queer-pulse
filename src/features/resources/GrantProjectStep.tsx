import { useState } from "react";
import { FormField, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MicroGrantsPage.module.css";

/* Step 2 — project details */
export function ProjectStep({
  projName,
  setProjName,
  projWhat,
  setProjWhat,
}: {
  projName: string;
  setProjName: (v: string) => void;
  projWhat: string;
  setProjWhat: (v: string) => void;
}) {
  const { t } = useTranslation();
  const [stage, setStage] = useState("");
  return (
    <>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="resources:microGrants.apply.project.stepTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>
        {t("resources:microGrants.apply.project.stepSub")}
      </p>
      <FormField label={t("resources:microGrants.apply.project.nameLabel")}>
        <input
          type="text"
          placeholder={t("resources:microGrants.apply.project.namePlaceholder")}
          value={projName}
          onChange={(e) => setProjName(e.target.value)}
        />
      </FormField>
      <FormField
        label={t("resources:microGrants.apply.project.whatLabel")}
        labelAside={t("resources:microGrants.apply.project.charCounter", {
          current: projWhat.length,
          max: 400,
        })}
      >
        <textarea
          placeholder={t("resources:microGrants.apply.project.whatPlaceholder")}
          value={projWhat}
          maxLength={400}
          onChange={(e) => setProjWhat(e.target.value)}
        />
      </FormField>
      <FormField
        label={t("resources:microGrants.apply.project.beneficiaryLabel")}
      >
        <textarea
          placeholder={t(
            "resources:microGrants.apply.project.beneficiaryPlaceholder",
          )}
        />
      </FormField>
      <div className={styles.row2}>
        <FormField
          label={t("resources:microGrants.apply.project.timelineLabel")}
        >
          <input
            type="text"
            placeholder={t(
              "resources:microGrants.apply.project.timelinePlaceholder",
            )}
          />
        </FormField>
        <FormField label={t("resources:microGrants.apply.project.stageLabel")}>
          <Select
            placeholder={t("resources:microGrants.apply.project.stage.select")}
            value={stage || null}
            onChange={(value) => setStage(value ?? "")}
            options={[
              {
                value: "idea",
                label: t("resources:microGrants.apply.project.stage.idea"),
              },
              {
                value: "development",
                label: t(
                  "resources:microGrants.apply.project.stage.development",
                ),
              },
              {
                value: "ready",
                label: t("resources:microGrants.apply.project.stage.ready"),
              },
              {
                value: "ongoing",
                label: t("resources:microGrants.apply.project.stage.ongoing"),
              },
            ]}
          />
        </FormField>
      </div>
    </>
  );
}
