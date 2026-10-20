import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioMyClaimsReplyCount } from "./api/useStudioMyClaimsReplyCount";
import css from "./StudioCredits.module.css";

/** The pill beside "My claims" while a claim waits for the member's reply.
 *  It shows only while one waits, and fades in and out. `className` adds a
 *  host's own class beside the shared pill style. */
export function StudioMyClaimsBadge({
  className,
}: { className?: string } = {}) {
  const { t } = useTranslation();
  const { count } = useStudioMyClaimsReplyCount();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="my-claims-replies"
          className={className ? `${css.badge} ${className}` : css.badge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <span aria-hidden>{count}</span>
          {/* The comma keeps "My claims" and the count apart in the link's
              accessible name ("My claims, 2 claims waiting for your reply").
              The count sentence sits in its own node so it reads as one
              text. */}
          <span className="visuallyHidden">
            {", "}
            <span>{t("studio:shell.menu.myClaimsBadge", { count })}</span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
