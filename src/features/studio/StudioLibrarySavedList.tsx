import { Link } from "react-router-dom";
import { linkToPath } from "../../app/routeMap";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioLibrary.module.css";

/** Saved Studio things as quiet rows: the title opens it. A save our team
 *  took down reads "Withdrawn" and keeps its href (its page explains it);
 *  any other lost save stays, unlinked, as "No longer available" (the API
 *  names no other reason, on purpose). */
export function StudioLibrarySavedList({ items }: { items: SavedItem[] }) {
  const { t } = useTranslation();
  return (
    <ul className={css.savedList}>
      {items.map((item) => {
        const isUnavailable = isSavedItemUnavailable(item);
        const isWithdrawn =
          isUnavailable && item.unavailableReason === "withdrawn";
        const href = isUnavailable && !isWithdrawn ? null : (item.href ?? null);
        return (
          <li
            key={item.id}
            className={[css.savedRow, isUnavailable && css.savedRowUnavailable]
              .filter(Boolean)
              .join(" ")}
          >
            {href ? (
              <Link to={linkToPath(href)} className={css.savedTitle}>
                {item.title}
              </Link>
            ) : (
              <span className={css.savedTitle}>{item.title}</span>
            )}
            {item.meta && <span className={css.savedMeta}>{item.meta}</span>}
            {isUnavailable && (
              <span className={css.savedNote}>
                {t(
                  isWithdrawn
                    ? "studio:withdrawnLive.rowLabel"
                    : "studio:playlist.row.unavailable",
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
