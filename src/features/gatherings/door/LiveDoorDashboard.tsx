import { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import {
  Button,
  EmptyState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { PageShell } from "../../../shared/components/layout";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ApiError } from "../../../shared/api/client";
import { routes } from "../../../app/routeMap";
import { useEvent } from "../api/useEvent";
import { useAttendees } from "../api/useAttendees";
import { useCheckIn, useUndoCheckIn } from "../api/useCheckIn";
import { manageGatheringPath } from "../data";
import { DoorGuestList } from "./DoorGuestList";
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

  if (!gathering || !gathering.viewerIsOrganizer) {
    return <DoorUnavailable isLoading={isLoading} />;
  }

  const going = roster?.going ?? [];
  const checkedInCount = roster?.checkedInCount ?? 0;
  const seatsTaken = roster?.seatsTaken ?? roster?.goingCount ?? 0;

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
        onError: (error) => showToast(failed(error), "error"),
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
        onError: (error) => setScanError(failed(error)),
      },
    );
  };

  return (
    <DoorShell
      title={gathering.title}
      manageTo={manageGatheringPath(gathering.slug)}
      stats={[
        {
          value: checkedInCount,
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
      <div className={styles.doorLayout}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            {t("gatherings:door.scan.heading")}
          </div>
          <div className={styles.cardBody}>
            <p className={styles.doorLead}>{t("gatherings:door.scan.lead")}</p>
            <Button
              variant="primary"
              className={styles.scanBtn}
              onClick={() => {
                setScanError(null);
                setIsScanOpen(true);
              }}
            >
              {t("gatherings:door.scan.openCta")}
            </Button>
          </div>
        </div>

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

      {isScanOpen && (
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
