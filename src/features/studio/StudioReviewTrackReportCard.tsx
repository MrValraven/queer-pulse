import { useId } from "react";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioAdminTrackView,
  StudioReviewTrackReportView,
} from "./api/studioSafety.adapters";
import { STUDIO_CONTENT_WARNING_IDS } from "./api/studioSafety.types";
import { useStaffStudioTrackRead } from "./api/useStudioTrackReports";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import { ReviewCardFrame, ReviewFact, type TitleRef } from "./StudioReviewCard";
import {
  ReviewDisabledReasons,
  ReviewLookupFailure,
  ReviewSelectBox,
  ReviewUrgency,
} from "./StudioReviewCardParts";
import { ReviewTrackLink } from "./StudioReviewTrackLink";
import { StudioTrackWarningPill } from "./StudioTrackWarningPill";
import css from "./StudioFlagReview.module.css";
import { useReviewDate } from "./useReviewDate";

/** Why each track action waits, or none for an action that can run. */
function useTrackActionReasons(
  track: StudioAdminTrackView | null,
  /** The failure text's id while the track read failed, else null. */
  lookupTextId: string | null,
) {
  const isLookupFailed = lookupTextId !== null;
  const { t } = useTranslation();
  const explicitId = useId();
  const warningId = useId();
  const isEveryWarningAdded =
    track !== null &&
    track.staffContentWarnings.length === STUDIO_CONTENT_WARNING_IDS.length;
  // A failed read already says why in the panel above; a loading one waits
  // with one shared line.
  const waitingText = isLookupFailed
    ? null
    : t("studio:flagReviewLive.trackReports.waitingForTrack");
  const explicitText = !track
    ? waitingText
    : track.isExplicitLocked
      ? t("studio:flagReviewLive.trackReports.explicitLockedReason")
      : null;
  const warningText = !track
    ? null
    : isEveryWarningAdded
      ? t("studio:flagReviewLive.trackReports.everyWarningReason")
      : null;
  const reasons = [
    explicitText ? { id: explicitId, text: explicitText } : null,
    warningText ? { id: warningId, text: warningText } : null,
  ].filter((reason) => reason !== null);
  return {
    reasons,
    explicit: {
      isWaiting: !track || track.isExplicitLocked,
      describedBy: lookupTextId ?? (explicitText ? explicitId : undefined),
    },
    warning: {
      isWaiting: !track || isEveryWarningAdded,
      describedBy:
        lookupTextId ??
        (warningText
          ? warningId
          : !track && explicitText
            ? explicitId
            : undefined),
    },
    takeDown: {
      isWaiting: !track,
      describedBy:
        lookupTextId ?? (!track && explicitText ? explicitId : undefined),
    },
  };
}

/** A member's report about one track. The report names only the track, so
 *  the card reads it through the staff track route (contract). A failed read
 *  shows Reload in place, and every action that needs the track waits with
 *  its reason in view. */
export function StudioReviewTrackReportCard({
  report,
  titleRef,
  selection,
  onMarkExplicit,
  onAddWarning,
  onTakeDown,
  onDismiss,
}: {
  report: StudioReviewTrackReportView;
  titleRef: TitleRef;
  selection?: StudioRowSelection;
  onMarkExplicit: (track: StudioAdminTrackView) => void;
  onAddWarning: (track: StudioAdminTrackView) => void;
  onTakeDown: (track: StudioAdminTrackView) => void;
  onDismiss: (trackTitle: string) => void;
}) {
  const { t } = useTranslation();
  const dateOf = useReviewDate();
  const { track, loadState } = useStaffStudioTrackRead(report.trackId);
  const lookupTextId = useId();
  const waits = useTrackActionReasons(
    track,
    loadState.isError ? lookupTextId : null,
  );
  const trackTitle =
    track?.title || t("studio:flagReviewLive.trackReports.unknownTrack");
  // "Current marks" only shows once the track carries a warning or the
  // explicit mark.
  const hasMarks =
    track !== null && (track.contentWarnings.length > 0 || track.isExplicit);
  return (
    <ReviewCardFrame
      release={track?.release ?? null}
      titleRef={titleRef}
      chip={t(report.reasonLabelKey)}
      urgency={
        <ReviewUrgency severity={report.severity} slaDueAt={report.slaDueAt} />
      }
      selectBox={
        selection ? (
          <ReviewSelectBox
            isShown={selection.isSelecting}
            isChecked={selection.isSelected(report.reportId)}
            label={t("studio:flagReviewLive.queue.selectReport", {
              title: trackTitle,
            })}
            onToggle={(withShift) =>
              selection.toggle(report.reportId, withShift)
            }
          />
        ) : undefined
      }
      meta={t("studio:flagReviewLive.card.filedOn", {
        date: dateOf(report.createdAt),
      })}
      notice={
        <>
          <ReviewLookupFailure
            loadState={loadState}
            whatKey="studio:errors.what.track"
            reloadLabelKey="studio:flagReviewLive.trackReports.reloadTrack"
            textId={lookupTextId}
          />
          <ReviewDisabledReasons reasons={waits.reasons} />
        </>
      }
      actions={
        <>
          {/* The fixes that keep the track up lead; taking the whole
              release down is the heavier, rarer call. */}
          <Button
            variant="primary"
            size="sm"
            aria-disabled={waits.explicit.isWaiting || undefined}
            aria-describedby={waits.explicit.describedBy}
            onClick={() => {
              if (track && !waits.explicit.isWaiting) onMarkExplicit(track);
            }}
          >
            {t("studio:flagReviewLive.trackReports.markExplicit")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            aria-disabled={waits.warning.isWaiting || undefined}
            aria-describedby={waits.warning.describedBy}
            onClick={() => {
              if (track && !waits.warning.isWaiting) onAddWarning(track);
            }}
          >
            {t("studio:flagReviewLive.trackReports.addWarning")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={css.dangerOutline}
            aria-disabled={waits.takeDown.isWaiting || undefined}
            aria-describedby={waits.takeDown.describedBy}
            onClick={() => {
              if (track) onTakeDown(track);
            }}
          >
            {t("studio:flagReviewLive.action.takeDown")}
          </Button>
          {/* The quiet exits come last: on a phone they share one row. */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(trackTitle)}
          >
            {t("studio:flagReviewLive.action.dismiss")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            to={`${routes.adminModeration}?tab=open&subjectId=${encodeURIComponent(report.trackId)}`}
          >
            {t("studio:flagReviewLive.action.openModeration")}
          </Button>
        </>
      }
    >
      <ReviewFact labelKey="studio:flagReviewLive.claims.trackLabel">
        {track ? (
          <ReviewTrackLink
            trackId={track.id}
            releaseId={track.releaseId}
            href={track.href}
            label={t("studio:flagReviewLive.claims.trackLine", {
              number: track.position,
              title: track.title,
            })}
            title={track.title}
            canPlay={track.hasAudio}
          />
        ) : (
          trackTitle
        )}
      </ReviewFact>
      <ReviewFact
        labelKey="studio:flagReviewLive.trackReports.currentLabel"
        isShown={hasMarks}
      >
        <StudioTrackWarningPill warnings={track?.contentWarnings} />
        {track?.isExplicit ? ` ${t("studio:release.explicit")}` : ""}
      </ReviewFact>
    </ReviewCardFrame>
  );
}
