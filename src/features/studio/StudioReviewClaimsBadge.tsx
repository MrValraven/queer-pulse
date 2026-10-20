import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioClaimCounts } from "./api/useStudioClaimReview";
import css from "./StudioFlagReview.module.css";

/** The Claims tab's count while claims wait for our team (submitted plus
 *  countered). It fades in and out. */
export function StudioReviewClaimsBadge() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { waitingCount } = useStudioClaimCounts();
  return (
    <AnimatePresence initial={false}>
      {waitingCount > 0 && (
        <m.span
          key="claims-waiting"
          className={css.badge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <span aria-hidden>{waitingCount}</span>
          <span className="visuallyHidden">
            {", "}
            <span>
              {t("studio:flagReviewLive.claims.badge", { count: waitingCount })}
            </span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
