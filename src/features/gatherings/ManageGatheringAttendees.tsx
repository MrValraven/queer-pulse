import type { CSSProperties, ReactNode } from "react";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  attendeeMeta,
  type AttendeeRow as AttendeeRowData,
} from "./api/events.adapters";
import styles from "./ManageGatheringPage.module.css";

/** One attendee row: a tinted initials avatar, the name + composed meta line
 *  ("she/her · RSVP'd 2 Jun"), and a caller-supplied trailing action (Remove for
 *  the going list, Promote for the waitlist). */
export function AttendeeRow({
  attendee,
  action,
}: {
  attendee: AttendeeRowData;
  action: ReactNode;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.attRow}>
      <div
        className={styles.attAv}
        style={{ background: attendee.background, color: attendee.color }}
      >
        {attendee.initials}
      </div>
      <div className={styles.attInfo}>
        <div className={styles.attName}>{attendee.name}</div>
        <div className={styles.attMeta}>{attendeeMeta(attendee, t, fmt)}</div>
      </div>
      <div className={styles.attActions}>{action}</div>
    </div>
  );
}

/** A labelled attendee list section (Going / Waitlist) with its own paged
 *  "load more" control. `renderAction` supplies each row's trailing button so
 *  the going/waitlist sections stay one component with different actions. */
export function AttendeeSection({
  heading,
  headingStyle,
  attendees,
  hasMore,
  loadingMore,
  onLoadMore,
  renderAction,
}: {
  heading: string;
  /** Extra style on the section label (the waitlist heading spaces itself down). */
  headingStyle?: CSSProperties;
  attendees: AttendeeRowData[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  renderAction: (attendee: AttendeeRowData) => ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.attSectionLabel} style={headingStyle}>
        {heading}
      </div>
      <div className={styles.attList}>
        {attendees.map((attendee) => (
          <AttendeeRow
            key={attendee.id}
            attendee={attendee}
            action={renderAction(attendee)}
          />
        ))}
        {hasMore && (
          <div className={styles.moreRow}>
            <Button
              type="button"
              variant="ghost"
              disabled={loadingMore}
              onClick={onLoadMore}
            >
              {loadingMore
                ? t("gatherings:manage.attendees.loadingMore")
                : t("gatherings:manage.attendees.loadMoreCta")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
