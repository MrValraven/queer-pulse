import { useEffect, useId, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  pushModal,
  popModal,
  isTopmostModal,
} from "../../../shared/components/ui/modalStack";
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
  useScrollLock();
  const { t } = useTranslation();
  // Stable per-instance id so this drawer can register itself on the shared
  // modal stack (see `shared/components/ui/modalStack`) and only act on
  // Escape while topmost — same fix as `AdminModal`'s `useDismiss`. Without
  // this, a stack-aware dialog opened from inside the drawer (e.g. a delete
  // confirm `AdminModal`) and this drawer's own unconditional listener would
  // both fire on one Escape press, closing the confirm AND discarding the
  // drawer underneath it.
  const drawerId = useId();

  useEffect(() => {
    pushModal(drawerId);
    return () => popModal(drawerId);
  }, [drawerId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTopmostModal(drawerId)) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, drawerId]);

  return (
    <>
      <div
        className={styles.scrim}
        role="presentation"
        onClick={onClose}
      />
      <aside
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
