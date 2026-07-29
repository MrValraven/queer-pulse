import { Button } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { spotsText } from "./data";
import { EVENT_PRICE_MAX, EVENT_PRICE_MIN, EVENT_SPOTS } from "./eventPage.data";
import styles from "./EventPage.module.css";

/** ≤860px reach bar: the RSVP aside drops far below a long description, so this
 *  keeps a thumb-zone "Reserve" CTA in view that scrolls to the RSVP form. */
export function EventRsvpStickyBar({ targetId }: { targetId: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const prefersReducedMotion = usePrefersReducedMotion();

  function scrollToRsvp() {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className={styles.rsvpStickyBar}>
      <div className={styles.rsvpStickyBarInfo}>
        <div className={styles.rsvpStickyBarPrice}>
          {t("gatherings:event.pills.slidingScale", {
            min: EVENT_PRICE_MIN,
            max: EVENT_PRICE_MAX,
          })}
        </div>
        <div className={styles.rsvpStickyBarNote}>
          {spotsText(EVENT_SPOTS, t, fmt)}
        </div>
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={scrollToRsvp}
        style={{ whiteSpace: "nowrap" }}
      >
        {t("gatherings:event.rsvp.reserveCta")}
      </Button>
    </div>
  );
}
