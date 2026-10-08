import { useCallback, useId, type ReactNode } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { editSectionHeadingId } from "./editDetailsChanges";
import { editSectionConfig, type EditSectionKey } from "./editDetailsSections";
import { useEditDetailsSections } from "./editDetailsSectionsContext";
import fieldStyles from "./EditDetailsFields.module.css";
import styles from "./EditDetailsModal.module.css";

/**
 * One titled part of the edit-details modal: the gathering, when and where,
 * who it is for, taking care, and RSVPs. The title and the one-line hint come
 * from `editDetailsSections.ts`, so the rail and the heading always agree. The
 * modal's own title is an `h3`, so these are `h4`s.
 *
 * Each part is a named group, so a screen reader hears where its fields
 * belong. The section nav is the dialog's one inner landmark. The heading takes focus
 * when the rail jumps here (`tabIndex={-1}` keeps it out of the Tab order).
 * While the section holds edits, "Undo section changes" puts its fields back
 * to what the modal opened on, and focus moves to the heading since the
 * button leaves with the edits.
 */
export function EditDetailsSection({
  sectionKey,
  children,
}: {
  sectionKey: EditSectionKey;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const sections = useEditDetailsSections();
  const fallbackId = useId();
  const headingId = sections
    ? editSectionHeadingId(sections.editorId, sectionKey)
    : fallbackId;
  const hintId = `${headingId}-hint`;
  const config = editSectionConfig(sectionKey);
  const isEdited = sections?.editedKeys.includes(sectionKey) ?? false;
  const registerSection = sections?.registerSection;
  const sectionRef = useCallback(
    (element: HTMLDivElement | null) => registerSection?.(sectionKey, element),
    [registerSection, sectionKey],
  );

  const undoSection = () => {
    sections?.onReset(sectionKey);
    document.getElementById(headingId)?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={sectionRef}
      role="group"
      className={styles.section}
      aria-labelledby={headingId}
      aria-describedby={hintId}
    >
      <div className={styles.sectionHead}>
        <div className={styles.sectionHeadText}>
          <h4 id={headingId} className={styles.sectionTitle} tabIndex={-1}>
            {t(config.titleKey)}
          </h4>
          <p id={hintId} className={styles.sectionHint}>
            {t(config.hintKey)}
          </p>
        </div>
        {isEdited && (
          <button
            type="button"
            className={styles.sectionReset}
            onClick={undoSection}
          >
            <FiRotateCcw aria-hidden />
            {t("gatherings:manage.editModal.resetSection")}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * A modal field with no single native control (chips, a switch list, the
 * cover, the cost segment), drawn in the modal's look: the uppercase label,
 * then the hint, then the control.
 *
 * A group of buttons is not a labelable element, so the label is a plain
 * element whose id the control takes as `aria-labelledby`. The ids reach the
 * control through `children`.
 *
 * `aside` sits on the label's row, at its right end (the themes' live count).
 * It stays outside the label element, so the control's name is the label
 * alone.
 */
export function EditDetailsGroup({
  label,
  hint,
  aside,
  className,
  children,
}: {
  label: string;
  hint?: string;
  aside?: ReactNode;
  /** Added to the group's wrapper, so a section can place it in its grid. */
  className?: string;
  children: (ids: { labelId: string; hintId: string | undefined }) => ReactNode;
}) {
  const labelId = useId();
  const hintId = hint ? `${labelId}-hint` : undefined;
  const labelElement = (
    <div id={labelId} className={styles.groupLabel}>
      {label}
    </div>
  );
  return (
    <div className={[styles.group, className].filter(Boolean).join(" ")}>
      {aside ? (
        <div className={fieldStyles.groupLabelRow}>
          {labelElement}
          {aside}
        </div>
      ) : (
        labelElement
      )}
      {hint && (
        <p id={hintId} className={styles.groupHint}>
          {hint}
        </p>
      )}
      {children({ labelId, hintId })}
    </div>
  );
}
