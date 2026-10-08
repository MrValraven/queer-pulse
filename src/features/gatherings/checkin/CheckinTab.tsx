import { useRef, useState } from "react";
import { FiArchive } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import { Button } from "../../../shared/components/ui/Button";
import { SkeletonLine } from "../../../shared/components/ui";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAttendeePages } from "../api/useAttendeePages";
import { useAttendees } from "../api/useAttendees";
import { CheckinFocusLayer } from "./CheckinFocusLayer";
import { CheckinGuestDetails } from "./CheckinGuestDetails";
import { CheckinGuestGroups } from "./CheckinGuestGroups";
import { CheckinMeter } from "./CheckinMeter";
import { CheckinScanner } from "./CheckinScanner";
import { CheckinToolbar } from "./CheckinToolbar";
import { findGuestRow } from "./findGuestRow";
import { useCheckinActions } from "./useCheckinActions";
import { useFocusMode } from "./useFocusMode";
import { useNow } from "./useNow";
import styles from "./CheckinTab.module.css";

const NOW_REFRESH_MS = 30_000;
const SEARCH_DEBOUNCE_MS = 200;
const METER_SKELETON_HEIGHT = 132;

interface CheckinTabProps {
  slug: string;
  startAt: Date;
  endAt: Date | null;
  customRsvpQuestion?: string | null;
}

/**
 * The Check-in tab: the arrival meter, search and scan, and the guest list.
 * Every piece of panel state lives here, above the focus layer, because the
 * layer remounts its children whenever focus mode toggles.
 */
export function CheckinTab({
  slug,
  startAt,
  endAt,
  customRsvpQuestion,
}: CheckinTabProps) {
  const { t } = useTranslation();
  const { data: roster, isLoading } = useAttendees(slug);
  const now = useNow(NOW_REFRESH_MS);
  const { isFocusMode, enterFocusMode, exitFocusMode } = useFocusMode();
  const [query, setQuery] = useState("");
  const searchTerm = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const [isArrivedOpen, setIsArrivedOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [detailsSlug, setDetailsSlug] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    pendingSlugs,
    lingeringRows,
    wasRefusedPastWindow,
    lastAnnouncement,
    checkInByName,
    undoByName,
    checkInByCard,
  } = useCheckinActions(slug);
  const expected = useAttendeePages(slug, {
    status: "going",
    arrival: "expected",
    q: searchTerm,
  });
  const arrived = useAttendeePages(
    slug,
    { status: "going", arrival: "arrived", q: searchTerm },
    { isEnabled: isArrivedOpen || searchTerm !== "" },
  );

  // A number is a number, zero included. `null` means the platform no longer
  // keeps this gathering's check-ins. No roster yet reads as 0.
  const checkedInCount = roster ? roster.checkedInCount : 0;
  const canCheckIn = checkedInCount !== null && !wasRefusedPastWindow;
  const goingCount = roster?.goingCount ?? 0;
  const expectedCount = Math.max(0, goingCount - (checkedInCount ?? 0));
  const isRosterLoaded = roster !== undefined;
  // Mirrors when the guest list becomes "not on the list": the phone scan
  // dock steps away then, so it never covers the RSVP code.
  const isNotOnListShowing =
    searchTerm !== "" &&
    expected.total === 0 &&
    arrived.total === 0 &&
    !expected.isLoading &&
    !arrived.isLoading &&
    !expected.isLoadError &&
    !arrived.isLoadError;

  const detailsRow = detailsSlug
    ? findGuestRow(detailsSlug, {
        lingeringRows,
        expectedRows: expected.rows,
        arrivedRows: arrived.rows,
        rosterRows: roster?.going ?? [],
      })
    : undefined;
  // A guest whose row has left every list takes their open details with them,
  // and the slug is dropped so the dialog never comes back on its own.
  if (detailsSlug && !detailsRow) setDetailsSlug(null);

  const handleCheckIn = (memberSlug: string) => {
    const attendee = expected.rows.find((row) => row.slug === memberSlug);
    if (attendee) checkInByName(attendee);
  };
  const openScanner = () => setIsScanOpen(true);
  // The "not on the list" Clear button unmounts itself, so focus goes back
  // to the field the host types the next name into.
  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <>
      <CheckinFocusLayer isOpen={isFocusMode} onExit={exitFocusMode}>
        <div
          className={
            isFocusMode ? `${styles.tab} ${styles.tabFocus}` : styles.tab
          }
        >
          {isLoading && !roster ? (
            <SkeletonLine width="100%" height={METER_SKELETON_HEIGHT} />
          ) : (
            <CheckinMeter
              arrivedCount={checkedInCount}
              goingCount={goingCount}
              seatsTaken={roster?.seatsTaken ?? goingCount}
              waitlistCount={roster?.waitlistCount ?? 0}
              startAt={startAt}
              endAt={endAt}
              now={now}
            />
          )}
          {wasRefusedPastWindow && (
            <div className={styles.closedNotice} role="alert">
              <FiArchive aria-hidden="true" />
              <span>{t("gatherings:door.checkInClosedNotice")}</span>
            </div>
          )}
          <CheckinToolbar
            searchInputRef={searchInputRef}
            query={query}
            onQueryChange={setQuery}
            canScan={canCheckIn}
            onScan={openScanner}
            isFocusMode={isFocusMode}
            onToggleFocusMode={isFocusMode ? exitFocusMode : enterFocusMode}
          />
          <CheckinGuestGroups
            expected={expected}
            arrived={arrived}
            expectedCount={expectedCount}
            arrivedCount={checkedInCount}
            searchTerm={searchTerm}
            isRosterLoaded={isRosterLoaded}
            isArrivedOpen={isArrivedOpen}
            onArrivedOpenChange={setIsArrivedOpen}
            canCheckIn={canCheckIn}
            pendingSlugs={pendingSlugs}
            lingeringRows={lingeringRows}
            gatheringSlug={slug}
            onCheckIn={handleCheckIn}
            onUndo={(memberSlug) => void undoByName(memberSlug)}
            onShowDetails={setDetailsSlug}
            onClearSearch={clearSearch}
          />
          <p className={styles.footer}>
            {t("gatherings:checkin.footer.retention")}
          </p>
          {canCheckIn && !isNotOnListShowing && (
            <div className={styles.scanDock}>
              <Button
                variant="primary"
                className={styles.scanDockButton}
                onClick={openScanner}
              >
                <MdQrCodeScanner aria-hidden="true" />
                {t("gatherings:checkin.toolbar.scanCta")}
              </Button>
            </div>
          )}
        </div>
      </CheckinFocusLayer>
      {/* Always mounted, so a check-in or undo is read out the moment it
          lands. The keyed line remounts on every announcement, so the same
          words said twice are read twice. */}
      <div className={styles.announcer} aria-live="polite">
        {lastAnnouncement && (
          <span key={lastAnnouncement.sequence}>
            {lastAnnouncement.message}
          </span>
        )}
      </div>
      <CheckinGuestDetails
        attendee={detailsRow}
        canCheckIn={canCheckIn}
        pendingSlugs={pendingSlugs}
        customRsvpQuestion={customRsvpQuestion}
        onCheckIn={handleCheckIn}
        onClose={() => setDetailsSlug(null)}
      />
      {isScanOpen && canCheckIn && (
        <CheckinScanner
          onCardToken={checkInByCard}
          onUndo={undoByName}
          onClose={() => setIsScanOpen(false)}
        />
      )}
    </>
  );
}
