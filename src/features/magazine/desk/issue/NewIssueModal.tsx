import { useState } from "react";
import {
  Button,
  DatePicker,
  FormField,
  Modal,
} from "../../../../shared/components/ui";
import { ApiError } from "../../../../shared/api/client";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { CreateIssueDto } from "../../api/issueProduction.api";
import styles from "../DeskModals.module.css";

export interface NewIssueModalProps {
  /** Pre-filled number: one past the highest issue that exists
   *  (`suggestNextIssueNumber`). Editable — an editor may be backfilling. */
  suggestedNumber: string;
  isSaving: boolean;
  onClose: () => void;
  /** Resolves when the issue is created; rejects so this modal can show a
   *  duplicate-number 409 against the number field instead of a page toast. */
  onCreate: (body: CreateIssueDto) => Promise<unknown>;
}

/**
 * Creates a magazine issue from the desk. Deliberately four fields: an issue
 * needs a number to be addressable and a title and theme to be recognisable
 * in the switcher. The publish date is the one optional field — editors open
 * a number long before they know when it runs, so an issue can be created
 * unscheduled and dated later (shipping stamps today's date if nobody ever
 * does). Cover art, coverlines, the running order and the digest all belong
 * to the issue-production page, and duplicating them here would give a
 * brand-new issue a ship checklist that already looks half-finished.
 */
export function NewIssueModal({
  suggestedNumber,
  isSaving,
  onClose,
  onCreate,
}: NewIssueModalProps) {
  const { t } = useTranslation();
  const [number, setNumber] = useState(suggestedNumber);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [publishedOn, setPublishedOn] = useState("");
  const [numberError, setNumberError] = useState<string | null>(null);

  const isComplete =
    number.trim() !== "" && title.trim() !== "" && theme.trim() !== "";

  const submit = async () => {
    if (!isComplete || isSaving) return;
    setNumberError(null);
    try {
      await onCreate({
        number: number.trim(),
        title: title.trim(),
        theme: theme.trim(),
        // Omitted rather than sent as "": the backend stores an absent date as
        // NULL, and an empty string would fail its YYYY-MM-DD validation.
        ...(publishedOn ? { publishedOn } : {}),
      });
      onClose();
    } catch (error) {
      // A 409 is the one failure with an obvious field to blame, and the one
      // an editor can fix without leaving the form. Anything else stays a
      // form-level message rather than pointing at the wrong input.
      const isDuplicateNumber =
        error instanceof ApiError && error.status === 409;
      setNumberError(
        isDuplicateNumber
          ? t("magazine:desk.newIssue.duplicateNumberError", {
              number: number.trim().padStart(2, "0"),
            })
          : t("magazine:desk.newIssue.saveFailedError"),
      );
    }
  };

  return (
    <Modal
      title={t("magazine:desk.newIssue.title")}
      sub={t("magazine:desk.newIssue.sub")}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={!isComplete || isSaving}
            onClick={() => void submit()}
          >
            {isSaving
              ? t("magazine:desk.newIssue.creating")
              : t("magazine:desk.newIssue.create")}
          </Button>
        </div>
      }
    >
      <div className={styles.row}>
        <FormField
          label={t("magazine:desk.newIssue.numberLabel")}
          required
          helper={t("magazine:desk.newIssue.numberHelper")}
          error={numberError ?? undefined}
        >
          <input
            type="text"
            inputMode="numeric"
            value={number}
            onChange={(event) => {
              setNumber(event.target.value);
              setNumberError(null);
            }}
          />
        </FormField>
        <FormField
          label={t("magazine:desk.newIssue.publishesLabel")}
          helper={t("magazine:desk.newIssue.publishesHelper")}
        >
          <DatePicker
            mode="date"
            label={t("magazine:desk.newIssue.publishesLabel")}
            value={publishedOn || null}
            onChange={(value) => setPublishedOn(value ?? "")}
          />
        </FormField>
      </div>
      <FormField label={t("magazine:desk.newIssue.titleLabel")} required>
        <input
          type="text"
          placeholder={t("magazine:desk.newIssue.titlePlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>
      <FormField
        label={t("magazine:desk.newIssue.themeLabel")}
        required
        helper={t("magazine:desk.newIssue.themeHelper")}
      >
        <input
          type="text"
          placeholder={t("magazine:desk.newIssue.themePlaceholder")}
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
