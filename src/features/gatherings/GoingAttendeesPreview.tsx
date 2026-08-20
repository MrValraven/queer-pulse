import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
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
 * Live reads straight off `gathering.goingAttendeesPreview` — already
 * privacy- (host's `showAttendeeCount` toggle) and block-filtered
 * server-side (`EventsService.buildGoingAttendeesPreview`), so this never
 * re-derives or second-guesses that filtering client-side. Demo has no
 * per-gathering mock attendee list, so it derives a small stable one from the
 * member registry instead — see that file's doc for why.
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
 * one to show (nobody going yet, or the host has hidden attendee visibility
 * via the manage dashboard's "Show attendee count" toggle) — the backend is
 * the actual privacy gate; this component only ever renders what it's given.
 */
export function GoingAttendeesPreview({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
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
            </Link>
          );
        })}
        {moreCount > 0 && (
          <span className={styles.more}>
            {t("gatherings:gathering.attendeesPreview.moreLabel", {
              count: moreCount,
            })}
          </span>
        )}
      </div>
    </div>
  );
}
