import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath } from "../../app/routeMap";
import { useDirectoryPlaces } from "./api/useDirectory";
import { categoryLabel } from "./localPlaces";
import { nearbyPlaces } from "./nearbyPlaces";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/** Below a kilometre people read metres; above it, kilometres. */
const METRES_IN_A_KILOMETRE = 1000;
/** Metres are rounded to the nearest 50 so the strip reads as an estimate. */
const METRE_ROUNDING = 50;

/**
 * "Within a short walk": a compact strip of the places a member could
 * reasonably add to the same evening, nearest first, each with the distance
 * from the place they are looking at.
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
  const nearby = nearbyPlaces(place, places);
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
      <ul className={s.nearbyList}>
        {nearby.map(({ place: neighbour, metres }) => (
          <li key={neighbour.slug}>
            <Link className={s.nearbyItem} to={businessPath(neighbour.slug)}>
              <span className={s.nearbyName}>{neighbour.name}</span>
              <span className={s.nearbyMeta}>
                {categoryLabel(t, neighbour.cat)} · {neighbour.hood}
              </span>
              <span className={s.nearbyDistance}>
                <FiMapPin aria-hidden />
                {distanceLabel(metres)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
