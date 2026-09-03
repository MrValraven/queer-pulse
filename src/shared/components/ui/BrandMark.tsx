import type { CSSProperties } from "react";
import geometry from "./brandMark.geometry.json";
import styles from "./BrandMark.module.css";

/** Which drawing of the mark to render (see the brand guide, sections 02 and 06). */
export type BrandMarkState = "rest" | "compact" | "dot" | "gathering";

/** Which of the three brand behaviours to run. `gather` only affects `gathering`. */
export type BrandMarkMotion = "none" | "heartbeat" | "ripple" | "gather";

export interface BrandMarkProps {
  /** `rest` above 40px, `compact` from 24px, `dot` below; `gathering` needs 56px. */
  state?: BrandMarkState;
  motion?: BrandMarkMotion;
  /** Side of the square box. Defaults to `1em` so it sizes with the text beside it. */
  size?: number | string;
  /**
   * Accessible name when the symbol stands alone and is the only label. Omit
   * it whenever a visible wordmark sits beside the mark: the mark is then
   * decorative and is hidden from assistive tech.
   */
  label?: string;
  className?: string;
}

const CENTRE = geometry.centre;
const VIEW_BOX = `0 0 ${geometry.viewBox} ${geometry.viewBox}`;

/**
 * The QueerPulse mark, drawn inline so it takes the theme: the core is always
 * coral (`--accent`), rings and satellites follow `currentColor`, so the same
 * element is plum-ringed on cream and cream-ringed on plum. Every raster the
 * platform ships (favicon, icons, splash, press kit, OG) is generated from the
 * same geometry file, so this component and those files cannot drift.
 */
export function BrandMark({
  state = "rest",
  motion = "none",
  size,
  label,
  className,
}: BrandMarkProps) {
  const style: CSSProperties | undefined =
    size === undefined ? undefined : { width: size, height: size };
  const accessibility = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const };
  const isBeating = motion === "heartbeat";

  return (
    <svg
      viewBox={VIEW_BOX}
      className={[styles.mark, className].filter(Boolean).join(" ")}
      style={style}
      focusable="false"
      {...accessibility}
    >
      {state === "gathering" ? (
        <Gathering isArriving={motion === "gather"} />
      ) : (
        <>
          {state === "rest" && <RestRings />}
          {state === "compact" && <CompactRing />}
          {motion === "ripple" && <RippleRings />}
          <circle
            className={[styles.core, isBeating && styles.heartbeat]
              .filter(Boolean)
              .join(" ")}
            cx={CENTRE}
            cy={CENTRE}
            r={state === "dot" ? geometry.dotAlone.r : geometry.core.r}
            fill="var(--accent)"
          />
        </>
      )}
    </svg>
  );
}

/** One full hairline ring and an outer ring left open at one o'clock. */
function RestRings() {
  const { innerRing, outerArc } = geometry;
  return (
    <>
      <path
        d={outerArc.path}
        fill="none"
        stroke="currentColor"
        strokeWidth={outerArc.strokeWidth}
        strokeLinecap="round"
        opacity={outerArc.opacity}
      />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={innerRing.r}
        fill="none"
        stroke="currentColor"
        strokeWidth={innerRing.strokeWidth}
        opacity={innerRing.opacity}
      />
    </>
  );
}

/** The single heavier ring used between 24 and 40 px. */
function CompactRing() {
  const { compactRing } = geometry;
  return (
    <circle
      cx={CENTRE}
      cy={CENTRE}
      r={compactRing.r}
      fill="none"
      stroke="currentColor"
      strokeWidth={compactRing.strokeWidth}
      opacity={compactRing.opacity}
    />
  );
}

/** Two rings born from the core, one 400ms behind the other. */
function RippleRings() {
  const { ripple } = geometry;
  const ring = (extraClass?: string) => (
    <circle
      key={extraClass ?? "first"}
      className={[styles.rippleRing, extraClass].filter(Boolean).join(" ")}
      cx={CENTRE}
      cy={CENTRE}
      r={ripple.r}
      fill="none"
      stroke="currentColor"
      strokeWidth={ripple.strokeWidth}
    />
  );
  return (
    <>
      {ring()}
      {ring(styles.rippleRingLate)}
    </>
  );
}

const ARRIVAL_STAGGER_MS = 90;

/** Eight satellites drawing a Q around the core: six on the bowl, two on the tail. */
function Gathering({ isArriving }: { isArriving: boolean }) {
  const { gathering } = geometry;
  return (
    <>
      {gathering.satellites.map((satellite, index) => {
        const arrivalStyle: CSSProperties | undefined = isArriving
          ? ({
              "--from-x": `${satellite.from[0]}px`,
              "--from-y": `${satellite.from[1]}px`,
              "--settled-opacity": gathering.satelliteOpacity,
              animationDelay: `${index * ARRIVAL_STAGGER_MS}ms`,
            } as CSSProperties)
          : undefined;
        return (
          <circle
            key={`${satellite.role}-${index}`}
            className={[styles.satellite, isArriving && styles.arrive]
              .filter(Boolean)
              .join(" ")}
            style={arrivalStyle}
            cx={satellite.cx}
            cy={satellite.cy}
            r={satellite.r}
            fill="currentColor"
            opacity={gathering.satelliteOpacity}
          />
        );
      })}
      <circle
        className={[styles.core, isArriving && styles.beatOnce]
          .filter(Boolean)
          .join(" ")}
        cx={CENTRE}
        cy={CENTRE}
        r={gathering.coreR}
        fill="var(--accent)"
      />
    </>
  );
}
