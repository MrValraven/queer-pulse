import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioSalesPendingCount } from "./api/useStudioSalesPendingCount";
import { STUDIO_EXIT, STUDIO_SPRING } from "./studioMotion";
import css from "./StudioCredits.module.css";

const INSTANT = { duration: 0 };

/** The payments waiting to be confirmed, as a pill beside "Payments to
 *  confirm". Without `subprofileId` it counts every persona the member runs
 *  (the menu row); with it, that persona's own count (the artist page link).
 *  It shows only while a payment waits, springing in and fading out.
 *  `className` adds a host's own class beside the shared pill style. */
export function StudioSalesPendingBadge({
  className,
  subprofileId,
}: {
  className?: string;
  subprofileId?: string;
} = {}) {
  const { t } = useTranslation();
  const { count: totalCount, countFor } = useStudioSalesPendingCount();
  const { reducedMotion } = useMotionPrefs();
  const count =
    subprofileId === undefined ? totalCount : countFor(subprofileId);
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="sales-pending"
          className={className ? `${css.badge} ${className}` : css.badge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: reducedMotion ? INSTANT : STUDIO_SPRING,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            transition: reducedMotion ? INSTANT : STUDIO_EXIT,
          }}
        >
          <span aria-hidden>{count}</span>
          {/* The comma keeps the row's label and the count apart in the
              link's accessible name ("Payments to confirm, 3 payments to
              confirm"). The count sentence sits in its own node so it reads
              as one text. */}
          <span className="visuallyHidden">
            {", "}
            <span>{t("studio:purchase.inbox.badge", { count })}</span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}
