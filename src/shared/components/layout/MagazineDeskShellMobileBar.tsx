import { useLocation } from "react-router-dom";
import { FiEdit3, FiMenu } from "react-icons/fi";
import { Button } from "../ui";
import { useTranslation } from "../../i18n/useTranslation";
import { magazineWriteHref } from "./magazineWriteHref";

/**
 * The sticky bar above the desk's content on tablet/phone: the drawer
 * toggle, plus the rail's own Write button. Without this, no filled action
 * is on screen until the drawer opens, since the rail (and its Write
 * button) sits off-canvas at this width. Hidden
 * while the drawer is open, so this button and the rail's own Write stay a
 * single filled coral button between them, as the plan asks.
 */
export function MagazineDeskShellMobileBar({
  isDrawerOpen,
  onToggleDrawer,
  drawerId,
  className,
  menuButtonClassName,
}: {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  /** The `id` of the off-canvas drawer this bar's toggle controls. */
  drawerId: string;
  /** A CSS Module lookup can read `undefined` under `noUncheckedIndexedAccess`
   *  if the class is ever missing from the sheet; both classes stay optional
   *  here rather than asserted, so a miss renders without that one class
   *  instead of throwing. */
  className?: string;
  menuButtonClassName?: string;
}) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className={className}>
      <button
        type="button"
        className={menuButtonClassName}
        aria-label={isDrawerOpen ? t("nav:closeMenu") : t("nav:openMenu")}
        aria-expanded={isDrawerOpen}
        aria-controls={drawerId}
        onClick={onToggleDrawer}
      >
        <FiMenu aria-hidden />
      </button>
      {!isDrawerOpen && (
        // Default (md) size, so this button clears the same 44px floor the
        // menu button beside it already holds; `Button`'s own `sm` floor
        // (`Button.module.css`) sits at 40px.
        <Button variant="primary" to={magazineWriteHref(location)}>
          <FiEdit3 aria-hidden /> {t("magazine:deskShell.writePiece")}
        </Button>
      )}
    </div>
  );
}
