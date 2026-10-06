import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Avatar, KindChip } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { initialsFromParts } from "../../shared/lib/initials";
import { demoGoingAttendeesPreview } from "./GoingAttendeesPreview.data";
import type { GatheringDetail } from "./data";
import type { EventHostDTO } from "./api/events.api";
import styles from "./GoingAttendeesPreview.module.css";

interface Preview {
  attendees: EventHostDTO[];
  total: number;
}

/**
 * Resolve the preview to render, normalizing live vs. demo onto one shape.
 * Live reads straight off `gathering.goingAttendeesPreview`, which the server
 * already filters (`EventsService.buildGoingAttendeesPreview`) by the host's
 * `showAttendeeCount` toggle, by blocks, and by each attendee's own "Who can
 * see you're going?" answer (PRD-414: a face shows only when that answer
 * admits this viewer). This never re-derives that filtering client-side. Demo
 * has no per-gathering mock attendee list, so it derives a small stable one
 * from the member registry instead. See that file's doc for why.
 */
function resolvePreview(
  gathering: GatheringDetail,
  demoMode: boolean,
): Preview | null {
  if (demoMode) return demoGoingAttendeesPreview(gathering);
  const attendees = gathering.goingAttendeesPreview ?? [];
  if (!attendees.length) return null;
  return {
    attendees,
    total: gathering.goingAttendeesPreviewTotal ?? attendees.length,
  };
}

/**
 * MSG-12 — a small pre-RSVP "who else is going" glance: safety-in-numbers,
 * seeing familiar/other attendees before committing to show up. Sits right
 * under the RSVP CTA on both demo and live. Renders nothing when there's no
 * one to show: nobody going yet, the host has hidden attendee visibility via
 * the manage dashboard's "Show attendee count" toggle, or every attendee's
 * "Who can see you're going?" answer leaves this viewer out. The backend is
 * the privacy gate; this component only ever renders what it's given. The
 * "+N more" total counts hidden attendees as a number, with no face.
 *
 * The host holds a Going RSVP of their own (saved when the gathering is
 * created), so they can appear here too, marked with a small "Host" chip.
 */
export function GoingAttendeesPreview({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const preview = resolvePreview(gathering, demoMode);
  if (!preview || preview.attendees.length === 0) return null;

  const { attendees, total } = preview;
  const moreCount = Math.max(0, total - attendees.length);

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <FiUsers aria-hidden />
        {t("gatherings:gathering.attendeesPreview.heading")}
      </div>
      <div className={styles.list}>
        {attendees.map((attendee) => {
          const name = `${attendee.firstName} ${attendee.lastName}`.trim();
          return (
            <Link
              key={attendee.slug}
              to={`/members/${attendee.slug}`}
              className={styles.chip}
            >
              <Avatar
                initials={initialsFromParts(
                  attendee.firstName,
                  attendee.lastName,
                )}
                tint="plum"
                size={26}
                src={attendee.avatarUrl ?? undefined}
                name={name}
              />
              <span>{attendee.firstName}</span>
              {attendee.slug === gathering.hostSlug && (
                <KindChip kind="feature" className={styles.hostChip}>
                  {t("gatherings:gathering.attendeesPreview.hostTag")}
                </KindChip>
              )}
            </Link>
          );
        })}
        {moreCount > 0 && (
          <span className={styles.more}>
            <Translation
              i18nKey="gatherings:gathering.attendeesPreview.moreLabel"
              values={{ count: moreCount }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(moreCount)}
                    numericValue={moreCount}
                  />
                ),
              }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
