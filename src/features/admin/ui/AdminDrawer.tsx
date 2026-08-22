import { type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDismiss, useScrimDismiss } from "../../../shared/components/ui";
import styles from "./adminUi.module.css";

/**
 * Right-hand slide-over drawer. Mount it only while open (the parent renders it
 * conditionally) so `useScrollLock` runs unconditionally per repo convention.
 */
export function AdminDrawer({
  head,
  children,
  foot,
  onClose,
  label,
}: {
  head: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
  onClose: () => void;
  label?: string;
}) {
  const { t } = useTranslation();
  // The shared dialog behaviour, replacing this drawer's own hand-rolled
  // scroll lock + modal-stack registration + Escape listener. It keeps all of
  // that (including only acting on Escape while topmost, so a confirm opened
  // from inside the drawer does not also discard the drawer) and adds the
  // three things it was missing: initial focus, a Tab trap, and focus restore
  // to whatever opened it. Typed to <aside>, the drawer's own element.
  const drawerRef = useDismiss<HTMLElement>(onClose);
  // Requires the pointer to have gone DOWN on the scrim, so a text-selection
  // drag that ends outside the drawer no longer discards it.
  const scrimProps = useScrimDismiss(onClose);

  return (
    <>
      <div className={styles.scrim} role="presentation" {...scrimProps} />
      <aside
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className={styles.drawerHead}>
          <div className={styles.drawerHeadMain}>{head}</div>
          <button
            type="button"
            className={styles.drawerX}
            onClick={onClose}
            aria-label={t("admin:common.close")}
          >
            <FiX />
          </button>
        </div>
        <div className={styles.drawerBody}>{children}</div>
        {foot && <div className={styles.drawerFoot}>{foot}</div>}
      </aside>
    </>
  );
}
