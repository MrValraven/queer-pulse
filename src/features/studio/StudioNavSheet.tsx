import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useScrimDismiss } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { StudioAccountMenuPanel } from "./StudioAccountMenuPanel";
import styles from "./StudioNavSheet.module.css";

/**
 * The listener shell's phone navigation: a sheet from the left edge, opened
 * by the topbar avatar at 880px and below. It holds the account panel's
 * header, groups and exits. StudioAccountMenu owns the open state, the
 * leave window and the focus trap (useNavDrawerFocus on `panelRef`), so the
 * sheet only draws and reports its closes.
 */
export function StudioNavSheet({
  id,
  panelRef,
  persona,
  isExiting,
  onClose,
  onNavigate,
}: {
  id: string;
  /** The dialog element, for the focus trap the menu runs on it. */
  panelRef: RefObject<HTMLDivElement | null>;
  persona: StudioArtistRefView | null;
  /** True through the leave window, while the sheet slides out. */
  isExiting: boolean;
  /** Dismisses with the leave animation (scrim press, close button). */
  onClose: () => void;
  /** Closes at once, for every row that navigates. */
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const scrimProps = useScrimDismiss(onClose);
  useScrollLock();

  return createPortal(
    <div
      className={[styles.root, isExiting && styles.rootClosing]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.scrim} role="presentation" {...scrimProps} />
      <div
        ref={panelRef}
        id={id}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("studio:shell.sheet.label")}
        tabIndex={-1}
      >
        <div className={styles.brandRow}>
          <span className={styles.pulseDot} aria-hidden />
          <span className={styles.brand}>
            <Translation
              i18nKey="studio:brand.lockup"
              components={{ em: <em /> }}
            />
          </span>
          <span className={styles.product}>
            {t("studio:brand.studioLabel")}
          </span>
          <button
            type="button"
            className={styles.close}
            aria-label={t("studio:shell.sheet.close")}
            onClick={onClose}
          >
            <FiX aria-hidden />
          </button>
        </div>
        <StudioAccountMenuPanel
          id={`${id}-account`}
          className={styles.body}
          isSheet
          isExiting={isExiting}
          persona={persona}
          onNavigate={onNavigate}
        />
      </div>
    </div>,
    document.body,
  );
}
