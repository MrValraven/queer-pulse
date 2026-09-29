import { NavLink } from "react-router-dom";
import { FiFileText, FiLayers } from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Tooltip } from "../ui";
import { DeskToneDot } from "../../../features/magazine/desk/DeskToneDot";
import { usePieces } from "../../../features/magazine/api/usePieces";
import { useMagazineEditors } from "../../../features/magazine/api/useMagazineEditors";
import type { PieceFormat } from "../../../features/magazine/data/desk.data";
import {
  RECENT_TONE_FILL,
  recentToneFor,
  recentWaitingOnText,
} from "./magazineSidebarRecentTone";
import styles from "./MagazineSidebar.module.css";

const RECENT_COUNT = 5;

const FORMAT_ICON: Record<PieceFormat, IconType> = {
  article: FiFileText,
  deck: FiLayers,
};

/**
 * "Open now": the desk's most recently touched pieces. `usePieces` already
 * returns newest-first in both modes (the demo fixture's own order; the live
 * `GET /magazine/admin/pieces` list orders by `createdAt DESC`), so the first
 * few rows are a real recency signal. Renders nothing while there are no
 * pieces yet, so no placeholder titles ever show.
 *
 * The link has no native `title`: the `Tooltip` around it already shows the
 * full title on hover and focus, and a second native one would stack on it.
 */
export function MagazineSidebarRecents({
  onNavigate,
  me,
}: {
  onNavigate?: () => void;
  /** The viewer's editor id, used only to tell "waiting on you" apart from a
   *  piece that is waiting on someone else's turn (S6's dot). See
   *  `MagazineDeskShell` for how it is resolved in demo vs live mode. */
  me: string;
}) {
  const { t } = useTranslation();
  const { pieces } = usePieces();
  // The same directory the desk reads, so a piece on another editor's turn
  // is read out with that editor's first name, as the desk row says it.
  const { editors } = useMagazineEditors();
  const recentPieces = pieces.slice(0, RECENT_COUNT);

  if (recentPieces.length === 0) return null;

  return (
    <>
      <span className={styles.eyebrow}>{t("magazine:deskShell.openNow")}</span>
      <nav className={styles.nav} aria-label={t("magazine:deskShell.openNow")}>
        {recentPieces.map((piece) => {
          const Icon = FORMAT_ICON[piece.format];
          const tone = recentToneFor(piece, me);
          return (
            // Tooltip wraps the whole link (not just the label), so its own
            // wrapping span is an ANCESTOR of the focusable element and its
            // `onFocus` reveal actually fires on Tab, matching AdminSidebar's
            // `MaybeTooltip` pattern.
            <Tooltip key={piece.id} label={piece.title} placement="right">
              <NavLink
                to={routes.magazinePiece.replace(":id", piece.id)}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [styles.navItem, isActive && styles.navItemActive]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <Icon aria-hidden />
                <DeskToneDot
                  tone={tone}
                  style={{ background: RECENT_TONE_FILL[tone] }}
                />
                <span className={styles.navLabel}>{piece.title}</span>
                <span className="visuallyHidden">
                  {" "}
                  {recentWaitingOnText(piece, me, editors, t)}
                </span>
              </NavLink>
            </Tooltip>
          );
        })}
      </nav>
    </>
  );
}
