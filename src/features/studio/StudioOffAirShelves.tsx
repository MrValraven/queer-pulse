import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { linkToPath, routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import {
  OFF_AIR_LIBRARY,
  QUIET_HOURS,
  type OffAirCard,
} from "./studioOffAir.data";
import studioStyles from "./studio.module.css";
import { StudioEuroAmount } from "./StudioEuroAmount";

const cardTitle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 400,
  fontSize: 15,
  color: "var(--studio-text)",
  letterSpacing: "-0.01em",
};
const meta: React.CSSProperties = {
  fontSize: 12,
  color: "var(--studio-text-faint)",
};
const curator: React.CSSProperties = {
  fontSize: 12,
  color: "var(--studio-text-muted)",
};
const rowNote: React.CSSProperties = {
  fontSize: 13,
  color: "var(--studio-text-faint)",
};
const rowLink: React.CSSProperties = {
  marginLeft: "auto",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--studio-text-muted)",
};

/** Joins a card's format word, artist, track count and running time into its " · " meta line. */
function offAirMetaLine(item: OffAirCard, t: TFunction): string {
  return [
    item.kindKey ? t(item.kindKey) : undefined,
    item.artist,
    item.trackCount === undefined
      ? undefined
      : t("studioShowcase:offAir.meta.trackCount", { count: item.trackCount }),
    item.duration,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}

export function StudioOffAirShelves({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      {/* Carry on section */}
      <section className={studioStyles.row} style={{ paddingTop: 24 }}>
        <div className={studioStyles.rowH}>
          <h2>
            <Translation
              i18nKey="studio:offAir.carryOn.heading"
              components={{ em: <em /> }}
            />
          </h2>
          <div style={rowNote}>{t("studio:offAir.carryOn.sub")}</div>
          <Link to={routes.studioLibrary} style={rowLink}>
            {t("studio:offAir.libraryCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
        {loading ? (
          <StudioCardGridSkeleton className={studioStyles.rowGrid} count={4} />
        ) : (
          <div className={studioStyles.rowGrid}>
            {OFF_AIR_LIBRARY.map((item, i) => (
              <FadeIn
                key={item.title}
                delay={Math.min(i, 8) * 60}
                as={Link}
                to={linkToPath(item.to)}
                className={studioStyles.card}
              >
                <div className={studioStyles.cardCov}>
                  <ImageSlot
                    src={item.image}
                    tint={item.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder={t("studio:media.coverLabel")}
                  />
                  {item.tag && item.tagLabelKey && (
                    <span
                      className={`${studioStyles.tag} ${item.tag === "mem" ? studioStyles.tagMem : studioStyles.tagFree}`}
                    >
                      {t(item.tagLabelKey)}
                    </span>
                  )}
                </div>
                {item.curator && <div style={curator}>{item.curator}</div>}
                <h4 style={cardTitle}>
                  {item.title} <em>{item.titleEm}</em>
                </h4>
                <div style={meta}>{offAirMetaLine(item, t)}</div>
                {item.pay && (
                  <div style={meta}>
                    {t("studio:offAir.perPlay")}{" "}
                    <em style={{ color: "var(--studio-accent-text)" }}>
                      <StudioEuroAmount value={0.05} />
                    </em>
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Quiet hours section */}
      <section className={studioStyles.row} style={{ paddingBottom: 50 }}>
        <div className={studioStyles.rowH}>
          <h2>
            <Translation
              i18nKey="studio:offAir.quietHours.heading"
              components={{ em: <em /> }}
            />
          </h2>
          <div style={rowNote}>{t("studio:offAir.quietHours.sub")}</div>
          <Link to={routes.studioSearch} style={rowLink}>
            {t("studio:offAir.allCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
        {loading ? (
          <StudioCardGridSkeleton className={studioStyles.rowGrid} count={4} />
        ) : (
          <div className={studioStyles.rowGrid}>
            {QUIET_HOURS.map((item, i) => (
              <FadeIn
                key={item.title}
                delay={Math.min(i, 8) * 60}
                as={Link}
                to={linkToPath(item.to)}
                className={studioStyles.card}
              >
                <div className={studioStyles.cardCov}>
                  <ImageSlot
                    src={item.image}
                    tint={item.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder={t("studio:media.coverLabel")}
                  />
                </div>
                <div style={curator}>{item.curator}</div>
                <h4 style={cardTitle}>
                  {item.title} <em>{item.titleEm}</em>
                </h4>
                <div style={meta}>{offAirMetaLine(item, t)}</div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
