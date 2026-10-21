import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_SPRING } from "./studioMotion";
import css from "./StudioFlagReview.module.css";

/**
 * A tab's waiting count. It springs in when work arrives, fades out when
 * the queue is clear, and reads to a screen reader as a sentence ("3
 * claims waiting") after the tab name. `hasMore` marks a count that only
 * covers the pages read so far ("20+").
 */
export function StudioReviewTabBadge({
  count,
  hasMore = false,
  labelKey,
  moreLabelKey = labelKey,
}: {
  count: number;
  hasMore?: boolean;
  /** A plural catalog key that takes `{count}`. */
  labelKey: string;
  /** The sentence for a count that only covers the pages read so far ("20
   *  or more reports open"). */
  moreLabelKey?: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const shown = `${format.number(count)}${hasMore ? "+" : ""}`;
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="waiting"
          className={css.badge}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={
            reducedMotion
              ? { opacity: 0, transition: { duration: 0.12 } }
              : { opacity: 0, scale: 0.8, transition: STUDIO_EXIT }
          }
          transition={reducedMotion ? { duration: 0.12 } : STUDIO_SPRING}
        >
          <span aria-hidden>{shown}</span>
          <span className="visuallyHidden">
            {", "}
            <span>{t(hasMore ? moreLabelKey : labelKey, { count })}</span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
