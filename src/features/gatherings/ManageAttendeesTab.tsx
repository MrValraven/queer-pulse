import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { BarFromGatheringModal } from "./BarFromGatheringModal";
import { InviteMembersModal } from "./InviteMembersModal";
import { ManageBarredList } from "./ManageBarredList";
import {
  GoingAttendeeActions,
  WaitlistAttendeeActions,
} from "./ManageAttendeeActions";
import { useAttendees } from "./api/useAttendees";
import { AttendeeSection } from "./ManageGatheringAttendees";
import styles from "./ManageGatheringPage.module.css";

/** Which attendee the "bar from this gathering" prompt is open for. */
interface BarTarget {
  slug: string;
  name: string;
}

export function AttendeesTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [barTarget, setBarTarget] = useState<BarTarget | null>(null);
  const [loadingMoreGoing, setLoadingMoreGoing] = useState(false);
  const [loadingMoreWaitlist, setLoadingMoreWaitlist] = useState(false);
  const { data, loadMoreGoing, loadMoreWaitlist } = useAttendees(slug);
  const going = data?.going ?? [];
  const waitlist = data?.waitlist ?? [];
  const goingCount = data?.goingCount ?? going.length;
  const waitlistCount = data?.waitlistCount ?? waitlist.length;
  const capacity = data?.capacity ?? 20;
  // Seats, never rows (LOC-07). "Ten going" on a twenty-seat gathering can
  // mean thirty people once the declared plus-ones are counted, so the bar
  // measures what capacity actually measures.
  const seatsTaken = data?.seatsTaken ?? goingCount;
  const percentFilled = capacity
    ? Math.min(100, Math.round((seatsTaken / capacity) * 100))
    : 0;
  const hasMoreGoing = data?.hasMoreGoing ?? false;
  const hasMoreWaitlist = data?.hasMoreWaitlist ?? false;
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

  return (
    <div>
      <div className={styles.attToolbar}>
        <input
          className={styles.attSearch}
          type="text"
          aria-label={t("gatherings:manage.attendees.searchPlaceholder")}
          placeholder={t("gatherings:manage.attendees.searchPlaceholder")}
        />
        <Button
          variant="ghost"
          className={styles.actionBtn}
          onClick={() =>
            showToast(t("gatherings:manage.attendees.exportedToast"), "success")
          }
        >
          {t("gatherings:manage.attendees.exportCta")}
        </Button>
        <Button
          variant="primary"
          className={styles.actionBtn}
          onClick={() => setInviteOpen(true)}
        >
          {t("gatherings:manage.attendees.inviteCta")}
        </Button>
      </div>

      <div className={styles.capWrap}>
        <div className={styles.capLabel}>
          <span>
            {t("gatherings:manage.attendees.seatsFilled", {
              seats: seatsTaken,
              capacity,
            })}
            {seatsTaken !== goingCount && (
              <span className={styles.capNote}>
                {t("gatherings:manage.attendees.seatsFromGuests", {
                  count: goingCount,
                })}
              </span>
            )}
          </span>
          <span className={styles.capPct}>
            {fmt.number(percentFilled / 100, {
              style: "percent",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className={styles.capBar}>
          <div
            className={styles.capFill}
            style={{ width: `${percentFilled}%` }}
          />
        </div>
      </div>

      <AttendeeSection
        heading={t("gatherings:manage.attendees.goingHeading", {
          count: goingCount,
        })}
        attendees={going}
        hasMore={hasMoreGoing}
        loadingMore={loadingMoreGoing}
        onLoadMore={() => void onLoadMoreGoing()}
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
        heading={t("gatherings:manage.attendees.waitlistHeading", {
          count: waitlistCount,
        })}
        headingStyle={{ marginTop: 20 }}
        attendees={waitlist}
        hasMore={hasMoreWaitlist}
        loadingMore={loadingMoreWaitlist}
        onLoadMore={() => void onLoadMoreWaitlist()}
        renderAction={(attendee) => (
          <WaitlistAttendeeActions slug={slug} attendee={attendee} />
        )}
      />

      <ManageBarredList slug={slug} demoMode={demoMode} />

      {inviteOpen && (
        <InviteMembersModal slug={slug} onClose={() => setInviteOpen(false)} />
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
