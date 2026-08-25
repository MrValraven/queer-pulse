import { useState } from "react";
import { Button, DatePicker } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatDate } from "../../../../shared/lib/date";
import styles from "../pieceTabs.module.css";

export interface PublishDateCardProps {
  /** `null` while the issue is unscheduled: the date is optional at creation. */
  publishedOn: string | null;
  isSaving: boolean;
  /** `null` clears the date and puts the issue back to unscheduled. */
  onSave: (publishedOn: string | null) => void;
}

/**
 * The publish date in the issue-production `.erail`, editable in place. An
 * issue is created without a date (the desk opens a number before anyone
 * knows when it runs), so this card is where that date is filled in later,
 * moved, or cleared again.
 *
 * Save is a deliberate second step rather than a write on every calendar
 * click: the picker's typeable field emits a value on the way through
 * incomplete dates, and each of those would otherwise be a request that
 * briefly reschedules the issue.
 */
export function PublishDateCard({
  publishedOn,
  isSaving,
  onSave,
}: PublishDateCardProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(publishedOn);
  const isChanged = draft !== publishedOn;

  return (
    <div className={styles.card}>
      <h3>{t("magazine:issue.publishDate.heading")}</h3>
      <p className={styles.tiny}>
        {publishedOn
          ? t("magazine:issue.publishDate.set", { date: formatDate(publishedOn) })
          : t("magazine:issue.publishDate.unset")}
      </p>
      <DatePicker
        mode="date"
        size="sm"
        clearable
        label={t("magazine:issue.publishDate.heading")}
        value={draft}
        onChange={setDraft}
      />
      {isChanged && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isSaving}
          onClick={() => onSave(draft)}
        >
          {isSaving
            ? t("magazine:issue.publishDate.saving")
            : draft === null
              ? t("magazine:issue.publishDate.clear")
              : t("magazine:issue.publishDate.save")}
        </Button>
      )}
    </div>
  );
}
