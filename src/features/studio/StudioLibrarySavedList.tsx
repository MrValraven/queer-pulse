import { Link } from "react-router-dom";
import { linkToPath } from "../../app/routeMap";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioLibrary.module.css";

/** Saved Studio things as quiet rows: the title opens it; one that can no
 *  longer be opened stays, unlinked, and says so without a reason (the API
 *  never gives one, on purpose). */
export function StudioLibrarySavedList({ items }: { items: SavedItem[] }) {
  const { t } = useTranslation();
  return (
    <ul className={css.savedList}>
      {items.map((item) => {
        const href = isSavedItemUnavailable(item) ? null : item.href;
        return (
          <li
            key={item.id}
            className={[css.savedRow, href === null && css.savedRowUnavailable]
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
            {href === null && (
              <span className={css.savedNote}>
                {t("studio:playlist.row.unavailable")}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
