import {
  EmptyState,
  FadeIn,
  LoadErrorState,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { PitchCard } from "../../PitchCard";
import type { Pitch } from "../../pitchTracker.data";
import { SubmissionCardSkeleton } from "./SubmissionCardSkeleton";

export interface SubmissionsStatusBodyProps {
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  /** The member's submissions that match the active status filter. */
  visiblePitches: Pitch[];
  /** A filter other than "all" is active, so an empty list can be widened. */
  isFiltered: boolean;
  onShowAll: () => void;
  onWithdraw: (pitch: Pitch) => void;
  onStub: (label: string) => void;
}

/**
 * The body under the Submissions tab's filter: the error, loading, empty or
 * card-list state of the member's own submissions read.
 */
export function SubmissionsStatusBody({
  isPending,
  isError,
  onRetry,
  visiblePitches,
  isFiltered,
  onShowAll,
  onWithdraw,
  onStub,
}: SubmissionsStatusBodyProps) {
  const { t } = useTranslation();

  if (isError) {
    // A failed read gets a retry and no empty state: "you have no pitches"
    // would be a lie told to someone whose pitches are sitting on the desk.
    return (
      <LoadErrorState
        onRetry={onRetry}
        title={t("magazine:pitchTracker.page.loadErrorTitle")}
        description={t("magazine:pitchTracker.page.loadErrorBody")}
      />
    );
  }
  if (isPending) {
    return Array.from({ length: 4 }, (_unused, index) => (
      <SubmissionCardSkeleton key={index} />
    ));
  }
  if (visiblePitches.length === 0) {
    return (
      <EmptyState
        compact
        title={t("magazine:pitchTracker.page.emptyTitle")}
        description={t("magazine:pitchTracker.page.emptyBody")}
        // The ghost slot: "Submit a story" above is already the one primary
        // button on the tab.
        secondaryAction={
          isFiltered
            ? {
                label: t("magazine:pitchTracker.page.showAllCta"),
                onClick: onShowAll,
              }
            : undefined
        }
      />
    );
  }
  return visiblePitches.map((pitch, index) => (
    <FadeIn key={pitch.id} delay={Math.min(index, 8) * 55}>
      <PitchCard pitch={pitch} onWithdraw={onWithdraw} onStub={onStub} />
    </FadeIn>
  ));
}
