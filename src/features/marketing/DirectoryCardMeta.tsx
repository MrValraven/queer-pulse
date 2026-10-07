import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { categoryLabel } from "./localCategories";
import type { DirectoryPlace } from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/**
 * The card's meta row: the category, then where. An online-only business
 * gets a globe and "Online · {city}" ("Online" while it gives no city); a
 * place its neighbourhood, and an "Also online" pill when it sells online.
 * The Online tab passes `isOnOnlineTab`: every card there sells online, so
 * the pill would only repeat the tab's own name.
 */
export function DirectoryCardMeta({
  place,
  isOnOnlineTab = false,
}: {
  place: DirectoryPlace;
  isOnOnlineTab?: boolean;
}) {
  const { t } = useTranslation();
  const city = place.city?.trim() ?? "";
  return (
    <div className={s.metaRow} data-preview-region="meta">
      <span className={s.catPill}>{categoryLabel(t, place.cat)}</span>
      {place.online === true ? (
        <span className={s.hoodText}>
          <FiGlobe className={s.metaIcon} aria-hidden />
          {city
            ? t("marketing:directory.card.onlineIn", { city })
            : t("marketing:directory.card.online")}
        </span>
      ) : (
        <>
          <span className={s.hoodText}>{place.hood}</span>
          {place.hasOnlineShop && !isOnOnlineTab && (
            <span className={s.alsoOnlinePill}>
              <FiGlobe className={s.alsoOnlineIcon} aria-hidden />
              {t("marketing:directory.card.alsoOnline")}
            </span>
          )}
        </>
      )}
    </div>
  );
}
