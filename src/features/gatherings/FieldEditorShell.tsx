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
}: {
  isSaveEnabled: boolean;
  onSave: () => void;
  onCancel: () => void;
  /** Defaults to t("gatherings:manage.editModal.saveCta"). */
  saveLabel?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
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
  children,
}: {
  title: ReactNode;
  /** One short line on what saving does (who hears about it, where it shows). */
  sub?: ReactNode;
  /** Something changed and the draft is valid. */
  isSaveEnabled: boolean;
  onSave: () => void;
  onClose: () => void;
  /** The description's roomier dialog. */
  wide?: boolean;
  /** Where focus lands on open, when it is a particular control. Defaults to
   *  the first control in the body. */
  initialFocusRef?: RefObject<HTMLElement | null>;
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
