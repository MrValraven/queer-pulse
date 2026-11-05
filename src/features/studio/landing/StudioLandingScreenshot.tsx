import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  studioLandingShotSrc,
  type StudioLandingShot,
} from "./studioLanding.data";
import styles from "./StudioLandingScreenshot.module.css";

/**
 * One Studio screenshot. Studio is always dark, so every shot is its dark
 * capture.
 *
 * With `isPriority` (the hero), the image loads eagerly at high priority,
 * the image a visitor sees first. Every other shot loads lazily.
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
  const rootClassName = [styles.shot, className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      <img
        className={styles.image}
        src={studioLandingShotSrc(shot)}
        width={shot.width}
        height={shot.height}
        alt={t(shot.altKey)}
        decoding="async"
        loading={isPriority ? "eager" : "lazy"}
        fetchPriority={isPriority ? "high" : undefined}
      />
    </div>
  );
}
