import { useEffect, useRef, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { demoGoingAttendeesPreview } from "./GoingAttendeesPreview.data";
import { GoingAttendeesList } from "./GoingAttendeesList";
import { GoingHeightFrame } from "./GoingHeightFrame";
import {
  useGoingAttendeesExpansion,
  type GoingPreview,
} from "./useGoingAttendeesExpansion";
import type { GatheringDetail } from "./data";
import styles from "./GoingAttendeesPreview.module.css";

/** How long the revealed part fades out after "Show less" before it
 *  unmounts and the frame shrinks; matches `.leaving` in the CSS module. */
const LEAVE_FADE_MS = 150;

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
): GoingPreview | null {
  if (demoMode) return demoGoingAttendeesPreview(gathering);
  const attendees = gathering.goingAttendeesPreview ?? [];
  if (!attendees.length) return null;
  return {
    attendees,
    total: gathering.goingAttendeesPreviewTotal ?? attendees.length,
  };
}

/**
 * MSG-12: a small pre-RSVP "who else is going" glance: safety-in-numbers,
 * seeing familiar/other attendees before committing to show up. Sits right
 * under the RSVP CTA on both demo and live. Renders nothing when there's no
 * one to show: nobody going yet, the host has hidden attendee visibility via
 * the manage dashboard's "Show attendee count" toggle, or every attendee's
 * "Who can see you're going?" answer leaves this viewer out. The backend is
 * the privacy gate; this component only ever renders what it's given. The
 * "+N more" total counts hidden attendees as a number, with no face.
 *
 * Pressing "+N more" expands the row in place. Live, the rest come from the
 * paged attendees route (fetched on that press, never on page load), which
 * applies the same blocks and visibility answers, so its rows are shown as
 * given; the people it leaves out for this viewer read as one bare "N more
 * going privately" line, with no faces or names. See
 * `useGoingAttendeesExpansion` for the merge and the demo source.
 *
 * The host holds a Going RSVP of their own (saved when the gathering is
 * created), so they can appear here too, marked with a small "Host" chip.
 * Going co-hosts get a matching "Co-host" chip (live only; demo has no
 * co-host data). The host chip wins if a slug somehow matches both.
 */
export function GoingAttendeesPreview({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const preview = resolvePreview(gathering, demoMode);
  const { reducedMotion } = useMotionPrefs();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const showLessRef = useRef<HTMLButtonElement>(null);
  const expansion = useGoingAttendeesExpansion(gathering, preview, {
    toggleRef,
    listRef,
    showLessRef,
  });
  const [isLeaving, setIsLeaving] = useState(false);
  const leaveTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(leaveTimerRef.current), []);
  if (!preview || expansion.previewPeople.length === 0) return null;

  const showLess = () => {
    if (isLeaving) return;
    if (reducedMotion) {
      expansion.collapse();
      return;
    }
    setIsLeaving(true);
    leaveTimerRef.current = window.setTimeout(() => {
      setIsLeaving(false);
      expansion.collapse();
    }, LEAVE_FADE_MS);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <FiUsers aria-hidden />
        {t("gatherings:gathering.attendeesPreview.heading")}
      </div>
      <GoingHeightFrame id={expansion.regionId}>
        <GoingAttendeesList
          expansion={expansion}
          listRef={listRef}
          toggleRef={toggleRef}
          showLessRef={showLessRef}
          isLeaving={isLeaving}
          onShowLess={showLess}
        />
      </GoingHeightFrame>
      <div role="status">
        <Collapse isOpen={expansion.isLoadMoreError}>
          <p className={styles.errorLine}>
            {t("gatherings:gathering.attendeesPreview.loadError")}
            <button
              type="button"
              data-tap-target
              className={styles.textButton}
              onClick={expansion.retryLoadMore}
            >
              {t("gatherings:gathering.attendeesPreview.retry")}
            </button>
          </p>
        </Collapse>
        <Collapse isOpen={expansion.isLoadError}>
          <p className={styles.errorLine}>
            {t("gatherings:gathering.attendeesPreview.loadError")}
            <button
              type="button"
              data-tap-target
              className={styles.textButton}
              onClick={expansion.retryFirstLoad}
            >
              {t("gatherings:gathering.attendeesPreview.retry")}
            </button>
          </p>
        </Collapse>
      </div>
    </div>
  );
}
