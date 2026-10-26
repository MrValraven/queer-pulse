import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FiAlertCircle, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminInviteQuotaMemberDTO } from "./api/adminInvites.api";
import styles from "./AdminInviteQuotaModal.module.css";

/** Which of the editor's two writes is in flight, for the button label. */
export type InviteQuotaSavingAction = "save" | "useDefault" | null;

type QuotaDraftProblem = "empty" | "notWhole" | "negative";

type ParsedQuotaDraft =
  | { quota: number; problem: null }
  | { quota: null; problem: QuotaDraftProblem };

/** Read the typed limit: a whole number of 0 or more, or the reason it is
 *  not one, so the message under the field can name the problem. */
function parseQuotaDraft(draft: string): ParsedQuotaDraft {
  const trimmedDraft = draft.trim();
  if (trimmedDraft === "") return { quota: null, problem: "empty" };
  if (/^-\d+$/.test(trimmedDraft)) return { quota: null, problem: "negative" };
  if (!/^\d+$/.test(trimmedDraft)) return { quota: null, problem: "notWhole" };
  return { quota: Number(trimmedDraft), problem: null };
}

/** Puts the caret in the field as the editor opens, with the current figure
 *  selected so typing replaces it. Module-level, so React calls it once on
 *  mount and never again on a re-render. */
function focusAndSelectOnMount(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

/**
 * The inline limit editor that folds open under a member's row. Enter saves,
 * Escape cancels (without closing the modal), and a typed value that is not a
 * whole number of 0 or more is refused with a message naming the problem.
 * When the member has an override, "Use default" clears it.
 *
 * The draft seeds once when the editor opens: the member's own override, or
 * the platform default when they have none. The default leaves out any perk
 * or ambassador bonus, so a straight Enter on "Set limit" never pins that
 * bonus as a permanent override. The row remounts the editor on every open,
 * so no effect is needed to reseed it.
 */
export function AdminInviteQuotaLimitEditor({
  member,
  defaultMonthlyQuota,
  savingAction,
  serverError,
  onSave,
  onCancel,
}: {
  member: AdminInviteQuotaMemberDTO;
  /** The platform default before any bonus, from the list's page. */
  defaultMonthlyQuota: number;
  savingAction: InviteQuotaSavingAction;
  /** The failed save's reason, named for the admin. */
  serverError: string | null;
  onSave: (quota: number | null) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(
    String(member.inviteMonthlyQuota ?? defaultMonthlyQuota),
  );
  const [problem, setProblem] = useState<QuotaDraftProblem | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputId = useId();
  const messageId = useId();
  const isSaving = savingAction !== null;
  const hasOverride = member.inviteMonthlyQuota !== null;

  const problemMessage =
    problem &&
    t(`admin:adminInvites.quota.editor.problem.${problem}`, {
      name: member.name,
    });
  const message = problemMessage ?? serverError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const parsedDraft = parseQuotaDraft(draft);
    setProblem(parsedDraft.problem);
    if (parsedDraft.problem === null) onSave(parsedDraft.quota);
  }

  function handleChange(nextDraft: string) {
    setDraft(nextDraft);
    // Once a problem is showing, re-check as they type so it clears the
    // moment the value is fixed.
    if (problem !== null) setProblem(parseQuotaDraft(nextDraft).problem);
  }

  // The modal closes on Escape from a document listener; a press anywhere in
  // the editor (the field, Save, Cancel, Use default) belongs to the editor
  // alone, which folds away and hands focus back to the row. A native
  // listener on the form stops the press before it reaches the document.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (!isSaving) onCancel();
    }
    form.addEventListener("keydown", handleEscape);
    return () => form.removeEventListener("keydown", handleEscape);
  }, [isSaving, onCancel]);

  return (
    <form
      ref={formRef}
      className={styles.editor}
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor={inputId} className={styles.editorLabel}>
        {t("admin:adminInvites.quota.editor.label", { name: member.name })}
      </label>
      <div className={styles.editorControls}>
        <div className={styles.editorField}>
          <input
            ref={focusAndSelectOnMount}
            id={inputId}
            type="text"
            inputMode="numeric"
            enterKeyHint="done"
            autoComplete="off"
            maxLength={5}
            className={styles.editorInput}
            value={draft}
            readOnly={isSaving}
            aria-invalid={problem !== null || undefined}
            aria-describedby={message ? messageId : undefined}
            onChange={(event) => handleChange(event.target.value)}
          />
          <span className={styles.editorUnit}>
            {t("admin:adminInvites.quota.editor.unit")}
          </span>
        </div>
        <div className={styles.editorActions}>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            aria-disabled={isSaving || undefined}
          >
            {savingAction === "save"
              ? t("admin:adminInvites.quota.editor.saving")
              : t("admin:adminInvites.quota.editor.saveCta")}
          </Button>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            className={styles.editorCancel}
            aria-disabled={isSaving || undefined}
            onClick={() => {
              if (!isSaving) onCancel();
            }}
          >
            {t("admin:adminInvites.quota.editor.cancelCta")}
          </Button>
          {hasOverride && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.useDefaultButton}
              aria-disabled={isSaving || undefined}
              aria-label={
                savingAction === "useDefault"
                  ? undefined
                  : t("admin:adminInvites.quota.editor.useDefaultAria", {
                      name: member.name,
                    })
              }
              onClick={() => {
                if (!isSaving) onSave(null);
              }}
            >
              <FiRotateCcw aria-hidden />
              {savingAction === "useDefault"
                ? t("admin:adminInvites.quota.editor.saving")
                : t("admin:adminInvites.quota.editor.useDefaultCta")}
            </Button>
          )}
        </div>
      </div>
      <Collapse isOpen={message !== null}>
        <p id={messageId} role="alert" className={styles.editorError}>
          <FiAlertCircle aria-hidden className={styles.editorErrorIcon} />
          <span>{message}</span>
        </p>
      </Collapse>
    </form>
  );
}
