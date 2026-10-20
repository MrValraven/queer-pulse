import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioAdminTrackView,
  StudioReviewTrackReportView,
} from "./api/studioSafety.adapters";
import { STUDIO_CONTENT_WARNING_IDS } from "./api/studioSafety.types";
import { useStaffStudioTrack } from "./api/useStudioTrackReports";
import { ReviewCardFrame, ReviewFact, type TitleRef } from "./StudioReviewCard";
import { StudioTrackWarningPill } from "./StudioTrackWarningPill";
import css from "./StudioFlagReview.module.css";
import { useReviewDate } from "./useReviewDate";

/** A member's report about one track. The report names only the track, so
 *  the card reads it through the staff track route (contract). */
export function StudioReviewTrackReportCard({
  report,
  titleRef,
  onMarkExplicit,
  onAddWarning,
  onTakeDown,
  onDismiss,
}: {
  report: StudioReviewTrackReportView;
  titleRef: TitleRef;
  onMarkExplicit: (track: StudioAdminTrackView) => void;
  onAddWarning: (track: StudioAdminTrackView) => void;
  onTakeDown: (track: StudioAdminTrackView) => void;
  onDismiss: (trackTitle: string) => void;
}) {
  const { t } = useTranslation();
  const dateOf = useReviewDate();
  const track = useStaffStudioTrack(report.trackId);
  const trackTitle =
    track?.title || t("studio:flagReviewLive.trackReports.unknownTrack");
  const isEveryWarningAdded =
    track !== null &&
    track.staffContentWarnings.length === STUDIO_CONTENT_WARNING_IDS.length;
  // "Current marks" only shows once the track carries a warning or the
  // explicit mark.
  const hasMarks =
    track !== null && (track.contentWarnings.length > 0 || track.isExplicit);
  return (
    <ReviewCardFrame
      release={track?.release ?? null}
      titleRef={titleRef}
      chip={t(report.reasonLabelKey)}
      meta={t("studio:flagReviewLive.card.filedOn", {
        date: dateOf(report.createdAt),
      })}
      actions={
        <>
          {/* The fixes that keep the track up lead; taking the whole
              release down is the heavier, rarer call. */}
          <Button
            variant="primary"
            size="sm"
            aria-disabled={!track || track.isExplicitLocked || undefined}
            onClick={() => {
              if (track && !track.isExplicitLocked) onMarkExplicit(track);
            }}
          >
            {t("studio:flagReviewLive.trackReports.markExplicit")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            aria-disabled={!track || isEveryWarningAdded || undefined}
            onClick={() => {
              if (track && !isEveryWarningAdded) onAddWarning(track);
            }}
          >
            {t("studio:flagReviewLive.trackReports.addWarning")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={css.dangerOutline}
            aria-disabled={!track || undefined}
            onClick={() => {
              if (track) onTakeDown(track);
            }}
          >
            {t("studio:flagReviewLive.action.takeDown")}
          </Button>
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
        {track
          ? t("studio:flagReviewLive.claims.trackLine", {
              number: track.position,
              title: track.title,
            })
          : trackTitle}
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
