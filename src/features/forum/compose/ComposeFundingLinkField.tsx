import { Button, FormField } from "../../../shared/components/ui";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { thread as threadPath } from "../../../app/routeMap";
import type { FundingLinkLookup } from "../funding/useFundingLinkLookup";
import styles from "./ComposeFundingSection.module.css";

export interface ComposeFundingLinkFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Absent where a duplicate check makes no sense (editing the call itself). */
  lookup?: FundingLinkLookup;
  labelKey: string;
  hintKey: string;
  /** Tokens the hint interpolates, such as the fundraiser's allowed hosts. */
  hintValues?: TranslateOptions;
  errorKey: string | null;
  errorValues?: TranslateOptions;
}

export function ComposeFundingLinkField({
  value,
  onChange,
  lookup,
  labelKey,
  hintKey,
  hintValues,
  errorKey,
  errorValues,
}: ComposeFundingLinkFieldProps) {
  const { t } = useTranslation();
  const match = lookup?.isDuplicateUnconfirmed ? lookup.match : null;
  // The link's shape is the footer's (or the modal's) blocker line to state;
  // the field shows only a host or server refusal.
  const shownErrorKey = errorKey;
  return (
    <div className={styles.linkField}>
      <FormField
        label={t(labelKey)}
        required
        // An error takes the hint's place, so the host list shows once.
        helper={shownErrorKey ? undefined : t(hintKey, hintValues)}
        error={shownErrorKey ? t(shownErrorKey, errorValues) : undefined}
      >
        <input
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="https://"
          className={styles.input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => lookup?.check(value)}
        />
      </FormField>
      {lookup?.status === "checking" && (
        <p className={styles.checking} role="status">
          {t("forum:funding.compose.checking")}
        </p>
      )}
      {match && lookup && (
        <div className={styles.duplicate} role="alert">
          <p className={styles.duplicateText}>
            {t("forum:funding.compose.duplicate", { title: match.title })}
          </p>
          <div className={styles.duplicateActions}>
            <Button to={threadPath(match.slug)} variant="primary" size="sm">
              {t("forum:funding.compose.goToIt")}
            </Button>
            <Button variant="ghost" size="sm" onClick={lookup.dismiss}>
              {t("forum:funding.compose.postAnyway")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
