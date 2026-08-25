import { NavLink } from "react-router-dom";
import { FiFileText, FiLayers } from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { usePieces } from "../../../features/magazine/api/usePieces";
import type { PieceFormat } from "../../../features/magazine/data/desk.data";
import styles from "./MagazineSidebar.module.css";

const RECENT_COUNT = 3;

const FORMAT_ICON: Record<PieceFormat, IconType> = {
  article: FiFileText,
  deck: FiLayers,
};

/**
 * "Open now" — the desk's most-recently-touched pieces. `usePieces` already
 * returns newest-first in both modes (the demo fixture's own order; the live
 * `GET /magazine/admin/pieces` list orders by `createdAt DESC`), so the first
 * few rows are a real recency signal, not a guess. Renders nothing while
 * there are no pieces yet — no placeholder titles.
 */
export function MagazineSidebarRecents({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { pieces } = usePieces();
  const recentPieces = pieces.slice(0, RECENT_COUNT);

  if (recentPieces.length === 0) return null;

  return (
    <>
      <span className={styles.eyebrow}>{t("magazine:deskShell.openNow")}</span>
      <nav className={styles.nav} aria-label={t("magazine:deskShell.openNow")}>
        {recentPieces.map((piece) => {
          const Icon = FORMAT_ICON[piece.format];
          return (
            <NavLink
              key={piece.id}
              to={routes.magazinePiece.replace(":id", piece.id)}
              onClick={onNavigate}
              className={({ isActive }) =>
                [styles.navItem, isActive && styles.navItemActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              <Icon aria-hidden />
              <span className={styles.navLabel}>{piece.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
