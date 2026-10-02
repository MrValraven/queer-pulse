import { useId, useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { categoryLabel } from "./localCategories";
import { type DirectoryPlace } from "./directoryPlaces";
import {
  CONSTELLATION_LIMIT,
  ORBIT_RADII,
  layoutConstellation,
} from "./onlineConstellation";
import s from "./DirectoryOnline.module.css";

/** The heartbeat drawn through the core: flat, a small lift, the spike, the
 *  dip, flat again. In the core's own 0–48 box. */
const HEARTBEAT_PATH = "M4 26h9l3-5 4 12 5-24 4 17 3-5h12";

/**
 * The Online tab's lead-in: a compact band, on the same plum-tinted surface as
 * the map's frame, where the community's pulse sits at the centre of a small
 * constellation and every online-only business orbits it, wired back by a
 * faint signal line. It is the counterpart of the Lisbon map, and deliberately
 * not a second hero: the page already has one, so this stays one short line of
 * copy beside the picture and lets the cards start high on the page.
 *
 * Nodes stay still on purpose. Only decoration moves (the pulse rings and the
 * outer orbit's slow turn), so nothing clickable ever drifts from under a
 * pointer, and all of it stops under reduced motion. Hovering or focusing a
 * node lights its card in the grid below, and the other way round.
 */
export function DirectoryOnlineConstellation({
  places,
  activeSlug,
  onActivate,
}: {
  places: DirectoryPlace[];
  activeSlug: string | null;
  onActivate: (slug: string | null) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const titleId = useId();
  const nodes = useMemo(() => layoutConstellation(places), [places]);
  const overflow = Math.max(0, places.length - CONSTELLATION_LIMIT);
  const verifiedCount = places.filter(
    (place) => place.queerOwnedVerified,
  ).length;
  const kindCount = new Set(places.map((place) => place.cat)).size;
  const rolling = (count: number) => (
    <RollingNumber value={fmt.number(count)} numericValue={count} />
  );

  const stats = [
    { key: "businesses", count: places.length },
    { key: "verified", count: verifiedCount },
    { key: "kinds", count: kindCount },
  ];

  return (
    <section className={s.panel} aria-labelledby={titleId}>
      <div className={s.panelCopy}>
        <p className={s.eyebrow}>
          <span className={s.eyebrowDot} aria-hidden />
          {t("marketing:directory.online.eyebrow")}
        </p>
        <h2 id={titleId} className={s.title}>
          <Translation
            i18nKey="marketing:directory.online.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.body}>{t("marketing:directory.online.body")}</p>
        <div className={s.meta}>
          <dl className={s.stats}>
            {stats.map((stat) => (
              <div key={stat.key} className={s.stat}>
                <dt>
                  {t(`marketing:directory.online.stat.${stat.key}`, {
                    count: stat.count,
                  })}
                </dt>
                <dd>{rolling(stat.count)}</dd>
              </div>
            ))}
          </dl>
          {overflow > 0 && (
            <p className={s.overflow}>
              <Translation
                i18nKey="marketing:directory.online.more"
                values={{ count: overflow }}
                slots={{ count: rolling(overflow) }}
              />
            </p>
          )}
        </div>
      </div>

      <div className={s.stage}>
        <svg
          className={s.orbits}
          viewBox="0 0 100 100"
          aria-hidden
          focusable="false"
        >
          <circle cx={50} cy={50} r={ORBIT_RADII[0]} className={s.orbitInner} />
          <circle cx={50} cy={50} r={ORBIT_RADII[1]} className={s.orbitOuter} />
        </svg>
        <svg
          className={s.signals}
          viewBox="0 0 100 100"
          aria-hidden
          focusable="false"
        >
          {nodes.map((node) => (
            <line
              key={node.item.slug}
              x1={50}
              y1={50}
              x2={50 + node.x}
              y2={50 + node.y}
              className={s.signal}
              data-active={node.item.slug === activeSlug ? "true" : undefined}
            />
          ))}
        </svg>

        <div className={s.core} aria-hidden>
          <span className={s.ring} />
          <span className={s.ring} />
          <span className={s.ring} />
          <svg viewBox="0 0 48 48" className={s.heartbeat} focusable="false">
            <path d={HEARTBEAT_PATH} />
          </svg>
        </div>

        <ul
          className={s.nodes}
          aria-label={t("marketing:directory.online.constellationLabel")}
        >
          {nodes.map((node, index) => {
            const place = node.item;
            const style = {
              "--node-x": `${node.x}%`,
              "--node-y": `${node.y}%`,
              "--node-i": index,
            } as CSSProperties;
            return (
              <li key={place.slug} className={s.nodeItem} style={style}>
                <Link
                  to={`${routes.directory}/${place.slug}`}
                  className={s.node}
                  data-tint={place.tint}
                  data-active={place.slug === activeSlug ? "true" : undefined}
                  aria-label={t("marketing:directory.online.nodeLabel", {
                    name: place.name,
                    category: categoryLabel(t, place.cat),
                  })}
                  onMouseEnter={() => onActivate(place.slug)}
                  onMouseLeave={() => onActivate(null)}
                  onFocus={() => onActivate(place.slug)}
                  onBlur={() => onActivate(null)}
                >
                  <span className={s.nodeInitials} aria-hidden>
                    {place.av}
                  </span>
                  {place.queerOwnedVerified && (
                    <span className={s.nodeVerified} aria-hidden>
                      <FiCheck />
                    </span>
                  )}
                  <span className={s.nodeName} aria-hidden>
                    {place.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
