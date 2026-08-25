import { FiArrowRight, FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  operatingStateOf,
  type DirectoryPlace,
  websiteHref,
} from "./directoryPlaces";
import { DirectoryAsideLocation } from "./DirectoryAsideLocation";
import { DirectoryContactRows } from "./DirectoryContactRows";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the "back to directory" CTA doesn't render, matching
   *  how the rest of the page's navigation is inert there. */
  preview?: boolean;
}

/**
 * "Where it is": the second question a member asks, right after "is it open".
 *
 * This is the old aside contact card, moved into the main column and given a
 * heading. It was the single most useful block on the page and it was sitting
 * in a rail that a phone reader only reaches after the entire review list. The
 * map, the address, every contact route and the primary call to action now sit
 * one screen below the hours, where somebody deciding where to go tonight can
 * actually find them.
 */
export function DirectoryVisitSection({ place, preview = false }: Props) {
  const { t } = useTranslation();
  const isPermanentlyClosed = operatingStateOf(place) === "permanently_closed";

  return (
    <section className={s.sec}>
      <h2>{t("marketing:directory.detail.visitTitle")}</h2>
      <div className={s.visitLayout}>
        <div className={s.visitPlace}>
          <DirectoryAsideLocation place={place} />
        </div>
        <div className={s.visitDetails}>
          {place.savedCount != null && place.savedCount > 0 && (
            <div className={s.savedSignal}>
              <FiHeart aria-hidden />
              {t("marketing:directory.detail.savedByMembers", {
                count: place.savedCount,
              })}
            </div>
          )}
          <DirectoryContactRows place={place} />
          <div className={s.cta}>
            {place.social.website ? (
              <Button
                variant="primary"
                className={s.ctaBtn}
                href={websiteHref(place.social.website)}
              >
                {t("marketing:directory.detail.visitWebsite")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            ) : place.social.email && !isPermanentlyClosed ? (
              <Button
                variant="primary"
                className={s.ctaBtn}
                href={`mailto:${place.social.email}`}
              >
                {t("marketing:directory.detail.getInTouch")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            ) : null}
            {!preview && (
              <Button variant="ghost" className={s.ctaBtn} to={routes.directory}>
                {t("marketing:directory.detail.backToDirectory")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
