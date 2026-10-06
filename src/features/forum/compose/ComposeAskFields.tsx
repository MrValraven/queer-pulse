import { useId, useState } from "react";
import {
  DatePicker,
  FilterChips,
  FormField,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ASK_BENEFICIARIES,
  ASK_PURPOSES,
  BENEFICIARY_LABEL_KEYS,
  FUNDRAISING_HOSTS,
  PURPOSE_LABEL_KEYS,
  parseAskPurpose,
  parseBeneficiary,
} from "../funding/funding.data";
import { isoToLisbonWallClock } from "../funding/fundingDates";
import {
  isAllowedFundraisingHost,
  parseHttpsUrl,
} from "../funding/fundingLink";
import { ComposeFundingLinkField } from "./ComposeFundingLinkField";
import type { ComposeFunding } from "./composeThread.types";
import styles from "./ComposeFundingSection.module.css";

export interface ComposeAskFieldsProps {
  funding: ComposeFunding;
  onChange: (patch: Partial<ComposeFunding>) => void;
  /** A server refusal that belongs under the link. */
  linkErrorKey: string | null;
  /** A summary line (the composer footer, the modal's first blocker) is
   *  already saying the host is not allowed, so the field stays quiet. */
  isHostErrorShownElsewhere?: boolean;
}

/** The fundraiser's details: its page on an allow-listed host, the goal, what
 *  and who it is for, and an optional last day. */
export function ComposeAskFields({
  funding,
  onChange,
  linkErrorKey,
  isHostErrorShownElsewhere = false,
}: ComposeAskFieldsProps) {
  const { t } = useTranslation();
  const purposeLabelId = useId();
  const beneficiaryLabelId = useId();
  const endsLabelId = useId();
  const endsHintId = useId();
  // The earliest last day is today in Lisbon. Read once: the field is a date.
  const [todayInLisbon] = useState(() =>
    (isoToLisbonWallClock(new Date().toISOString()) ?? "").slice(0, 10),
  );
  const hosts = FUNDRAISING_HOSTS.join(", ");
  const isHostRefused =
    parseHttpsUrl(funding.linkUrl) !== null &&
    !isAllowedFundraisingHost(funding.linkUrl);
  const linkFieldErrorKey =
    linkErrorKey ??
    (isHostRefused ? "forum:composePage.blocker.fundingHostNotAllowed" : null);
  // On a refused host the field and the server both say the summary line's
  // sentence, so the field leaves it to the summary.
  const isHostSentenceRepeated = isHostErrorShownElsewhere && isHostRefused;
  return (
    <div className={styles.fields}>
      <ComposeFundingLinkField
        value={funding.linkUrl}
        onChange={(linkUrl) => onChange({ linkUrl })}
        labelKey="forum:funding.compose.askLink"
        hintKey="forum:funding.compose.askLinkHint"
        hintValues={{ hosts }}
        errorKey={isHostSentenceRepeated ? null : linkFieldErrorKey}
        errorValues={{ hosts }}
      />
      <FormField label={t("forum:funding.compose.goal")} required>
        <input
          className={styles.input}
          inputMode="numeric"
          value={funding.goalAmount}
          onChange={(event) => onChange({ goalAmount: event.target.value })}
        />
      </FormField>
      <fieldset className={styles.group}>
        <legend id={purposeLabelId} className={styles.label}>
          {t("forum:funding.compose.purpose")}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <FilterChips
          options={ASK_PURPOSES.map((value) => ({
            value,
            label: t(PURPOSE_LABEL_KEYS[value]),
          }))}
          value={funding.askPurpose ?? ""}
          onChange={(value) => onChange({ askPurpose: parseAskPurpose(value) })}
          labelledBy={purposeLabelId}
        />
      </fieldset>
      <fieldset className={styles.group}>
        <legend id={beneficiaryLabelId} className={styles.label}>
          {t("forum:funding.compose.beneficiary")}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <FilterChips
          options={ASK_BENEFICIARIES.map((value) => ({
            value,
            label: t(BENEFICIARY_LABEL_KEYS[value]),
          }))}
          value={funding.beneficiary ?? ""}
          onChange={(value) =>
            onChange({ beneficiary: parseBeneficiary(value) })
          }
          labelledBy={beneficiaryLabelId}
        />
      </fieldset>
      <fieldset className={styles.group}>
        <legend id={endsLabelId} className={styles.label}>
          {t("forum:funding.compose.endsOn")}
        </legend>
        <DatePicker
          mode="date"
          labelledBy={endsLabelId}
          aria-describedby={endsHintId}
          value={funding.endsOnLocal || null}
          onChange={(value) => onChange({ endsOnLocal: value ?? "" })}
          min={todayInLisbon}
          clearable
        />
        <p id={endsHintId} className={styles.checking}>
          {t("forum:funding.compose.endsOnHint")}
        </p>
      </fieldset>
    </div>
  );
}
