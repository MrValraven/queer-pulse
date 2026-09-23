import { useId } from "react";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import type { GatheringRsvpState } from "./useGatheringRsvp";
import styles from "./GatheringPage.module.css";

/**
 * The hero's one decision: the state banner when the gathering cannot take a
 * seat, and the single RSVP button when it can.
 *
 * WHY THE STATE BANNER IS HERE. A cancelled gathering and one that has already
 * happened both used to render an ordinary, enabled RSVP button on this page.
 * The server refuses both (a cancelled event is "not open for RSVPs"; a past
 * one now is too), so the member pressed a button and got an error about a
 * fact the page had never told them (PRD-181, PRD-183). The banner states it,
 * and the actions that no longer make sense are gone rather than disabled.
 *
 * Save, "Add to calendar" and Share used to sit in this row as buttons of the
 * same weight as the RSVP. They moved up to the header toolbar
 * (`GatheringHeaderToolbar`) as icons, so the RSVP stands alone here. Once the
 * member holds a seat, the button turns to a quieter ghost "Cancel RSVP": the
 * page's headline action is done, and undoing it should not shout.
 */
export function GatheringHeroActions({
  gathering,
  rsvp,
}: {
  gathering: GatheringDetail;
  /** Shared with the sidebar's RSVP panel. See `GatheringDetailBody`. */
  rsvp: GatheringRsvpState;
}) {
  const { t } = useTranslation();
  const stateBannerId = useId();
  // Past the host's RSVP cutoff, a member already holding a seat can still
  // cancel it. Everyone else meets a disabled button, with the banner above
  // it as the reason (Create Gathering v2).
  const isJoinClosed = rsvp.isRsvpClosed && !rsvp.isConfirmed;
  const stateBannerKey = rsvp.isCancelled
    ? "gatherings:gathering.cancelledBanner"
    : rsvp.hasEnded
      ? "gatherings:gathering.endedBanner"
      : "gatherings:gathering.rsvpClosedBanner";

  return (
    <>
      {(!rsvp.canRsvp || isJoinClosed) && (
        <div id={stateBannerId} className={styles.stateBanner} role="status">
          <span className={styles.stateBannerIcon} aria-hidden>
            <FiAlertCircle />
          </span>
          <span>{t(stateBannerKey)}</span>
        </div>
      )}
      {rsvp.canRsvp && (
        <div className={styles.cta}>
          <Button
            size="lg"
            variant={rsvp.isConfirmed ? "ghost" : "primary"}
            disabled={rsvp.isPending || isJoinClosed}
            aria-describedby={isJoinClosed ? stateBannerId : undefined}
            onClick={rsvp.isConfirmed ? rsvp.cancelRsvp : rsvp.goOrWaitlist}
          >
            {rsvp.isConfirmed ? (
              t("gatherings:rsvpControl.cancelCta")
            ) : (
              <>
                {rsvp.isPending
                  ? t("gatherings:rsvpControl.pendingCta")
                  : t(
                      gathering.isFull
                        ? "gatherings:rsvpControl.waitlistCta"
                        : gathering.ctaKey,
                    )}{" "}
                <FiArrowRight aria-hidden />
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
