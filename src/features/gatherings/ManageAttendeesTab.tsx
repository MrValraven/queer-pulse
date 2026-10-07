import { useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { BarFromGatheringModal } from "./BarFromGatheringModal";
import { InviteMembersModal } from "./InviteMembersModal";
import { GatheringLineupEditor } from "./GatheringLineupEditor";
import { ManageBarredList } from "./ManageBarredList";
import {
  GoingAttendeeActions,
  WaitlistAttendeeActions,
} from "./ManageAttendeeActions";
import { useAttendees } from "./api/useAttendees";
import { ManageAttendeesCapacity } from "./ManageAttendeesCapacity";
import { useAttendeeSearch } from "./useAttendeeSearch";
import {
  ManageAttendeesSearch,
  ManageAttendeesSearchFailure,
} from "./ManageAttendeesSearch";
import { getAttendeesCsv } from "./api/events.api";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import { AttendeeSection } from "./ManageGatheringAttendees";
import styles from "./ManageGatheringPage.module.css";

/** Which attendee the "bar from this gathering" prompt is open for. */
interface BarTarget {
  slug: string;
  name: string;
}

export function AttendeesTab({
  slug,
  customRsvpQuestion,
  hostSlug,
}: {
  slug: string;
  /** The host's own RSVP question, which labels each attendee's answer. */
  customRsvpQuestion?: string | null;
  /** Marks the host's own going row; see `AttendeeSection`. */
  hostSlug?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [barTarget, setBarTarget] = useState<BarTarget | null>(null);
  const [loadingMoreGoing, setLoadingMoreGoing] = useState(false);
  const [loadingMoreWaitlist, setLoadingMoreWaitlist] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data, loadMoreGoing, loadMoreWaitlist } = useAttendees(slug);
  const onLoadMoreGoing = async () => {
    setLoadingMoreGoing(true);
    await loadMoreGoing();
    setLoadingMoreGoing(false);
  };
  const onLoadMoreWaitlist = async () => {
    setLoadingMoreWaitlist(true);
    await loadMoreWaitlist();
    setLoadingMoreWaitlist(false);
  };
  const goingCount = data?.goingCount ?? data?.going.length ?? 0;
  const waitlistCount = data?.waitlistCount ?? data?.waitlist.length ?? 0;
  const capacity = data?.capacity ?? 20;
  // The bar counts seats (LOC-07). "Ten going" on a twenty-seat gathering can
  // mean thirty people once the declared plus-ones are counted, so the bar
  // measures what capacity actually measures.
  const seatsTaken = data?.seatsTaken ?? goingCount;
  const search = useAttendeeSearch(slug, {
    going: {
      attendees: data?.going ?? [],
      hasMore: data?.hasMoreGoing ?? false,
      loadingMore: loadingMoreGoing,
      onLoadMore: () => void onLoadMoreGoing(),
      headingCount: goingCount,
    },
    waitlist: {
      attendees: data?.waitlist ?? [],
      hasMore: data?.hasMoreWaitlist ?? false,
      loadingMore: loadingMoreWaitlist,
      onLoadMore: () => void onLoadMoreWaitlist(),
      headingCount: waitlistCount,
    },
  });
  // Everyone already going is hidden from the invite picker. The attendee
  // list carries no invited status, so only the going rows loaded so far
  // are known here.
  const goingRows = data?.going;
  const goingSlugs = useMemo(
    () => (goingRows ?? []).map((attendee) => attendee.slug),
    [goingRows],
  );
  const exportAttendees = async () => {
    if (demoMode) {
      showToast(t("gatherings:manage.attendees.exportDemoToast"), "info");
      return;
    }
    setIsExporting(true);
    try {
      const csv = await getAttendeesCsv(slug);
      downloadBlob(`${slug}-attendees.csv`, csv, "text/csv;charset=utf-8;");
      showToast(t("gatherings:manage.attendees.exportedToast"), "success");
    } catch {
      showToast(t("gatherings:manage.attendees.exportFailedToast"), "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className={styles.attToolbar}>
        <ManageAttendeesSearch
          query={search.query}
          onQueryChange={search.setQuery}
        />
        {/* A real download (PRD-190). Demo has no roster behind it, so it
            keeps the toast and leaves the mock guest list off the host's
            disk. */}
        <Button
          variant="ghost"
          className={styles.actionBtn}
          disabled={isExporting}
          onClick={() => void exportAttendees()}
        >
          {t(
            isExporting
              ? "gatherings:manage.attendees.exportingCta"
              : "gatherings:manage.attendees.exportCta",
          )}
        </Button>
        <Button
          variant="primary"
          className={styles.actionBtn}
          onClick={() => setInviteOpen(true)}
        >
          {t("gatherings:manage.attendees.inviteCta")}
        </Button>
      </div>

      <ManageAttendeesCapacity
        seatsTaken={seatsTaken}
        capacity={capacity}
        goingCount={goingCount}
      />
      {search.hasFailed && (
        <ManageAttendeesSearchFailure onRetry={search.retry} />
      )}

      <AttendeeSection
        {...search.going}
        heading={t("gatherings:manage.attendees.goingHeading", {
          count: search.going.headingCount,
        })}
        hostSlug={hostSlug}
        customRsvpQuestion={customRsvpQuestion}
        renderAction={(attendee) => (
          <GoingAttendeeActions
            slug={slug}
            attendee={attendee}
            canBar={!demoMode}
            onBar={setBarTarget}
          />
        )}
      />
      <AttendeeSection
        {...search.waitlist}
        heading={t("gatherings:manage.attendees.waitlistHeading", {
          count: search.waitlist.headingCount,
        })}
        headingStyle={{ marginTop: 20 }}
        customRsvpQuestion={customRsvpQuestion}
        renderAction={(attendee) => (
          <WaitlistAttendeeActions slug={slug} attendee={attendee} />
        )}
      />

      <GatheringLineupEditor slug={slug} />

      <ManageBarredList slug={slug} demoMode={demoMode} />

      {inviteOpen && (
        <InviteMembersModal
          slug={slug}
          excludeSlugs={goingSlugs}
          onClose={() => setInviteOpen(false)}
        />
      )}
      {barTarget && (
        <BarFromGatheringModal
          slug={slug}
          memberSlug={barTarget.slug}
          memberName={barTarget.name}
          onClose={() => setBarTarget(null)}
        />
      )}
    </div>
  );
}
