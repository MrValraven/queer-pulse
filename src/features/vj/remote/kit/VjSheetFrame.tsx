import type { ReactNode, RefObject } from "react";
import { Button, Modal } from "../../../../shared/components/ui";
import { useQuizshowDarkDialog } from "../../../quizshow/builder/useQuizshowDarkDialog";
import styles from "./VjRemoteKit.module.css";

export interface VjSheetFrameProps {
  title: ReactNode;
  /** The footer button's label, naming what it closes ("Close mix"). */
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  /** Extra class on the dialog. */
  className?: string;
  /** Where focus lands on open; left out, the first control takes it. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** A status line kept in view at the footer's start, beside the close button. */
  footerStart?: ReactNode;
}

/**
 * Every remote sheet's frame: the shared Modal (a bottom sheet on a phone)
 * painted in the dark Pulse Live look, its dialog stamped `data-theme="dark"`
 * so the shared buttons inside read their cream-on-dark tokens, and a footer
 * with one close button, after an optional status line (`footerStart`). Render it inside `AnimatePresence` so the sheet
 * plays its exit when the host removes it.
 */
export function VjSheetFrame({
  title,
  closeLabel,
  onClose,
  children,
  className,
  initialFocusRef,
  footerStart,
}: VjSheetFrameProps) {
  const darkDialogRef = useQuizshowDarkDialog();
  return (
    <Modal
      title={title}
      className={[styles.sheet, className].filter(Boolean).join(" ")}
      onClose={onClose}
      initialFocusRef={initialFocusRef}
      footer={
        <div className={styles.footer}>
          {footerStart === undefined ? null : (
            <div className={styles.footerStart} data-vj-sheet-footer-start="">
              {footerStart}
            </div>
          )}
          <Button variant="stage-ghost" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      }
    >
      <div className={styles.body} ref={darkDialogRef} data-vj-sheet="">
        {children}
      </div>
    </Modal>
  );
}
