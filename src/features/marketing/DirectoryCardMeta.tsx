import { FiGlobe, FiMapPin } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { categoryLabel } from "./localCategories";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  hasMeetingPoint,
  listingKindOf,
  mobileCardAreaLine,
  normalizeMobileDetails,
} from "./listBusiness/listingMobile.data";
import s from "./DirectoryPage.module.css";

/** "Also online", for a place or an out-and-about listing with a shop. */
function AlsoOnlinePill() {
  const { t } = useTranslation();
  return (
    <span className={s.alsoOnlinePill}>
      <FiGlobe className={s.alsoOnlineIcon} aria-hidden />
      {t("marketing:directory.card.alsoOnline")}
    </span>
  );
}

/**
 * The card's meta row: the category, then where. An online-only business
 * gets a globe and "Online · {city}" ("Online" while it gives no city). An
 * out-and-about one gets a map pin and its meeting point's neighbourhood, or
 * where it works ("Works across Lisbon", or up to two parishes and a count);
 * "Also travels to" stays off the card. A place shows its neighbourhood.
 * Places and out-and-about listings that sell online add the "Also online"
 * pill, except on the Online tab (`isOnOnlineTab`), where every card sells
 * online and the pill would only repeat the tab's own name.
 */
export function DirectoryCardMeta({
  place,
  isOnOnlineTab = false,
}: {
  place: DirectoryPlace;
  isOnOnlineTab?: boolean;
}) {
  const { t } = useTranslation();
  const kind = listingKindOf(place);
  const city = place.city?.trim() ?? "";
  const hasPill = kind !== "online" && place.hasOnlineShop && !isOnOnlineTab;
  const areaLine =
    kind === "mobile"
      ? mobileCardAreaLine({
          hood: place.hood,
          isAtMeetingPoint: hasMeetingPoint(place),
          details: normalizeMobileDetails(place.mobileDetails),
        })
      : null;
  return (
    <div className={s.metaRow} data-preview-region="meta">
      <span className={s.catPill}>{categoryLabel(t, place.cat)}</span>
      {kind === "online" ? (
        <span className={s.hoodText}>
          <FiGlobe className={s.metaIcon} aria-hidden />
          {city
            ? t("marketing:directory.card.onlineIn", { city })
            : t("marketing:directory.card.online")}
        </span>
      ) : areaLine ? (
        <span className={s.hoodText}>
          <FiMapPin className={s.metaIcon} aria-hidden />
          {t(areaLine.key, areaLine.values)}
        </span>
      ) : (
        <span className={s.hoodText}>{place.hood}</span>
      )}
      {hasPill && <AlsoOnlinePill />}
    </div>
  );
}
