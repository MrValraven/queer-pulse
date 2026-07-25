import { type CSSProperties } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { MAP_LOADING_DOTS, MAP_LOADING_STREETS } from "./mapLoading.data";
import s from "./MapLoading.module.css";

/** In-panel "city lights" loader for the Lisbon map: a faint street web draws
 *  itself in while brand-coloured dots breathe at staggered offsets on its
 *  intersections — Lisbon waking up before the pins land. Covers the canvas
 *  until the map has painted its first full frame, then crossfades out to
 *  reveal the settled basemap. */
export function MapLoading({ ready }: { ready: boolean }) {
  return (
    <div
      className={`${s.loading} ${ready ? s.done : ""}`}
      role="status"
      aria-hidden={ready}
    >
      <div className={s.lights} aria-hidden>
        {/* The street web behind the dots. preserveAspectRatio="none" makes the
            0–100 viewBox map onto the panel exactly like the dots' top/left %,
            so each light lands on an intersection. Strokes stay even under that
            non-uniform stretch via vector-effect="non-scaling-stroke". */}
        <svg
          className={s.streets}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {MAP_LOADING_STREETS.map((street, index) => (
            <polyline
              key={index}
              className={`${s.street} ${street.artery ? s.artery : ""}`}
              points={street.points}
              pathLength={100}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${street.delay}s` }}
            />
          ))}
        </svg>

        {MAP_LOADING_DOTS.map((dot, index) => (
          <span
            key={index}
            className={s.light}
            style={
              {
                top: dot.top,
                insetInlineStart: dot.left,
                "--light-size": `${dot.size}px`,
                "--light-color": dot.color,
                animationDelay: `${dot.delay}s`,
                animationDuration: `${dot.duration}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <p className={s.label}>
        <Translation
          i18nKey="marketing:map.mapLoading"
          components={{ em: <em /> }}
        />
      </p>
    </div>
  );
}
