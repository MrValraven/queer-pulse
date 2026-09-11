import { useId } from "react";
import { SegmentedControl, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringDetailPanels.module.css";
import guestStyles from "./GatheringRsvpGuestCountField.module.css";

/** The widest range still shown as segments. A larger range (an organiser, or
 *  a member who saved more guests) becomes a select, so the row stays on a
 *  phone. */
const MAX_SEGMENTED_GUEST_COUNT = 3;

/**
 * "Who's coming": how many extra people the member brings. The options run
 * from none to `maxGuestCount`; after the cutoff that ceiling is the member's
 * saved count, and the hint says why. With none saved there is nothing left to
 * pick, so only the hint shows.
 */
export function GatheringRsvpGuestCountField({
  guestCount,
  maxGuestCount,
  isGuestRaiseClosed,
  onGuestCountChange,
}: {
  guestCount: number;
  maxGuestCount: number;
  isGuestRaiseClosed: boolean;
  onGuestCountChange: (count: number) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  const guestLabels = Array.from({ length: maxGuestCount + 1 }, (_, count) =>
    t("gatherings:rsvpDetails.guestOption", { count }),
  );
  const hasNoGuestChoice = isGuestRaiseClosed && maxGuestCount === 0;
  const isSegmented = maxGuestCount <= MAX_SEGMENTED_GUEST_COUNT;

  return (
    <div className={styles.detailsField}>
      {/* A <div> label: a `SegmentedControl` is a `role="group"` of buttons,
          which a <label> cannot be associated with. The group takes its
          accessible name from the `label` prop, and the select points at
          this element. */}
      <div id={labelId} className={styles.detailsLabel}>
        {t("gatherings:rsvpDetails.guestsLabel")}
      </div>
      {hasNoGuestChoice ? null : isSegmented ? (
        <SegmentedControl
          fullWidth
          className={guestStyles.guestSegments}
          label={t("gatherings:rsvpDetails.guestsLabel")}
          options={guestLabels}
          value={guestLabels[guestCount] ?? guestLabels[0]!}
          onChange={(label) => onGuestCountChange(guestLabels.indexOf(label))}
        />
      ) : (
        <Select
          labelledBy={labelId}
          aria-describedby={hintId}
          searchable={false}
          options={guestLabels.map((label, count) => ({
            value: String(count),
            label,
          }))}
          value={String(guestCount)}
          onChange={(value) => onGuestCountChange(Number(value ?? 0))}
        />
      )}
      <p id={hintId} className={styles.detailsHint}>
        {!isGuestRaiseClosed
          ? t("gatherings:rsvpDetails.guestsHint")
          : hasNoGuestChoice
            ? t("gatherings:rsvpDetails.guestsClosedNoneHint")
            : t("gatherings:rsvpDetails.guestsClosedHint")}
      </p>
    </div>
  );
}
