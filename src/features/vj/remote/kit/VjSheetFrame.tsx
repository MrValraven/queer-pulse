import { useCallback, useId } from "react";
import type { ReactNode, RefObject } from "react";
import { Button, Modal } from "../../../../shared/components/ui";
import { useQuizshowDarkDialog } from "../../../quizshow/builder/useQuizshowDarkDialog";
import styles from "./VjRemoteKit.module.css";
import frameStyles from "./VjSheetFrame.module.css";

export interface VjSheetFrameProps {
  title: ReactNode;
  /** One quiet line under the title saying what the sheet is for; it also
   *  becomes the dialog's description (aria-describedby). */
  intro?: string;
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
 * so the shared buttons inside read their cream-on-dark tokens, an optional
 * one-line `intro` under the title (the Modal's sub line, in the remote's
 * caption look, wired as the dialog's aria-describedby), and a footer
 * with one close button, after an optional status line (`footerStart`). Render it inside `AnimatePresence` so the sheet
 * plays its exit when the host removes it.
 */
export function VjSheetFrame({
  title,
  intro,
  closeLabel,
  onClose,
  children,
  className,
  initialFocusRef,
  footerStart,
}: VjSheetFrameProps) {
  const darkDialogRef = useQuizshowDarkDialog();
  const introId = useId();
  const hasIntro = intro !== undefined && intro !== "";
  // The Modal takes no description prop, so the body's first element stamps
  // aria-describedby on the dialog itself, the way the dark theme is stamped.
  const bodyRef = useCallback(
    (anchor: HTMLDivElement | null) => {
      darkDialogRef(anchor);
      const dialog = anchor?.closest('[role="dialog"]');
      if (dialog === null || dialog === undefined) return;
      if (hasIntro) dialog.setAttribute("aria-describedby", introId);
      else dialog.removeAttribute("aria-describedby");
    },
    [darkDialogRef, hasIntro, introId],
  );
  return (
    <Modal
      title={title}
      sub={hasIntro ? <span id={introId}>{intro}</span> : undefined}
      subClassName={frameStyles.intro}
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
      <div className={styles.body} ref={bodyRef} data-vj-sheet="">
        {children}
      </div>
    </Modal>
  );
}
