import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioCreditPendingCount } from "./api/useStudioCreditPendingCount";
import css from "./StudioCredits.module.css";

/** The pending credit requests pill beside "Credits". It shows only while a
 *  request waits, and fades in and out. */
export function StudioCreditsBadge() {
  const { t } = useTranslation();
  const { count } = useStudioCreditPendingCount();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="credit-requests"
          className={css.badge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <span aria-hidden>{count}</span>
          {/* The comma keeps "Credits" and the count apart in the link's
              accessible name ("Credits, 2 credit requests waiting"). The
              count sentence sits in its own node so it reads as one text. */}
          <span className="visuallyHidden">
            {", "}
            <span>{t("studio:credits.badge", { count })}</span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
