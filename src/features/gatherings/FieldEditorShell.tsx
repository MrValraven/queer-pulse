import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./FieldEditor.module.css";

/** The controls a host can type into or press, in the order `Modal`'s own
 *  focus trap reads them. A date segment is a `div role="spinbutton"` with
 *  `tabIndex={0}`, so the `tabindex` entry is what finds a `DatePicker`'s
 *  first segment. */
const FIRST_FIELD_SELECTOR =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex="0"]';

/**
 * Cancel on the left, Save on the right: the footer of every one-field editor,
 * exported so a dialog drawn on its own `Modal` (the full `EditDetailsModal`)
 * shows the same pair.
 *
 * While nothing has changed, Save keeps `disabled` and sits as a quiet
 * neutral chip at full strength (see `.save` in FieldEditor.module.css). The
 * shared Button's faded coral read as a washed-out salmon on cream and a
 * muddy maroon with unreadable text on the dark page. Save turns into the
 * normal coral primary the moment the field changes.
 */
export function FieldEditorFooter({
  isSaveEnabled,
  onSave,
  onCancel,
  saveLabel,
  status,
}: {
  isSaveEnabled: boolean;
  onSave: () => void;
  onCancel: () => void;
  /** Defaults to t("gatherings:manage.editModal.saveCta"). */
  saveLabel?: ReactNode;
  /** A line on the footer's left saying where the edit stands (the full
   *  `EditDetailsModal` says what changed and what holds Save). Cancel and
   *  Save then sit together on the right. The one-field editors pass none
   *  and keep their Cancel-left, Save-right footer exactly as it was. */
  status?: ReactNode;
}) {
  const { t } = useTranslation();
  const buttons = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {t("gatherings:manage.cancelCta")}
      </Button>
      <Button
        variant="primary"
        className={styles.save}
        onClick={onSave}
        disabled={!isSaveEnabled}
      >
        {saveLabel ?? t("gatherings:manage.editModal.saveCta")}
      </Button>
    </>
  );
  if (status === undefined) {
    return <div className={styles.footer}>{buttons}</div>;
  }
  return (
    <div className={`${styles.footer} ${styles.footerWithStatus}`}>
      <div className={styles.footerStatus}>{status}</div>
      <div className={styles.footerActions}>{buttons}</div>
    </div>
  );
}

/**
 * The shared chrome of the manage page's one-field editors (date and time,
 * venue, capacity, description): the shared `Modal` with a plain title naming the
 * field, one sub line saying what saving does, the field itself, and
 * `FieldEditorFooter`.
 *
 * The title alone names the field, so there is no eyebrow above it: "Edit"
 * over "Edit description" said the same thing twice. On phones `Modal` is
 * already a bottom sheet, and the footer's two buttons share its width there
 * so both sit under the thumb.
 *
 * Focus opens on the field. Left to itself `Modal` focuses its first control,
 * the close button in the head, so a host opening "Date and time" had to tab
 * past it to reach the date. Without an `initialFocusRef` the shell points
 * `Modal` at the first control in its own body: the start date's first
 * segment, or the capacity editor's No limit switch.
 */
export function FieldEditorShell({
  title,
  sub,
  isSaveEnabled,
  onSave,
  onClose,
  wide = false,
  initialFocusRef,
  shouldCollapseSubWithKeyboard = false,
  children,
}: {
  title: ReactNode;
  /** One short line on what saving does (who hears about it, where it shows). */
  sub?: ReactNode;
  /** Something changed and the draft is valid. */
  isSaveEnabled: boolean;
  onSave: () => void;
  onClose: () => void;
  /** The roomier dialog, for the description and the venue's results list. */
  wide?: boolean;
  /** Where focus lands on open, when it is a particular control. Defaults to
   *  the first control in the body. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Passed to `Modal`: on a phone with the keyboard up the sub line steps
   *  aside so a search's results list keeps its rows above the keyboard. */
  shouldCollapseSubWithKeyboard?: boolean;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  // One stable object for the life of the dialog: `Modal`'s focus effect
  // lists its ref as a dependency, so a fresh object per render would pull
  // focus back to the first field on every keystroke. The lookup runs inside
  // that effect, after the body has mounted.
  const [firstFieldRef] = useState<RefObject<HTMLElement | null>>(() => ({
    get current() {
      return (
        bodyRef.current?.querySelector<HTMLElement>(FIRST_FIELD_SELECTOR) ??
        null
      );
    },
  }));
  return (
    <Modal
      title={title}
      sub={sub}
      wide={wide}
      shouldCollapseSubWithKeyboard={shouldCollapseSubWithKeyboard}
      onClose={onClose}
      initialFocusRef={initialFocusRef ?? firstFieldRef}
      footer={
        <FieldEditorFooter
          isSaveEnabled={isSaveEnabled}
          onSave={onSave}
          onCancel={onClose}
        />
      }
    >
      <div ref={bodyRef} className={styles.body}>
        {children}
      </div>
    </Modal>
  );
}
