import { useState } from "react";
import { useTheme, type Theme } from "../../../app/providers/themeContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  studioLandingShotSrc,
  type StudioLandingShot,
} from "./studioLanding.data";
import styles from "./StudioLandingScreenshot.module.css";

const SHOT_THEMES: readonly Theme[] = ["light", "dark"];

/**
 * One Studio screenshot in both themes, stacked in a single grid cell. CSS
 * keyed on `html[data-theme]` shows the variant matching the app theme and
 * crossfades between them when the theme changes. The hidden variant is
 * `display: none` and lazy, so the browser does not fetch it until the
 * theme flips.
 *
 * With `isPriority` (the hero), the variant for the current theme loads
 * eagerly at high priority, the image a visitor sees first.
 *
 * The incoming variant fades up from `@starting-style` only once the theme
 * has flipped while this screenshot is on screen (`themeFade`). A fresh
 * mount (first paint, a gallery tab switch) shows the image straight away,
 * so it never stacks a second fade on the gallery's crossfade or holds back
 * the hero image.
 */
export function StudioLandingScreenshot({
  shot,
  isPriority = false,
  className,
}: {
  shot: StudioLandingShot;
  isPriority?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const altText = t(shot.altKey);
  const [renderedTheme, setRenderedTheme] = useState(theme);
  const [hasThemeFlipped, setHasThemeFlipped] = useState(false);
  if (theme !== renderedTheme) {
    setRenderedTheme(theme);
    setHasThemeFlipped(true);
  }
  const rootClassName = [
    styles.shot,
    hasThemeFlipped ? styles.themeFade : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      data-theme-fade={hasThemeFlipped ? "true" : undefined}
    >
      {SHOT_THEMES.map((shotTheme) => {
        const isEager = isPriority && shotTheme === theme;
        return (
          <img
            key={shotTheme}
            className={styles.image}
            data-shot-theme={shotTheme}
            src={studioLandingShotSrc(shot, shotTheme)}
            width={shot.width}
            height={shot.height}
            alt={altText}
            decoding="async"
            loading={isEager ? "eager" : "lazy"}
            fetchPriority={isEager ? "high" : undefined}
          />
        );
      })}
    </div>
  );
}
