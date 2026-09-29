import { useState } from "react";
import {
  Button,
  DatePicker,
  FormField,
} from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatDate } from "../../../../shared/lib/date";
import { useIssueCloseDate } from "../../api/useIssueCloseDate";
import styles from "../pieceTabs.module.css";

export interface PublishDateCardProps {
  /** `null` while the issue is unscheduled: the date is optional at creation. */
  publishedOn: string | null;
  isSaving: boolean;
  /** `null` clears the date and puts the issue back to unscheduled. */
  onSave: (publishedOn: string | null) => void;
  /**
   * The issue's number, which switches on the "Closes on" row below the
   * publish date (read and saved here through `useIssueCloseDate`, dual
   * mode, with its own toast). Left unset until the page that mounts this
   * card is wired to pass it through; the row simply does not render.
   */
  issueNumber?: string;
}

/**
 * The publish date in the issue-production `.erail`, editable in place, plus
 * the close date below it. An issue is created without either date (the desk
 * opens a number before anyone knows when it runs or when copy stops), so
 * this card is where both are filled in later, moved, or cleared again. A
 * close date can only land on or before the publish date: `IssueCloseDateRow`
 * re-checks it on save, since its own `max` clamp only reaches the calendar
 * grid and a typed date can still slip past it.
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
  issueNumber,
}: PublishDateCardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<string | null>(publishedOn);
  const isChanged = draft !== publishedOn;
  const closeDate = useIssueCloseDate(issueNumber ?? "");

  const saveCloseDate = (closesOn: string | null) => {
    closeDate
      .saveClosesOn(closesOn)
      .then(() => {
        showToast(
          closesOn
            ? t("magazine:issue.closeDate.savedToast", {
                date: formatDate(closesOn),
              })
            : t("magazine:issue.closeDate.clearedToast"),
          "success",
        );
      })
      .catch(() => {
        showToast(t("magazine:desk.newIssue.saveFailedError"), "error");
      });
  };

  return (
    <div className={styles.card}>
      <h3>{t("magazine:issue.publishDate.heading")}</h3>
      <p className={styles.tiny}>
        {publishedOn
          ? t("magazine:issue.publishDate.set", {
              date: formatDate(publishedOn),
            })
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
      {issueNumber !== undefined && !closeDate.isLoading && (
        // Keyed by the loaded value so a fresh mount picks up each new
        // server value as its initial draft, the way `IssueRail` keys this
        // whole card by `publishedOn`: simpler than an effect that writes
        // state back after every load or save.
        <IssueCloseDateRow
          key={closeDate.closesOn ?? "unset"}
          closesOn={closeDate.closesOn}
          publishedOn={publishedOn}
          isSaving={closeDate.isSaving}
          onSave={saveCloseDate}
        />
      )}
    </div>
  );
}

interface IssueCloseDateRowProps {
  closesOn: string | null;
  /** Closes must land on or before this day when the issue has one. */
  publishedOn: string | null;
  isSaving: boolean;
  onSave: (closesOn: string | null) => void;
}

/** The close-date half of `PublishDateCard`, split out so it can be remounted
 *  by key independently of the publish-date draft above it. */
function IssueCloseDateRow({
  closesOn,
  publishedOn,
  isSaving,
  onSave,
}: IssueCloseDateRowProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(closesOn);
  const [error, setError] = useState<string | null>(null);
  const isChanged = draft !== closesOn;

  const submit = () => {
    if (draft && publishedOn && draft > publishedOn) {
      setError(t("magazine:desk.closeDate.afterPublishError"));
      return;
    }
    setError(null);
    onSave(draft);
  };

  return (
    <>
      <h3>{t("magazine:issue.closeDate.heading")}</h3>
      <p className={styles.tiny}>
        {closesOn
          ? t("magazine:issue.closeDate.set", { date: formatDate(closesOn) })
          : t("magazine:issue.closeDate.unset")}
      </p>
      <FormField error={error ?? undefined}>
        <DatePicker
          mode="date"
          size="sm"
          clearable
          label={t("magazine:issue.closeDate.heading")}
          value={draft}
          max={publishedOn || undefined}
          onChange={(value) => {
            setDraft(value);
            setError(null);
          }}
        />
      </FormField>
      {isChanged && (
        <Button variant="ghost" size="sm" disabled={isSaving} onClick={submit}>
          {isSaving
            ? t("magazine:issue.closeDate.saving")
            : draft === null
              ? t("magazine:issue.closeDate.clear")
              : t("magazine:issue.closeDate.save")}
        </Button>
      )}
    </>
  );
}
