import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useInertWhileCovered } from "../../shared/components/ui/modalStack";
import {
  useFocusHandBack,
  type ModalExit,
} from "../../shared/components/ui/useModalExit";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import styles from "./vouchGraphShell.module.css";

/**
 * The overlay and dialog for the whole trust network, mounted once by
 * `AdminVouchGraphModal` for every state (loading, empty, error and the
 * loaded graph), so a state change or a member jump swaps only what sits
 * inside and the entrance plays once. `exit` comes from the modal's single
 * `useModalExit`, which plays the exit when the page or drawer stops
 * rendering the network inside its AnimatePresence.
 */
export function GraphModalShell({
  exit,
  children,
}: {
  exit: ModalExit;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  // The content claims focus as it mounts (each state focuses its close
  // button). Child effects run before this shell's own, so focus is already
  // inside the dialog when `useInertWhileCovered` below makes the drawer
  // underneath inert, and nothing gets blurred to `<body>`. The opener is
  // read in a layout effect, ahead of any of that.
  useLayoutEffect(() => {
    openerRef.current = document.activeElement;
  }, []);
  // Returns focus to the control that opened the network once it unmounts.
  // Deliberately lighter than the full `useDismiss`: Tab stays free, and the
  // modal keeps its own Escape listener (see `AdminVouchGraphModal`).
  useEffect(() => {
    const opener = openerRef.current;
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  // Hands focus back to the opener as the exit starts, so keyboard use
  // carries on while the shell fades out.
  useFocusHandBack(exit, dialogRef);
  // A dialog opened on top (the inspector's "Cite" confirm, or
  // AdminMemberDrawer's own overlays) makes this shell inert until it closes,
  // so assistive tech reaches only the top dialog (mirrors the shared Modal
  // in shared/components/ui/Modal.tsx). While the shell plays its exit it
  // leaves the stack, so the layer underneath wakes up at once.
  const overlayRef = useRef<HTMLDivElement>(null);
  useInertWhileCovered(overlayRef, exit.isClosing);
  return createPortal(
    <div
      ref={overlayRef}
      className={cx(styles.overlay, exit.isClosing && styles.overlayClosing)}
      role="presentation"
      onAnimationEnd={exit.handleExitAnimationEnd}
      onClick={(event) => {
        if (event.target === event.currentTarget) exit.close();
      }}
    >
      <div
        ref={dialogRef}
        className={cx(styles.shell, exit.isClosing && styles.shellClosing)}
        role="dialog"
        aria-modal="true"
        aria-label={t("admin:vouchGraph.modal.ariaLabel")}
        inert={exit.isClosing}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** The close button and body for the loading, empty and error states. The
 *  loaded graph brings its own top bar with a close button. */
export function GraphModalStatus({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Claims focus as the state appears (see GraphModalShell).
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);
  return (
    <>
      <button
        ref={closeButtonRef}
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label={t("admin:common.close")}
      >
        <FiX aria-hidden />
      </button>
      {children}
    </>
  );
}
