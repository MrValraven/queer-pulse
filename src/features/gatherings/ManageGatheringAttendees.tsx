import type { CSSProperties, ReactNode } from "react";
import { Button, KindChip } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  attendeeMeta,
  type AttendeeRow as AttendeeRowData,
} from "./api/events.adapters";
import { AttendeeNeeds } from "./AttendeeNeeds";
import styles from "./ManageGatheringPage.module.css";

/** One attendee row: a tinted initials avatar, the name + composed meta line
 *  ("she/her · RSVP'd 2 Jun"), whatever they typed into "Anything we should
 *  know?" (organisers only, LOC-07), and a caller-supplied trailing action
 *  (Remove for the going list, Promote for the waitlist). The host's own row
 *  carries a "Host" chip beside the name. */
export function AttendeeRow({
  attendee,
  action,
  customRsvpQuestion,
  isHost = false,
}: {
  attendee: AttendeeRowData;
  action: ReactNode;
  /** The host's own RSVP question, which labels this attendee's answer. */
  customRsvpQuestion?: string | null;
  isHost?: boolean;
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
        <div className={styles.attName}>
          {attendee.name}
          {isHost && (
            <KindChip kind="feature" className={styles.attHostChip}>
              {t("gatherings:manage.attendees.hostTag")}
            </KindChip>
          )}
        </div>
        <div className={styles.attMeta}>{attendeeMeta(attendee, t, fmt)}</div>
        <AttendeeNeeds
          attendee={attendee}
          customQuestion={customRsvpQuestion}
        />
      </div>
      <div className={styles.attActions}>{action}</div>
    </div>
  );
}

/** A labelled attendee list section (Going / Waitlist) with its own paged
 *  "load more" control. `renderAction` supplies each row's trailing button so
 *  the going/waitlist sections stay one component with different actions.
 *
 *  The host holds a Going RSVP of their own (saved when the gathering is
 *  created, and the server refuses to drop it), so their row is marked and
 *  carries no Remove or Bar: the host stays on their own gathering. */
export function AttendeeSection({
  heading,
  headingStyle,
  attendees,
  hasMore,
  loadingMore,
  onLoadMore,
  renderAction,
  customRsvpQuestion,
  hostSlug,
}: {
  heading: string;
  /** Extra style on the section label (the waitlist heading spaces itself down). */
  headingStyle?: CSSProperties;
  attendees: AttendeeRowData[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  renderAction: (attendee: AttendeeRowData) => ReactNode;
  /** The host's own RSVP question, passed down to label each answer. */
  customRsvpQuestion?: string | null;
  /** The gathering host's slug, matched against each row's `slug`. */
  hostSlug?: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.attSectionLabel} style={headingStyle}>
        {heading}
      </div>
      <div className={styles.attList}>
        {attendees.map((attendee) => {
          const isHost = hostSlug !== undefined && attendee.slug === hostSlug;
          return (
            <AttendeeRow
              key={attendee.id}
              attendee={attendee}
              action={isHost ? null : renderAction(attendee)}
              customRsvpQuestion={customRsvpQuestion}
              isHost={isHost}
            />
          );
        })}
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
