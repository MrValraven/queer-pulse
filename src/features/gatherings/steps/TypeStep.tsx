import { useId } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { GATE_ANCHOR } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { FormatPicker } from "./FormatPicker";
import { StepRequirementBadge } from "./StepRequirement";
import styles from "../CreateGatheringPage.module.css";

export function TypeStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step1.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step1.sub")}</p>
      <StepRequirementBadge required={true} />
      <FormatPicker form={form} />
      {/* Label, control and hint share one wrapper so the checklist's "give
          your gathering a name" row can flash the whole field rather than a
          bare input with its label left outside the ring. */}
      <div id={GATE_ANCHOR.title}>
        <label className={styles.label} htmlFor={`${fieldId}-title`}>
          {t("gatherings:create.step1.titleLabel")}
        </label>
        <input
          id={`${fieldId}-title`}
          className={styles.input}
          type="text"
          placeholder={t("gatherings:create.step1.titlePlaceholder")}
          required
          aria-invalid={!form.title.trim()}
          aria-describedby={
            !form.title.trim() ? `${fieldId}-title-hint` : undefined
          }
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
        />
        {!form.title.trim() && (
          <p id={`${fieldId}-title-hint`} className={styles.hint}>
            {t("gatherings:create.step1.titleRequired")}
          </p>
        )}
      </div>
      <label className={styles.label} htmlFor={`${fieldId}-desc`}>
        {t("gatherings:create.step1.descLabel")}
      </label>
      <textarea
        id={`${fieldId}-desc`}
        className={styles.textarea}
        placeholder={t("gatherings:create.step1.descPlaceholder")}
        value={form.description}
        onChange={(event) => form.setDescription(event.target.value)}
      />
    </div>
  );
}
