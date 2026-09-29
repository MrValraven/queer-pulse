import type { CSSProperties } from "react";
import { BrandMark } from "../ui/BrandMark";
import { usePrefersReducedMotion } from "../../hooks";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { useScreenLoaderHandoff } from "./screenLoaderHandoff";
import styles from "./PageLoader.module.css";

export interface PageLoaderProps {
  /** Visible caption. Defaults to t("shared:loading.label"). */
  label?: string;
  /**
   * "screen" fills the whole viewport, for a wait with no shell around it
   * (the session check and the route Suspense fallbacks), and adds the
   * QueerPulse wordmark under the mark; "page" fills the body of a page under its
   * nav; "section" is a compact block inside a page body or panel. Default "page".
   */
  size?: "screen" | "page" | "section";
  className?: string;
}

type PageLoaderSize = NonNullable<PageLoaderProps["size"]>;

/**
 * The mark's pixel size for each loader size. All clear the 56px the
 * gathering drawing needs for its eight satellites to read as a Q.
 */
const MARK_SIZE: Record<PageLoaderSize, number> = {
  screen: 96,
  page: 96,
  section: 72,
};

const SIZE_CLASS_NAMES: Record<PageLoaderSize, string | undefined> = {
  screen: styles.screen,
  page: styles.page,
  section: styles.section,
};

/** Two pulse waves half a cycle apart, timed in the stylesheet to the gather beat. */
const WAVES = [
  { id: "onBeat", className: styles.wave },
  { id: "offBeat", className: styles.waveLate },
];

/**
 * The branded wait: the QueerPulse mark gathering into its Q on a breathing
 * coral halo, with coral pulse waves travelling out from it on each beat and a
 * serif caption beneath. It is the one loader for a whole screen and for a
 * block inside a page, so every wait in the app reads as the same product
 * moment.
 *
 * `size="screen"` is the one full-screen loader: the session check in
 * app/routes.tsx, the auth chunks' Suspense fallback (`auth()` in
 * app/routeHelpers.tsx) and RouteFallback all render it. At that size the
 * QueerPulse wordmark sits under the mark as the headline and the caption
 * drops to a quiet italic line. A cold load of a gated route mounts two of
 * these back to back, so a screen loader that takes over from one still on
 * screen (or gone within a frame or two) continues its timeline: the
 * `--loader-elapsed` it sets pulls every animation delay back by how long the
 * wait has already run, so the reveal hold is spent once, the caption rises
 * once, and the gather, halo and waves carry on mid-cycle. See
 * `useScreenLoaderHandoff`. The page and section sizes carry no wordmark and
 * always start fresh.
 *
 * The root is the live region, so callers render it bare and add no wrapper of
 * their own. The mark is decorative because the wordmark and caption already
 * name the wait. Under reduced motion the mark is told to hold still as well,
 * on top of BrandMark's own reduced-motion rules, the waves are removed, and
 * the halo and caption stay put.
 */
export function PageLoader({
  label,
  size = "page",
  className,
}: PageLoaderProps) {
  const { t } = useTranslation();
  const isReducedMotion = usePrefersReducedMotion();
  const isScreen = size === "screen";
  const elapsedMs = useScreenLoaderHandoff(isScreen);
  const markSize = MARK_SIZE[size];
  const stageStyle = { "--mark-size": `${markSize}px` } as CSSProperties;
  const rootStyle = isScreen
    ? ({ "--loader-elapsed": `${Math.round(elapsedMs)}ms` } as CSSProperties)
    : undefined;

  const rootClassName = [
    styles.loader,
    SIZE_CLASS_NAMES[size],
    isReducedMotion && styles.still,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      style={rootStyle}
      role="status"
      aria-live="polite"
    >
      <div className={styles.stage} style={stageStyle}>
        <span className={styles.halo} aria-hidden />
        {WAVES.map((wave) => (
          <span key={wave.id} className={wave.className} aria-hidden />
        ))}
        <BrandMark
          className={styles.mark}
          state="gathering"
          motion={isReducedMotion ? "none" : "gather"}
          size={markSize}
        />
      </div>
      {isScreen && (
        <p className={styles.wordmark}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <span className={styles.wordmarkItalic} /> }}
          />
        </p>
      )}
      <p className={styles.caption}>{label ?? t("shared:loading.label")}</p>
    </div>
  );
}
