import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InviteMembersModal } from "./InviteMembersModal";
import { useAttendees } from "./api/useAttendees";
import { AttendeeSection } from "./ManageGatheringAttendees";
import styles from "./ManageGatheringPage.module.css";

export function AttendeesTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loadingMoreGoing, setLoadingMoreGoing] = useState(false);
  const [loadingMoreWaitlist, setLoadingMoreWaitlist] = useState(false);
  const { data, loadMoreGoing, loadMoreWaitlist } = useAttendees(slug);
  const going = data?.going ?? [];
  const waitlist = data?.waitlist ?? [];
  const goingCount = data?.goingCount ?? going.length;
  const waitlistCount = data?.waitlistCount ?? waitlist.length;
  const capacity = data?.capacity ?? 20;
  const pct = capacity ? Math.round((goingCount / capacity) * 100) : 0;
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
            {t("gatherings:manage.attendees.spotsFilled", {
              going: goingCount,
              capacity,
            })}
          </span>
          <span className={styles.capPct}>
            {fmt.number(pct / 100, {
              style: "percent",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className={styles.capBar}>
          <div className={styles.capFill} style={{ width: `${pct}%` }} />
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
          <Button
            variant="ghost"
            aria-label={t("gatherings:manage.attendees.removeAria", {
              name: attendee.name,
            })}
            className={`${styles.attActionBtn} ${styles.remove}`}
            onClick={() =>
              showToast(t("gatherings:manage.attendees.removedToast"), "info")
            }
          >
            {t("gatherings:manage.attendees.removeCta")}
          </Button>
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
          <Button
            variant="ghost"
            aria-label={t("gatherings:manage.attendees.promoteAria", {
              name: attendee.name,
            })}
            className={`${styles.attActionBtn} ${styles.promote}`}
            onClick={() =>
              showToast(
                t("gatherings:manage.attendees.promotedToast", {
                  name: attendee.name.split(" ")[0]!,
                }),
                "success",
              )
            }
          >
            {t("gatherings:manage.attendees.promoteCta")}
          </Button>
        )}
      />
      {inviteOpen && (
        <InviteMembersModal slug={slug} onClose={() => setInviteOpen(false)} />
      )}
    </div>
  );
}
