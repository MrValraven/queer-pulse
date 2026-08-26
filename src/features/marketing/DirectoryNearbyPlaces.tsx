import { FiMapPin } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlaces } from "./api/useDirectory";
import { LocalBusinessCard } from "./LocalBusinessCard";
import { nearbyPlaces } from "./nearbyPlaces";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/** Below a kilometre people read metres; above it, kilometres. */
const METRES_IN_A_KILOMETRE = 1000;
/** Metres are rounded to the nearest 50 so the strip reads as an estimate. */
const METRE_ROUNDING = 50;

/**
 * "Within a short walk": the places a member could reasonably add to the same
 * evening, nearest first, each with the distance from the place they are
 * looking at.
 *
 * Renders the same `LocalBusinessCard` the directory grid uses — photo, badge,
 * rating, description, pills, opening status — so a suggestion here is judged
 * on exactly what a listing shows in the directory, rather than on a name and
 * a category. The only addition is the walking distance, pinned to the photo's
 * top-left corner where it clears both the badge and the bookmark.
 *
 * Distances come from `nearbyPlaces`, which drops anything with no
 * coordinates and anything not trading normally, so this never invents a
 * position or sends someone to a closed door. Renders nothing when there is
 * no walkable neighbour, and nothing at all for an online-only business,
 * which has no "here" to be near.
 */
export function DirectoryNearbyPlaces({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const places = useDirectoryPlaces();
  const { demoMode } = useDemoMode();
  const nearby = nearbyPlaces(place, places, demoMode);
  if (nearby.length === 0) return null;

  const distanceLabel = (metres: number): string =>
    metres < METRES_IN_A_KILOMETRE
      ? t("marketing:directory.detail.nearby.metres", {
          distance: fmt.number(
            Math.max(
              METRE_ROUNDING,
              Math.round(metres / METRE_ROUNDING) * METRE_ROUNDING,
            ),
          ),
        })
      : t("marketing:directory.detail.nearby.kilometres", {
          distance: fmt.number(metres / METRES_IN_A_KILOMETRE, {
            maximumFractionDigits: 1,
          }),
        });

  return (
    <section className={s.nearby}>
      <h2 className={s.relatedTitle}>
        {t("marketing:directory.detail.nearby.title")}
      </h2>
      <p className={s.nearbySub}>
        {t("marketing:directory.detail.nearby.sub", { name: place.name })}
      </p>
      <div className={s.relatedGrid}>
        {nearby.map(({ place: neighbour, metres }, index) => (
          <LocalBusinessCard
            key={neighbour.slug}
            place={neighbour}
            index={index}
            photoTag={
              <>
                <FiMapPin aria-hidden />
                {distanceLabel(metres)}
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}
