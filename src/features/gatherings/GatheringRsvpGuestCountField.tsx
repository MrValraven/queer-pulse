import { useId } from "react";
import { FiInfo, FiMinus, FiPlus } from "react-icons/fi";
import { Collapse, IconButton } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringDetailPanels.module.css";
import guestStyles from "./GatheringRsvpGuestCountField.module.css";
import { GuestSeatIcons } from "./GuestSeatIcons";
import { MAX_RSVP_GUESTS } from "./rsvpGuestCap";

/**
 * "Who's coming": how many extra people the member brings, as one quantity
 * row that holds any range on a single line. The left side says the party in
 * words ("Just me", "Me and 2 others") over a row of seat icons; the right
 * side is a minus and plus stepper around the count. The stepper runs from
 * none to `maxGuestCount`; after the cutoff that ceiling is the member's saved
 * count, and the hint says why. With none saved there is nothing left to
 * pick, so only the hint shows.
 */
export function GatheringRsvpGuestCountField({
  guestCount,
  maxGuestCount,
  isGuestRaiseClosed,
  isAtGuestCap,
  inviteSeatCount,
  onGuestCountChange,
}: {
  guestCount: number;
  maxGuestCount: number;
  isGuestRaiseClosed: boolean;
  /** Plus is held because guests and invites fill every seat on the RSVP. */
  isAtGuestCap: boolean;
  /** Seats held by open member invites and by connections picked to invite. */
  inviteSeatCount: number;
  onGuestCountChange: (count: number) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  const capHintId = useId();
  const hasNoGuestChoice = isGuestRaiseClosed && maxGuestCount === 0;
  const canRemoveGuest = guestCount > 0;
  const canAddGuest = guestCount < maxGuestCount;
  const partyLabel =
    guestCount === 0
      ? t("gatherings:rsvpDetails.guestsJustMe")
      : t("gatherings:rsvpDetails.guestOption", { count: guestCount });

  return (
    <div className={styles.detailsField}>
      {/* A <div> label: the row is a `role="group"`, which a <label> cannot
          be associated with, so the group points at this element instead. */}
      <div id={labelId} className={styles.detailsLabel}>
        {t("gatherings:rsvpDetails.guestsLabel")}
      </div>
      {hasNoGuestChoice ? null : (
        <div
          role="group"
          aria-labelledby={labelId}
          aria-describedby={`${hintId} ${capHintId}`}
          className={guestStyles.quantityRow}
        >
          <div className={guestStyles.party}>
            {/* Announced on every step, so a screen reader hears the new
                party size right after pressing minus or plus. */}
            <span className={guestStyles.partyLabel} aria-live="polite">
              {partyLabel}
            </span>
            <GuestSeatIcons
              guestCount={guestCount}
              inviteSeatCount={inviteSeatCount}
            />
          </div>
          <div className={guestStyles.stepper}>
            {/* `aria-disabled` keeps a button focusable at its limit, so
                focus stays put when the last press reaches 0 or the max. */}
            <IconButton
              aria-label={t("gatherings:rsvpDetails.removeGuest")}
              aria-disabled={!canRemoveGuest}
              className={guestStyles.stepButton}
              onClick={() => {
                if (canRemoveGuest) onGuestCountChange(guestCount - 1);
              }}
            >
              <FiMinus aria-hidden />
            </IconButton>
            <span className={guestStyles.count} aria-hidden>
              <RollingNumber
                value={String(guestCount)}
                numericValue={guestCount}
              />
            </span>
            <IconButton
              aria-label={t("gatherings:rsvpDetails.addGuest")}
              aria-disabled={!canAddGuest}
              className={guestStyles.stepButton}
              onClick={() => {
                if (canAddGuest) onGuestCountChange(guestCount + 1);
              }}
            >
              <FiPlus aria-hidden />
            </IconButton>
          </div>
        </div>
      )}
      <p id={hintId} className={styles.detailsHint}>
        {!isGuestRaiseClosed
          ? t("gatherings:rsvpDetails.guestsHint")
          : hasNoGuestChoice
            ? t("gatherings:rsvpDetails.guestsClosedNoneHint")
            : t("gatherings:rsvpDetails.guestsClosedHint")}
      </p>
      {/* Why plus is held at the cap, in the same words as the invite
          section, so the seats and the invites tell one story. */}
      <Collapse isOpen={isAtGuestCap && !hasNoGuestChoice}>
        <p id={capHintId} className={guestStyles.capHint}>
          <FiInfo aria-hidden className={guestStyles.capHintIcon} />
          {t("gatherings:rsvpInvites.capReachedHint", { max: MAX_RSVP_GUESTS })}
        </p>
      </Collapse>
    </div>
  );
}
