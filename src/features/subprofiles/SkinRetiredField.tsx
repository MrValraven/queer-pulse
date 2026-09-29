import { useLayoutEffect, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinMoveToSectionAction } from "./SkinMoveToSectionAction";
import styles from "./SkinRetiredField.module.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** The first focusable element after `wrapper` in the editor, else the last
 *  one before it, skipping anything inside the wrapper or not rendered. */
function neighbourFocusTarget(wrapper: HTMLElement): HTMLElement | undefined {
  const scope = wrapper.closest("main") ?? wrapper.ownerDocument.body;
  const candidates = Array.from(
    scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !wrapper.contains(element) && element.getClientRects().length > 0,
  );
  const isAfterWrapper = (element: HTMLElement) =>
    Boolean(
      wrapper.compareDocumentPosition(element) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  return (
    candidates.find(isAfterWrapper) ??
    candidates.filter((element) => !isAfterWrapper(element)).at(-1)
  );
}

/**
 * Hands focus on when a retired field leaves the chapter with focus inside
 * it (its last character deleted, its last line removed, Clear, or a full
 * move): focus goes to the next field or button, so it never drops to the
 * page. The neighbour is picked while the field is still in the page, and
 * focused once it is gone.
 */
function useFocusHandOffOnLeave() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    return () => {
      if (!wrapper?.contains(wrapper.ownerDocument.activeElement)) return;
      const target = neighbourFocusTarget(wrapper);
      queueMicrotask(() => {
        if (target?.isConnected) target.focus();
      });
    };
  }, []);
  return wrapperRef;
}

/** The value that empties a control: no lines for a list, else "". */
function emptyValueOf(stored: unknown): unknown {
  return Array.isArray(stored) ? [] : "";
}

/**
 * A retired field (`isRetired`): the control as it was, its helper saying
 * where the fact lives now, then its actions. "Move to Credentials" does the
 * move for a list with `moveToSection`; Clear empties the field, which then
 * leaves the chapter. Both stay pending until "Save all", and "Discard all"
 * brings the field back.
 */
export function SkinRetiredField({
  control,
  editor,
  children,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const wrapperRef = useFocusHandOffOnLeave();
  const clear = () =>
    editor.setValue(control.path, emptyValueOf(editor.getValue(control.path)));

  return (
    <div ref={wrapperRef}>
      {children}
      <div className={styles.actions}>
        {control.moveToSection && (
          <SkinMoveToSectionAction control={control} editor={editor} />
        )}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={clear}
          aria-label={t("subprofiles:skinRetired.clearLabel", {
            field: t(control.labelKey),
          })}
        >
          <FiX aria-hidden />
          {t("subprofiles:skinRetired.clear")}
        </Button>
      </div>
    </div>
  );
}
