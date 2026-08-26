import { useState } from "react";
import { FiCornerUpLeft, FiFileText } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useModResponseTemplates } from "./api/AdminResponseTemplateHooks";
import type {
  ModActionCodeFilter,
  ModResponseTemplateDTO,
} from "./api/adminModResponseTemplates.api";
import { fillTemplateBody } from "./AdminResponseTemplateFill";
import type { ReasonCode } from "../safety/reportReasons";
import styles from "./AdminResponseTemplates.module.css";

/**
 * The saved-response picker inside the moderator action drawer.
 *
 * Three rules it exists to keep:
 *  1. PREFILL, NEVER SEND. The chosen body is written into the note field with
 *     its placeholders already resolved, so the moderator reads and edits the
 *     finished words before the action is filed. The stored note is always the
 *     text they approved; no template id is ever persisted.
 *  2. NEVER CLOBBER SILENTLY. If the moderator has already written something,
 *     using a template asks first.
 *  3. ALWAYS UNDOABLE. Right after a prefill, Undo restores what was there.
 *     The Undo control disappears the moment the moderator edits the prefilled
 *     text, because from then on undoing would throw away their own writing.
 */
export function AdminResponseTemplatePicker({
  reasonCode,
  actionCode,
  note,
  onNoteChange,
  memberName,
  communityName,
}: {
  /** The reason currently selected in the drawer. */
  reasonCode: ReasonCode | null;
  /** The server action code for the currently selected action, if any. */
  actionCode: ModActionCodeFilter;
  note: string;
  onNoteChange: (value: string) => void;
  /** The reported member's display name, for `{member}`. */
  memberName: string;
  /** The community the report sits in, or null when it is platform-wide. */
  communityName: string | null;
}) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useModResponseTemplates({
    reasonCode,
    actionCode,
  });
  // The note text as it was immediately before the last prefill, plus the text
  // that prefill produced. Undo is offered only while the two still describe
  // the field, so it can never eat something the moderator typed afterwards.
  const [undoState, setUndoState] = useState<{
    previousNote: string;
    appliedNote: string;
  } | null>(null);
  const [pendingTemplate, setPendingTemplate] =
    useState<ModResponseTemplateDTO | null>(null);

  const templates = data ?? [];
  const isUndoOffered = undoState !== null && undoState.appliedNote === note;

  function applyTemplate(template: ModResponseTemplateDTO) {
    const filled = fillTemplateBody(template.body, {
      member: memberName,
      community:
        communityName ?? t("admin:moderation.templates.picker.anyCommunity"),
    });
    setUndoState({ previousNote: note, appliedNote: filled });
    setPendingTemplate(null);
    onNoteChange(filled);
  }

  function handleUse(template: ModResponseTemplateDTO) {
    // Empty, or still exactly what the last prefill produced: nothing of the
    // moderator's own is at stake, so swap it straight over.
    if (note.trim() === "" || note === undoState?.appliedNote) {
      applyTemplate(template);
      return;
    }
    setPendingTemplate(template);
  }

  function handleUndo() {
    if (!undoState) return;
    onNoteChange(undoState.previousNote);
    setUndoState(null);
  }

  return (
    <div className={styles.picker}>
      <div className={styles.pickerHead}>
        <span className={styles.pickerTitle}>
          <FiFileText aria-hidden />{" "}
          {t("admin:moderation.templates.picker.title")}
        </span>
        {isUndoOffered && (
          <button
            type="button"
            className={styles.undoCta}
            onClick={handleUndo}
            aria-label={t("admin:moderation.templates.picker.undoAriaLabel")}
          >
            <FiCornerUpLeft aria-hidden />{" "}
            {t("admin:moderation.templates.picker.undoCta")}
          </button>
        )}
      </div>

      {isLoading ? (
        <SkeletonLine height={30} style={{ borderRadius: 999 }} />
      ) : isError ? (
        <p className={styles.pickerNote}>
          {t("admin:moderation.templates.picker.loadError")}
        </p>
      ) : templates.length === 0 ? (
        <p className={styles.pickerNote}>
          {t("admin:moderation.templates.picker.empty")}
        </p>
      ) : (
        <>
          <ul className={styles.pickerList}>
            {templates.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  className={styles.pickerChip}
                  onClick={() => handleUse(template)}
                  aria-label={t(
                    "admin:moderation.templates.picker.useAriaLabel",
                    { label: template.label },
                  )}
                  title={template.body}
                >
                  {template.label}
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.pickerNote}>
            {t("admin:moderation.templates.picker.hint")}
          </p>
        </>
      )}

      {pendingTemplate && (
        <div
          className={styles.replaceConfirm}
          role="group"
          aria-label={t("admin:moderation.templates.picker.replaceTitle")}
        >
          <p className={styles.replaceBody}>
            {t("admin:moderation.templates.picker.replaceBody", {
              label: pendingTemplate.label,
            })}
          </p>
          <div className={styles.replaceActions}>
            <button
              type="button"
              className={styles.replaceKeep}
              onClick={() => setPendingTemplate(null)}
            >
              {t("admin:moderation.templates.picker.replaceCancelCta")}
            </button>
            <button
              type="button"
              className={styles.replaceConfirmCta}
              onClick={() => applyTemplate(pendingTemplate)}
            >
              {t("admin:moderation.templates.picker.replaceConfirmCta")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
