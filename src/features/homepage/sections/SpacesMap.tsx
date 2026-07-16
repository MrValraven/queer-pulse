import { useState } from "react";
import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import {
  mapFilters,
  mapLegend,
  mapSpaces,
  MAP_COLORS,
} from "../data/mapSpaces";
import { visibleSpaces } from "../lib/filters";
import type { MapSpaceType } from "../data/types";
import styles from "./SpacesMap.module.css";

export function SpacesMap() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | MapSpaceType>("all");
  const visible = visibleSpaces(mapSpaces, filter);

  return (
    <section className={styles.section} id="map">
      <div className="wrap">
        <Reveal>
          <SectionHead
            dark
            title={
              <Translation
                i18nKey="homepage:spacesMap.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:spacesMap.subtitle")}
            action={
              <Button variant="ghost-dark" to={routes.map}>
                {t("homepage:spacesMap.openFullMapCta")}
              </Button>
            }
          />
        </Reveal>

        <Reveal className={styles.container}>
          <div className={styles.filters}>
            {mapFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  styles.chip,
                  filter === option.value && styles.chipActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(option.value)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>

          <svg
            className={styles.svg}
            viewBox="0 0 900 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="qp-map-bg" cx="45%" cy="42%" r="65%">
                <stop offset="0%" style={{ stopColor: "var(--plum-deep)" }} />
                <stop offset="100%" style={{ stopColor: "var(--plum)" }} />
              </radialGradient>
            </defs>
            <rect width={900} height={400} fill="url(#qp-map-bg)" />

            {/* Subtle river sweep + block texture */}
            <path
              d="M0 330 C 220 300, 420 360, 640 312 S 900 300, 900 320 L900 400 L0 400 Z"
              fill="rgba(74,140,111,.05)"
            />
            <g
              fill="rgba(247,243,238,.028)"
              stroke="rgba(247,243,238,.04)"
              strokeWidth={0.5}
            >
              <rect x={152} y={200} width={38} height={22} rx={1} />
              <rect x={194} y={200} width={40} height={22} rx={1} />
              <rect x={152} y={226} width={84} height={24} rx={1} />
              <rect x={152} y={254} width={36} height={22} rx={1} />
              <rect x={192} y={254} width={44} height={22} rx={1} />
              <rect x={240} y={254} width={36} height={22} rx={1} />
              <rect x={360} y={196} width={60} height={26} rx={1} />
              <rect x={430} y={210} width={46} height={30} rx={1} />
              <rect x={300} y={250} width={70} height={28} rx={1} />
              <rect x={600} y={244} width={52} height={28} rx={1} />
            </g>

            {visible.map((space) => (
              <g key={space.title} className={styles.pin}>
                <circle
                  className={styles.pinGlow}
                  cx={space.x}
                  cy={space.y}
                  r={11}
                  fill={space.color}
                  opacity={0.22}
                />
                <circle cx={space.x} cy={space.y} r={5.5} fill={space.color} />
                {space.label && (
                  <text
                    className={styles.pinLabel}
                    x={space.x}
                    y={space.y - 11}
                    fontFamily="DM Sans, sans-serif"
                    fontSize={9.5}
                    fill="rgba(247,243,238,.9)"
                    textAnchor="middle"
                    fontWeight={600}
                  >
                    {space.label}
                  </text>
                )}
                <title>{space.title}</title>
              </g>
            ))}
          </svg>

          <div className={styles.legend}>
            {mapLegend.map((item) => (
              <div key={item.type} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: MAP_COLORS[item.type] }}
                />
                {t(item.labelKey)}
              </div>
            ))}
            <span className={styles.legendCount}>
              {t("homepage:spacesMap.countLabel", { count: 48 })}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
