import { Link } from "react-router-dom";
import { FiArrowRight, FiGlobe, FiMapPin } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { SafeSpaceBadge } from "../safety/SafeSpaceBadge";
import { categoryLabel } from "./localPlaces";
import { type DirectoryPlace, type Tint } from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

const tintBg: Record<Tint, string> = {
  coral: "rgba(232,119,90,.15)",
  jade: "rgba(74,140,111,.15)",
  plum: "rgba(45,27,61,.1)",
};
const tintFg: Record<Tint, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade)",
  plum: "var(--plum)",
};

/** One business card in the unified Local list. Extracted verbatim from the old DirectoryPage grid. */
export function LocalBusinessCard({
  place,
  index,
}: {
  place: DirectoryPlace;
  index: number;
}) {
  const { t } = useTranslation();
  return (
    <FadeIn
      as={Link}
      delay={Math.min(index, 8) * 60}
      to={`${routes.directory}/${place.slug}`}
      className={s.card}
    >
      <div className={s.top}>
        <span
          className={s.av}
          style={{ background: tintBg[place.tint], color: tintFg[place.tint] }}
        >
          {place.av}
        </span>
        <div className={s.badges}>
          <span className={`${s.badge} ${place.owned ? s.owned : s.friendly}`}>
            {t(
              place.owned
                ? "marketing:directory.badge.queerOwned"
                : "marketing:directory.badge.friendly",
            )}
          </span>
          {place.safeSpaceStatus === "verified" && (
            <SafeSpaceBadge
              label={t("marketing:directory.card.verifiedBadge")}
            />
          )}
        </div>
      </div>
      <div>
        <div className={s.name}>{place.name}</div>
        <div className={s.cat}>{categoryLabel(t, place.cat)}</div>
        <div className={s.hood}>
          {place.online ? (
            <>
              <FiGlobe /> {t("marketing:directory.card.online")}
            </>
          ) : (
            <>
              <FiMapPin /> {place.hood}
            </>
          )}
        </div>
      </div>
      <div className={s.desc}>{place.desc}</div>
      <div className={s.foot}>
        {place.member ? (
          <span className={s.memberLink}>
            {t("marketing:directory.card.memberRun")}
          </span>
        ) : (
          <span />
        )}
        <span className={s.visit}>
          {t("marketing:directory.card.viewDetails")}{" "}
          <FiArrowRight aria-hidden />
        </span>
      </div>
    </FadeIn>
  );
}
