import { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { EmptyState, SkeletonLine } from "../../../shared/components/ui";
import { PageShell } from "../../../shared/components/layout";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ApiError } from "../../../shared/api/client";
import { routes } from "../../../app/routeMap";
import { useEvent } from "../api/useEvent";
import { useAttendees } from "../api/useAttendees";
import { useCheckIn, useUndoCheckIn } from "../api/useCheckIn";
import { isAttendanceWindowClosed } from "../api/checkInError";
import { manageGatheringPath } from "../data";
import { DoorGuestList } from "./DoorGuestList";
import { DoorClosedNotice, DoorScanCard } from "./DoorScanCard";
import { DoorScanModal } from "./DoorScanModal";
import { DoorShell } from "./DoorShell";
import styles from "../GatheringDashboardPage.module.css";

/** Loading / not-yours frame. A guest list is the host's, so a viewer who is
 *  not an organiser is told plainly rather than shown a roster. */
function DoorUnavailable({ isLoading }: { isLoading: boolean }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.body}>
        <div className="wrap">
          {isLoading ? (
            <>
              <SkeletonLine width="30%" height={18} />
              <SkeletonLine width="60%" height={40} style={{ marginTop: 16 }} />
              <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
            </>
          ) : (
            <EmptyState
              icon={<FiCalendar />}
              title={t("gatherings:door.notYoursTitle")}
              description={t("gatherings:door.notYoursDescription")}
              action={{
                label: t("gatherings:prototypeComingSoon.browseCta"),
                to: routes.events,
              }}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

/**
 * The real day-of dashboard (LOC-03).
 *
 * It reads the slug off the route, loads THIS gathering and THIS roster, and
 * every count on it is the server's own: expected, arrived, waiting. A host
 * standing at a door with a queue in front of them is the one moment where a
 * fabricated list would do real damage, so there is no fixture anywhere in
 * this path and no fallback to one.
 */
export function LiveDoorDashboard({ param }: { param: string | undefined }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading } = useEvent(param);
  const gathering = data?.gathering ?? null;
  const slug = gathering?.slug ?? "";
  const {
    data: roster,
    loadMoreGoing,
    isLoading: isRosterLoading,
  } = useAttendees(slug || undefined);
  const checkIn = useCheckIn(slug);
  const undoCheckIn = useUndoCheckIn(slug);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Set when the server refuses a check-in because this gathering is past its
  // attendance window. Sticky for the life of the screen: the refusal is
  // deterministic, so the reason stays on the page rather than passing by in a
  // toast, and no retry is offered.
  const [wasRefusedPastWindow, setWasRefusedPastWindow] = useState(false);

  if (!gathering || !gathering.viewerIsOrganizer) {
    return <DoorUnavailable isLoading={isLoading} />;
  }

  const going = roster?.going ?? [];
  // Three states, deliberately kept apart. A number is a number, including
  // zero, which means nobody has arrived yet. `null` means the platform no
  // longer keeps this gathering's check-ins, which is the answer past the
  // 30-day retention window. No roster yet is neither, and reads as 0 for the
  // moment the skeleton is up, exactly as it did before.
  const checkedInCount = roster ? roster.checkedInCount : 0;
  const isCheckInKept = checkedInCount !== null;
  const seatsTaken = roster?.seatsTaken ?? roster?.goingCount ?? 0;
  // Two ways to learn the door is shut, and both close the same affordances.
  // The count going null is the ambient signal on load; the 403 is what a tab
  // that was already open finds out when a tap lands.
  const canCheckIn = isCheckInKept && !wasRefusedPastWindow;

  const failed = (error: unknown) =>
    error instanceof ApiError && error.message
      ? error.message
      : t("gatherings:door.failedToast");

  const checkInByName = (memberSlug: string) => {
    setPendingSlug(memberSlug);
    checkIn.mutate(
      { memberSlug },
      {
        onSuccess: (result) =>
          showToast(
            t("gatherings:dashboard.checkedInToast", {
              name: result?.attendee.firstName ?? "",
            }),
            "success",
          ),
        onError: (error) => {
          // A closed window is permanent, so it is stated in place and the
          // buttons come down. Everything else is worth another tap and keeps
          // the toast it always had.
          if (isAttendanceWindowClosed(error)) {
            setWasRefusedPastWindow(true);
            return;
          }
          showToast(failed(error), "error");
        },
        onSettled: () => setPendingSlug(null),
      },
    );
  };

  const undoByName = (memberSlug: string) => {
    setPendingSlug(memberSlug);
    undoCheckIn.mutate(memberSlug, {
      onSuccess: () => showToast(t("gatherings:door.undoneToast"), "info"),
      onError: (error) => showToast(failed(error), "error"),
      onSettled: () => setPendingSlug(null),
    });
  };

  const checkInByCard = (cardToken: string) => {
    setScanError(null);
    checkIn.mutate(
      { cardToken },
      {
        onSuccess: (result) => {
          setIsScanOpen(false);
          showToast(
            t("gatherings:dashboard.checkedInToast", {
              name: result?.attendee.firstName ?? "",
            }),
            "success",
          );
        },
        onError: (error) => {
          // The scan modal's own submit would happily be pressed again, and
          // this refusal will never succeed. Close it and put the reason on
          // the page behind it instead of leaving a live-looking button.
          if (isAttendanceWindowClosed(error)) {
            setIsScanOpen(false);
            setScanError(null);
            setWasRefusedPastWindow(true);
            return;
          }
          setScanError(failed(error));
        },
      },
    );
  };

  return (
    <DoorShell
      title={gathering.title}
      manageTo={manageGatheringPath(gathering.slug)}
      statsNote={
        isCheckInKept ? undefined : t("gatherings:door.checkInsNotKeptNote")
      }
      stats={[
        {
          value:
            checkedInCount !== null ? (
              checkedInCount
            ) : (
              <span className={styles.hsUnavailable}>
                {t("gatherings:door.checkInsNotKept")}
              </span>
            ),
          labelKey: "gatherings:dashboard.checkedIn",
        },
        { value: seatsTaken, labelKey: "gatherings:door.expectedSeats" },
        {
          value: roster?.waitlistCount ?? 0,
          labelKey: "gatherings:dashboard.waitlist",
          emphasis: true,
        },
      ]}
    >
      {wasRefusedPastWindow && <DoorClosedNotice />}

      <div
        className={[
          styles.doorLayout,
          canCheckIn ? "" : styles.doorLayoutSingle,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {canCheckIn && (
          <DoorScanCard
            onOpen={() => {
              setScanError(null);
              setIsScanOpen(true);
            }}
          />
        )}

        {isRosterLoading ? (
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <SkeletonLine width="80%" height={16} />
              <SkeletonLine width="60%" height={16} style={{ marginTop: 12 }} />
            </div>
          </div>
        ) : (
          <DoorGuestList
            attendees={going}
            checkedInCount={checkedInCount}
            canCheckIn={canCheckIn}
            pendingSlug={pendingSlug}
            hasMore={roster?.hasMoreGoing ?? false}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => {
              setIsLoadingMore(true);
              void loadMoreGoing().finally(() => setIsLoadingMore(false));
            }}
            onCheckIn={checkInByName}
            onUndo={undoByName}
          />
        )}
      </div>

      {isScanOpen && canCheckIn && (
        <DoorScanModal
          onToken={checkInByCard}
          isPending={checkIn.isPending}
          errorMessage={scanError}
          onClose={() => setIsScanOpen(false)}
        />
      )}
    </DoorShell>
  );
}
