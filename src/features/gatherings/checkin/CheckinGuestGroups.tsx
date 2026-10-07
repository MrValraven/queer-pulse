import { useId, useMemo } from "react";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { EmptyState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AttendeeRow } from "../api/events.adapters";
import type { AttendeePagesResult } from "../api/useAttendeePages";
import { CheckinGroupHeading } from "./CheckinGroupHeading";
import { splitLingering } from "./checkinLinger";
import { collapseMotion } from "./checkinMotion";
import { CheckinGuestList, type CheckinRowContext } from "./CheckinGuestList";
import { CheckinNotOnList } from "./CheckinNotOnList";
import styles from "./CheckinGuests.module.css";
import { useCheckinFocus } from "./useCheckinFocus";

interface CheckinGuestGroupsProps {
  expected: AttendeePagesResult;
  arrived: AttendeePagesResult;
  /** Header counts when not searching (from the roster's own totals). */
  expectedCount: number;
  arrivedCount: number | null;
  /** False until those counts have loaded, so "No guests yet" waits. */
  isRosterLoaded: boolean;
  searchTerm: string;
  isArrivedOpen: boolean;
  onArrivedOpenChange: (isOpen: boolean) => void;
  canCheckIn: boolean;
  pendingSlugs: ReadonlySet<string>;
  /** Rows just checked in, held in "still to arrive" for the linger. */
  lingeringRows: ReadonlyMap<string, AttendeeRow>;
  customRsvpQuestion?: string | null;
  gatheringSlug: string;
  onCheckIn: (memberSlug: string) => void;
  onUndo: (memberSlug: string) => void;
  onClearSearch: () => void;
}

/** A group the current search found nobody in, once its query settled. */
function hasNoMatches(pages: AttendeePagesResult, shownRows: AttendeeRow[]) {
  const isSettled = !pages.isLoading && !pages.isLoadError;
  return isSettled && pages.total === 0 && shownRows.length === 0;
}

/**
 * The guest list on the Check-in tab: "Still to arrive" on top, where the
 * host works, and "Arrived" folded away under it until they want it.
 *
 * A search opens both groups, counts what it found and leaves out a group
 * that found nobody. A search that finds nobody in either group becomes the
 * "not on the list" state, which offers the RSVP code. When the platform no
 * longer keeps this gathering's check-ins (`arrivedCount === null`) there is
 * no Arrived group, and the first group holds the whole list.
 */
export function CheckinGuestGroups({
  expected,
  arrived,
  expectedCount,
  arrivedCount,
  isRosterLoaded,
  searchTerm,
  isArrivedOpen,
  onArrivedOpenChange,
  canCheckIn,
  pendingSlugs,
  lingeringRows,
  customRsvpQuestion,
  gatheringSlug,
  onCheckIn,
  onUndo,
  onClearSearch,
}: CheckinGuestGroupsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const expectedHeadingId = useId();
  const arrivedHeadingId = useId();
  const arrivedBodyId = useId();
  const {
    containerRef,
    expectedSectionRef,
    expectedHeadingRef,
    handleCheckIn,
    handleUndo,
  } = useCheckinFocus({ pendingSlugs, onCheckIn, onUndo });
  const split = useMemo(
    () => splitLingering(expected.rows, arrived.rows, lingeringRows),
    [expected.rows, arrived.rows, lingeringRows],
  );

  const isSearching = searchTerm !== "";
  const hasArrivedGroup = arrivedCount !== null;
  const isExpectedUnmatched = hasNoMatches(expected, split.expected);
  const isArrivedUnmatched = hasNoMatches(arrived, split.arrived);

  if (isSearching && isExpectedUnmatched && isArrivedUnmatched) {
    return (
      <CheckinNotOnList
        searchTerm={searchTerm}
        gatheringSlug={gatheringSlug}
        onClearSearch={onClearSearch}
      />
    );
  }

  const isRosterEmpty =
    isRosterLoaded &&
    !isSearching &&
    expectedCount === 0 &&
    (arrivedCount ?? 0) === 0 &&
    !expected.isLoading &&
    !expected.isLoadError;
  if (isRosterEmpty) {
    return (
      <EmptyState
        compact
        icon={<FiUsers />}
        title={t("gatherings:door.emptyTitle")}
        description={t("gatherings:door.emptyDescription")}
      />
    );
  }

  const rowContext: CheckinRowContext = {
    canCheckIn,
    pendingSlugs,
    customRsvpQuestion,
    onCheckIn: handleCheckIn,
    onUndo: handleUndo,
  };
  const nobodyLeft = (
    <p className={styles.nobodyLeft}>
      {t("gatherings:checkin.groups.nobodyLeft")}
    </p>
  );
  const isArrivedExpanded = isSearching || isArrivedOpen;
  const isExpectedShown = !isSearching || !isExpectedUnmatched;
  const isArrivedShown =
    hasArrivedGroup && (!isSearching || !isArrivedUnmatched);

  return (
    <LayoutGroup id="checkin-guests">
      <div ref={containerRef} className={styles.groups}>
        {isExpectedShown && (
          <section
            ref={expectedSectionRef}
            aria-labelledby={expectedHeadingId}
            className={styles.group}
          >
            <CheckinGroupHeading
              id={expectedHeadingId}
              headingRef={expectedHeadingRef}
              labelKey="gatherings:checkin.groups.expected"
              count={isSearching ? expected.total : expectedCount}
            />
            <CheckinGuestList
              rows={split.expected}
              pages={expected}
              rowContext={rowContext}
              emptyMessage={isSearching ? undefined : nobodyLeft}
            />
          </section>
        )}
        {isArrivedShown && (
          <section aria-labelledby={arrivedHeadingId} className={styles.group}>
            <CheckinGroupHeading
              id={arrivedHeadingId}
              labelKey="gatherings:checkin.groups.arrived"
              count={isSearching ? arrived.total : (arrivedCount ?? 0)}
              toggle={
                isSearching
                  ? undefined
                  : {
                      isOpen: isArrivedOpen,
                      controlsId: arrivedBodyId,
                      onToggle: () => onArrivedOpenChange(!isArrivedOpen),
                    }
              }
            />
            <AnimatePresence initial={false}>
              {isArrivedExpanded && (
                <m.div
                  key="arrived-body"
                  id={arrivedBodyId}
                  {...collapseMotion(reducedMotion)}
                >
                  <CheckinGuestList
                    rows={split.arrived}
                    pages={arrived}
                    rowContext={rowContext}
                  />
                </m.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </div>
    </LayoutGroup>
  );
}
