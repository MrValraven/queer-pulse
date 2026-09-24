import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { FormField, Select } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AffiliationOptionDTO } from "./api/subprofiles.api";
import { affiliationOptionsForRow } from "./api/useAffiliationOptions";
import type { AffiliationTargetType } from "./affiliations.data";
import styles from "./SubprofileAffiliationsEditor.module.css";

/** An event this year reads as "3 Jul"; any other year keeps the year. */
const DATE_THIS_YEAR: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};
const DATE_OTHER_YEAR: Intl.DateTimeFormatOptions = {
  ...DATE_THIS_YEAR,
  year: "numeric",
};

interface SubprofileAffiliationTargetPickerProps {
  targetType: AffiliationTargetType;
  targetSlug: string;
  options: readonly AffiliationOptionDTO[];
  isLoading: boolean;
  hasError: boolean;
  /** `type:slug` keys picked by the OTHER rows; hidden from this row. */
  takenKeys: ReadonlySet<string>;
  onChange: (targetSlug: string) => void;
}

/**
 * The target half of one affiliation row: a `Select` of only the communities
 * the signed-in owner belongs to, or the events they're going to, for the
 * row's current type (from `useAffiliationOptions`, with the persona's saved
 * links merged in by the editor so they always show selected), minus targets
 * another row already links. Loading shows a disabled Select; a failed first
 * fetch shows one too (the editor renders the single alert with a retry above
 * the rows); an empty list shows a hint with a link to go find one (worded for
 * "none yet" or "all already linked") under the same label as the Select.
 */
export function SubprofileAffiliationTargetPicker({
  targetType,
  targetSlug,
  options,
  isLoading,
  hasError,
  takenKeys,
  onChange,
}: SubprofileAffiliationTargetPickerProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const label = t(`subprofiles:affiliationsEditor.targetLabel.${targetType}`);
  const { optionsOfType, eligibleOptions } = affiliationOptionsForRow(
    options,
    targetType,
    takenKeys,
  );
  const placeholder = t(
    `subprofiles:affiliationsEditor.targetPlaceholder.${targetType}`,
  );

  if (isLoading || hasError) {
    return (
      <FormField label={label} className={styles.pickerField}>
        <Select
          options={[]}
          value={null}
          onChange={() => undefined}
          disabled
          placeholder={
            isLoading
              ? t("subprofiles:affiliationsEditor.optionsLoading")
              : t("subprofiles:affiliationsEditor.optionsUnavailable")
          }
        />
      </FormField>
    );
  }

  if (eligibleOptions.length === 0) {
    const browsePath =
      targetType === "community" ? routes.communities : routes.gatherings;
    // Every eligible target is already linked by another row, or there are none.
    const hintKey =
      optionsOfType.length > 0
        ? `subprofiles:affiliationsEditor.allLinked.${targetType}`
        : `subprofiles:affiliationsEditor.noOptions.${targetType}`;
    // The fragment keeps FormField from wiring its label to the hint, which is
    // text rather than a control; the label still heads the row like the rest.
    return (
      <FormField label={label} className={styles.pickerField}>
        <>
          <p className={styles.pickerHint}>
            {t(hintKey)}{" "}
            <Link to={browsePath}>
              {t(`subprofiles:affiliationsEditor.browse.${targetType}`)}
            </Link>
          </p>
        </>
      </FormField>
    );
  }

  const currentYear = new Date().getFullYear();
  const selectOptions = eligibleOptions.map((option) => {
    if (!option.startsAt)
      return { value: option.targetSlug, label: option.name };
    const startDate = new Date(option.startsAt);
    const dateOptions =
      startDate.getFullYear() === currentYear
        ? DATE_THIS_YEAR
        : DATE_OTHER_YEAR;
    return {
      value: option.targetSlug,
      label: t("subprofiles:affiliationsEditor.eventOptionLabel", {
        name: option.name,
        date: format.date(startDate, dateOptions),
      }),
    };
  });
  const isSavedSlugEligible = selectOptions.some(
    (option) => option.value === targetSlug,
  );

  return (
    <FormField label={label} className={styles.pickerField}>
      <Select
        options={selectOptions}
        value={isSavedSlugEligible ? targetSlug : null}
        onChange={(value) => onChange(value ?? "")}
        placeholder={placeholder}
      />
    </FormField>
  );
}
