import { createPortal } from "react-dom";
import { useTranslation } from "../../i18n/useTranslation";
import type { MegaMenu } from "./navMenus";
import { MegaNavRail } from "./MegaNavRail";
import { MegaNavColumns } from "./MegaNavColumns";
import { MegaNavPreview } from "./MegaNavPreview";
import { MegaNavFooter } from "./MegaNavFooter";
import styles from "./MegaNav.module.css";

/**
 * The unified "room" mega panel, portalled to `document.body` while a menu is
 * open: a dismiss overlay plus a stable, centered card laid out as
 * rail | columns | preview with a full-width footer. The rail lists all six
 * sections and `onSelect` swaps the active section (columns + preview) in place
 * without closing. Split into sub-components so each stays under the line limit.
 */
export function MegaNavPanel({
  menus,
  activeMenu,
  activeKey,
  onSelect,
  onClose,
  onPanelMouseEnter,
  onPanelMouseLeave,
}: {
  menus: MegaMenu[];
  activeMenu: MegaMenu;
  activeKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  onPanelMouseEnter: () => void;
  onPanelMouseLeave: () => void;
}) {
  const { t } = useTranslation();

  return createPortal(
    <>
      <div className={styles.overlay} role="presentation" onClick={onClose} />
      <div
        id="mega-panel"
        role="region"
        aria-label={t("shared:megaNav.panelAria", {
          menu: t(activeMenu.titleKey),
        })}
        className={styles.panel}
        onMouseEnter={onPanelMouseEnter}
        onMouseLeave={onPanelMouseLeave}
      >
        <div className={styles.grid}>
          <MegaNavRail menus={menus} activeKey={activeKey} onSelect={onSelect} />
          <MegaNavColumns
            key={activeMenu.key}
            activeMenu={activeMenu}
            onClose={onClose}
          />
          <MegaNavPreview activeMenu={activeMenu} onClose={onClose} />
        </div>
        <MegaNavFooter onClose={onClose} />
      </div>
    </>,
    document.body,
  );
}
