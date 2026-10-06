import { useId } from "react";
import { FiShield } from "react-icons/fi";
import {
  CheckLine,
  ChipSelect,
  DatePicker,
  FilterChips,
  FormField,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ELIGIBILITY_LABEL_KEYS,
  FUNDING_ELIGIBILITIES,
  FUNDING_SCOPES,
  SCOPE_LABEL_KEYS,
  parseEligibility,
  parseScope,
} from "../funding/funding.data";
import type { FundingEligibility } from "../funding/funding.types";
import type { FundingLinkLookup } from "../funding/useFundingLinkLookup";
import { ComposeFundingLinkField } from "./ComposeFundingLinkField";
import type { ComposeFunding } from "./composeThread.types";
import styles from "./ComposeFundingSection.module.css";

/** The funder's name, at the column's width. */
const FUNDER_NAME_MAX_LENGTH = 120;

export interface ComposeCallFieldsProps {
  funding: ComposeFunding;
  onChange: (patch: Partial<ComposeFunding>) => void;
  onToggleEligibility: (value: FundingEligibility) => void;
  lookup?: FundingLinkLookup;
  linkErrorKey: string | null;
}

export function ComposeCallFields({
  funding,
  onChange,
  onToggleEligibility,
  lookup,
  linkErrorKey,
}: ComposeCallFieldsProps) {
  const { t } = useTranslation();
  const deadlineLabelId = useId();
  const eligibilityLabelId = useId();
  const scopeLabelId = useId();
  return (
    <div className={styles.fields}>
      <ComposeFundingLinkField
        value={funding.linkUrl}
        onChange={(linkUrl) => onChange({ linkUrl })}
        lookup={lookup}
        labelKey="forum:funding.compose.link"
        hintKey="forum:funding.compose.linkHint"
        errorKey={linkErrorKey}
      />
      <FormField label={t("forum:funding.compose.funder")} required>
        <input
          className={styles.input}
          value={funding.funderName}
          maxLength={FUNDER_NAME_MAX_LENGTH}
          onChange={(event) => onChange({ funderName: event.target.value })}
        />
      </FormField>
      <div className={styles.pair}>
        <FormField
          label={t("forum:funding.compose.amountMin")}
          helper={t("forum:funding.compose.amountHint")}
        >
          <input
            className={styles.input}
            inputMode="numeric"
            value={funding.amountMin}
            onChange={(event) => onChange({ amountMin: event.target.value })}
          />
        </FormField>
        <FormField label={t("forum:funding.compose.amountMax")}>
          <input
            className={styles.input}
            inputMode="numeric"
            value={funding.amountMax}
            onChange={(event) => onChange({ amountMax: event.target.value })}
          />
        </FormField>
      </div>
      <fieldset className={styles.group}>
        <legend id={deadlineLabelId} className={styles.label}>
          {t("forum:funding.compose.deadline")}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <DatePicker
          mode="datetime"
          labelledBy={deadlineLabelId}
          value={funding.deadlineLocal || null}
          onChange={(value) => onChange({ deadlineLocal: value ?? "" })}
          disabled={funding.isRolling}
        />
        <CheckLine
          checked={funding.isRolling}
          onChange={(isRolling) => onChange({ isRolling })}
          title={t("forum:funding.compose.rolling")}
        />
      </fieldset>
      <fieldset className={styles.group}>
        <legend id={eligibilityLabelId} className={styles.label}>
          {t("forum:funding.compose.eligibility")}
        </legend>
        <ChipSelect
          options={FUNDING_ELIGIBILITIES.map((value) => ({
            value,
            label: t(ELIGIBILITY_LABEL_KEYS[value]),
          }))}
          selected={new Set(funding.eligibility)}
          onToggle={(value) => {
            const [known] = parseEligibility([value]);
            if (known) onToggleEligibility(known);
          }}
          labelledBy={eligibilityLabelId}
          size="touch"
        />
      </fieldset>
      <fieldset className={styles.group}>
        <legend id={scopeLabelId} className={styles.label}>
          {t("forum:funding.compose.scope")}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <FilterChips
          options={FUNDING_SCOPES.map((value) => ({
            value,
            label: t(SCOPE_LABEL_KEYS[value]),
          }))}
          value={funding.scope ?? ""}
          onChange={(value) => onChange({ scope: parseScope(value) })}
          labelledBy={scopeLabelId}
        />
      </fieldset>
      <p className={styles.guidance}>
        <FiShield aria-hidden />
        {t("forum:funding.compose.callGuidance")}
      </p>
    </div>
  );
}
