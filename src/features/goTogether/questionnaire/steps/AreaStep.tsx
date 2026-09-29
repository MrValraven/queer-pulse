import { useId } from "react";
import { Select, type SelectOption } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  LISBON_AREA_IDS,
  WIDE_AREAS,
} from "../../goTogetherQuestionnaire.data";
import type { QuestionnaireStepProps } from "../useQuestionnaireDraft";
import styles from "../GoTogetherQuestionnaire.module.css";

interface AreaStepProps extends QuestionnaireStepProps {
  /** Clears the area and moves on to the next step. */
  onSkip: () => void;
}

/** Optional: a Lisbon neighbourhood (a proper noun, kept as written) or one
 *  of the three wide areas. Skipping counts as neutral for matching. Next is
 *  already open with no area, so "Clear and skip" only shows once an area is
 *  chosen. */
export function AreaStep({ questionnaire, onSkip }: AreaStepProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const lisbonGroup = t("goTogether:questionnaire.area.groupLisbon");
  const wideGroup = t("goTogether:questionnaire.area.groupWide");
  const hasChosenArea = questionnaire.draft.area != null;
  const options: SelectOption[] = [
    ...LISBON_AREA_IDS.map((name) => ({
      value: name,
      label: name,
      group: lisbonGroup,
    })),
    ...WIDE_AREAS.map((areaId) => ({
      value: areaId,
      label: t(`goTogether:questionnaire.area.${areaId}`),
      group: wideGroup,
    })),
  ];
  return (
    <div className={styles.rows}>
      <section className={styles.block}>
        <h2 id={labelId} className={styles.groupLabel}>
          {t("goTogether:questionnaire.area.label")}
        </h2>
        <Select
          labelledBy={labelId}
          options={options}
          value={questionnaire.draft.area}
          onChange={(area) => questionnaire.setChoice("area", area)}
          placeholder={t("goTogether:questionnaire.area.placeholder")}
          searchPlaceholder={t("goTogether:questionnaire.area.search")}
          clearable
          className={styles.areaSelect}
        />
      </section>
      {hasChosenArea && (
        <button type="button" className={styles.skipLink} onClick={onSkip}>
          {t("goTogether:questionnaire.area.skip")}
        </button>
      )}
    </div>
  );
}
