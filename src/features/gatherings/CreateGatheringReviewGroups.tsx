import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReadinessItem } from "./createGatheringChapters";
import { CreateGatheringAccessReadback } from "./CreateGatheringReadback";
import {
  ReviewGroup,
  ReviewRow,
  ReviewRows,
} from "./CreateGatheringReviewParts";
import {
  reviewCohostsText,
  reviewContentNotesText,
  reviewCostText,
  reviewCustomQuestionText,
  reviewLanguageText,
  reviewRsvpCutoffText,
  reviewRsvpQuestionsText,
  reviewSpotsText,
  reviewVisibilityText,
} from "./reviewRecapReadings";
import type { GatheringForm } from "./useGatheringForm";
import { useHostableCommunities } from "./useHostableCommunities";

/** What every recap group receives from the recap. */
export interface ReviewGroupProps {
  form: GatheringForm;
  /** From `publishReadiness(form)`, for the rows that offer "Needed". */
  readinessItems: readonly ReadinessItem[];
  /** A group's Edit: open that chapter with focus on its head. */
  onEditChapter: (chapterIndex: number) => void;
  /** An unmet field: open its chapter and jump to it. */
  onJumpToItem: (item: ReadinessItem) => void;
}

/**
 * Chapter 3 read back: spots, language, cost, who can see it, the waitlist,
 * when RSVPs close, the community (only for a host who runs or moderates one,
 * as the chapter itself shows the field) and the co-hosts picked.
 */
export function WhoReviewGroup({ form, onEditChapter }: ReviewGroupProps) {
  const { t } = useTranslation();
  const { options: myCommunityOptions } = useHostableCommunities();
  const communityName = form.communitySlug
    ? (myCommunityOptions.find(
        (community) => community.slug === form.communitySlug,
      )?.name ?? form.communitySlug)
    : "";
  return (
    <ReviewGroup
      title={t("gatherings:create.v2.review.group.who")}
      chapterId="who"
      onEditChapter={onEditChapter}
    >
      <ReviewRows>
        <ReviewRow
          label={t("gatherings:create.v2.review.row.spots")}
          value={reviewSpotsText(form, t)}
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.language")}
          value={reviewLanguageText(form, t)}
        />
        <ReviewRow
          label={t("gatherings:create.step3.costLabel")}
          value={reviewCostText(form, t)}
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.visibility")}
          value={reviewVisibilityText(form, t)}
        />
        <ReviewRow
          label={t("gatherings:create.v2.who.waitlistTitle")}
          value={t(
            form.allowWaitlist
              ? "gatherings:create.v2.review.value.on"
              : "gatherings:create.v2.review.value.off",
          )}
        />
        <ReviewRow
          label={t("gatherings:create.v2.who.rsvpCutoffLabel")}
          value={reviewRsvpCutoffText(form, t)}
        />
        {myCommunityOptions.length > 0 && (
          <ReviewRow
            label={t("gatherings:create.v2.review.row.community")}
            value={communityName}
          />
        )}
        <ReviewRow
          label={t("gatherings:create.v2.review.row.cohosts")}
          value={reviewCohostsText(form)}
        />
      </ReviewRows>
    </ReviewGroup>
  );
}

/** The six accessibility answers, the host's note and what is still open. */
export function AccessReviewGroup({
  form,
  onEditChapter,
  onJumpToAccess,
}: ReviewGroupProps & { onJumpToAccess: () => void }) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <ReviewGroup
      title={t("gatherings:create.v2.review.group.access")}
      titleId={titleId}
      chapterId="access"
      onEditChapter={onEditChapter}
    >
      <CreateGatheringAccessReadback
        form={form}
        labelledById={titleId}
        onJumpToAccess={onJumpToAccess}
      />
    </ReviewGroup>
  );
}

/** House rules, content notes, what the RSVP form asks and the host's own
 *  question. */
export function CareReviewGroup({ form, onEditChapter }: ReviewGroupProps) {
  const { t } = useTranslation();
  return (
    <ReviewGroup
      title={t("gatherings:create.v2.review.group.care")}
      chapterId="care"
      onEditChapter={onEditChapter}
    >
      <ReviewRows>
        <ReviewRow
          label={t("gatherings:create.v2.review.row.houseRules")}
          value={form.houseRules}
          isMultiline
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.contentNotes")}
          value={reviewContentNotesText(form, t)}
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.rsvpQuestions")}
          value={reviewRsvpQuestionsText(form, t)}
        />
        <ReviewRow
          label={t("gatherings:create.v2.care.customQuestionLabel")}
          value={reviewCustomQuestionText(form, t)}
        />
      </ReviewRows>
    </ReviewGroup>
  );
}
