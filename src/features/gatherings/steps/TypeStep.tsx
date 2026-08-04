import { useId } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { TYPES } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
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
      <div className={styles.types}>
        {TYPES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              styles.typeCard,
              form.type === option.value && styles.typeCardSelected,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => form.selectType(option.value, option.icon)}
          >
            <div className={styles.typeIcon}>
              <option.icon />
            </div>
            <span className={styles.typeName}>{t(option.nameKey)}</span>
            <span className={styles.typeSub}>{t(option.subKey)}</span>
          </button>
        ))}
      </div>
      {!form.type && (
        <p className={styles.hint}>
          {t("gatherings:create.step1.typeRequired")}
        </p>
      )}
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
        onChange={(e) => form.setTitle(e.target.value)}
      />
      {!form.title.trim() && (
        <p id={`${fieldId}-title-hint`} className={styles.hint}>
          {t("gatherings:create.step1.titleRequired")}
        </p>
      )}
      <label className={styles.label} htmlFor={`${fieldId}-desc`}>
        {t("gatherings:create.step1.descLabel")}
      </label>
      <textarea
        id={`${fieldId}-desc`}
        className={styles.textarea}
        placeholder={t("gatherings:create.step1.descPlaceholder")}
        value={form.description}
        onChange={(e) => form.setDescription(e.target.value)}
      />
    </div>
  );
}
